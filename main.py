from app import create_app
from app.utils.config import HOST, PORT, DEBUG
from app.utils.logger import logger

if __name__ == '__main__':
    # Create and configure the application
    app = create_app()
    
    # Run the application
    logger.info(f"Starting server on {HOST}:{PORT}")
    app.run(host=HOST, port=PORT, debug=DEBUG) 