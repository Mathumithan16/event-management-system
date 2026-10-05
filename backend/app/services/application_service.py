from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.application import Application
from app.repositories.application_repository import (
    create_application,
    get_application_by_id,
    get_applications_by_volunteer,
    get_applications_by_event,
    update_application,
    get_application_by_event_and_volunteer,
    count_accepted_applications
)
from app.repositories.event_repository import get_event_by_id
from app.schemas.application import ApplicationStatus


def apply_to_event(
    db: Session,
    event_id: int,
    volunteer_id: int
):
    event = get_event_by_id(db=db, event_id=event_id)
    if event is None:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    if event.status in {"CANCELLED", "COMPLETED"}:
        raise HTTPException(
            status_code=400,
            detail="You cannot apply to a cancelled or completed event"
        )

    existing_application = get_application_by_event_and_volunteer(
        db=db,
        event_id=event_id,
        volunteer_id=volunteer_id
    )
    if existing_application is not None:
        raise HTTPException(
            status_code=400,
            detail="You have already applied to this event"
        )

    accepted_count = count_accepted_applications(db=db, event_id=event_id)
    if accepted_count >= event.max_volunteers:
        raise HTTPException(
            status_code=400,
            detail="This event has reached its maximum volunteer capacity"
        )

    application = Application(
        event_id=event_id,
        volunteer_id=volunteer_id,
        status="PENDING"
    )

    return create_application(
        db=db,
        application=application
    )


def get_my_applications(db: Session, volunteer_id: int):
    results = get_applications_by_volunteer(
        db=db,
        volunteer_id=volunteer_id
    )

    return [
        {
            "id": application.id,
            "event_id": application.event_id,
            "volunteer_id": application.volunteer_id,
            "status": application.status,
            "applied_at": application.applied_at,
            "event_title": event.title,
            "event_location": event.location,
            "event_date": event.date,
        }
        for application, event in results
    ]

def get_event_applications(
    db: Session,
    event_id: int,
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

    if not is_admin and event.organizer_id != organizer_id:
        raise HTTPException(
            status_code=403,
            detail="You can only view applications for your own events"
        )

    return get_applications_by_event(
        db=db,
        event_id=event_id
    )

def change_application_status(
    db: Session,
    application_id: int,
    status: ApplicationStatus,
    organizer_id: int,
    is_admin: bool = False,
):
    application = get_application_by_id(
        db=db,
        application_id=application_id
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    event = get_event_by_id(db=db, event_id=application.event_id)
    if event is None:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    if not is_admin and event.organizer_id != organizer_id:
        raise HTTPException(
            status_code=403,
            detail="You can only manage applications for your own events"
        )

    if status in {ApplicationStatus.ACCEPTED, ApplicationStatus.APPROVED}:
        accepted_count = count_accepted_applications(
            db=db,
            event_id=application.event_id,
        )
        already_accepted = application.status in {"ACCEPTED", "APPROVED"}
        if not already_accepted and accepted_count >= event.max_volunteers:
            raise HTTPException(
                status_code=400,
                detail="This event has reached its maximum volunteer capacity"
            )

    application.status = status.value
    return update_application(db=db, application=application)