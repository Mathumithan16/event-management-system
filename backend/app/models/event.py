from sqlalchemy import Column , Integer ,String ,DateTime ,Text ,ForeignKey
from sqlalchemy.sql import func

from database import Base

class Event(Base):
    __tablename__= "events"

    id= Column(Integer , primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column (Text, nullable = False)
    location = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    max_volunteers = Column(Integer, nullable=False)

    status = Column(
    String,
    nullable=False,
    default="UPCOMING"
)

    organizer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )