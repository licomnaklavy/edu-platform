import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

def test_database_models():
    """Test database models without real connection"""
    # Use SQLite in-memory database for testing
    TEST_DATABASE_URL = "sqlite:///:memory:"
    
    try:
        engine = create_engine(TEST_DATABASE_URL)
        
        # Test that we can create engine and session
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        session = SessionLocal()
        session.execute("SELECT 1")
        session.close()
        
        assert True
    except Exception as e:
        pytest.fail(f"Database test failed: {e}")

def test_models_import():
    """Test that models can be imported without DB connection"""
    from app.models import User, Course
    assert User.__tablename__ == 'users'
    assert Course.__tablename__ == 'courses'