import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "main-api"}

def test_root_endpoint():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_courses_endpoint_requires_auth():
    """Test that courses endpoint requires authentication"""
    response = client.get("/courses")
    assert response.status_code == 401  # Unauthorized

def test_login_with_invalid_credentials():
    """Test login with invalid credentials"""
    response = client.post("/auth/login", json={
        "email": "invalid@email.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_register_invalid_data():
    """Test registration with invalid data"""
    response = client.post("/auth/register", json={
        "email": "invalid-email",
        "password": "123",
        "name": "Test User"
    })
    assert response.status_code in [400, 422]  # Bad Request or Validation Error