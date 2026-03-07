## Job Scraper Platform – How to run

### Backend (FastAPI)

1. Open a terminal in the `backend` folder:

   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. The API will be available at `http://localhost:8000` and the docs at `http://localhost:8000/docs`.

### Frontend (React + TypeScript + Vite + Tailwind)

1. Open another terminal in the `frontend` folder:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. Open the printed URL (usually `http://localhost:5173`) in your browser.

### Features implemented

- Email/password authentication (signup + login) with JWT.
- Protected routes on the backend using token-based auth.
- Job scraper endpoint (demo data) exposing jobs from LinkedIn, Naukri, Internshala and Unstop.
- Job results table with apply button opening the job link and storing an application record.
- Application history table per user with platform, date applied and link.
- Profile page with view/update profile and delete image – demonstrating full CRUD.

