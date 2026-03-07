import urllib.parse
from typing import List

from .base import BaseScraper, JobItem


class UnstopScraper(BaseScraper):
    """Scraper for Unstop (formerly Dare2Compete) jobs/internships."""
    
    def __init__(self):
        super().__init__("Unstop")
    
    def _build_search_url(self, keyword: str, location: str) -> str:
        encoded_keyword = urllib.parse.quote(keyword)
        # Unstop uses query parameters
        return f"https://unstop.com/jobs?search={encoded_keyword}"
    
    def search_jobs(self, keyword: str, location: str) -> List[JobItem]:
        """Search for jobs on Unstop."""
        jobs = []
        url = self._build_search_url(keyword, location)
        
        soup = self._get(url)
        if soup is None:
            return jobs
        
        # Find job cards - Unstop uses various class names
        # Try common patterns
        job_cards = soup.find_all('div', class_=lambda x: x and 'job' in x.lower() if x else False)
        
        for card in job_cards[:20]:  # Limit to 20 results
            try:
                # Extract job title
                title_elem = card.find(['h2', 'h3', 'h4', 'a'], class_=lambda x: x and ('title' in x.lower() or 'heading' in x.lower()) if x else False)
                if not title_elem:
                    title_elem = card.find(['h2', 'h3', 'h4', 'a'])
                job_title = self._clean_text(title_elem.text) if title_elem else None
                
                # Extract company name
                company_elem = card.find(['span', 'div', 'p', 'a'], class_=lambda x: x and 'company' in x.lower() if x else False)
                if not company_elem:
                    # Try finding by icon or label
                    company_elem = card.find(string=lambda x: x and 'Company' in x if x else False)
                    if company_elem:
                        company_elem = company_elem.find_next_sibling()
                company_name = self._clean_text(company_elem.text) if company_elem and hasattr(company_elem, 'text') else None
                
                # Extract location
                location_elem = card.find(['span', 'div', 'p'], class_=lambda x: x and 'location' in x.lower() if x else False)
                job_location = self._clean_text(location_elem.text) if location_elem else None
                
                # Extract job link
                link_elem = card.find('a')
                if not link_elem:
                    link_elem = title_elem if title_elem and title_elem.name == 'a' else None
                job_link = ''
                if link_elem:
                    href = link_elem.get('href', '')
                    job_link = href if href.startswith('http') else f'https://unstop.com{href}'
                
                if job_title:
                    jobs.append(JobItem(
                        job_title=job_title,
                        company_name=company_name or "Not specified",
                        location=job_location or location,
                        platform=self.platform_name,
                        job_link=job_link
                    ))
            except Exception as e:
                continue
        
        # Fallback: Try alternative parsing
        if not jobs:
            jobs = self._fallback_parse(soup, keyword)
        
        self._rate_limit(2)
        return jobs
    
    def _fallback_parse(self, soup, keyword: str) -> List[JobItem]:
        """Fallback parsing method for Unstop."""
        jobs = []
        
        # Try finding all links that might be job listings
        job_links = soup.find_all('a', href=lambda x: x and ('job' in x.lower() or '/jobs/' in x))
        
        seen_titles = set()
        for link in job_links[:20]:
            try:
                job_title = self._clean_text(link.text)
                if not job_title or job_title in seen_titles:
                    continue
                seen_titles.add(job_title)
                
                href = link.get('href', '')
                job_link = href if href.startswith('http') else f'https://unstop.com{href}'
                
                # Try to find company and location from parent elements
                parent = link.find_parent(['div', 'article', 'li'])
                company_name = None
                job_location = None
                
                if parent:
                    company_elem = parent.find(['span', 'div', 'p'], class_=lambda x: x and 'company' in x.lower() if x else False)
                    if company_elem:
                        company_name = self._clean_text(company_elem.text)
                    
                    location_elem = parent.find(['span', 'div', 'p'], class_=lambda x: x and 'location' in x.lower() if x else False)
                    if location_elem:
                        job_location = self._clean_text(location_elem.text)
                
                jobs.append(JobItem(
                    job_title=job_title,
                    company_name=company_name or "Not specified",
                    location=job_location,
                    platform=self.platform_name,
                    job_link=job_link
                ))
            except Exception:
                continue
        
        return jobs

