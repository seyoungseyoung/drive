import requests
import json
from flask import Flask, request, jsonify, session
import logging

app = Flask(__name__)

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

if __name__ == '__main__':
    app.run(debug=True)

