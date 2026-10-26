
from app.models.user import User
from database import SessionLocal


def test_register_success(client, monkeypatch):
    # TODO: Mock the email-sending function used by register_user.
    payload = {
        "name": "Test Volunteer",
        "email": "registration-test@example.com",
        "password": "TestPassword123",
        "role": "VOLUNTEER",
    }

    response = client.post("/auth/register", json=payload)

    assert response.status_code in (200, 201)

    db = SessionLocal()
    try:
        user = (
            db.query(User)
            .filter(User.email == payload["email"])
            .first()
        )
        assert user is not None
        assert user.is_email_verified is False
    finally:
        db.close()


def test_register_duplicate_email(client, monkeypatch):
    # TODO: Mock email sending.
    payload = {
        "name": "Test Volunteer",
        "email": "duplicate-test@example.com",
        "password": "TestPassword123",
        "role": "VOLUNTEER",
    }

    first_response = client.post("/auth/register", json=payload)
    second_response = client.post("/auth/register", json=payload)

    assert first_response.status_code in (200, 201)
    assert second_response.status_code == 400


def test_register_invalid_email(client):
    payload = {
        "name": "Test Volunteer",
        "email": "not-an-email",
        "password": "TestPassword123",
        "role": "VOLUNTEER",
    }

    response = client.post("/auth/register", json=payload)

    assert response.status_code == 422
