import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API Configuration
DEEPSEAK_API_KEY = os.getenv('DEEPSEAK_API_KEY')
FLASK_SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'default_secret_key')

# Server Configuration
HOST = '0.0.0.0'  # Listen on all interfaces
PORT = 5000
DEBUG = True

# File upload settings
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pptx', 'pdf', 'jpg', 'jpeg', 'png'}

# Make sure required directories exist
def ensure_directories():
    """Ensure all required directories exist"""
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs('static', exist_ok=True) 