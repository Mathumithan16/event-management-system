from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.event import Event


def create_application(
    db: Session,
    application: Application
):
    db.add(application)
    db.commit()
    db.refresh(application)

    return application


def get_application_by_id(
    db: Session,
    application_id: int
):
    return db.query(Application).filter(
        Application.id == application_id
    ).first()


def get_application_by_event_and_volunteer(
    db: Session,
    event_id: int,
    volunteer_id: int,
):
    return db.query(Application).filter(
        Application.event_id == event_id,
        Application.volunteer_id == volunteer_id,
    ).first()

def get_applications_by_volunteer(db: Session, volunteer_id: int):
    return (
        db.query(Application, Event)
        .join(Event, Application.event_id == Event.id)
        .filter(Application.volunteer_id == volunteer_id)
        .all()
    )


def get_applications_by_event(
    db: Session,
    event_id: int
):
    return db.query(Application).filter(
        Application.event_id == event_id
    ).all()


def get_all_applications(db: Session):
    return db.query(Application).all()


def update_application(db: Session, application: Application):
    db.commit()
    db.refresh(application)
    return application


def count_accepted_applications(
    db: Session,
    event_id: int
):
    return db.query(Application).filter(
        Application.event_id == event_id,
        Application.status.in_(("ACCEPTED", "APPROVED"))
    ).count()


def delete_application(db: Session, application: Application):
    db.delete(application)
    db.commit()