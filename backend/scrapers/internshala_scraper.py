import urllib.parse
from typing import List

from .base import BaseScraper, JobItem


class InternshalaScraper(BaseScraper):
    """Scraper for Internshala jobs/internships."""
    
    def __init__(self):
        super().__init__("Internshala")
    
    def _build_search_url(self, keyword: str, location: str) -> str:
        encoded_keyword = urllib.parse.quote(keyword)
        # Internshala uses 'locations' parameter
        return f"https://internshala.com/jobs/keywords/{encoded_keyword}"
    
    def search_jobs(self, keyword: str, location: str) -> List[JobItem]:
        """Search for jobs/internships on Internshala."""
        jobs = []
        url = self._build_search_url(keyword, location)
        
        soup = self._get(url)
        if soup is None:
            return jobs
        
        # Find job cards - Internshala uses 'individual_internship' class
        job_cards = soup.find_all('div', class_='individual_internship')
        
        for card in job_cards[:20]:  # Limit to 20 results
            try:
                # Extract job title
                title_elem = card.find('h2', class_='heading')
                if not title_elem:
                    title_elem = card.find('a', class_='job-title-href')
                job_title = self._clean_text(title_elem.text) if title_elem else None
                
                # Extract company name
                company_elem = card.find('p', class_='company-name')
                if not company_elem:
                    company_elem = card.find('h4', class_='company-name')
                company_name = self._clean_text(company_elem.text.replace('at', '').strip()) if company_elem else None
                
                # Extract location
                location_elem = card.find('span', class_='location')
                if not location_elem:
                    location_elem = card.find('a', class_='location_link')
                job_location = self._clean_text(location_elem.text) if location_elem else None
                
                # Extract job link
                link_elem = card.find('a', class_='job-title-href')
                if not link_elem:
                    link_elem = card.find('a', class_='view_detail_button')
                job_link = 'https://internshala.com' + link_elem.get('href', '') if link_elem else None
                
                if job_title and job_link:
                    jobs.append(JobItem(
                        job_title=job_title,
                        company_name=company_name or "Not specified",
                        location=job_location or location,
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
        """Fallback parsing method for Internshala."""
        jobs = []
        
        # Try alternative class names
        all_cards = soup.find_all('div', class_=lambda x: x and 'internship' in x.lower() if x else False)
        
        for card in all_cards[:20]:
            try:
                # Look for title
                title_elem = card.find(['h2', 'h3', 'a'], class_=lambda x: x and ('heading' in x.lower() or 'title' in x.lower()) if x else False)
                if not title_elem:
                    title_elem = card.find(['h2', 'h3', 'a'])
                
                job_title = self._clean_text(title_elem.text) if title_elem else None
                
                # Build link
                job_link = ''
                if title_elem and title_elem.name == 'a':
                    job_link = 'https://internshala.com' + title_elem.get('href', '')
                else:
                    link_elem = card.find('a')
                    if link_elem:
                        job_link = 'https://internshala.com' + link_elem.get('href', '')
                
                # Look for company
                company_elem = card.find(['p', 'h4', 'span', 'div'], class_=lambda x: x and 'company' in x.lower() if x else False)
                company_name = self._clean_text(company_elem.text.replace('at', '').strip()) if company_elem else None
                
                # Look for location
                location_elem = card.find(['span', 'div', 'a'], class_=lambda x: x and 'location' in x.lower() if x else False)
                job_location = self._clean_text(location_elem.text) if location_elem else None
                
                if job_title and job_link:
                    jobs.append(JobItem(
                        job_title=job_title,
                        company_name=company_name or "Not specified",
                        location=job_location,
                        platform=self.platform_name,
                        job_link=job_link
                    ))
            except Exception:
                return jobs

