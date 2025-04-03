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
from app.services.ai_service import (
    generate_ai_response,
    suggest_design_improvements,
    generate_slide_content,
    analyze_slide,
    generate_title_suggestions
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
    
    @app.route('/api/ai/chat', methods=['POST'])
    def ai_chat():
        """Generate AI response for chat messages"""
        try:
            data = request.get_json()
            prompt = data.get('prompt')
            context = data.get('context', {})
            
            if not prompt:
                return jsonify({'error': 'Prompt is required'}), 400
            
            # 컨텍스트에 세션 ID 추가
            session_id = session.get('session_id')
            if session_id:
                context['session_id'] = session_id
            
            # AI 응답 생성
            response = generate_ai_response(prompt, context)
            
            return jsonify({
                'success': True,
                'response': response
            })
            
        except Exception as e:
            logger.error(f"AI chat error: {str(e)}")
            return jsonify({'error': f'AI 응답 생성 중 오류 발생: {str(e)}'}), 500
    
    @app.route('/api/ai/design-suggestions', methods=['POST'])
    def design_suggestions():
        """Get AI design improvement suggestions"""
        try:
            data = request.get_json()
            slide_index = data.get('slideIndex')
            
            if slide_index is None:
                return jsonify({'error': 'Slide index is required'}), 400
            
            session_id = session.get('session_id')
            if not session_id:
                return jsonify({'error': 'No session ID found'}), 400
            
            # 현재 슬라이드 가져오기
            slides = get_session_slides(session_id)
            if slide_index >= len(slides):
                return jsonify({'error': 'Invalid slide index'}), 400
            
            current_slide = slides[slide_index]
            
            # AI 디자인 제안 생성
            suggestions = suggest_design_improvements(current_slide)
            
            return jsonify({
                'success': True,
                'suggestions': suggestions
            })
            
        except Exception as e:
            logger.error(f"Design suggestion error: {str(e)}")
            return jsonify({'error': f'디자인 제안 생성 중 오류 발생: {str(e)}'}), 500
    
    @app.route('/api/ai/generate-content', methods=['POST'])
    def generate_content():
        """Generate slide content using AI"""
        try:
            data = request.get_json()
            prompt = data.get('prompt')
            content_type = data.get('type', 'text')  # text, bullets, title, etc.
            
            if not prompt:
                return jsonify({'error': 'Prompt is required'}), 400
            
            # AI 콘텐츠 생성
            content = generate_slide_content(prompt, content_type)
            
            return jsonify({
                'success': True,
                'content': content
            })
            
        except Exception as e:
            logger.error(f"Content generation error: {str(e)}")
            return jsonify({'error': f'콘텐츠 생성 중 오류 발생: {str(e)}'}), 500
    
    @app.route('/api/ai/analyze-slide', methods=['POST'])
    def analyze_slide_api():
        """Analyze slide content and provide feedback"""
        try:
            data = request.get_json()
            slide_index = data.get('slideIndex')
            
            if slide_index is None:
                return jsonify({'error': 'Slide index is required'}), 400
            
            session_id = session.get('session_id')
            if not session_id:
                return jsonify({'error': 'No session ID found'}), 400
            
            # 현재 슬라이드 가져오기
            slides = get_session_slides(session_id)
            if slide_index >= len(slides):
                return jsonify({'error': 'Invalid slide index'}), 400
            
            current_slide = slides[slide_index]
            
            # AI 슬라이드 분석
            analysis = analyze_slide(current_slide)
            
            return jsonify({
                'success': True,
                'analysis': analysis
            })
            
        except Exception as e:
            logger.error(f"Slide analysis error: {str(e)}")
            return jsonify({'error': f'슬라이드 분석 중 오류 발생: {str(e)}'}), 500
    
    @app.route('/api/ai/analyze', methods=['POST', 'OPTIONS'])
    def analyze_content_api():
        """Analyze slide content from frontend captured data"""
        # OPTIONS 요청 처리 (CORS 프리플라이트 요청)
        if request.method == 'OPTIONS':
            response = jsonify({'status': 'ok'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
            response.headers.add('Access-Control-Allow-Methods', 'POST')
            return response
            
        try:
            data = request.get_json()
            context = data.get('context', {})
            content = data.get('content', {})
            
            # 컨텍스트에서 슬라이드 정보 추출
            presentation_context = context.get('presentation', {})
            current_slide = presentation_context.get('currentSlide')
            
            if not current_slide:
                # 콘텐츠에서 직접 추출한 정보로 대체
                visual_description = presentation_context.get('visualDescription', '')
                return jsonify({
                    'success': True,
                    'analysis': {
                        'score': 70,
                        'feedback': f"슬라이드 분석: {visual_description}\n\n더 자세한 분석을 위해 슬라이드 데이터가 필요합니다.",
                        'suggestions': [
                            "슬라이드 요소의 정렬을 확인하세요",
                            "텍스트 크기의 일관성을 유지하세요",
                            "적절한 색상 대비를 사용하세요"
                        ]
                    }
                })
            
            # 현재 슬라이드 분석
            analysis = analyze_slide(current_slide)
            
            return jsonify({
                'success': True,
                'analysis': analysis
            })
            
        except Exception as e:
            logger.error(f"Content analysis error: {str(e)}")
            return jsonify({
                'success': False,
                'error': str(e),
                'analysis': {
                    'score': 0,
                    'feedback': f"분석 중 오류가 발생했습니다: {str(e)}",
                    'suggestions': ["서버 연결을 확인하세요", "다시 시도해보세요"]
                }
            })
    
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
    
    @app.route('/api/ai/suggest-titles', methods=['POST'])
    def suggest_titles():
        """Suggest titles based on content or theme"""
        try:
            data = request.get_json()
            content = data.get('content', '')
            theme = data.get('theme', '')
            count = data.get('count', 5)
            
            if not content and not theme:
                return jsonify({'error': 'Content or theme is required'}), 400
            
            # 제목 추천 생성
            titles = generate_title_suggestions(content, theme, count)
            
            return jsonify({
                'success': True,
                'titles': titles
            })
            
        except Exception as e:
            logger.error(f"Title suggestion error: {str(e)}")
            return jsonify({'error': f'제목 추천 생성 중 오류 발생: {str(e)}'}), 500 