from datetime import datetime
from pydantic import BaseModel

class EventCreate(BaseModel):
    title: str
    description: str
    location: str
    date: datetime
    max_volunteers: int


class EventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    location: str | None = None
    date: datetime | None = None
    max_volunteers: int | None = None


class EventResponse(BaseModel):
    id: int
    title: str
    description: str
    location: str
    date: datetime
    max_volunteers: int
    organizer_id: int
    created_at: datetime