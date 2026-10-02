from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database import get_db
from app.core.security import verify_access_token
from app.repositories.user_repository import get_user_by_id


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

    user_id = payload.get("sub")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user = get_user_by_id(
        db,
        int(user_id)
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user


def require_organizer(
    current_user = Depends(get_current_user)
):
    if current_user.role != "ORGANIZER":
        raise HTTPException(
            status_code=403,
            detail="Only organizers can perform this action"
        )

    return current_user