from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db

from app.core.dependencies import require_admin

from app.schemas.application import (
    ApplicationResponse,
    ApplicationStatusUpdate,
)

from app.schemas.user import (
    UserResponse,
    UserRoleUpdate,
)

from app.services.admin_service import (
    delete_application_record,
    delete_user_account,
    list_applications,
    list_users,
    update_user_role,
)
from app.services.application_service import change_application_status


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(require_admin)],
)


# ==========================================
# USER MANAGEMENT
# ==========================================

@router.get(
    "/users",
    response_model=list[UserResponse]
)
def get_users_endpoint(
    db: Session = Depends(get_db)
):
    return list_users(db)


@router.patch(
    "/users/{user_id}/role",
    response_model=UserResponse
)
def update_user_role_endpoint(
    user_id: int,
    role_data: UserRoleUpdate,
    db: Session = Depends(get_db),
):
    return update_user_role(
        db,
        user_id,
        role_data.role
    )


@router.delete(
    "/users/{user_id}"
)
def delete_user_endpoint(
    user_id: int,
    db: Session = Depends(get_db)
):
    return delete_user_account(
        db,
        user_id
    )


# ==========================================
# APPLICATION MANAGEMENT
# ==========================================

@router.get(
    "/applications",
    response_model=list[ApplicationResponse]
)
def get_applications_endpoint(
    db: Session = Depends(get_db)
):
    return list_applications(db)


@router.patch(
    "/applications/{application_id}",
    response_model=ApplicationResponse
)
def update_application_endpoint(
    application_id: int,
    status_data: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
):
    return change_application_status(
        db=db,
        application_id=application_id,
        status=status_data.status,
        organizer_id=0,
        is_admin=True,
    )


@router.delete(
    "/applications/{application_id}"
)
def delete_application_endpoint(
    application_id: int,
    db: Session = Depends(get_db)
):
    return delete_application_record(
        db,
        application_id
    )