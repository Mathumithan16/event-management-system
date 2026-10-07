from importlib import import_module

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine

import_module("app.models.user")
import_module("app.models.event")
import_module("app.models.application")

from app.routers import admin, applications, auth, events


# Create database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI application
app = FastAPI(
    title="Event & Volunteer Management API",
    description="Backend API for the Event & Volunteer Management Application",
    version="1.0.0",
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:19006",
        "http://127.0.0.1:19006",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routers
app.include_router(events.router)
app.include_router(auth.router)
app.include_router(applications.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {
        "message": "Event Management API is running!"
    }