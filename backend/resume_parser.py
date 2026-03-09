"""
AI Resume Parser Module
Custom implementation for extracting information from resumes (PDF/DOCX)
Uses regex patterns and NLP techniques to extract key information
"""

import os
import re
import tempfile
from typing import Optional, Dict, Any, List
from datetime import datetime

# Try to import pdfminer for PDF parsing
try:
    from pdfminer.high_level import extract_text
    PDF_PARSER_AVAILABLE = True
except ImportError:
    PDF_PARSER_AVAILABLE = False

# Try to import docx for DOCX parsing
try:
    import docx
    DOCX_PARSER_AVAILABLE = True
except ImportError:
    DOCX_PARSER_AVAILABLE = False

# Common skills database
COMMON_SKILLS = {
    # Programming Languages
    'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'go', 'rust', 'swift',
    'kotlin', 'php', 'scala', 'perl', 'r', 'matlab', 'sql', 'html', 'css', 'sass', 'less',
    
    # Web Frameworks
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'rails',
    'next.js', 'nuxt', 'svelte', 'fastapi', 'laravel',
    
    # Databases
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'oracle', 'sqlite',
    'firebase', 'supabase', 'dynamodb',
    
    # Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins', 'git',
    'github', 'gitlab', 'ci/cd', 'devops', 'linux', 'unix', 'bash', 'powershell',
    
    # Data Science & ML
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras', 'pandas', 'numpy',
    'scikit-learn', 'nlp', 'computer vision', 'data analysis', 'data visualization',
    'tableau', 'power bi', 'jupyter', 'spark', 'hadoop',
    
    # Other Tech
    'rest api', 'graphql', 'microservices', 'agile', 'scrum', 'jira', 'confluence',
    'testing', 'unit testing', 'integration testing', 'selenium', 'cypress',
    'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator',
    
    # Soft Skills
    'leadership', 'communication', 'teamwork', 'problem-solving', 'analytical',
    'project management', 'time management', 'presentation',
    
    # Languages
    'english', 'hindi', 'spanish', 'french', 'german', 'chinese', 'japanese', 'korean',
}

# Common degree patterns
DEGREE_PATTERNS = [
    r'\b(B\.?Tech|B\.?E\.?|M\.?Tech|M\.?Sc\.?|B\.?Sc\.?|M\.?BA?|Ph\.?D\.?|B\.?A\.?|M\.?A\.?)\b',
    r'\b(Bachelor|Master|Doctorate|PhD)\s+(of|in)?\s+\w+\b',
]

# Email regex
EMAIL_REGEX = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'

# Phone regex (various formats)
PHONE_REGEX = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'

# Years of experience patterns
EXPERIENCE_PATTERNS = [
    r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)',
    r'(?:experience|exp)[:\s]+(\d+)\+?\s*(?:years?|yrs?)',
    r'(\d+)\s*-\s*(\d+)\s*(?:years?|yrs?)',
]


def extract_text_from_pdf(file_content: bytes) -> Optional[str]:
    """Extract text from PDF file."""
    if not PDF_PARSER_AVAILABLE:
        # Fallback: try using basic text extraction
        try:
            import io
            from pdfminer.pdfparser import PDFSyntaxError
            from pdfminer.pdfpage import PDFPage
            from pdfminer.pdfinterp import PDFResourceManager, PDFPageInterpreter
            from pdfminer.converter import TextConverter
            from pdfminer.layout import LAParams
            
            resource_manager = PDFResourceManager()
            output = io.StringIO()
            laparams = LAParams()
            device = TextConverter(resource_manager, output, laparams=laparams)
            
            with io.BytesIO(file_content) as f:
                interpreter = PDFPageInterpreter(resource_manager, device)
                for page in PDFPage.get_pages(f):
                    interpreter.process_page(page)
            
            device.close()
            return output.getvalue()
        except Exception as e:
            print(f"PDF extraction error: {e}")
            return None
    else:
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
                tmp.write(file_content)
                tmp_path = tmp.name
            
            text = extract_text(tmp_path)
            os.remove(tmp_path)
            
            # Debug: print first 200 chars of extracted text
            if text:
                print(f"PDF extracted text (first 200 chars): {text[:200]}")
            
            return text
        except Exception as e:
            print(f"PDF extraction error: {e}")
            return None


def extract_text_from_docx(file_content: bytes) -> Optional[str]:
    """Extract text from DOCX file."""
    if not DOCX_PARSER_AVAILABLE:
        return None
    
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.docx') as tmp:
            tmp.write(file_content)
            tmp_path = tmp.name
        
        doc = docx.Document(tmp_path)
        text = '\n'.join([para.text for para in doc.paragraphs])
        os.remove(tmp_path)
        return text
    except Exception as e:
        print(f"DOCX extraction error: {e}")
        return None


def extract_name(text: str) -> Optional[str]:
    """Extract name from resume text using common patterns."""
    lines = text.split('\n')
    
    # Usually name is in the first few non-empty lines
    for line in lines[:5]:
        line = line.strip()
        if not line:
            continue
        
        # Name typically doesn't contain numbers or special chars
        # and is 2-4 words long
        words = line.split()
        if 1 <= len(words) <= 4:
            # Check if line looks like a name (mostly letters)
            if all(w.isalpha() or w in ['-', '.'] for w in line):
                # Skip lines that look like headers
                if any(keyword in line.lower() for keyword in ['resume', 'cv', 'curriculum', 'experience', 'education', 'skills']):
                    continue
                return line.title()
    
    return None


def extract_email(text: str) -> Optional[str]:
    """Extract email from text."""
    match = re.search(EMAIL_REGEX, text)
    return match.group(0) if match else None


def extract_phone(text: str) -> Optional[str]:
    """Extract phone number from text."""
    match = re.search(PHONE_REGEX, text)
    return match.group(0) if match else None


def extract_skills(text: str) -> List[str]:
    """Extract skills from text by matching against common skills database."""
    text_lower = text.lower()
    found_skills = set()
    
    for skill in COMMON_SKILLS:
        # Use word boundary matching to avoid partial matches
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.add(skill.title() if len(skill) > 2 else skill.upper())
    
    return sorted(list(found_skills))


def extract_experience(text: str) -> List[str]:
    """Extract work experience entries from text."""
    experience = []
    
    # Split by common section headers
    sections = re.split(r'\n\s*(?:work\s*experience|employment|professional\s*experience)\s*\n', 
                        text, flags=re.IGNORECASE)
    
    if len(sections) > 1:
        exp_section = sections[1]
        # Further split by dates or company names
        entries = re.split(r'\n\s*(?:\w+\s*\d{4}|present|\.|•|-)', exp_section)
        for entry in entries[:5]:  # Limit to 5 entries
            entry = entry.strip()
            if len(entry) > 20:  # Filter out short snippets
                experience.append(entry[:200])  # Limit length
    
    return experience


def extract_education(text: str) -> List[Dict[str, str]]:
    """Extract education details from text."""
    education = []
    
    # Find education section
    sections = re.split(r'\n\s*(?:education|academic|qualification)\s*\n', 
                        text, flags=re.IGNORECASE)
    
    if len(sections) > 1:
        edu_section = sections[1]
        # Look for degree patterns
        for degree_pattern in DEGREE_PATTERNS:
            matches = re.finditer(degree_pattern, edu_section, re.IGNORECASE)
            for match in matches:
                # Get surrounding context
                start = max(0, match.start() - 50)
                end = min(len(edu_section), match.end() + 100)
                context = edu_section[start:end].strip()
                
                education.append({
                    'degree': match.group(0),
                    'context': context.replace('\n', ' ')
                })
    
    return education[:5]  # Limit to 5 entries


def extract_companies(text: str) -> List[str]:
    """Extract company names from text."""
    companies = []
    
    # Common company suffixes
    suffixes = ['Inc', 'LLC', 'Ltd', 'Corp', 'Corporation', 'Company', 'Co', 'Technologies', 
                'Solutions', 'Services', 'Consulting', 'Systems', 'Tech', 'Labs', 'Studio']
    
    for suffix in suffixes:
        pattern = rf'\b[A-Z][a-zA-Z\s]+{suffix}\b'
        matches = re.findall(pattern, text)
        companies.extend(matches)
    
    return list(set(companies))[:5]  # Unique, limit to 5


def calculate_total_experience(text: str) -> Optional[float]:
    """Calculate total years of experience."""
    text_lower = text.lower()
    
    for pattern in EXPERIENCE_PATTERNS:
        match = re.search(pattern, text_lower)
        if match:
            if match.lastindex == 1:
                # Single number (e.g., "5 years experience")
                return float(match.group(1))
            elif match.lastindex == 2:
                # Range (e.g., "2-4 years")
                return (float(match.group(1)) + float(match.group(2))) / 2
    
    # Count number of job entries as a rough estimate
    exp_section = re.split(r'\n\s*(?:work\s*experience|employment)\s*\n', 
                           text, flags=re.IGNORECASE)
    if len(exp_section) > 1:
        # Estimate: each entry ~2 years
        entries = re.split(r'\n\s*(?:\w+\s*\d{4}|present|\.|•|-)', exp_section[1])
        job_count = sum(1 for e in entries if len(e.strip()) > 20)
        return min(job_count * 2, 20)  # Cap at 20 years
    
    return None


def parse_resume(file_content: bytes, filename: str) -> Dict[str, Any]:
    """
    Parse a resume and extract relevant information.
    
    Args:
        file_content: The raw file content (PDF or DOCX)
        filename: The name of the file (used to determine extension)
    
    Returns:
        Dictionary containing extracted resume data
    """
    # Determine file extension
    file_ext = os.path.splitext(filename)[1].lower()
    
    # Extract text based on file type
    text = None
    if file_ext == '.pdf':
        text = extract_text_from_pdf(file_content)
    elif file_ext in ['.docx', '.doc']:
        text = extract_text_from_docx(file_content)
    
    if not text:
        return {
            "name": None,
            "email": None,
            "mobile_number": None,
            "skills": [],
            "experience": [],
            "education": [],
            "company_names": [],
            "college_name": None,
            "degree": None,
            "designation": None,
            "total_experience": None,
        }
    
    # Extract information
    name = extract_name(text)
    email = extract_email(text)
    phone = extract_phone(text)
    skills = extract_skills(text)
    experience = extract_experience(text)
    education = extract_education(text)
    companies = extract_companies(text)
    total_exp = calculate_total_experience(text)
    
    # Extract college and degree from education
    college_name = None
    degree = None
    if education:
        degree = education[0].get('degree')
        # Try to extract college name from context
        if education[0].get('context'):
            edu_text = education[0]['context']
            # Look for college names (usually in quotes or after "from")
            college_match = re.search(r'(?:from|at|in)\s+([A-Z][A-Za-z\s]+)', edu_text)
            if college_match:
                college_name = college_match.group(1).strip()
    
    # Extract designation (current role)
    designation = None
    exp_section = re.split(r'\n\s*(?:work\s*experience|employment)\s*\n', 
                           text, flags=re.IGNORECASE)
    if len(exp_section) > 1:
        # Get first job title after experience header
        job_match = re.search(r'\n\s*([A-Z][a-zA-Z\s]+(?:Engineer|Developer|Manager|Analyst|Designer|Consultant|Lead|Senior|Junior|Head|Director|VP))\s*\n', 
                             exp_section[1])
        if job_match:
            designation = job_match.group(1).strip()
    
    result = {
        "name": name,
        "email": email,
        "mobile_number": phone,
        "skills": skills,
        "experience": experience,
        "education": education,
        "company_names": companies,
        "college_name": college_name,
        "degree": degree,
        "designation": designation,
        "total_experience": total_exp,
    }
    
    # Remove None values
    result = {k: v for k, v in result.items() if v is not None and v != []}
    
    return result


def format_skills_for_profile(skills: List[str]) -> str:
    """
    Format skills list for user profile storage.
    Joins skills with commas.
    """
    if not skills:
        return ""
    return ", ".join(skills)

