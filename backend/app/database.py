from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import time

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@db:5432/education_platform")

def create_engine_with_retry():
    """Создает engine с повторными попытками"""
    for i in range(20):  # Увеличим количество попыток
        try:
            engine = create_engine(DATABASE_URL)
            # Проверяем подключение
            with engine.connect() as conn:
                pass
            print("Database connection established")
            return engine
        except Exception as e:
            print(f"Database connection attempt {i+1}/20 failed: {e}")
            if i < 19:
                time.sleep(2)
    raise Exception("Could not connect to database after 20 attempts")

engine = create_engine_with_retry()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from .models import Base
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")