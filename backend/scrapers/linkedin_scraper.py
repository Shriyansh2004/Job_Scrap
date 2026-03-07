import urllib.parse
from typing import List, Optional

from .base import BaseScraper, JobItem


class LinkedInScraper(BaseScraper):
    """Scraper for LinkedIn jobs."""
    
    def __init__(self):
        super().__init__("LinkedIn")
    
    def _build_search_url(self, keyword: str, location: str) -> str:
        encoded_keyword = urllib.parse.quote(keyword)
        encoded_location = urllib.parse.quote(location)
        return f"https://www.linkedin.com/jobs/search/?keywords={encoded_keyword}&location={encoded_location}&f_TPR=r86400&sortBy=DD"
    
    def search_jobs(self, keyword: str, location: str) -> List[JobItem]:
        """
        Search for jobs on LinkedIn.
        Note: LinkedIn has strong anti-scraping measures. This uses their public jobs search.
        """
        jobs = []
        url = self._build_search_url(keyword, location)
        
        soup = self._get(url)
        if soup is None:
            return jobs
        
        # LinkedIn uses JavaScript to render job listings
        # We'll try to extract from the HTML that's available
        job_cards = soup.find_all('div', class_='base-card')
        
        for card in job_cards[:20]:  # Limit to 20 results
            try:
                # Extract job title
                title_elem = card.find('h3', class_='base-search-card__title')
                job_title = self._clean_text(title_elem.text) if title_elem else None
                
                # Extract company name
                company_elem = card.find('h4', class_='base-search-card__subtitle')
                company_name = self._clean_text(company_elem.text) if company_elem else None
                
                # Extract location
                location_elem = card.find('span', class_='job-search-card__location')
                job_location = self._clean_text(location_elem.text) if location_elem else None
                
                # Extract job link
                link_elem = card.find('a', class_='base-card__full-link')
                job_link = link_elem.get('href', '') if link_elem else None
                
                if job_title and job_link:
                    jobs.append(JobItem(
                        job_title=job_title,
                        company_name=company_name or "Not specified",
                        location=job_location,
                        platform=self.platform_name,
                        job_link=job_link.split('?')[0]  # Remove query params
                    ))
            except Exception as e:
                continue
        
        # Fallback: Try alternative selectors if no jobs found
        if not jobs:
            jobs = self._fallback_parse(soup, keyword)
        
        self._rate_limit(2)
        return jobs
    
    def _fallback_parse(self, soup, keyword: str) -> List[JobItem]:
        """Fallback parsing method for LinkedIn."""
        jobs = []
        
        # Try alternative selectors
        job_listings = soup.find_all('li', class_='jobs-search-results__list-item')
        
        for listing in job_listings[:20]:
            try:
                title_elem = listing.find('a', class_='job-card-list__title')
                job_title = self._clean_text(title_elem.text) if title_elem else None
                
                company_elem = listing.find('div', className__or='job-card-container__companyName')
                company_name = self._clean_text(company_elem.text) if company_elem else None
                
                location_elem = listing.find('div', className__or='job-card-container__metadata-item')
                job_location = self._clean_text(location_elem.text) if location_elem else None
                
                job_link = title_elem.get('href', '') if title_elem else None
                
                if job_title and job_link:
                    jobs.append(JobItem(
                        job_title=job_title,
                        company_name=company_name or "Not specified",
                        location=job_location,
                        platform=self.platform_name,
                        job_link=job_link.split('?')[0]
                    ))
            except Exception:
                continue
        
        return jobs

