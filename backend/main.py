import os
import uuid
from datetime import datetime
from typing import List

from fastapi import Depends, FastAPI, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

import auth
import models
import schemas
from auth import create_access_token, get_current_user, get_password_hash, verify_password
from cloudinary_config import upload_image, upload_resume, delete_file
from database import Base, engine, get_db
from scrapers import LinkedInScraper, NaukriScraper, InternshalaScraper, UnstopScraper

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Job Scraper Platform")

# Get allowed origins from environment variable (comma-separated)
# Default to localhost for development
origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
origins = [origin.strip() for origin in origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/auth/signup", response_model=schemas.UserOut)
def signup(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )
    user = models.User(
        email=user_in.email,
        full_name=user_in.full_name,
        location=user_in.location,
        bio=user_in.bio,
        image_url=user_in.image_url,
        hashed_password=get_password_hash(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/auth/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    token = create_access_token(data={"sub": str(user.id)})
    return schemas.Token(access_token=token)


@app.get("/users/me", response_model=schemas.UserOut)
def read_profile(current_user: models.User = Depends(get_current_user)):
    return current_user


@app.put("/users/me", response_model=schemas.UserOut)
def update_profile(
    updates: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@app.delete("/users/me/image", response_model=schemas.UserOut)
def delete_profile_image(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Delete the image file from Cloudinary if it's a Cloudinary URL
    if current_user.image_url and "cloudinary.com" in current_user.image_url:
        delete_file(current_user.image_url)
    
    current_user.image_url = None
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@app.post("/users/me/upload-image")
async def upload_profile_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Upload a profile image to Cloudinary."""
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Validate file size (max 5MB)
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must be less than 5MB"
        )
    
    # Get file extension
    file_extension = os.path.splitext(file.filename)[1].lstrip(".") if file.filename else "jpg"
    
    # Read file content
    content = await file.read()
    
    # Upload to Cloudinary
    url = upload_image(content, file_extension)
    
    return {"url": url}


@app.post("/users/me/upload-resume")
async def upload_resume_endpoint(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Upload a resume (PDF) to Cloudinary."""
    # Validate file type - only PDF allowed
    allowed_types = ["application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a PDF"
        )
    
    # Validate file size (max 10MB)
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must be less than 10MB"
        )
    
    # Read file content
    content = await file.read()
    
    # Upload to Cloudinary
    url = upload_resume(content)
    
    # Delete old resume if exists (Cloudinary URL)
    if current_user.resume_url and "cloudinary.com" in current_user.resume_url:
        delete_file(current_user.resume_url)
    
    # Update user's resume_url
    current_user.resume_url = url
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    return {"url": current_user.resume_url}


@app.delete("/users/me/resume", response_model=schemas.UserOut)
def delete_resume(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Delete the resume file from Cloudinary if it's a Cloudinary URL
    if current_user.resume_url and "cloudinary.com" in current_user.resume_url:
        delete_file(current_user.resume_url)
    
    current_user.resume_url = None
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@app.post("/jobs/scrape", response_model=schemas.JobSearchResponse)
def scrape_jobs(
    search: schemas.JobSearchRequest,
    current_user: models.User = Depends(get_current_user),
):
    """
    Scrapes job listings from LinkedIn, Naukri, Internshala, and Unstop.
    Uses actual web scraping with rate limiting and error handling.
    """
    keyword = search.keyword
    location = search.location

    all_results: List[schemas.JobOut] = []
    
    # Initialize scrapers
    scrapers = [
        LinkedInScraper(),
        NaukriScraper(),
        InternshalaScraper(),
        UnstopScraper(),
    ]
    
    for scraper in scrapers:
        try:
            jobs = scraper.search_jobs(keyword, location)
            for job in jobs:
                all_results.append(
                    schemas.JobOut(
                        job_title=job.job_title,
                        company_name=job.company_name,
                        location=job.location,
                        platform=job.platform,
                        job_link=job.job_link,
                    )
                )
        except Exception as e:
            # Log error but continue with other scrapers
            print(f"Error scraping {scraper.platform_name}: {e}")
            continue
    
    # If no results from any scraper (likely due to anti-scraping measures),
    # return a message to the user
    if not all_results:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not fetch jobs from any platform. This may be due to anti-scraping measures. Please try again later or use different search terms."
        )

    return schemas.JobSearchResponse(results=all_results)


@app.post("/applications", response_model=schemas.JobApplicationOut)
def create_application(
    app_in: schemas.JobApplicationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    job_app = models.JobApplication(
        user_id=current_user.id,
        job_title=app_in.job_title,
        company_name=app_in.company_name,
        location=app_in.location,
        platform=app_in.platform,
        job_link=app_in.job_link,
        date_applied=datetime.utcnow(),
        status=app_in.status or "Applied",
    )
    db.add(job_app)
    db.commit()
    db.refresh(job_app)
    return job_app


@app.get("/applications/me", response_model=List[schemas.JobApplicationOut])
def list_my_applications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    apps = (
        db.query(models.JobApplication)
        .filter(models.JobApplication.user_id == current_user.id)
        .order_by(models.JobApplication.date_applied.desc())
        .all()
    )
    return apps

