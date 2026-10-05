from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.event import Event


def create_event(db: Session, event: Event):
    db.add(event)
    db.commit()
    db.refresh(event)

    return event


def get_all_events(db: Session):
    return db.query(Event).all()

def get_event_by_id(db: Session, event_id: int):
    return db.query(Event).filter(Event.id == event_id).first()

def update_event(db: Session, event: Event):
    db.commit()
    db.refresh(event)

    return event

def delete_event(db: Session , event:Event):
    db.query(Application).filter(
        Application.event_id == event.id
    ).delete(synchronize_session=False)
    db.delete(event)
    db.commit()

    return True

def get_events_by_organizer(
    db: Session,
    organizer_id: int
):
    return db.query(Event).filter(
        Event.organizer_id == organizer_id
    ).all()
