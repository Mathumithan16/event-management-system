from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.repositories.user_repository import (
    get_user_by_email,
    create_user
)
from app.core.security import hash_password
from app.schemas.user import UserCreate, LoginRequest
from app.core.security import hash_password, verify_password, create_access_token

def register_user(
    db: Session,
    user_data: UserCreate
):
    existing_user = get_user_by_email(
        db,
        user_data.email
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password=hash_password(user_data.password),
        role=user_data.role
    )

    return create_user(db, new_user)

def login_user(
    db: Session,
    login_data: LoginRequest
):
    user = get_user_by_email(
        db,
        login_data.email
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        login_data.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token({
        "sub": str(user.id),
        "role": user.role
    })

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

