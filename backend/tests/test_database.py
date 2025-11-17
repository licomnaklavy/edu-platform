import pytest
from app.database import get_db
from app.models import Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Test database
TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_database_connection():
    """Test database connection and table creation"""
    try:
        Base.metadata.create_all(bind=engine)
        session = TestingSessionLocal()
        session.execute("SELECT 1")
        session.close()
        assert True
    except Exception as e:
        pytest.fail(f"Database test failed: {e}")