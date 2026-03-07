import time
import logging
from abc import ABC, abstractmethod
from typing import List, Dict, Optional
from dataclasses import dataclass

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


@dataclass
class JobItem:
    job_title: str
    company_name: str
    location: Optional[str]
    platform: str
    job_link: str


class BaseScraper(ABC):
    """Base class for all job scrapers."""
    
    def __init__(self, platform_name: str):
        self.platform_name = platform_name
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
        })
    
    def _get(self, url: str, timeout: int = 30) -> Optional[BeautifulSoup]:
        """Make a GET request and return BeautifulSoup object."""
        try:
            response = self.session.get(url, timeout=timeout)
            response.raise_for_status()
            return BeautifulSoup(response.content, "lxml")
        except requests.RequestException as e:
            logger.error(f"Error fetching {url}: {e}")
            return None
    
    def _rate_limit(self, delay: float = 1.0):
        """Apply rate limiting between requests."""
        time.sleep(delay)
    
    @abstractmethod
    def search_jobs(self, keyword: str, location: str) -> List[JobItem]:
        """
        Search for jobs based on keyword and location.
        Must be implemented by each platform scraper.
        """
        pass
    
    def _clean_text(self, text: Optional[str]) -> Optional[str]:
        """Clean and normalize text."""
        if text is None:
            return None
        return " ".join(text.split()).strip()
    
    def _build_search_url(self, keyword: str, location: str) -> str:
        """
        Build the search URL for the platform.
        Must be implemented by each platform scraper.
        """
        raise NotImplementedError

