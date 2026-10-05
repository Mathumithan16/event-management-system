from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict


class ApplicationStatus(str, Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class ApplicationCreate(BaseModel):#Used when a volunteer applies for an event.
    event_id: int


class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_id: int
    volunteer_id: int
    status: str
    applied_at: datetime


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus

class MyApplicationResponse(BaseModel):
    id: int
    event_id: int
    volunteer_id: int
    status: str
    applied_at: datetime

    event_title: str
    event_location: str
    event_date: datetime