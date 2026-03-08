# Deployment Tasks - Backend on Render

## ✅ Completed Tasks

- [x] 1. Update requirements.txt - Added Cloudinary SDK
- [x] 2. Create Cloudinary configuration module (backend/cloudinary_config.py)
- [x] 3. Update main.py - Integrated Cloudinary for file uploads
- [x] 4. Create .env.example template
- [x] 5. Update auth.py - Fixed SECRET_KEY environment variable name
- [x] 6. Create Render deployment configuration (render.yaml)
- [x] 7. Update frontend API to use environment variable for backend URL
- [x] 8. Create frontend .env.example template

## 🚀 Deployment Steps

### Step 1: Set up Cloudinary
1. Go to [Cloudinary](https://cloudinary.com/) and create a free account
2. Get your Cloud Name, API Key, and API Secret from the Dashboard
3. Note these down for later

### Step 2: Deploy Backend on Render

**Option A: Using render.yaml (Recommended)**
1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" → "Blueprint"
4. Select your GitHub repository
5. Select the render.yaml file
6. Fill in the environment variables:
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
   - `ALLOWED_ORIGINS`: Your frontend URL (e.g., https://your-app.vercel.app)
7. Click "Apply"

**Option B: Manual Setup**
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   - `DATABASE_URL`: Will be auto-filled when you create a PostgreSQL database
   - `SECRET_KEY`: Generate using `python -c "import secrets; print(secrets.token_hex(32))"`
   - `BACKEND_URL`: Your Render backend URL (e.g., https://job-scraper-backend.onrender.com)
   - `ALLOWED_ORIGINS`: Your frontend URL
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
6. Click "Create Web Service"

### Step 3: Deploy Frontend
1. Go to [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/)
2. Connect your frontend GitHub repository
3. Add environment variable:
   - `VITE_API_URL`: Your Render backend URL (e.g., https://job-scraper-backend.onrender.com)
4. Deploy

### Step 4: Update CORS
After deploying frontend, update the `ALLOWED_ORIGINS` environment variable in Render to include your frontend URL.

## 🔧 Environment Variables Reference

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SECRET_KEY=your-secure-random-key
BACKEND_URL=https://your-backend.onrender.com
ALLOWED_ORIGINS=https://your-frontend.vercel.app
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend.onrender.com
```

