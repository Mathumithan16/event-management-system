from datetime import datetime

from pydantic import BaseModel


class ApplicationCreate(BaseModel):#Used when a volunteer applies for an event.
    event_id: int


class ApplicationResponse(BaseModel):
    id: int
    event_id: int
    volunteer_id: int
    status: str
    applied_at: datetime


class ApplicationStatusUpdate(BaseModel):
    status: str