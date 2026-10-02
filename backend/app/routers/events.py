from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from app.schemas.event import EventCreate, EventResponse ,EventUpdate
from app.services.event_service import (
    create_new_event,
    get_events,
    get_event,
    update_existing_event,
    delete_existing_event
)
from app.core.dependencies import require_organizer


router = APIRouter(
    prefix="/events",
    tags=["Events"]
)

@router.post("/", response_model=EventResponse)
def create_new_event_endpoint(
    event_data: EventCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_organizer)
):
    organizer_id = int(current_user.id)

    return create_new_event(
        db=db,
        event_data=event_data,
        organizer_id=organizer_id
    )


@router.get("/", response_model=list[EventResponse])
def get_events_endpoint(
    db: Session = Depends(get_db)
):
    return get_events(db)

@router.get("/{event_id}", response_model=EventResponse)
def get_event_by_id_endpoint(
    event_id: int,
    db: Session = Depends(get_db)
):
    return get_event(
        db=db,
        event_id=event_id
    )

@router.put("/{event_id}", response_model=EventResponse)
def update_event_endpoint(
    event_id: int,
    event_data: EventUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_organizer)
):
    return update_existing_event(
        db=db,
        event_id=event_id,
        event_data=event_data,
        organizer_id=current_user.id
    )


@router.delete("/{event_id}")
def delete_event_endpoint(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_organizer)
):
    return delete_existing_event(
        db=db,
        event_id=event_id,
        organizer_id=current_user.id
    )