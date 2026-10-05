from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.event import Event
from app.models.user import User


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user: User):
    db.add(user)
    db.commit()
    db.refresh(user)

    return user

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def get_all_users(db: Session):
    return db.query(User).all()


def update_user(db: Session, user: User):
    db.commit()
    db.refresh(user)

    return user


def delete_user_and_associated_data(db: Session, user: User):
    owned_event_ids = [
        event_id
        for (event_id,) in db.query(Event.id).filter(
            Event.organizer_id == user.id
        ).all()
    ]
    if owned_event_ids:
        db.query(Application).filter(
            or_(
                Application.volunteer_id == user.id,
                Application.event_id.in_(owned_event_ids),
            )
        ).delete(synchronize_session=False)
    else:
        db.query(Application).filter(
            Application.volunteer_id == user.id
        ).delete(synchronize_session=False)
    db.query(Event).filter(Event.organizer_id == user.id).delete(
        synchronize_session=False
    )
    db.delete(user)
    db.commit()