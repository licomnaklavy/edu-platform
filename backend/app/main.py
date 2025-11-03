from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from . import models, schemas, crud
from .database import get_db, init_db

# JWT configuration
SECRET_KEY = "your-secret-key-here-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI(title="Education Platform API")
security = HTTPBearer()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://frontend:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def on_startup():
    print("Initializing database...")
    try:
        init_db()
        print("Database tables created")
        
        # Initialize sample data
        db = next(get_db())
        crud.init_sample_data(db)
        print("Sample data initialized")
        print("Application started successfully!")
    except Exception as e:
        print(f"Startup error: {e}")

# JWT token functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception
    
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    
    user = crud.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    
    return user

# Auth endpoints
@app.post("/auth/login", response_model=schemas.LoginResponse)
def login(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, user_data.email)
    if not user or not crud.verify_password(user_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": schemas.User.from_orm(user)
    }

@app.post("/auth/register", response_model=schemas.LoginResponse)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = crud.get_user_by_email(db, email=user_data.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = crud.create_user(db=db, user=user_data)
    
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": schemas.User.from_orm(user)
    }

# User endpoints
@app.get("/users/me", response_model=schemas.User)
def get_current_user_info(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.put("/users/me", response_model=schemas.User)
def update_user_profile(
    user_update: schemas.UserCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.update_user(db=db, user_id=current_user.id, user_update=user_update)

# Course endpoints
@app.get("/courses", response_model=List[schemas.CourseWithEnrollment])
def get_all_courses(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    courses = crud.get_courses(db)
    user_courses = crud.get_user_courses(db, current_user.id)
    user_course_ids = [course.id for course in user_courses]
    
    # Add enrollment status to each course
    courses_with_enrollment = []
    for course in courses:
        course_data = schemas.CourseWithEnrollment.from_orm(course)
        course_data.is_enrolled = course.id in user_course_ids
        courses_with_enrollment.append(course_data)
    
    return courses_with_enrollment

@app.get("/users/me/courses", response_model=List[schemas.Course])
def get_my_courses(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_user_courses(db, current_user.id)

# Enrollment endpoints
@app.post("/users/me/courses/{course_id}")
def enroll_in_course(
    course_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    course = crud.enroll_user_in_course(db, current_user.id, course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    return {"message": "Successfully enrolled in course"}

@app.delete("/users/me/courses/{course_id}")
def leave_course(
    course_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    course = crud.leave_course(db, current_user.id, course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found or not enrolled"
        )
    
    return {"message": "Successfully left course"}

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "main-api"}

@app.get("/")
def root():
    return {"message": "Education Platform API"}