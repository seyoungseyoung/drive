import requests
import json
from flask import Flask, request, jsonify, session, render_template
import logging
import os
from dotenv import load_dotenv
import uuid
import time

# .env 파일 로드
load_dotenv()

# 환경 변수에서 API 키 가져오기
DEEPSEAK_API_KEY = os.getenv('DEEPSEAK_API_KEY')

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('server.log'),
        logging.StreamHandler()  # 콘솔에도 로그 출력
    ]
)
logger = logging.getLogger('ppt_agent')

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'default_secret_key')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max-limit
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'pptx', 'pdf', 'jpg', 'jpeg', 'png'}

# 세션 데이터 저장
ppt_sessions = {}

@app.route('/')
def index():
    # 고유 세션 ID 생성
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
        ppt_sessions[session['session_id']] = {
            'slides': [],
            'theme': 'default'
        }
    
    return render_template('index.html')

def call_deepseak_api(messages):
    """딥시크 API를 호출하여 응답 받기"""
    try:
        url = "https://api.deepseek.com/v1/chat/completions"
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {DEEPSEAK_API_KEY}"
        }
        
        data = {
            "model": "deepseek-chat",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 4000
        }
        
        # 타임아웃 추가 (15초)
        response = requests.post(url, headers=headers, json=data, timeout=15)
        
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']
        elif response.status_code == 402:
            # 잔액 부족 오류 처리
            logger.error(f"DeepSeek API 잔액 부족: {response.text}")
            return "API 잔액이 부족합니다. 관리자에게 문의하세요."
        else:
            logger.error(f"API Error: {response.status_code}, {response.text}")
            return f"API 오류({response.status_code}): 잠시 후 다시 시도해주세요."
            
    except requests.exceptions.Timeout:
        logger.error("DeepSeek API 호출 타임아웃")
        return "API 호출 시간이 초과되었습니다. 잠시 후 다시 시도해주세요."
    except requests.exceptions.RequestException as e:
        logger.error(f"DeepSeek API 요청 오류: {str(e)}")
        return "API 연결 오류가 발생했습니다. 네트워크 상태를 확인해주세요."
    except Exception as e:
        logger.error(f"Error calling DeepSeek API: {str(e)}")
        return f"API 호출 중 오류가 발생했습니다: {str(e)}"

@app.route('/generate_from_topic', methods=['POST'])
def generate_from_topic():
    """주제와 슬라이드 개수를 기반으로 프레젠테이션 생성"""
    try:
        session_id = session.get('session_id')
        if not session_id:
            return jsonify({'error': 'No session ID found'}), 400
            
        data = request.get_json()
        topic = data.get('topic')
        slide_count = data.get('slide_count', 5)
        
        if not topic:
            return jsonify({'error': 'Topic is required'}), 400
            
        # 슬라이드 수 제한
        if slide_count < 1:
            slide_count = 1
        elif slide_count > 20:
            slide_count = 20
        
        # API 키가 없는 경우 기본 슬라이드 생성 (테스트용)
        if not DEEPSEAK_API_KEY:
            logger.warning("DeepSeek API 키가 없어 기본 슬라이드를 생성합니다.")
            
            slides_data = []
            
            # 타이틀 슬라이드
            slides_data.append({
                "title": f"{topic}",
                "content": "프레젠테이션 소개",
                "elements": [
                    {
                        "type": "shape",
                        "content": "rectangle",
                        "x": 100,
                        "y": 300,
                        "width": 600,
                        "height": 5,
                        "style": {
                            "color": "#3498db",
                            "borderStyle": "solid"
                        }
                    }
                ]
            })
            
            # 내용 슬라이드
            for i in range(1, slide_count):
                slides_data.append({
                    "title": f"{topic} - 슬라이드 {i+1}",
                    "content": f"이 슬라이드는 {topic}에 관한 내용을 담고 있습니다.",
                    "elements": [
                        {
                            "type": "shape",
                            "content": "circle" if i % 3 == 0 else "rectangle" if i % 3 == 1 else "triangle",
                            "x": 500,
                            "y": 150,
                            "width": 100,
                            "height": 100,
                            "style": {
                                "color": "#2ecc71" if i % 3 == 0 else "#e74c3c" if i % 3 == 1 else "#f1c40f",
                                "borderStyle": "solid"
                            }
                        }
                    ]
                })
            
            # 슬라이드 데이터 저장
            ppt_sessions[session_id]['slides'] = slides_data
            
            return jsonify({
                'success': True,
                'slides': slides_data
            })
            
        # 슬라이드 구조 생성 요청 메시지
        messages = [
            {"role": "system", "content": """당신은 전문적인 PPT 디자인 전문가입니다. 
            사용자가 입력한 주제와 슬라이드 개수에 맞춰 프레젠테이션 구조를 JSON 형식으로 만들어주세요.
            각 슬라이드는 제목과 내용을 포함해야 하며, 필요에 따라 시각적 요소(도형, 텍스트 상자, 이미지 등)도 제안할 수 있습니다.
            
            응답은 다음 JSON 형식을 따라야 합니다:
            [
                {
                    "title": "슬라이드 제목",
                    "content": "슬라이드 내용",
                    "elements": [
                        {
                            "type": "shape",
                            "content": "rectangle",
                            "x": 100,
                            "y": 100,
                            "width": 200,
                            "height": 100,
                            "style": {
                                "color": "#3498db",
                                "borderStyle": "solid"
                            }
                        }
                    ]
                }
            ]
            
            JSON 형식으로만 응답하세요. 추가 설명은 포함하지 마세요."""},
            {"role": "user", "content": f"""주제: {topic}
            슬라이드 개수: {slide_count}
            
            위 주제에 맞는 프레젠테이션 슬라이드를 {slide_count}장 생성해주세요.
            첫 번째 슬라이드는 타이틀 슬라이드로, 나머지는 내용 슬라이드로 구성해주세요.
            내용 슬라이드는 논리적 흐름에 따라 구성하고, 각 슬라이드는 간결하고 명확한 내용으로 작성해주세요.
            """}
        ]
        
        # 딥시크 API 호출
        logger.info(f"Generating slides for topic: {topic}, count: {slide_count}")
        api_response = call_deepseak_api(messages)
        
        # API 오류 메시지 확인
        if '오류' in api_response or '잔액' in api_response:
            return jsonify({'error': api_response}), 500
        
        # JSON 부분 추출
        try:
            # JSON 블록 찾기
            json_start = api_response.find('[')
            json_end = api_response.rfind(']') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_part = api_response[json_start:json_end]
                slides_data = json.loads(json_part)
                
                # 슬라이드 데이터 저장
                ppt_sessions[session_id]['slides'] = slides_data
                
                return jsonify({
                    'success': True,
                    'slides': slides_data
                })
            else:
                logger.error(f"JSON 형식 찾을 수 없음: {api_response}")
                return jsonify({'error': 'API 응답에서 JSON 형식을 찾을 수 없습니다.'}), 500
                
        except Exception as e:
            logger.error(f"JSON 파싱 오류: {str(e)}")
            return jsonify({'error': f'API 응답 파싱 실패: {str(e)}'}), 500
        
    except Exception as e:
        logger.error(f"프레젠테이션 생성 오류: {str(e)}")
        return jsonify({'error': f'프레젠테이션 생성 중 오류가 발생했습니다: {str(e)}'}), 500

@app.route('/edit_slide_ai', methods=['POST'])
def edit_slide_ai():
    """딥시크 API를 사용하여 슬라이드 요소 편집"""
    try:
        session_id = session.get('session_id')
        if not session_id:
            return jsonify({'error': 'No session ID found'}), 400
            
        data = request.get_json()
        slide_index = data.get('index')
        prompt = data.get('prompt')
        
        if slide_index is None or not prompt:
            return jsonify({'error': 'Invalid request data'}), 400
        
        # 현재 슬라이드 정보 가져오기
        if slide_index >= len(ppt_sessions[session_id]['slides']):
            return jsonify({'error': 'Slide index out of range'}), 400
            
        current_slide = ppt_sessions[session_id]['slides'][slide_index]
        
        # 딥시크 API에 슬라이드 편집 요청
        messages = [
            {"role": "system", "content": """당신은 프레젠테이션 슬라이드 요소를 편집하는 전문가입니다. 
            사용자의 요청에 따라 슬라이드의 시각적 요소(도형, 텍스트 상자, 이미지 등)를 JSON 형식으로 반환하세요.
            당신은 슬라이드에 직접 요소를 추가하고 편집할 수 있는 권한이 있습니다.
            
            각 요소는 다음 형식을 따라야 합니다:
            {
                "type": "shape" | "text" | "image",
                "content": "내용 또는 도형 유형(rectangle, circle, triangle, arrow, star 등)",
                "x": 숫자(x좌표),
                "y": 숫자(y좌표),
                "width": 숫자(너비),
                "height": 숫자(높이),
                "rotation": 숫자(회전 각도, 0-360),
                "style": {
                    "color": "색상코드(#RRGGBB)",
                    "borderStyle": "실선/점선(solid, dashed, dotted)",
                    "fontSize": "텍스트 크기(px)",
                    "textAlign": "정렬(left, center, right)"
                },
                "zIndex": 숫자(층위)
            }
            
            가능한 도형 유형: rectangle, square, circle, oval, triangle, right-triangle, pentagon, hexagon, arrow, double-arrow, star, callout, line, curve
            
            JSON 형식으로만 응답하세요. 추가 설명은 포함하지 마세요."""},
            {"role": "user", "content": f"""다음 슬라이드에 요청된 시각적 요소를 추가해주세요:
            
            제목: {current_slide.get('title', '')}
            내용: {current_slide.get('content', '')}
            
            요청: {prompt}
            
            응답은 JSON 배열 형식으로 반환하세요.
            """}
        ]
        
        api_response = call_deepseak_api(messages)
        
        # API 오류 메시지 확인
        if '오류' in api_response or '잔액' in api_response:
            return jsonify({'error': api_response}), 500
        
        # JSON 부분 추출
        try:
            # JSON 블록 찾기
            json_start = api_response.find('[')
            json_end = api_response.rfind(']') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_part = api_response[json_start:json_end]
                elements_data = json.loads(json_part)
                
                # 슬라이드 요소 업데이트
                if 'elements' in current_slide:
                    # 기존 요소가 있으면 추가
                    current_slide['elements'].extend(elements_data)
                else:
                    # 없으면 새로 설정
                    current_slide['elements'] = elements_data
                
                return jsonify({
                    'success': True,
                    'elements': current_slide['elements']
                })
            else:
                logger.error(f"JSON 형식 찾을 수 없음: {api_response}")
                return jsonify({'error': 'API 응답에서 JSON 형식을 찾을 수 없습니다.'}), 500
                
        except Exception as e:
            logger.error(f"JSON 파싱 오류: {str(e)}")
            return jsonify({'error': f'API 응답 파싱 실패: {str(e)}'}), 500
        
    except Exception as e:
        logger.error(f"슬라이드 AI 편집 오류: {str(e)}")
        return jsonify({'error': f'슬라이드 AI 편집 실패: {str(e)}'}), 500

@app.route('/analyze_slides', methods=['POST'])
def analyze_slides():
    """딥시크 API를 사용하여 모든 슬라이드를 분석하고 개선점 제안"""
    try:
        session_id = session.get('session_id')
        if not session_id:
            return jsonify({'error': 'No session ID found'}), 400
        
        if not ppt_sessions[session_id]['slides'] or len(ppt_sessions[session_id]['slides']) == 0:
            return jsonify({'error': '분석할 슬라이드가 없습니다.'}), 400
        
        slides = ppt_sessions[session_id]['slides']
        
        # API 키가 없는 경우 테스트용 분석 결과 생성
        if not DEEPSEAK_API_KEY:
            logger.warning("DeepSeek API 키가 없어 테스트용 분석 결과를 생성합니다.")
            
            analysis_data = {
                "overall_feedback": "전체적으로 프레젠테이션의 구조는 양호하나, 슬라이드별 내용의 깊이와 시각적 요소의 다양성을 개선하면 더 효과적인 발표가 될 것입니다.",
                "improvement_suggestions": [
                    {
                        "slide_index": 0,
                        "suggestion": "타이틀 슬라이드에 부제목을 추가하여 프레젠테이션의 목적을 명확히 하세요.",
                        "priority": "high",
                        "auto_applicable": True,
                        "changes": {
                            "content": "프레젠테이션 소개 - 핵심 내용과 주요 논점"
                        }
                    }
                ]
            }
            
            # 각 슬라이드에 대한 제안 추가
            for i in range(1, len(slides)):
                suggestion = {
                    "slide_index": i,
                    "suggestion": f"슬라이드 {i+1}의 내용을 더 구체적으로 작성하고 관련 이미지를 추가하세요.",
                    "priority": "medium" if i % 2 == 0 else "low",
                    "auto_applicable": False
                }
                analysis_data["improvement_suggestions"].append(suggestion)
            
            return jsonify({
                'success': True,
                'analysis': analysis_data
            })
        
        # 슬라이드 정보 추출
        slides_info = []
        for i, slide in enumerate(slides):
            slide_info = {
                'index': i,
                'title': slide.get('title', ''),
                'content': slide.get('content', ''),
                'elements': len(slide.get('elements', []))
            }
            slides_info.append(slide_info)
        
        # 딥시크 API에 분석 요청
        messages = [
            {"role": "system", "content": """당신은 프레젠테이션 전문가입니다. 슬라이드 세트를 분석하고 개선할 점을 제안해주세요.
            다음과 같은 측면에서 분석해주세요:
            1. 내용의 일관성과 논리적 흐름
            2. 슬라이드 디자인과 시각적 요소
            3. 텍스트의 간결성과 명확성
            4. 각 슬라이드별 개선점
            
            분석 후에는 구체적인 개선 방안을 JSON 형식으로 제공해주세요. 각 개선 제안에는 적용할 슬라이드 인덱스, 개선 내용, 수준(낮음, 중간, 높음)을 포함해야 합니다.
            
            응답 포맷:
            {
                "overall_feedback": "전체적인 분석 내용",
                "improvement_suggestions": [
                    {
                        "slide_index": 0,
                        "suggestion": "구체적인 개선 내용",
                        "priority": "high/medium/low",
                        "auto_applicable": true/false,
                        "changes": {
                            "title": "변경된 제목(필요한 경우)",
                            "content": "변경된 내용(필요한 경우)",
                            "elements": [새로운 요소 배열(필요한 경우)]
                        }
                    }
                ]
            }
            
            auto_applicable이 true인 경우, changes 필드를 포함하여 자동으로 적용할 수 있는 구체적인 변경사항을 제공하세요.
            """},
            {"role": "user", "content": f"""다음 슬라이드 세트를 분석하고 개선 방안을 제안해주세요:
            
            슬라이드 정보: {json.dumps(slides_info, ensure_ascii=False)}
            
            각 슬라이드 상세 내용:
            {json.dumps(slides, ensure_ascii=False)}
            """}
        ]
        
        # 딥시크 API 호출
        logger.info("Analyzing slides and suggesting improvements")
        api_response = call_deepseak_api(messages)
        
        # API 오류 메시지 확인
        if '오류' in api_response or '잔액' in api_response:
            return jsonify({'error': api_response}), 500
        
        # JSON 부분 추출
        try:
            # JSON 블록 찾기
            json_start = api_response.find('{')
            json_end = api_response.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_part = api_response[json_start:json_end]
                analysis_data = json.loads(json_part)
                
                return jsonify({
                    'success': True,
                    'analysis': analysis_data
                })
            else:
                logger.error(f"JSON 형식 찾을 수 없음: {api_response}")
                return jsonify({'error': 'API 응답에서 JSON 형식을 찾을 수 없습니다.'}), 500
                
        except Exception as e:
            logger.error(f"JSON 파싱 오류: {str(e)}")
            return jsonify({'error': f'API 응답 파싱 실패: {str(e)}'}), 500
        
    except Exception as e:
        logger.error(f"슬라이드 분석 오류: {str(e)}")
        return jsonify({'error': f'슬라이드 분석 중 오류가 발생했습니다: {str(e)}'}), 500

@app.route('/apply_suggestion', methods=['POST'])
def apply_suggestion():
    """분석 후 제안된 개선사항을 적용"""
    try:
        session_id = session.get('session_id')
        if not session_id:
            return jsonify({'error': 'No session ID found'}), 400
        
        data = request.get_json()
        suggestion_index = data.get('suggestion_index')
        analysis = data.get('analysis')
        
        if suggestion_index is None or not analysis:
            return jsonify({'error': 'Invalid request data'}), 400
        
        # 제안 내용 가져오기
        try:
            suggestion = analysis['improvement_suggestions'][suggestion_index]
            slide_index = suggestion.get('slide_index')
            changes = suggestion.get('changes', {})
            
            # 슬라이드 인덱스 확인
            if slide_index is None or slide_index >= len(ppt_sessions[session_id]['slides']):
                return jsonify({'error': '유효하지 않은 슬라이드 인덱스입니다.'}), 400
            
            # 변경사항 적용
            slide = ppt_sessions[session_id]['slides'][slide_index]
            
            # 제목 변경
            if 'title' in changes:
                slide['title'] = changes['title']
            
            # 내용 변경
            if 'content' in changes:
                slide['content'] = changes['content']
            
            # 요소 변경/추가
            if 'elements' in changes and changes['elements']:
                # 기존 요소가 없으면 초기화
                if 'elements' not in slide:
                    slide['elements'] = []
                
                # 새 요소 추가
                for element in changes['elements']:
                    if not any(e.get('id') == element.get('id') for e in slide['elements']):
                        # 중복되지 않은 요소만 추가
                        slide['elements'].append(element)
            
            return jsonify({
                'success': True,
                'message': f'슬라이드 {slide_index}에 개선사항이 적용되었습니다.',
                'slide': slide
            })
            
        except (IndexError, KeyError) as e:
            logger.error(f"제안 적용 인덱스 오류: {str(e)}")
            return jsonify({'error': '잘못된 제안 인덱스입니다.'}), 400
        
    except Exception as e:
        logger.error(f"제안 적용 오류: {str(e)}")
        return jsonify({'error': f'개선사항 적용 중 오류가 발생했습니다: {str(e)}'}), 500

if __name__ == '__main__':
    # 디렉토리 확인
    os.makedirs('uploads', exist_ok=True)
    os.makedirs('static', exist_ok=True)
    
    # 서버 설정
    host = '0.0.0.0'  # 모든 IP에서 접근 가능
    port = 5000
    debug = True
    
    logger.info(f"Starting server on {host}:{port}")
    app.run(host=host, port=port, debug=debug)

