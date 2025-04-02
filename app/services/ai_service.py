import requests
import json
from app.utils.logger import logger
from app.utils.config import DEEPSEAK_API_KEY

def call_deepseak_api(messages):
    """Call DeepSeek API to get AI-generated responses"""
    try:
        if not DEEPSEAK_API_KEY:
            logger.warning("DeepSeek API key not found. Cannot make API call.")
            return "API 키가 없습니다. 관리자에게 문의하세요."
        
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
        
        # Add timeout (15 seconds)
        response = requests.post(url, headers=headers, json=data, timeout=15)
        
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']
        elif response.status_code == 402:
            # Insufficient balance error
            logger.error(f"DeepSeek API insufficient balance: {response.text}")
            return "API 잔액이 부족합니다. 관리자에게 문의하세요."
        else:
            logger.error(f"API Error: {response.status_code}, {response.text}")
            return f"API 오류({response.status_code}): 잠시 후 다시 시도해주세요."
            
    except requests.exceptions.Timeout:
        logger.error("DeepSeek API call timeout")
        return "API 호출 시간이 초과되었습니다. 잠시 후 다시 시도해주세요."
    except requests.exceptions.RequestException as e:
        logger.error(f"DeepSeek API request error: {str(e)}")
        return "API 연결 오류가 발생했습니다. 네트워크 상태를 확인해주세요."
    except Exception as e:
        logger.error(f"Error calling DeepSeek API: {str(e)}")
        return f"API 호출 중 오류가 발생했습니다: {str(e)}" 