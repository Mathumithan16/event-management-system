from fastapi import FastAPI

from database import Base, engine

from app.models.user import User
from app.models.event import Event
from app.models.application import Application

from app.routers import events
from app.routers import auth


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Event & Volunteer Management API",
    description="Backend API for the Event & Volunteer Management Application",
    version="1.0.0"
)


app.include_router(events.router)
app.include_router(auth.router)


@app.get("/")
def root():
    return {
        "message": "Event Management API is running!"
    }