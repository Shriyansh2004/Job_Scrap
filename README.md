<div align="center">

# Fast Job Scraper Platform

<p align="center">

<a href="https://fastjobscraper.netlify.app/">
<img src="https://img.shields.io/badge/Live%20Frontend-Netlify-black?style=for-the-badge&logo=netlify">
</a>

<a href="https://job-scraper-backend-jpr4.onrender.com">
<img src="https://img.shields.io/badge/Backend-Render-black?style=for-the-badge&logo=render">
</a>

<img src="https://img.shields.io/badge/React-TypeScript-black?style=for-the-badge&logo=react">
<img src="https://img.shields.io/badge/FastAPI-Python-black?style=for-the-badge&logo=fastapi">
<img src="https://img.shields.io/badge/PostgreSQL-Database-black?style=for-the-badge&logo=postgresql">

</p>

<h3 align="center">
AI Powered Multi-Platform Job Scraper
</h3>

<p align="center">
A full stack platform that aggregates jobs from multiple platforms and tracks applications in one dashboard.
</p>

</div>

---

# Platform Overview

Fast Job Scraper is a modern job discovery system that allows users to search, scrape, and manage job opportunities from multiple platforms in one unified interface.

The platform simplifies job searching by collecting listings from several job portals, presenting them in a clean dashboard, and tracking user applications.

It also includes an AI Resume Parser that extracts skills automatically from uploaded resumes.

---

# Live Deployment

Frontend

https://fastjobscraper.netlify.app/

Backend API

https://job-scraper-backend-jpr4.onrender.com

---

# Core Features

## Authentication System

Secure user authentication powered by JWT tokens.

Features

• User Signup
• User Login
• Token Based Authentication
• Protected Routes
• Secure API Access

---

## Multi Platform Job Scraper

Users can search and scrape jobs using keyword and location filters.

Workflow

1 Enter job keyword
2 Enter job location
3 Click Scrape Jobs
4 Results are aggregated from multiple platforms

Supported platforms

LinkedIn
Naukri
Internshala
Unstop

---

## Job Results Dashboard

Scraped jobs are displayed in a structured results table.

| Job Title         | Company      | Location  | Platform | Job Link | Apply |
| ----------------- | ------------ | --------- | -------- | -------- | ----- |
| Software Engineer | Example Corp | Bangalore | LinkedIn | View Job | Apply |

---

## Job Application Tracking

Users can apply to jobs and track applications.

When a user clicks Apply:

• Opens the original job listing
• Stores application record in database

Stored Data

Job Title
Company Name
Platform
Date Applied
Application Status

---

## Application History

Every application is stored and displayed in a dedicated history page.

Users can review

• previously applied jobs
• job platform
• application date
• job link

This allows better tracking of job search progress.

---

## Profile Management

Users can manage their profile information.

Supported operations

View profile
Update profile
Upload profile image
Delete profile image

This module demonstrates full CRUD operations.

---

# AI Resume Parser

The system includes an AI feature that extracts skills from uploaded resumes.

Process

1 User uploads resume
2 AI analyzes the document
3 Skills are extracted automatically
4 Skills are displayed in the interface

Example extracted skills

Python
React
SQL
Machine Learning
FastAPI

This feature helps quickly analyze candidate capabilities.

---

# System Architecture

```
Frontend
React + TypeScript + Tailwind + Vite
        │
        │ REST API
        ▼
Backend
FastAPI Application
        │
        │ ORM
        ▼
Database
PostgreSQL
```

---

# Tech Stack

Frontend

React
TypeScript
TailwindCSS
Vite

Backend

Python
FastAPI
JWT Authentication

Database

PostgreSQL

Deployment

Netlify
Render

AI Integration

Resume Parsing
Skill Extraction

---

# Project Structure

```
fast-job-scraper

frontend
 ├── src
 ├── components
 ├── pages
 ├── services
 └── utils

backend
 ├── routers
 ├── models
 ├── schemas
 ├── database
 └── main.py

database
 └── PostgreSQL
```

---

# API Example

Login

POST /auth/login

Request

{
"email": "[user@example.com](mailto:user@example.com)",
"password": "password"
}

Response

{
"access_token": "jwt_token",
"token_type": "bearer"
}

---

Scrape Jobs

POST /jobs/scrape

Request

{
"keyword": "Software Engineer",
"location": "Bangalore"
}

---

# Local Development Setup

Clone repository

```
git clone https://github.com/yourusername/job-scraper-platform.git
cd job-scraper-platform
```

Backend Setup

```
cd backend

python -m venv venv
source venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend will run on

http://localhost:8000

Frontend Setup

```
cd frontend

npm install
npm run dev
```

Frontend runs on

http://localhost:5173

---

# Deployment

Frontend deployed using Netlify

https://fastjobscraper.netlify.app/

Backend deployed using Render

https://job-scraper-backend-jpr4.onrender.com

---

# Future Improvements

Advanced job filters

Salary prediction system

AI job recommendations

Email job alerts

Resume improvement suggestions

Company insights dashboard

---

# Author

Anubhab Sahoo

Electrical Engineering Student
Full Stack Developer

Technologies

FastAPI
React
PostgreSQL
AI Integration

---

# License

This project was created as an academic assignment and technical demonstration.
