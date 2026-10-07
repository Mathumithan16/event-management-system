from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db

from app.schemas.user import UserRole

from app.schemas.event import (
    EventCreate,
    EventResponse,
    EventUpdate,
    EventStatusUpdate
)

from app.services.event_service import (
    create_new_event,
    get_events,
    get_my_events,
    get_event,
    update_existing_event,
    delete_existing_event,
    change_event_status
)

from app.core.dependencies import require_organizer_or_admin


router = APIRouter(
    prefix="/events",
    tags=["Events"]
)


# =========================
# CREATE EVENT
# =========================

@router.post("/", response_model=EventResponse)
def create_new_event_endpoint(
    event_data: EventCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_organizer_or_admin)
):
    if current_user.role.strip().upper() == UserRole.ADMIN.value:

        if event_data.organizer_id is None:
            raise HTTPException(
                status_code=422,
                detail="Admins must specify organizer_id when creating an event"
            )

        organizer_id = event_data.organizer_id

    else:
        organizer_id = current_user.id

    return create_new_event(
        db=db,
        event_data=event_data,
        organizer_id=organizer_id
    )


# =========================
# GET ALL EVENTS
# =========================

@router.get("/", response_model=list[EventResponse])
def get_events_endpoint(
    db: Session = Depends(get_db)
):
    return get_events(db)


# =========================
# GET MY EVENTS
# =========================

@router.get("/my", response_model=list[EventResponse])
def get_my_events_endpoint(
    db: Session = Depends(get_db),
    current_user = Depends(require_organizer_or_admin)
):
    return get_my_events(
        db=db,
        organizer_id=current_user.id
    )


# =========================
# GET SINGLE EVENT
# =========================

@router.get("/{event_id}", response_model=EventResponse)
def get_event_by_id_endpoint(
    event_id: int,
    db: Session = Depends(get_db)
):
    return get_event(
        db=db,
        event_id=event_id
    )


# =========================
# UPDATE EVENT
# =========================

@router.put("/{event_id}", response_model=EventResponse)
def update_event_endpoint(
    event_id: int,
    event_data: EventUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_organizer_or_admin)
):
    return update_existing_event(
        db=db,
        event_id=event_id,
        event_data=event_data,
        organizer_id=current_user.id,
        is_admin=current_user.role.strip().upper() == UserRole.ADMIN.value
    )


# =========================
# DELETE EVENT
# =========================

@router.delete("/{event_id}")
def delete_event_endpoint(
    event_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_organizer_or_admin)
):
    return delete_existing_event(
        db=db,
        event_id=event_id,
        organizer_id=current_user.id,
        is_admin=current_user.role.strip().upper() == UserRole.ADMIN.value
    )


# =========================
# UPDATE EVENT STATUS
# =========================

@router.patch("/{event_id}/status", response_model=EventResponse)
def update_event_status(
    event_id: int,
    status_data: EventStatusUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_organizer_or_admin)
):
    return change_event_status(
        db=db,
        event_id=event_id,
        status=status_data.status,
        organizer_id=current_user.id,
        is_admin=current_user.role.strip().upper() == UserRole.ADMIN.value
    )