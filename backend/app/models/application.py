from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from database import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)

    event_id = Column(
        Integer,
        ForeignKey("events.id"),
        nullable=False
    )

    volunteer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    status = Column(String, nullable=False, default="PENDING")

    applied_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )