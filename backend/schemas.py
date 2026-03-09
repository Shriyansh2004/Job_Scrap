from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    image_url: Optional[str] = None
    resume_url: Optional[str] = None
    skills: Optional[str] = None  # Comma-separated skills


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    image_url: Optional[str] = None
    resume_url: Optional[str] = None
    skills: Optional[str] = None


class UserOut(UserBase):
    id: int

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None


class JobBase(BaseModel):
    job_title: str
    company_name: str
    location: Optional[str] = None
    platform: str
    job_link: str


class JobIn(JobBase):
    pass


class JobOut(JobBase):
    pass


class JobApplicationCreate(JobBase):
    status: Optional[str] = "Applied"


class JobApplicationOut(JobBase):
    id: int
    date_applied: datetime
    status: str

    class Config:
        from_attributes = True


class JobSearchRequest(BaseModel):
    keyword: str
    location: str


class JobSearchResponse(BaseModel):
    results: List[JobOut]


# Resume Parser Schemas
class ResumeParseResponse(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    mobile_number: Optional[str] = None
    skills: List[str] = []
    experience: List[str] = []
    education: List[dict] = []
    company_names: List[str] = []
    college_name: Optional[str] = None
    degree: Optional[str] = None
    designation: Optional[str] = None
    total_experience: Optional[float] = None


class ResumeUpdateRequest(BaseModel):
    """Request to update user profile with parsed resume data."""
    skills: Optional[List[str]] = None
    experience: Optional[str] = None
    education: Optional[str] = None

