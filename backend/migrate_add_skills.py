"""
Migration script to add 'skills' column to users table.
Run this once to update your existing database.
"""

import os
import sys

# Add the backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import get_engine
from sqlalchemy import text


def migrate_add_skills_column():
    """Add the skills column to the users table."""
    engine = get_engine()
    
    with engine.connect() as conn:
        # Check if column exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'skills'
        """))
        
        if result.fetchone():
            print("✓ Column 'skills' already exists in users table.")
            return
        
        # Add the column
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN skills VARCHAR"))
            conn.commit()
            print("✓ Successfully added 'skills' column to users table!")
        except Exception as e:
            print(f"Error adding column: {e}")
            raise


if __name__ == "__main__":
    print("Running migration to add skills column...")
    migrate_add_skills_column()
    print("Migration complete!")

