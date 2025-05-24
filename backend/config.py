import os

# Default API Key
DEFAULT_API_KEY = "AIzaSyCdDcfNJFkJMM8OEE_VZOQJwUMg_gmIA3s"

# Google API Key - use environment variable if set, otherwise use default
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY', DEFAULT_API_KEY)

if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY is not set. Please set it before running the application.")

# Google Gemini API Configuration
GOOGLE_API_KEY = "AIzaSyCdDcfNJFkJMM8OEE_VZOQJwUMg_gmIA3s" 