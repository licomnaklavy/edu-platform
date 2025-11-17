import pytest

def test_health_check():
    """Test health check endpoint without starting full app"""
    # This test will be skipped in CI since we can't start the app without DB
    pytest.skip("Skipping in CI - requires database connection")

def test_models_creation():
    """Test that models can be created"""
    from app.models import User, Course
    from app.schemas import UserCreate, CourseCreate
    
    # Test model creation
    user = User(email="test@test.com", password="test", name="Test User")
    course = Course(name="Test Course", description="Test", hours=10, level="beginner")
    
    assert user.email == "test@test.com"
    assert course.name == "Test Course"

def test_schemas_validation():
    """Test that schemas work correctly"""
    from app.schemas import UserCreate, CourseCreate
    
    user_data = UserCreate(email="test@test.com", password="test123", name="Test User")
    course_data = CourseCreate(name="Test Course", description="Test", hours=10, level="beginner")
    
    assert user_data.email == "test@test.com"
    assert course_data.name == "Test Course"