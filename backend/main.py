from importlib import import_module

from fastapi import FastAPI

from database import Base, engine

import_module("app.models.user")
import_module("app.models.event")
import_module("app.models.application")

from app.routers import admin, applications, auth, events

Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Event & Volunteer Management API",
    description="Backend API for the Event & Volunteer Management Application",
    version="1.0.0"
)


app.include_router(events.router)
app.include_router(auth.router)
app.include_router(applications.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {
        "message": "Event Management API is running!"
    }