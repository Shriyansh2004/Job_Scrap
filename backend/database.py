import os
from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


@lru_cache()
def get_database_url():
    """Get the database URL from environment variable with caching."""
    return os.getenv(
        "DATABASE_URL", "postgresql+psycopg://postgres:postgres@localhost:5432/job_scraper"
    )


def get_engine():
    """Create and return the SQLAlchemy engine."""
    database_url = get_database_url()
    connect_args = {}
    if database_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
    return create_engine(database_url, connect_args=connect_args)


@lru_cache()
def get_session_maker():
    """Get the session maker with caching."""
    return sessionmaker(autocommit=False, autoflush=False, bind=get_engine())


# Create a lazy property for SessionLocal
class LazySessionLocal:
    """Lazy session maker that defers engine creation."""
    
    def __call__(self):
        Session = get_session_maker()
        return Session()


SessionLocal = LazySessionLocal()

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

