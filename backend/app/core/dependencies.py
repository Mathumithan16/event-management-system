from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database import get_db
from app.core.security import verify_access_token
from app.repositories.user_repository import get_user_by_id
from app.schemas.user import UserRole


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    payload = verify_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    if not isinstance(payload, dict):
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user_id = payload.get("sub")

    if not isinstance(user_id, str) or not user_id.isdecimal():
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user = get_user_by_id(db, int(user_id))

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user


def require_organizer(
    current_user = Depends(get_current_user)
):
    if current_user.role.strip().upper() != UserRole.ORGANIZER.value:
        raise HTTPException(
            status_code=403,
            detail="Only organizers can perform this action"
        )

    return current_user


def require_volunteer(
    current_user = Depends(get_current_user)
):
    if current_user.role.strip().upper() != UserRole.VOLUNTEER.value:
        raise HTTPException(
            status_code=403,
            detail="Only volunteers can perform this action"
        )

    return current_user


def require_admin(
    current_user = Depends(get_current_user)
):
    if current_user.role.strip().upper() != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=403,
            detail="Only admins can perform this action"
        )

    return current_user


def require_organizer_or_admin(
    current_user = Depends(get_current_user)
):
    if current_user.role.strip().upper() not in {
        UserRole.ORGANIZER.value,
        UserRole.ADMIN.value,
    }:
        raise HTTPException(
            status_code=403,
            detail="Only organizers or admins can perform this action"
        )

    return current_user