from fastapi.testclient import TestClient

from main import app

client =TestClient(app)

def test_root():
    response  = client.get("/")

    assert response.status_code == 200
    assert response.json() =={
        "message":"Event Management API is running!"
    }

#verify that the actual test case match with expected outcome- assert#
#black box testing#