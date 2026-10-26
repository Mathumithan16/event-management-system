
import os

import pytest
from dotenv import load_dotenv
from sqlalchemy.engine import make_url

load_dotenv()

# Require a separate test database.
test_database_url = os.getenv("TEST_DATABASE_URL")

if not test_database_url:
    raise RuntimeError(
        "TEST_DATABASE_URL is missing from the .env file."
    )

parsed_url = make_url(test_database_url)

if parsed_url.database != "event_management_test":
    raise RuntimeError(
        "Tests can only use the event_management_test database."
    )

# Set this BEFORE importing the application or database module.
os.environ["DATABASE_URL"] = test_database_url

from database import Base, engine, SessionLocal, get_db
import main

from fastapi.testclient import TestClient


def override_get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


main.app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def client():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    with TestClient(main.app) as test_client:
        yield test_client

    Base.metadata.drop_all(bind=engine)
