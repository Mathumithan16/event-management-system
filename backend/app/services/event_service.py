from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.event import Event
from app.schemas.event import EventCreate, EventUpdate
from app.schemas.user import UserRole

from app.repositories.event_repository import (
    create_event,
    get_all_events,
    get_event_by_id,
    get_events_by_organizer,
    update_event,
    delete_event,
)

from app.repositories.user_repository import get_user_by_id


def create_new_event(
    db: Session,
    event_data: EventCreate,
    organizer_id: int
):
    organizer = get_user_by_id(db, organizer_id)

    if (
        organizer is None
        or organizer.role.strip().upper()
        != UserRole.ORGANIZER.value
    ):
        raise HTTPException(
            status_code=400,
            detail="Events must be assigned to an organizer"
        )

    event_date = event_data.date

    if event_date.tzinfo is None:
        event_date = event_date.replace(
            tzinfo=timezone.utc
        )

    if event_date <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=400,
            detail="Event date must be in the future"
        )

    new_event = Event(
        title=event_data.title,
        description=event_data.description,
        location=event_data.location,
        date=event_data.date,
        max_volunteers=event_data.max_volunteers,
        organizer_id=organizer_id
    )

    return create_event(db, new_event)


# =========================
# GET ALL EVENTS
# =========================

def get_events(db: Session):
    return get_all_events(db)


# =========================
# GET MY EVENTS
# =========================

def get_my_events(
    db: Session,
    organizer_id: int
):
    return get_events_by_organizer(
        db=db,
        organizer_id=organizer_id
    )


# =========================
# GET SINGLE EVENT
# =========================

def get_event(
    db: Session,
    event_id: int
):
    event = get_event_by_id(
        db,
        event_id
    )

    if event is None:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    return event


# =========================
# UPDATE EVENT
# =========================

def update_existing_event(
    db: Session,
    event_id: int,
    event_data: EventUpdate,
    organizer_id: int,
    is_admin: bool = False
):
    event = get_event_by_id(
        db,
        event_id
    )

    if event is None:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    if (
        not is_admin
        and event.organizer_id != organizer_id
    ):
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

    return update_event(
        db,
        event
    )


# =========================
# DELETE EVENT
# =========================

def delete_existing_event(
    db: Session,
    event_id: int,
    organizer_id: int,
    is_admin: bool = False
):
    event = get_event_by_id(
        db,
        event_id
    )

    if event is None:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    if (
        not is_admin
        and event.organizer_id != organizer_id
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only modify your own events"
        )

    delete_event(
        db,
        event
    )

    return {
        "message": "Event deleted successfully"
    }


# =========================
# UPDATE EVENT STATUS
# =========================

def change_event_status(
    db: Session,
    event_id: int,
    status: str,
    organizer_id: int,
    is_admin: bool = False,
):
    event = get_event_by_id(
        db=db,
        event_id=event_id
    )

    if event is None:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    if (
        not is_admin
        and event.organizer_id != organizer_id
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only manage your own events"
        )

    event.status = status

    db.commit()
    db.refresh(event)

    return event