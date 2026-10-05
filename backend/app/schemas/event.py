from datetime import datetime
from pydantic import BaseModel, ConfigDict
from pydantic import BaseModel, Field
from typing import Literal

class EventCreate(BaseModel):
    title: str
    description: str
    location: str
    date: datetime
    max_volunteers: int = Field(gt=0)
    organizer_id: int | None = None
    status: Literal[
    "UPCOMING",
    "ONGOING",
    "COMPLETED",
    "CANCELLED"
] = "UPCOMING"


class EventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    location: str | None = None
    date: datetime | None = None
    max_volunteers: int | None = None


class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    location: str
    date: datetime
    max_volunteers: int
    organizer_id: int
    created_at: datetime
    status: str

class EventStatusUpdate(BaseModel):
    status: Literal[
        "UPCOMING",
        "ONGOING",
        "COMPLETED",
        "CANCELLED"
    ]