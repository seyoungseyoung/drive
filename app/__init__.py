import requests
import json
from flask import Flask
import logging
import os
from dotenv import load_dotenv
from app.utils.config import FLASK_SECRET_KEY, MAX_CONTENT_LENGTH, ensure_directories
from app.utils.logger import logger
from app.api.routes import init_routes

# .env 파일 로드
load_dotenv()

def create_app():
    """Create and configure the Flask application"""
    # Ensure required directories exist
    ensure_directories()
    
    # Create Flask app
    app = Flask(__name__, 
                template_folder='../templates',
                static_folder='../static')
    
    # Configure app
    app.secret_key = FLASK_SECRET_KEY
    app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH
    app.config['UPLOAD_FOLDER'] = 'static/uploads'
    
    # Initialize routes
    init_routes(app)
    
    logger.info("Application initialized successfully")
    return app 