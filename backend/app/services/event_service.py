from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.event import Event
from app.schemas.event import EventCreate, EventUpdate 
from app.repositories.event_repository import (
    create_event,
    get_all_events,
    get_event_by_id,
    update_event,
    delete_event
)


def create_new_event(
    db: Session,
    event_data: EventCreate,
    organizer_id: int
):
    new_event = Event(
        title=event_data.title,
        description=event_data.description,
        location=event_data.location,
        date=event_data.date,
        max_volunteers=event_data.max_volunteers,
        organizer_id=organizer_id
    )

    return create_event(db, new_event)


def get_events(db: Session):
    return get_all_events(db)

def get_event(db: Session, event_id: int):
    event = get_event_by_id(db, event_id)

    if event is None:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    return event

def update_existing_event(
    db: Session,
    event_id: int,
    event_data: EventUpdate,
    organizer_id: int
):
    event = get_event_by_id(db, event_id)

    if event is None:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    if event.organizer_id != organizer_id:
        raise HTTPException(
            status_code=403,
            detail="You can only modify your own events"
        )

    if event_data.title is not None:
        event.title = event_data.title

    if event_data.description is not None:
        event.description = event_data.description

    if event_data.location is not None:
        event.location = event_data.location

    if event_data.date is not None:
        event.date = event_data.date

    if event_data.max_volunteers is not None:
        event.max_volunteers = event_data.max_volunteers

    return update_event(db, event)

def delete_existing_event(
    db: Session,
    event_id: int,
    organizer_id: int
):
    event = get_event_by_id(db, event_id)

    if event is None:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )
    if event.organizer_id != organizer_id:
        raise HTTPException(
        status_code=403,
        detail="You can only modify your own events"
    )

    delete_event(db, event)

    return {
        "message": "Event deleted successfully"
    }