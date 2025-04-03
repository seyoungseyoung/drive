from app import create_app
from app.utils.config import HOST, PORT, DEBUG
from app.utils.logger import logger
import os
import signal
import sys
import psutil
import threading
import time
from flask import request, jsonify

# Create application instance
app = create_app()

def find_and_kill_process_on_port(port):
    """포트를 사용 중인 프로세스를 찾아서 종료합니다"""
    try:
        for proc in psutil.process_iter(['pid', 'name', 'connections']):
            try:
                for conn in proc.connections():
                    if conn.laddr.port == port and conn.status == psutil.CONN_LISTEN:
                        logger.info(f"포트 {port}를 사용 중인 프로세스 발견: PID {proc.pid}")
                        # 현재 실행 중인 프로세스와 동일한지 확인
                        if proc.pid == os.getpid():
                            logger.info(f"현재 프로세스입니다. 종료하지 않습니다.")
                            continue
                        # 프로세스 종료
                        try:
                            parent = psutil.Process(proc.pid)
                            children = parent.children(recursive=True)
                            for child in children:
                                child.terminate()
                            # 부모 프로세스 종료
                            parent.terminate()
                            gone, alive = psutil.wait_procs([parent], timeout=3)
                            for p in alive:
                                p.kill()
                            logger.info(f"프로세스 {proc.pid} 종료 완료")
                            return True
                        except Exception as e:
                            logger.error(f"프로세스 {proc.pid} 종료 중 오류: {str(e)}")
                            # 실패했을 경우 OS 별 명령어로 시도
                            if sys.platform == 'win32':
                                os.system(f'taskkill /F /PID {proc.pid}')
                            else:
                                os.system(f'kill -9 {proc.pid}')
                            logger.info(f"강제 프로세스 종료 완료")
                            return True
            except (psutil.AccessDenied, psutil.ZombieProcess, psutil.NoSuchProcess):
                # 접근 거부된 프로세스는 무시
                pass
        return False
    except Exception as e:
        logger.error(f"프로세스 검색 중 오류 발생: {str(e)}")
        return False

def kill_existing_server():
    """기존 서버 프로세스 종료"""
    try:
        # 포트를 사용 중인 프로세스 확인 및 종료
        if find_and_kill_process_on_port(PORT):
            logger.info(f"기존 서버 종료 완료")
        else:
            # 프로세스를 찾지 못한 경우, 전통적인 방법으로 시도
            if sys.platform == 'win32':
                os.system(f'for /f "tokens=5" %a in (\'netstat -aon ^| find ":{PORT}" ^| find "LISTENING"\') do taskkill /F /PID %a')
            else:
                os.system(f'lsof -ti:{PORT} | xargs kill -9')
            logger.info(f"기존 서버 종료 시도 완료")
        
        # 포트 확인을 위한 추가 대기
        time.sleep(1)
    except Exception as e:
        logger.error(f"기존 서버 종료 중 오류 발생: {str(e)}")

@app.route('/api/ai/chat', methods=['POST'])
def handle_ai_chat():
    data = request.json
    print("AI 채팅 요청 수신:", data)
    
    try:
        prompt = data.get('prompt', '')
        context = data.get('context', {})
        
        # 디버깅을 위해 컨텍스트 세부 정보 기록
        print(f"현재 슬라이드 인덱스: {context.get('currentSlideIndex', 'N/A')}")
        print(f"전체 슬라이드 수: {context.get('slideCount', 'N/A')}")
        
        # 현재 슬라이드 정보가 있으면 요약
        current_slide = context.get('currentSlide', None)
        if current_slide:
            print(f"현재 슬라이드 ID: {current_slide.get('id', 'N/A')}")
            print(f"현재 슬라이드 배경: {current_slide.get('background', 'N/A')}")
            elements = current_slide.get('elements', [])
            print(f"현재 슬라이드 요소 수: {len(elements)}")
            
            # 요소 타입 요약
            element_types = {}
            for elem in elements:
                elem_type = elem.get('type', 'unknown')
                if elem_type in element_types:
                    element_types[elem_type] += 1
                else:
                    element_types[elem_type] = 1
            
            print(f"요소 타입 요약: {element_types}")
        
        # 선택된 요소 정보가 있으면 요약
        selected_elements = context.get('selectedElements', [])
        if selected_elements:
            print(f"선택된 요소 수: {len(selected_elements)}")
            for i, elem in enumerate(selected_elements):
                print(f"선택된 요소 {i+1} - 타입: {elem.get('type', 'N/A')}, ID: {elem.get('id', 'N/A')}")
        
        # AI 응답 생성
        if current_slide:
            # 슬라이드에 요소가 있는 경우 자세한 설명 응답
            elements_desc = ""
            for i, elem in enumerate(elements):
                elem_type = elem.get('type', 'unknown')
                if elem_type == 'text':
                    elements_desc += f"텍스트 요소 {i+1}: \"{elem.get('content', '')}\" (위치: {elem.get('x', 0)},{elem.get('y', 0)}, 크기: {elem.get('width', 0)}x{elem.get('height', 0)})\n"
                elif elem_type == 'shape':
                    elements_desc += f"도형 요소 {i+1}: {elem.get('content', '기본도형')} (위치: {elem.get('x', 0)},{elem.get('y', 0)}, 크기: {elem.get('width', 0)}x{elem.get('height', 0)})\n"
            
            # 프롬프트에 따른 응답 생성
            if '추가' in prompt or '넣어' in prompt:
                action_type = None
                if '텍스트' in prompt:
                    action_type = 'addText'
                    action_content = "새 텍스트 요소"
                    if '제목' in prompt:
                        action_content = "제목 텍스트"
                elif '도형' in prompt or '원' in prompt or '사각형' in prompt:
                    action_type = 'addShape'
                    action_shape = 'rectangle'
                    if '원' in prompt:
                        action_shape = 'circle'
                    elif '삼각형' in prompt:
                        action_shape = 'triangle'
                    elif '별' in prompt:
                        action_shape = 'star'
                
                if action_type:
                    actions = []
                    if action_type == 'addText':
                        actions.append({
                            'type': 'addText',
                            'text': action_content,
                            'x': 100,
                            'y': 100,
                            'width': 400,
                            'height': 100
                        })
                    elif action_type == 'addShape':
                        actions.append({
                            'type': 'addShape',
                            'shapeType': action_shape,
                            'x': 100,
                            'y': 100,
                            'width': 200,
                            'height': 150
                        })
                    
                    response = f"현재 슬라이드에 {action_content if action_type == 'addText' else action_shape} 요소를 추가했습니다."
                    return jsonify({
                        'success': True,
                        'response': response,
                        'actions': actions
                    })
            
            # 기본 응답
            response = f"현재 슬라이드 정보를 확인했습니다. 슬라이드에는 {len(elements)}개의 요소가 있습니다.\n\n{elements_desc}\n무엇을 도와드릴까요?"
        else:
            # 슬라이드 정보가 없는 경우
            response = "현재 슬라이드 정보를 확인할 수 없습니다. 새로운 슬라이드를 추가하거나 요소를 추가하는 것을 도와드릴까요?"
        
        return jsonify({
            'success': True,
            'response': response
        })
    except Exception as e:
        print(f"AI 채팅 처리 중 오류 발생: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        })

if __name__ == '__main__':
    try:
        # 필요한 패키지 확인
        try:
            import psutil
        except ImportError:
            print("psutil 패키지가 설치되어 있지 않습니다. 설치를 시도합니다...")
            os.system(f"{sys.executable} -m pip install psutil")
            print("psutil 설치 완료. 다시 시작합니다...")
            os.execv(sys.executable, [sys.executable] + sys.argv)
            
        # 기존 서버 종료
        kill_existing_server()
        
        # 서버 시작
        logger.info(f"Starting server on {HOST}:{PORT}")
        app.run(host=HOST, port=PORT, debug=DEBUG)
        
    except KeyboardInterrupt:
        logger.info("서버가 키보드 인터럽트로 종료되었습니다.")
        sys.exit(0)
    except Exception as e:
        logger.error(f"서버 실행 중 오류 발생: {str(e)}")
        sys.exit(1) 