from sqlalchemy import Column, Integer, String, Boolean, Table, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

# Association table for many-to-many relationship between users and courses
user_course_association = Table(
    'user_courses',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('course_id', Integer, ForeignKey('courses.id'))
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    
    # Relationship to courses (many-to-many)
    courses = relationship("Course", secondary=user_course_association, back_populates="users")

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    hours = Column(Integer, nullable=False)
    level = Column(String, nullable=False)  # beginner, intermediate, advanced
    
    # Relationship to users (many-to-many)
    users = relationship("User", secondary=user_course_association, back_populates="courses")