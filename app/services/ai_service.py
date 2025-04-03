"""
AI Service Module - Provides AI capabilities for the presentation editor
Uses OpenAI's API for generating responses and suggestions
"""

import os
import json
import random
import requests
import re
from dotenv import load_dotenv
from app.utils.logger import logger

# .env 파일 로드
load_dotenv()

# OpenAI API 키 (환경 변수에서 로드)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

# AI 모델 설정
DEFAULT_MODEL = "gpt-3.5-turbo"
ADVANCED_MODEL = "gpt-4" if os.getenv("USE_GPT4", "false").lower() == "true" else DEFAULT_MODEL

def generate_ai_response(prompt, context=None):
    """
    OpenAI API를 사용하여 AI 응답을 생성합니다.
    실제 API 키가 없는 경우 더미 응답을 반환합니다.
    
    Args:
        prompt (str): 사용자 프롬프트
        context (dict): 추가 컨텍스트 정보
        
    Returns:
        str: AI 응답
    """
    if not context:
        context = {}
    
    # API 키가 없는 경우 더미 응답 반환
    if not OPENAI_API_KEY:
        logger.warning("OpenAI API 키가 설정되지 않았습니다. 더미 응답을 반환합니다.")
        return generate_dummy_response(prompt)
    
    try:
        # 시스템 메시지 생성
        system_message = "당신은 프레젠테이션을 만드는 데 도움을 주는 전문적인 AI 비서입니다. 슬라이드 디자인, 내용 작성, 프레젠테이션 구성에 관한 질문에 답변하고 제안을 제공합니다."
        
        # 현재 세션 정보 추가
        if 'current_slide' in context:
            system_message += f"\n현재 작업 중인 슬라이드: {json.dumps(context['current_slide'], ensure_ascii=False)}"
        
        # API 요청 헤더
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENAI_API_KEY}"
        }
        
        # API 요청 데이터
        data = {
            "model": DEFAULT_MODEL,
            "messages": [
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 1000
        }
        
        # API 요청 전송
        response = requests.post(OPENAI_API_URL, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        
        # 응답 추출
        if 'choices' in result and len(result['choices']) > 0:
            ai_response = result['choices'][0]['message']['content'].strip()
            return ai_response
        else:
            logger.error(f"API 응답에서 유효한 결과를 찾을 수 없습니다: {result}")
            return "죄송합니다. 응답을 생성하는 데 문제가 발생했습니다."
            
    except Exception as e:
        logger.error(f"OpenAI API 호출 중 오류 발생: {str(e)}")
        return f"AI 응답 생성 중 오류가 발생했습니다: {str(e)}"

def generate_dummy_response(prompt):
    """AI API 없이 더미 응답을 생성합니다"""
    
    # 질문 유형에 따라 다른 응답 제공
    if "디자인" in prompt or "색상" in prompt or "레이아웃" in prompt:
        return random.choice([
            "슬라이드 디자인을 개선하려면 일관된 색상 테마를 사용하고, 텍스트와 배경 사이에 충분한 대비를 유지하세요. 또한 한 슬라이드에 너무 많은 정보를 넣지 않는 것이 좋습니다.",
            "프레젠테이션의 시각적 일관성을 위해 2-3개의 주요 색상으로 구성된 색상 팔레트를 선택하세요. 예를 들어, 기본색, 보조색, 강조색으로 구성할 수 있습니다.",
            "효과적인 슬라이드 레이아웃을 위해 콘텐츠 주위에 충분한 여백을 두고, 정보를 논리적 그룹으로 구성하세요. 또한 중요한 내용은 슬라이드 상단 또는 중앙에 배치하는 것이 좋습니다."
        ])
    elif "내용" in prompt or "텍스트" in prompt or "메시지" in prompt:
        return random.choice([
            "효과적인 프레젠테이션 내용을 위해 핵심 메시지를 명확하게 전달하고, 글머리 기호를 사용하여 주요 포인트를 강조하세요. 또한 전문 용어 사용을 최소화하고 간결한 문장을 사용하는 것이 좋습니다.",
            "슬라이드당 최대 3-5개의 핵심 포인트만 포함하는 것이 좋습니다. 이렇게 하면 청중이 정보를 더 쉽게 소화하고 기억할 수 있습니다.",
            "프레젠테이션 내용은 '무엇을, 왜, 어떻게'라는 구조를 따르면 효과적입니다. 먼저 주제 소개, 그 중요성 설명, 그리고 관련 세부 정보나 솔루션을 제시하세요."
        ])
    elif "이미지" in prompt or "그림" in prompt or "시각" in prompt:
        return random.choice([
            "슬라이드에 관련성 높은 이미지를 추가하면 메시지 전달력을 크게 향상시킬 수 있습니다. 고품질 이미지를 사용하고, 텍스트와 균형을 이루도록 배치하세요.",
            "이미지는 텍스트보다 더 많은 정보를 빠르게 전달할 수 있습니다. 복잡한 개념을 설명할 때는 다이어그램이나 인포그래픽을 활용하면 효과적입니다.",
            "시각적 요소를 선택할 때는 프레젠테이션의 전체적인 스타일과 어울리는지, 전달하려는 메시지를 강화하는지 고려하세요."
        ])
    elif "발표" in prompt or "프레젠테이션" in prompt or "말하기" in prompt:
        return random.choice([
            "효과적인 발표를 위해서는 슬라이드의 모든 내용을 그대로 읽지 말고, 주요 포인트를 강조하며 청중과 눈 맞춤을 유지하세요.",
            "발표 시작 부분에서 명확한 목표와 구조를 제시하고, 마지막에는 핵심 메시지를 다시 강조하며 마무리하세요.",
            "청중의 관심을 유지하기 위해 개인적인 이야기, 흥미로운 데이터, 또는 관련 사례를 포함시키는 것이 좋습니다."
        ])
    else:
        return random.choice([
            "효과적인 프레젠테이션을 만들기 위해서는 명확한 메시지, 간결한 텍스트, 관련 이미지, 그리고 일관된 디자인이 중요합니다.",
            "프레젠테이션의 구조는 도입부(무엇을 말할 것인지), 본론(핵심 내용), 결론(무엇을 말했는지 요약)으로 구성하는 것이 효과적입니다.",
            "청중의 관심을 유지하기 위해 다양한 시각적 요소를 활용하고, 슬라이드 간 자연스러운 전환을 만드는 것이 중요합니다."
        ])

def suggest_design_improvements(slide):
    """
    슬라이드 디자인 개선을 위한 AI 제안을 생성합니다.
    
    Args:
        slide (dict): 분석할 슬라이드 데이터
        
    Returns:
        list: 디자인 개선 제안 목록
    """
    # 더미 디자인 제안
    suggestions = [
        {
            "type": "color",
            "title": "색상 조화 개선",
            "description": "현재 슬라이드의 색상이 조화롭지 않습니다. 더 일관된 색상 팔레트를 사용하세요.",
            "suggestion": "파란색 계열(#336699)과 보완색인 주황색(#FF9933)을 강조색으로 사용해보세요."
        },
        {
            "type": "layout",
            "title": "요소 배치 최적화",
            "description": "슬라이드 요소들이 균형 있게 배치되어 있지 않습니다.",
            "suggestion": "주요 내용을 슬라이드 중앙에 배치하고, 관련 이미지는 오른쪽에 정렬하세요."
        },
        {
            "type": "typography",
            "title": "폰트 일관성 유지",
            "description": "여러 다른 폰트를 사용하면 시각적 혼란을 줄 수 있습니다.",
            "suggestion": "제목에는 Arial 또는 Pretendard, 본문에는 Calibri 또는 Roboto를 일관되게 사용하세요."
        }
    ]
    
    return suggestions

def generate_slide_content(prompt, content_type="text"):
    """
    AI를 사용하여 슬라이드 콘텐츠를 생성합니다.
    
    Args:
        prompt (str): 콘텐츠 생성을 위한 프롬프트
        content_type (str): 생성할 콘텐츠 유형 (text, bullets, title 등)
        
    Returns:
        dict: 생성된 콘텐츠
    """
    # 더미 콘텐츠 생성
    if content_type == "title":
        return {
            "title": f"{prompt}에 관한 효과적인 프레젠테이션",
            "subtitle": "핵심 개념과 응용 방안"
        }
    elif content_type == "bullets":
        return {
            "title": f"{prompt} 주요 포인트",
            "bullets": [
                f"{prompt}의 기본 개념 이해하기",
                f"{prompt}가 중요한 이유와 배경",
                f"{prompt}의 주요 구성 요소 분석",
                f"{prompt} 활용을 위한 실용적 접근 방법",
                f"{prompt}의 미래 전망과 발전 방향"
            ]
        }
    elif content_type == "conclusion":
        return {
            "title": "결론",
            "content": f"{prompt}에 대해 살펴보았습니다. 이를 통해 우리는 중요한 통찰력을 얻을 수 있었으며, 향후 이 지식을 실제 상황에 적용할 수 있는 방안을 모색해 볼 수 있습니다."
        }
    else:  # 기본 텍스트
        return {
            "title": prompt,
            "content": f"{prompt}는 현대 비즈니스 환경에서 중요한 역할을 합니다. 효과적으로 활용하면 생산성을 향상시키고 의사결정을 개선할 수 있습니다. 이 주제에 대한 깊은 이해는 조직의 성공에 기여할 수 있는 핵심 요소입니다."
        }

def analyze_slide(slide):
    """
    슬라이드 콘텐츠를 분석하고 피드백을 제공합니다.
    
    Args:
        slide (dict): 분석할 슬라이드 데이터
        
    Returns:
        dict: 분석 결과와 개선 제안
    """
    # 더미 분석 결과
    analysis = {
        "readability": {
            "score": random.choice(["good", "average", "poor"]),
            "feedback": "텍스트 양이 적절하고 가독성이 좋습니다."
        },
        "content_quality": {
            "score": random.choice(["good", "average", "poor"]),
            "feedback": "핵심 메시지가 명확하게 전달되고 있습니다."
        },
        "visual_balance": {
            "score": random.choice(["good", "average", "poor"]),
            "feedback": "요소들이 균형 있게 배치되어 있습니다."
        },
        "improvements": [
            "더 강렬한 제목을 사용하여 청중의 관심을 끌어보세요.",
            "핵심 포인트를 3-5개로 제한하여 집중력을 높이세요.",
            "관련 이미지나 그래픽을 추가하여 시각적 효과를 높이세요."
        ]
    }
    
    return analysis

def generate_title_suggestions(content='', theme='', count=5):
    """
    콘텐츠나 테마에 기반한 제목을 추천합니다.
    
    Args:
        content (str): 슬라이드 콘텐츠
        theme (str): 프레젠테이션 테마 또는 주제
        count (int): 생성할 제목 개수
        
    Returns:
        list: 추천 제목 목록
    """
    # API 키가 없는 경우 더미 응답 반환
    if not OPENAI_API_KEY:
        logger.warning("OpenAI API 키가 설정되지 않았습니다. 더미 제목을 반환합니다.")
        return generate_dummy_titles(content, theme, count)
    
    try:
        # 시스템 메시지 생성
        system_message = "당신은 프레젠테이션 제목 추천 전문가입니다. 제공된 콘텐츠나 주제에 기반하여 매력적이고 전문적인 제목을 추천해 주세요."
        
        # 프롬프트 생성
        prompt = "다음 정보를 바탕으로 프레젠테이션 제목을 추천해 주세요:\n"
        
        if content:
            prompt += f"콘텐츠: {content}\n"
        
        if theme:
            prompt += f"주제/테마: {theme}\n"
        
        prompt += f"\n{count}개의 서로 다른 제목을 제안해 주세요. 각 제목은 간결하면서도 매력적이어야 합니다. 번호를 매겨서 목록 형태로 제공해 주세요."
        
        # API 요청 헤더
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENAI_API_KEY}"
        }
        
        # API 요청 데이터
        data = {
            "model": DEFAULT_MODEL,
            "messages": [
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.8,
            "max_tokens": 500
        }
        
        # API 요청 전송
        response = requests.post(OPENAI_API_URL, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        
        # 응답 추출 및 파싱
        if 'choices' in result and len(result['choices']) > 0:
            ai_response = result['choices'][0]['message']['content'].strip()
            
            # 응답에서 제목 목록 추출
            titles = []
            for line in ai_response.split('\n'):
                # 번호가 붙은 라인 찾기 (예: "1. 제목", "2) 제목", "- 제목")
                if re.match(r'^\d+[\.\)]\s+|^[-*]\s+', line.strip()):
                    title = re.sub(r'^\d+[\.\)]\s+|^[-*]\s+', '', line.strip())
                    if title:
                        titles.append(title)
            
            # 추출된 제목이 없다면 전체 응답을 줄바꿈으로 분리
            if not titles:
                titles = [line.strip() for line in ai_response.split('\n') if line.strip()]
            
            # 요청한 개수만큼 반환
            return titles[:count]
        else:
            logger.error(f"API 응답에서 유효한 결과를 찾을 수 없습니다: {result}")
            return generate_dummy_titles(content, theme, count)
            
    except Exception as e:
        logger.error(f"제목 추천 중 오류 발생: {str(e)}")
        return generate_dummy_titles(content, theme, count)

def generate_dummy_titles(content='', theme='', count=5):
    """API 없이 더미 제목 응답을 생성합니다"""
    
    # 테마나 콘텐츠에 따라 다른 제목 생성
    general_titles = [
        "혁신의 시대: 미래를 위한 준비",
        "성공을 향한 로드맵",
        "변화의 물결: 적응과 성장",
        "최고의 결과를 위한 전략",
        "새로운 관점: 패러다임의 전환",
        "통찰력 있는 분석과 해결책",
        "비전과 실행: 목표 달성의 비결",
        "디지털 시대의 경쟁 우위 확보",
        "지속 가능한 성장을 위한 전략",
        "협업의 힘: 함께 이루는 성공"
    ]
    
    business_titles = [
        "비즈니스 성장을 위한 핵심 전략",
        "시장 점유율 확대를 위한 로드맵",
        "고객 중심 비즈니스 모델 구축",
        "디지털 트랜스포메이션의 성공 사례",
        "효율적인 팀 관리와 리더십",
        "데이터 기반 의사결정의 중요성",
        "브랜드 가치 향상을 위한 전략",
        "수익성 개선을 위한 실용적 접근법",
        "글로벌 시장 진출 전략",
        "위기 관리와 비즈니스 연속성"
    ]
    
    tech_titles = [
        "AI가 바꾸는 미래 기술 동향",
        "디지털 혁신: 기술의 새로운 지평",
        "클라우드 컴퓨팅의 비즈니스 활용",
        "사이버 보안: 위협과 대응 전략",
        "블록체인 기술의 실용적 응용",
        "빅데이터 분석과 비즈니스 인사이트",
        "IoT가 만드는 스마트 세상",
        "디지털 워크플레이스의 미래",
        "인공지능과 머신러닝의 현재와 미래",
        "기술 주도 혁신의 성공 사례"
    ]
    
    education_titles = [
        "효과적인 학습법: 지식 습득의 최적화",
        "미래 교육의 혁신적 접근 방식",
        "평생 학습: 지속적 성장의 열쇠",
        "교육 기술의 발전과 적용",
        "학습 동기 부여: 교육 성공의 비결",
        "비판적 사고력 향상을 위한 교육",
        "창의성과 혁신을 위한 교육 방법론",
        "글로벌 교육 트렌드와 시사점",
        "맞춤형 학습: 개인화 교육의 중요성",
        "교육 평가 방법의 혁신적 접근"
    ]
    
    # 콘텐츠 또는 테마에 따라 적절한 제목 목록 선택
    if theme:
        theme_lower = theme.lower()
        if '비즈니스' in theme_lower or '경영' in theme_lower:
            titles = business_titles.copy()
        elif '기술' in theme_lower or '테크' in theme_lower or 'IT' in theme_lower:
            titles = tech_titles.copy()
        elif '교육' in theme_lower or '학습' in theme_lower:
            titles = education_titles.copy()
        else:
            titles = general_titles.copy()
    elif content:
        content_lower = content.lower()
        if '비즈니스' in content_lower or '회사' in content_lower or '경영' in content_lower:
            titles = business_titles.copy()
        elif '기술' in content_lower or 'AI' in content_lower or '개발' in content_lower:
            titles = tech_titles.copy()
        elif '교육' in content_lower or '학습' in content_lower or '학교' in content_lower:
            titles = education_titles.copy()
        else:
            titles = general_titles.copy()
    else:
        titles = general_titles.copy()
    
    # 무작위로 섞고 요청한 개수만큼 반환
    random.shuffle(titles)
    return titles[:count] 