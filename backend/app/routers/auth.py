from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database import get_db

from app.schemas.user import (
    UserCreate,
    UserResponse,
    LoginResponse,
    EmailRequest,
    EmailVerificationRequest,
    GoogleLoginRequest,
)

from app.services.user_service import (
    register_user,
    login_user,
    resend_verification_email,
    verify_user_email,
    google_login_user,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    return await register_user(db=db, user_data=user_data)


@router.post("/verify-email")
def verify_email(
    verification_data: EmailVerificationRequest,
    db: Session = Depends(get_db),
):
    return verify_user_email(db=db, verification_data=verification_data)


@router.post("/resend-verification")
async def resend_verification(
    request: EmailRequest,
    db: Session = Depends(get_db),
):
    return await resend_verification_email(db=db, email=str(request.email))


@router.post("/login", response_model=LoginResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    return login_user(
        db=db,
        email=form_data.username,
        password=form_data.password,
    )


@router.post("/google", response_model=LoginResponse)
def google_login(
    request_data: GoogleLoginRequest,
    db: Session = Depends(get_db),
):
    return google_login_user(db=db, request_data=request_data)
