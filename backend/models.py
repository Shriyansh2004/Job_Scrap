from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    location = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    resume_url = Column(String, nullable=True)
    skills = Column(String, nullable=True)  # Comma-separated skills from resume parser
    hashed_password = Column(String, nullable=False)

    applications = relationship("JobApplication", back_populates="user")


class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_title = Column(String, nullable=False)
    company_name = Column(String, nullable=False)
    location = Column(String, nullable=True)
    platform = Column(String, nullable=False)
    job_link = Column(String, nullable=False)
    date_applied = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="Applied")

    user = relationship("User", back_populates="applications")

