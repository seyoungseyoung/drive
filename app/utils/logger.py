import logging
import os

def setup_logger(name='ppt_agent'):
    """Set up and configure logger"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('server.log'),
            logging.StreamHandler()  # Console output
        ]
    )
    return logging.getLogger(name)

# Create main logger instance
logger = setup_logger() 