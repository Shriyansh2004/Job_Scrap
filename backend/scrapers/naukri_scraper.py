import urllib.parse
from typing import List

from .base import BaseScraper, JobItem


class NaukriScraper(BaseScraper):
    """Scraper for Naukri jobs."""
    
    def __init__(self):
        super().__init__("Naukri")
    
    def _build_search_url(self, keyword: str, location: str) -> str:
        encoded_keyword = urllib.parse.quote(keyword)
        encoded_location = urllib.parse.quote(location)
        return f"https://www.naukri.com/jobs-in-{encoded_location}?k={encoded_keyword}&l={encoded_location}"
    
    def search_jobs(self, keyword: str, location: str) -> List[JobItem]:
        """Search for jobs on Naukri."""
        jobs = []
        url = self._build_search_url(keyword, location)
        
        soup = self._get(url)
        if soup is None:
            return jobs
        
        # Find job cards
        job_cards = soup.find_all('div', class_='jobTuple')
        
        for card in job_cards[:20]:  # Limit to 20 results
            try:
                # Extract job title
                title_elem = card.find('a', class_='title')
                job_title = self._clean_text(title_elem.text) if title_elem else None
                
                # Extract company name
                company_elem = card.find('a', class_='companyInfo')
                if not company_elem:
                    company_elem = card.find('span', class_='companyInfo')
                company_name = self._clean_text(company_elem.text) if company_elem else None
                
                # Extract location
                location_elem = card.find('span', class_='location')
                job_location = self._clean_text(location_elem.text) if location_elem else None
                
                # Extract job link
                job_link = title_elem.get('href', '') if title_elem else None
                
                if job_title and job_link:
                    jobs.append(JobItem(
                        job_title=job_title,
                        company_name=company_name or "Not specified",
                        location=job_location,
                        platform=self.platform_name,
                        job_link=job_link
                    ))
            except Exception as e:
                continue
        
        # Fallback: Try alternative selectors
        if not jobs:
            jobs = self._fallback_parse(soup)
        
        self._rate_limit(2)
        return jobs
    
    def _fallback_parse(self, soup) -> List[JobItem]:
        """Fallback parsing method for Naukri."""
        jobs = []
        
        # Try finding all job cards with different class patterns
        all_cards = soup.find_all('div', class_=lambda x: x and 'job' in x.lower() if x else False)
        
        for card in all_cards[:20]:
            try:
                # Look for title in various elements
                title_elem = card.find(['a', 'h2', 'h3'], class_=lambda x: x and 'title' in x.lower() if x else False)
                if not title_elem:
                    title_elem = card.find(['a', 'h2', 'h3'])
                
                job_title = self._clean_text(title_elem.text) if title_elem else None
                job_link = title_elem.get('href', '') if title_elem and title_elem.name == 'a' else None
                
                # Look for company
                company_elem = card.find(['a', 'span', 'div'], class_=lambda x: x and 'company' in x.lower() if x else False)
                company_name = self._clean_text(company_elem.text) if company_elem else None
                
                # Look for location
                location_elem = card.find(['span', 'div'], class_=lambda x: x and 'location' in x.lower() if x else False)
                job_location = self._clean_text(location_elem.text) if location_elem else None
                
                if job_title:
                    jobs.append(JobItem(
                        job_title=job_title,
                        company_name=company_name or "Not specified",
                        location=job_location,
                        platform=self.platform_name,
                        job_link=job_link or ""
                    ))
            except Exception:
                continue
        
        return jobs

