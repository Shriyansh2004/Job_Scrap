import os
import uuid
from pathlib import Path
from urllib.parse import urljoin

# Get the base directory and uploads path
BASE_DIR = Path(__file__).parent
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

# Ensure the directories for images and resumes exist
IMAGES_DIR = UPLOADS_DIR / "images"
IMAGES_DIR.mkdir(exist_ok=True)

RESUMES_DIR = UPLOADS_DIR / "resumes"
RESUMES_DIR.mkdir(exist_ok=True)


def get_base_url() -> str:
    """Get the base URL for serving static files."""
    # Try to get from environment variable, otherwise use default
    # Check RENDER_EXTERNAL_URL first (provided by Render natively), then BACKEND_URL, then API_BASE_URL
    return os.getenv("RENDER_EXTERNAL_URL") or os.getenv("BACKEND_URL") or os.getenv("API_BASE_URL", "http://localhost:8000")


def save_image(file_content: bytes, file_extension: str = "jpg") -> str:
    """Save an image locally and return the full URL."""
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = IMAGES_DIR / unique_filename
    
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    # Return full URL with backend base URL
    base_url = get_base_url()
    return f"{base_url}/uploads/images/{unique_filename}"


def save_resume(file_content: bytes) -> str:
    """Save a resume locally and return the full URL."""
    unique_filename = f"{uuid.uuid4()}.pdf"
    file_path = RESUMES_DIR / unique_filename
    
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    # Return full URL with backend base URL
    base_url = get_base_url()
    return f"{base_url}/uploads/resumes/{unique_filename}"


def delete_file(url: str) -> bool:
    """Delete a local file based on its URL."""
    try:
        # Extract filename from URL
        # Handle both relative URLs (/uploads/...) and full URLs (http://.../uploads/...)
        filename = None
        if url.startswith("/uploads/"):
            filename = url.split("/")[-1]
        elif "/uploads/" in url:
            # Full URL - extract path and get filename
            path_part = url.split("/uploads/")[-1]
            filename = path_part.split("/")[-1]
        
        if filename:
            # Determine which directory based on the URL
            if "/images/" in url:
                file_path = IMAGES_DIR / filename
            elif "/resumes/" in url:
                file_path = RESUMES_DIR / filename
            else:
                return False
            
            if file_path.exists():
                file_path.unlink()
                return True
    except Exception as e:
        print(f"Error deleting local file: {e}")
        return False
    
    return False

