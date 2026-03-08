import os
import uuid

import cloudinary
import cloudinary.uploader

# Configure Cloudinary with credentials from environment variables
def configure_cloudinary():
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
        secure=True
    )

def upload_image(file_content: bytes, file_extension: str = "jpg") -> str:
    """Upload an image to Cloudinary and return the URL."""
    configure_cloudinary()
    
    unique_filename = f"job_scraper/{uuid.uuid4()}.{file_extension}"
    
    result = cloudinary.uploader.upload(
        file_content,
        public_id=unique_filename.replace(f".{file_extension}", ""),
        resource_type="image",
        folder="job_scraper"
    )
    
    return result["secure_url"]

def upload_resume(file_content: bytes) -> str:
    """Upload a resume (PDF) to Cloudinary and return the URL."""
    configure_cloudinary()
    
    unique_filename = f"job_scraper/resumes/{uuid.uuid4()}.pdf"
    
    result = cloudinary.uploader.upload(
        file_content,
        public_id=unique_filename.replace(".pdf", ""),
        resource_type="raw",
        folder="job_scraper/resumes"
    )
    
    return result["secure_url"]

def delete_file(url: str) -> bool:
    """Delete a file from Cloudinary based on its URL."""
    configure_cloudinary()
    
    # Extract public ID from URL
    # Cloudinary URLs format: https://res.cloudinary.com/<cloud_name>/<resource_type>/<version>/<folder>/<public_id>
    try:
        # Get the public ID from the URL
        parts = url.split("/")
        # Find the job_scraper folder position
        if "job_scraper" in parts:
            idx = parts.index("job_scraper")
            # Get everything from job_scraper onwards
            public_id_parts = parts[idx:]
            # Remove extension if present
            if public_id_parts[-1]:
                public_id_parts[-1] = public_id_parts[-1].rsplit(".", 1)[0]
            public_id = "/".join(public_id_parts)
            
            cloudinary.uploader.destroy(public_id)
            return True
    except Exception as e:
        print(f"Error deleting file from Cloudinary: {e}")
        return False
    
    return False

