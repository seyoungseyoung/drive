import json
import time
from app.utils.logger import logger
from app.services.ai_service import generate_ai_response

# Store active presentation sessions
ppt_sessions = {}

def get_session_slides(session_id):
    """Get slides for a specific session"""
    if session_id not in ppt_sessions:
        return []
    return ppt_sessions[session_id].get('slides', [])

def create_session(session_id):
    """Create a new presentation session"""
    ppt_sessions[session_id] = {
        'slides': [],
        'theme': 'default'
    }
    return ppt_sessions[session_id]

def create_demo_slides(session_id, topic, slide_count):
    """Create demo slides when API key is not available"""
    logger.warning("Creating demo slides without DeepSeek API")
    
    slides_data = []
    
    # Title slide
    slides_data.append({
        "title": f"{topic}",
        "content": "프레젠테이션 소개",
        "elements": [
            {
                "type": "shape",
                "content": "rectangle",
                "id": f"shape_{len(slides_data)}_{0}",
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
    
    # Content slides
    for i in range(1, slide_count):
        slides_data.append({
            "title": f"{topic} - 슬라이드 {i+1}",
            "content": f"이 슬라이드는 {topic}에 관한 내용을 담고 있습니다.",
            "elements": [
                {
                    "type": "shape",
                    "id": f"shape_{len(slides_data)}_{0}",
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
    
    # Save slides in session
    ppt_sessions[session_id]['slides'] = slides_data
    return slides_data

def generate_slides_from_topic(session_id, topic, slide_count):
    """Generate slides from a topic using DeepSeek API"""
    try:
        # Slide structure generation request message
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
        
        # Call DeepSeek API
        logger.info(f"Generating slides for topic: {topic}, count: {slide_count}")
        api_response = generate_ai_response(messages)
        
        # Check for error messages
        if '오류' in api_response or '잔액' in api_response:
            # If there's an API error, create demo slides instead
            return create_demo_slides(session_id, topic, slide_count)
        
        # Extract JSON part
        try:
            # Find JSON block
            json_start = api_response.find('[')
            json_end = api_response.rfind(']') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_part = api_response[json_start:json_end]
                slides_data = json.loads(json_part)
                
                # Add IDs to elements for easier manipulation
                for slide_idx, slide in enumerate(slides_data):
                    if 'elements' in slide:
                        for elem_idx, elem in enumerate(slide['elements']):
                            if 'id' not in elem:
                                elem['id'] = f"elem_{slide_idx}_{elem_idx}_{int(time.time())}"
                
                # Store slides in session
                ppt_sessions[session_id]['slides'] = slides_data
                return slides_data
            else:
                logger.error(f"JSON format not found: {api_response}")
                return create_demo_slides(session_id, topic, slide_count)
                
        except Exception as e:
            logger.error(f"JSON parsing error: {str(e)}")
            return create_demo_slides(session_id, topic, slide_count)
            
    except Exception as e:
        logger.error(f"Presentation generation error: {str(e)}")
        return create_demo_slides(session_id, topic, slide_count)

def add_elements_with_ai(session_id, slide_index, prompt):
    """Add elements to a slide using AI suggestions"""
    if session_id not in ppt_sessions:
        return None, "Session not found"
        
    if slide_index >= len(ppt_sessions[session_id]['slides']):
        return None, "Slide index out of range"
        
    current_slide = ppt_sessions[session_id]['slides'][slide_index]
    
    # DeepSeek API slide edit request
    messages = [
        {"role": "system", "content": """당신은 프레젠테이션 슬라이드 요소를 편집하는 전문가입니다. 
        사용자의 요청에 따라 슬라이드의 시각적 요소(도형, 텍스트 상자, 이미지 등)를 JSON 형식으로 반환하세요.
        
        각 요소는 다음 형식을 따라야 합니다:
        {
            "type": "shape" | "text" | "image",
            "content": "내용 또는 도형 유형(rectangle, circle, triangle, arrow, star 등)",
            "id": "고유 ID",
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
    
    api_response = generate_ai_response(messages)
    
    # Check for error messages
    if '오류' in api_response or '잔액' in api_response:
        return None, api_response
    
    # Extract JSON part
    try:
        # Find JSON block
        json_start = api_response.find('[')
        json_end = api_response.rfind(']') + 1
        
        if json_start >= 0 and json_end > json_start:
            json_part = api_response[json_start:json_end]
            elements_data = json.loads(json_part)
            
            # Add IDs to elements if they don't have one
            for i, elem in enumerate(elements_data):
                if 'id' not in elem:
                    elem['id'] = f"elem_{slide_index}_{len(current_slide.get('elements', []))+i}_{int(time.time())}"
            
            # Update slide elements
            if 'elements' in current_slide:
                # Add to existing elements
                current_slide['elements'].extend(elements_data)
            else:
                # Create elements array
                current_slide['elements'] = elements_data
            
            return current_slide['elements'], None
        else:
            logger.error(f"JSON format not found: {api_response}")
            return None, "AI 응답에서 JSON 형식을 찾을 수 없습니다."
            
    except Exception as e:
        logger.error(f"JSON parsing error: {str(e)}")
        return None, f"AI 응답 파싱 실패: {str(e)}"
        
import time  # Added for timestamp generation 