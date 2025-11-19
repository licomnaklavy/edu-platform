from pydantic import BaseModel
from typing import List, Optional

# User schemas
class UserBase(BaseModel):
    email: str
    name: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str

# Курсы
class CourseBase(BaseModel):
    name: str
    description: Optional[str] = None
    hours: int
    level: str

class CourseCreate(CourseBase):
    pass

class Course(CourseBase):
    id: int

    class Config:
        from_attributes = True

class CourseWithEnrollment(Course):
    is_enrolled: bool = False

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

class UserWithCourses(User):
    courses: List[Course] = []