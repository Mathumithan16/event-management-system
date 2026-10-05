from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db

from app.core.dependencies import (
    require_organizer_or_admin,
    require_volunteer,
)

from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatusUpdate,
    MyApplicationResponse
)
from app.schemas.user import UserRole

from app.services.application_service import (
    apply_to_event,
    get_my_applications,
    get_event_applications,
    change_application_status
)


router = APIRouter(
    prefix="/applications",
    tags=["Applications"]
)


@router.post("/", response_model=ApplicationResponse)
def apply_for_event(
    application_data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_volunteer)
):
    return apply_to_event(
        db=db,
        event_id=application_data.event_id,
        volunteer_id=current_user.id
    )


@router.get("/my", response_model=list[MyApplicationResponse])
def get_my_applications_endpoint(
    db: Session = Depends(get_db),
    current_user = Depends(require_volunteer)
):
    return get_my_applications(
        db=db,
        volunteer_id=current_user.id
    )


@router.get(
    "/event/{event_id}",
    response_model=list[ApplicationResponse]
)
def get_event_applications_endpoint(
    event_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_organizer_or_admin)
):
    return get_event_applications(
        db=db,
        event_id=event_id,
        organizer_id=current_user.id,
        is_admin=current_user.role.strip().upper() == UserRole.ADMIN.value,
    )

@router.put(
    "/{application_id}/status",
    response_model=ApplicationResponse
)
def update_application_status_endpoint(
    application_id: int,
    status_data: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_organizer_or_admin)
):
    return change_application_status(
        db=db,
        application_id=application_id,
        status=status_data.status,
        organizer_id=current_user.id,
        is_admin=current_user.role.strip().upper() == UserRole.ADMIN.value,
    )
