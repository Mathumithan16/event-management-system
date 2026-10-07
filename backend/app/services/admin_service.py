from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.application_repository import (
    delete_application,
    get_all_applications,
    get_application_by_id,
)

from app.repositories.user_repository import (
    delete_user_and_associated_data,
    get_all_users,
    get_user_by_id,
    update_user,
)

from app.schemas.user import RegistrationRole, UserRole


# ==========================================
# USER MANAGEMENT
# ==========================================
def list_users(db: Session):
    return get_all_users(db)


def update_user_role(
    db: Session,
    user_id: int,
    role: RegistrationRole,
):
    user = get_user_by_id(db, user_id)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Admin role cannot be changed through this endpoint
    if user.role.strip().upper() == UserRole.ADMIN.value:
        raise HTTPException(
            status_code=403,
            detail="Admin roles cannot be changed through this endpoint"
        )

    user.role = role.value
    user.is_approved = True

    return update_user(
        db,
        user
    )


def approve_user_account(
    db: Session,
    user_id: int,
):
    user = get_user_by_id(db, user_id)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if user.role.strip().upper() == UserRole.ADMIN.value:
        raise HTTPException(
            status_code=403,
            detail="Admin accounts cannot be approved through this endpoint"
        )

    user.is_approved = True

    return update_user(
        db,
        user
    )


def delete_user_account(
    db: Session,
    user_id: int
):
    user = get_user_by_id(
        db,
        user_id
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Admin accounts cannot be deleted
    if user.role.strip().upper() == UserRole.ADMIN.value:
        raise HTTPException(
            status_code=403,
            detail="Admin accounts cannot be deleted through this endpoint"
        )

    # Delete user and related events/applications
    delete_user_and_associated_data(
        db,
        user
    )

    return {
        "message": "User and their events/applications were deleted"
    }


# ==========================================
# APPLICATION MANAGEMENT
# ==========================================

def list_applications(db: Session):
    return get_all_applications(db)


def delete_application_record(
    db: Session,
    application_id: int
):
    application = get_application_by_id(
        db,
        application_id
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    delete_application(
        db,
        application
    )

    return {
        "message": "Application deleted"
    }