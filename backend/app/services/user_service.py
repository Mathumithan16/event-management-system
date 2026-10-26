import logging
import secrets
from datetime import datetime, timedelta, timezone
import os

from google.auth.exceptions import GoogleAuthError
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from sqlalchemy.exc import IntegrityError

from app.schemas.user import GoogleLoginRequest
import aiosmtplib
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import EmailVerificationRequest, UserCreate
from app.repositories.user_repository import get_user_by_email
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.services.email_service import send_otp_email


OTP_EXPIRATION_MINUTES = 10
OTP_RESEND_COOLDOWN_SECONDS = 60
MAX_OTP_ATTEMPTS = 5
logger = logging.getLogger(__name__)


async def register_user(
    db: Session,
    user_data: UserCreate,
):
    existing_user = get_user_by_email(db, user_data.email)

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    otp = f"{secrets.randbelow(1_000_000):06d}"
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password=hash_password(user_data.password),
        role=user_data.role.value,
        is_approved=user_data.role.value != "ORGANIZER",
        is_email_verified=False,
        email_verification_code_hash=hash_password(otp),
        email_verification_expires_at=datetime.now(timezone.utc)
        + timedelta(minutes=OTP_EXPIRATION_MINUTES),
        email_verification_sent_at=datetime.now(timezone.utc),
        email_verification_attempts=0,
    )

    db.add(new_user)
    try:
        db.flush()
        await send_otp_email(new_user.email, otp)
        db.commit()
        db.refresh(new_user)
    except (
        aiosmtplib.errors.SMTPException,
        OSError,
        TimeoutError,
        RuntimeError,
    ) as exc:
        db.rollback()
        raise HTTPException(
            status_code=503,
            detail="Verification email could not be sent. Please try again.",
        ) from exc

    return new_user


def verify_user_email(db: Session, verification_data: EmailVerificationRequest):
    user = get_user_by_email(db, str(verification_data.email))
    if user is None:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    if user.is_email_verified:
        return {"message": "Email is already verified"}

    if user.email_verification_attempts >= MAX_OTP_ATTEMPTS:
        user.email_verification_code_hash = None
        db.commit()
        raise HTTPException(
            status_code=429,
            detail="Too many incorrect OTP attempts. Request a new code.",
        )

    if (
        user.email_verification_code_hash is None
        or user.email_verification_expires_at is None
    ):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    expires_at = user.email_verification_expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if datetime.now(timezone.utc) >= expires_at:
        user.email_verification_code_hash = None
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    if not verify_password(
        verification_data.otp,
        user.email_verification_code_hash,
    ):
        user.email_verification_attempts += 1
        if user.email_verification_attempts >= MAX_OTP_ATTEMPTS:
            user.email_verification_code_hash = None
        db.commit()
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired OTP",
        )

    user.is_email_verified = True
    user.email_verification_code_hash = None
    user.email_verification_expires_at = None
    user.email_verification_sent_at = None
    user.email_verification_attempts = 0
    db.commit()
    return {"message": "Email verified successfully"}


async def resend_verification_email(db: Session, email: str):
    user = get_user_by_email(db, email)
    if user is None or user.is_email_verified:
        raise HTTPException(
            status_code=400,
            detail="No unverified account found for this email",
        )

    sent_at = user.email_verification_sent_at
    if sent_at is not None:
        if sent_at.tzinfo is None:
            sent_at = sent_at.replace(tzinfo=timezone.utc)
        wait_until = sent_at + timedelta(seconds=OTP_RESEND_COOLDOWN_SECONDS)
        remaining_seconds = int(
            (wait_until - datetime.now(timezone.utc)).total_seconds()
        )
        if remaining_seconds > 0:
            raise HTTPException(
                status_code=429,
                detail=f"Please wait {remaining_seconds} seconds before requesting another code.",
            )

    otp = f"{secrets.randbelow(1_000_000):06d}"
    user.email_verification_code_hash = hash_password(otp)
    user.email_verification_expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=OTP_EXPIRATION_MINUTES
    )
    user.email_verification_sent_at = datetime.now(timezone.utc)
    user.email_verification_attempts = 0

    try:
        await send_otp_email(user.email, otp)
        db.commit()
    except (
        aiosmtplib.errors.SMTPException,
        OSError,
        TimeoutError,
        RuntimeError,
    ) as exc:
        db.rollback()
        raise HTTPException(
            status_code=503,
            detail="Verification email could not be sent. Please try again.",
        ) from exc

    return {"message": "A new verification code has been sent"}


def login_user(
    db: Session,
    email: str,
    password: str,
):
    user = get_user_by_email(db, email)

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not verify_password(password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not user.is_email_verified:
        raise HTTPException(
            status_code=403,
            detail="Please verify your email before logging in",
        )

    # Only organizers require admin approval.
    # Admins and volunteers can log in without approval.
    if user.role == "ORGANIZER" and not user.is_approved:
        raise HTTPException(
            status_code=403,
            detail="Your organizer account is pending admin approval",
        )

    access_token = create_access_token({
        "sub": str(user.id),
        "role": user.role,
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


def _google_login_response(user: User):
    if user.role == "ORGANIZER" and not user.is_approved:
        raise HTTPException(
            status_code=403,
            detail="Your organizer account is pending admin approval",
        )

    return {
        "access_token": create_access_token({
            "sub": str(user.id),
            "role": user.role,
        }),
        "token_type": "bearer",
    }


def google_login_user(db: Session, request_data: GoogleLoginRequest):
    client_ids = {
        client_id.strip()
        for client_id in (
            os.getenv("GOOGLE_CLIENT_IDS", "")
            + ","
            + os.getenv("GOOGLE_CLIENT_ID", "")
        ).split(",")
        if client_id.strip()
    }

    if not client_ids:
        raise HTTPException(
            status_code=500,
            detail="Google sign-in is not configured",
        )

    google_user = None
    verification_error = None

    # Step 1: Verify using google.oauth2.id_token with clock skew tolerance (300 seconds / 5 mins)
    try:
        google_user = id_token.verify_oauth2_token(
            request_data.credential,
            google_requests.Request(),
            audience=None,
            clock_skew_in_seconds=300,
        )
    except Exception as exc:
        verification_error = exc
        logger.warning(
            "Local Google ID token verification failed (%s). Attempting verification via Google tokeninfo API...",
            exc,
        )

    # Step 2: Fallback to Google tokeninfo API if local verification failed
    # This prevents failures caused by machine clock skew, network TLS issues, or cert cache mismatches.
    if google_user is None:
        try:
            import json
            import urllib.parse
            import urllib.request

            tokeninfo_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={urllib.parse.quote(request_data.credential)}"
            req = urllib.request.Request(
                tokeninfo_url,
                headers={"User-Agent": "EventManagementBackend/1.0"},
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status == 200:
                    payload = json.loads(resp.read().decode("utf-8"))
                    # Validate standard Google issuer
                    if payload.get("iss") in ("accounts.google.com", "https://accounts.google.com"):
                        google_user = payload
                        logger.info("Successfully verified Google ID token via Google tokeninfo API.")
        except Exception as exc:
            logger.warning("Google tokeninfo API verification fallback failed: %s", exc)

    if not google_user:
        logger.error(
            "Google ID token verification failed entirely. Error: %s",
            verification_error,
        )
        raise HTTPException(
            status_code=401,
            detail="Google ID token is invalid or expired. Please sign in again.",
        )

    # Check audience or authorized party (azp)
    audience = google_user.get("aud")
    azp = google_user.get("azp")
    audience_values = []
    if isinstance(audience, str):
        audience_values.append(audience)
    elif isinstance(audience, list):
        audience_values.extend(v for v in audience if isinstance(v, str))
    if isinstance(azp, str):
        audience_values.append(azp)

    audience_is_allowed = any(value in client_ids for value in audience_values)

    if not audience_is_allowed:
        logger.warning(
            "Google token audience mismatch. Token aud/azp: %s, Backend client_ids: %s",
            audience_values,
            client_ids,
        )
        raise HTTPException(
            status_code=401,
            detail=(
                "Google token audience does not match the backend configuration. "
                "Ensure GOOGLE_CLIENT_ID or GOOGLE_CLIENT_IDS includes the web "
                "client ID from mobile/.env.local, then restart the backend."
            ),
        )

    email = google_user.get("email")
    subject = google_user.get("sub")
    name = (
        google_user.get("name")
        or google_user.get("given_name")
        or (email.split("@")[0] if isinstance(email, str) else "")
    )

    if not (
        isinstance(email, str)
        and email.strip()
        and isinstance(subject, str)
        and subject.strip()
    ):
        raise HTTPException(
            status_code=401,
            detail="Google account information is incomplete",
        )

    email = email.strip().lower()
    name = name.strip() if isinstance(name, str) and name.strip() else "User"

    email_verified = google_user.get("email_verified")
    is_verified = (
        email_verified is True
        or str(email_verified).strip().lower() == "true"
    )
    if not is_verified:
        raise HTTPException(
            status_code=401,
            detail="Your Google email must be verified",
        )

    # 1. Existing user registered with this Google account
    existing_google_user = (
        db.query(User).filter(User.google_sub == subject).first()
    )
    if existing_google_user is not None:
        return _google_login_response(existing_google_user)

    # 2. Existing user registered previously via email/password
    existing_user = get_user_by_email(db, email)
    if existing_user is not None:
        if existing_user.google_sub is None:
            # Safely link Google account to the existing verified user
            existing_user.google_sub = subject
            existing_user.is_email_verified = True
            db.commit()
            db.refresh(existing_user)
            return _google_login_response(existing_user)
        elif existing_user.google_sub == subject:
            return _google_login_response(existing_user)
        else:
            raise HTTPException(
                status_code=409,
                detail="An account with this email is associated with a different Google account.",
            )

    # 3. Create new user account with role
    role = request_data.role.value

    new_user = User(
        name=name,
        email=email,
        password=hash_password(secrets.token_urlsafe(48)),
        role=role,
        google_sub=subject,
        is_approved=role != "ORGANIZER",
        is_email_verified=True,
        email_verification_code_hash=None,
        email_verification_expires_at=None,
        email_verification_sent_at=None,
        email_verification_attempts=0,
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="This Google account is already registered. Please sign in again.",
        ) from exc

    return _google_login_response(new_user)
