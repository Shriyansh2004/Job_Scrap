"""Migration script to add resume_url column to users table"""
import os
from sqlalchemy import create_engine, text

SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+psycopg://postgres:postgres@localhost:5432/job_scraper"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)

def migrate():
    with engine.connect() as conn:
        # Check if column exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'resume_url'
        """))
        
        if result.fetchone() is None:
            # Add the column
            conn.execute(text("ALTER TABLE users ADD COLUMN resume_url VARCHAR"))
            conn.commit()
            print("Successfully added resume_url column to users table")
        else:
            print("resume_url column already exists")

if __name__ == "__main__":
    migrate()

