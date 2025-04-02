from flask import request, jsonify, session, render_template
import uuid
import json
from app.utils.logger import logger
from app.services.slide_service import (
    ppt_sessions, 
    create_session, 
    get_session_slides,
    generate_slides_from_topic,
    add_elements_with_ai
)

def init_routes(app):
    """Initialize all routes for the application"""
    
    @app.route('/')
    def index():
        """Render the main application page"""
        # Create a unique session ID if not exists
        if 'session_id' not in session:
            session['session_id'] = str(uuid.uuid4())
            create_session(session['session_id'])
        
        return render_template('index.html')
    
    @app.route('/generate_from_topic', methods=['POST'])
    def generate_from_topic():
        """Generate presentation slides from a topic"""
        try:
            session_id = session.get('session_id')
            if not session_id:
                return jsonify({'error': 'No session ID found'}), 400
                
            data = request.get_json()
            topic = data.get('topic')
            slide_count = data.get('slide_count', 5)
            
            if not topic:
                return jsonify({'error': 'Topic is required'}), 400
                
            # Limit slide count
            if slide_count < 1:
                slide_count = 1
            elif slide_count > 20:
                slide_count = 20
            
            # Generate slides
            slides_data = generate_slides_from_topic(session_id, topic, slide_count)
            
            return jsonify({
                'success': True,
                'slides': slides_data
            })
            
        except Exception as e:
            logger.error(f"Error generating presentation: {str(e)}")
            return jsonify({'error': f'Error generating presentation: {str(e)}'}), 500
    
    @app.route('/edit_slide_ai', methods=['POST'])
    def edit_slide_ai():
        """Edit slide elements using AI suggestions"""
        try:
            session_id = session.get('session_id')
            if not session_id:
                return jsonify({'error': 'No session ID found'}), 400
                
            data = request.get_json()
            slide_index = data.get('index')
            prompt = data.get('prompt')
            
            if slide_index is None or not prompt:
                return jsonify({'error': 'Invalid request data'}), 400
            
            # Add elements with AI
            elements, error = add_elements_with_ai(session_id, slide_index, prompt)
            
            if error:
                return jsonify({'error': error}), 500
                
            return jsonify({
                'success': True,
                'elements': elements
            })
            
        except Exception as e:
            logger.error(f"Error editing slide with AI: {str(e)}")
            return jsonify({'error': f'Error editing slide with AI: {str(e)}'}), 500
    
    @app.route('/save_slides', methods=['POST'])
    def save_slides():
        """Save the current state of slides"""
        try:
            session_id = session.get('session_id')
            if not session_id:
                return jsonify({'error': 'No session ID found'}), 400
                
            data = request.get_json()
            slides = data.get('slides')
            
            if not slides:
                return jsonify({'error': 'No slides data provided'}), 400
            
            # Update slides in session
            ppt_sessions[session_id]['slides'] = slides
            
            return jsonify({
                'success': True,
                'message': '슬라이드가 저장되었습니다.'
            })
            
        except Exception as e:
            logger.error(f"Error saving slides: {str(e)}")
            return jsonify({'error': f'Error saving slides: {str(e)}'}), 500
    
    @app.route('/get_slides', methods=['GET'])
    def get_slides():
        """Get all slides for the current session"""
        try:
            session_id = session.get('session_id')
            if not session_id:
                return jsonify({'error': 'No session ID found'}), 400
            
            slides = get_session_slides(session_id)
            
            return jsonify({
                'success': True,
                'slides': slides
            })
            
        except Exception as e:
            logger.error(f"Error retrieving slides: {str(e)}")
            return jsonify({'error': f'Error retrieving slides: {str(e)}'}), 500
    
    @app.route('/update_theme', methods=['POST'])
    def update_theme():
        """Update the presentation theme"""
        try:
            session_id = session.get('session_id')
            if not session_id:
                return jsonify({'error': 'No session ID found'}), 400
                
            data = request.get_json()
            theme = data.get('theme')
            
            if not theme:
                return jsonify({'error': 'Theme is required'}), 400
            
            # Update theme in session
            ppt_sessions[session_id]['theme'] = theme
            
            return jsonify({
                'success': True,
                'message': '테마가 업데이트되었습니다.'
            })
            
        except Exception as e:
            logger.error(f"Error updating theme: {str(e)}")
            return jsonify({'error': f'Error updating theme: {str(e)}'}), 500 