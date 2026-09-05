import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_triage_preview_endpoint():
    payload = {
        "emergency_type": "Chest Pain",
        "description": "Patient experiencing severe chest pressure",
        "patient_latitude": 12.9716,
        "patient_longitude": 77.5946,
        "patient_info": {
            "age_group": "Adult",
            "conscious": True,
            "breathing_difficulty": True,
            "major_injury": False,
            "chest_pain": True
        }
    }
    response = client.post("/api/emergencies/triage-preview", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert data["level"] == "CRITICAL"
    assert data["score"] >= 60

def test_user_registration_and_login():
    unique_email = "testuser_api_route@example.com"
    reg_payload = {
        "name": "Integration Test User",
        "email": unique_email,
        "phone": "+91 9998887776",
        "password": "testpassword123",
        "role": "PATIENT"
    }
    # Register
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code in [201, 400]

    # Login
    login_payload = {
        "email": unique_email,
        "password": "testpassword123"
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

def test_hospitals_and_ambulances_endpoints():
    # Hospitals list
    hosp_res = client.get("/api/hospitals")
    assert hosp_res.status_code == 200
    assert isinstance(hosp_res.json(), list)

    # Ambulances list
    amb_res = client.get("/api/ambulances")
    assert amb_res.status_code == 200
    assert isinstance(amb_res.json(), list)
