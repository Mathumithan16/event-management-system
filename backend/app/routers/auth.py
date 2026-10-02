from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from app.schemas.user import (
    UserCreate,
    UserResponse,
    LoginRequest,
    LoginResponse
)
from app.services.user_service import register_user,login_user


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register", response_model=UserResponse)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    return register_user(
        db=db,
        user_data=user_data
    )

@router.post("/login", response_model=LoginResponse)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    return login_user(
        db=db,
        login_data=login_data
    )