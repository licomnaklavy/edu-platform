from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext

# Password hashing - используем argon2 вместо bcrypt
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# User operations
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        password=hashed_password,
        name=user.name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: schemas.UserCreate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db_user.email = user_update.email
        db_user.name = user_update.name
        if user_update.password:
            db_user.password = get_password_hash(user_update.password)
        db.commit()
        db.refresh(db_user)
    return db_user

# Course operations
def get_courses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Course).offset(skip).limit(limit).all()

def get_course(db: Session, course_id: int):
    return db.query(models.Course).filter(models.Course.id == course_id).first()

def create_course(db: Session, course: schemas.CourseCreate):
    db_course = models.Course(**course.dict())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

# User-Course operations
def get_user_courses(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    return user.courses if user else []

def enroll_user_in_course(db: Session, user_id: int, course_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    
    if user and course and course not in user.courses:
        user.courses.append(course)
        db.commit()
    
    return course

def leave_course(db: Session, user_id: int, course_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    
    if user and course and course in user.courses:
        user.courses.remove(course)
        db.commit()
    
    return course

# Initialize sample data
def init_sample_data(db: Session):
    # Create sample users
    users_data = [
        {"email": "student@edu.ru", "password": "123", "name": "Иван Студентов"},
        {"email": "teacher@edu.ru", "password": "123", "name": "Петр Преподавателев"}
    ]
    
    for user_data in users_data:
        if not get_user_by_email(db, user_data["email"]):
            create_user(db, schemas.UserCreate(**user_data))
    
    # Create sample courses
    courses_data = [
        {
            "name": "Введение в программирование",
            "description": "Основы программирования для начинающих. Изучите базовые концепции и напишите свои первые программы.",
            "hours": 12,
            "level": "beginner"
        },
        {
            "name": "Веб-дизайн",
            "description": "Создание современных веб-интерфейсов. Освойте принципы UX/UI дизайна и инструменты разработки.",
            "hours": 8,
            "level": "intermediate"
        },
        {
            "name": "Продвинутый JavaScript",
            "description": "Современные возможности JavaScript. Асинхронное программирование, паттерны и лучшие практики.",
            "hours": 15,
            "level": "advanced"
        },
        {
            "name": "Основы алгоритмов",
            "description": "Фундаментальные алгоритмы и структуры данных. Подготовка к техническим собеседованиям.",
            "hours": 10,
            "level": "intermediate"
        },
        {
            "name": "Базы данных для начинающих",
            "description": "Основы работы с реляционными базами данных. SQL запросы и проектирование схем.",
            "hours": 6,
            "level": "beginner"
        },
        {
            "name": "Машинное обучение",
            "description": "Введение в машинное обучение. Линейная регрессия, классификация и нейронные сети.",
            "hours": 20,
            "level": "advanced"
        }
    ]
    
    for course_data in courses_data:
        if not db.query(models.Course).filter(models.Course.name == course_data["name"]).first():
            create_course(db, schemas.CourseCreate(**course_data))
    
    db.commit()