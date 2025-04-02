// ... existing code ...

// AI 편집 요청
aiSubmitBtn.addEventListener('click', function() {
    const prompt = aiPromptInput.value.trim();
    if (!prompt) {
        alert('편집 지시사항을 입력해주세요.');
        return;
    }
    
    const currentSlideIndex = currentSlide;
    if (currentSlideIndex === null) {
        alert('선택된 슬라이드가 없습니다.');
        return;
    }
    
    // 로딩 표시
    aiSubmitBtn.disabled = true;
    aiSubmitBtn.innerHTML = '<span class="loading"></span> 처리 중...';
    
    // 타임아웃 설정
    const timeoutId = setTimeout(() => {
        aiSubmitBtn.disabled = false;
        aiSubmitBtn.textContent = 'AI에게 요청하기';
        alert('요청 시간이 초과되었습니다. 다시 시도해주세요.');
    }, 30000); // 30초 타임아웃
    
    // AI 편집 요청 보내기
    fetch('/edit_slide_ai', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            index: currentSlideIndex,
            prompt: prompt
        })
    })
    .then(response => {
        clearTimeout(timeoutId); // 타임아웃 취소
        if (!response.ok) {
            throw new Error(`서버 오류: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // 성공적으로 요소가 추가됨
            console.log('AI가 생성한 요소:', data.elements);
            
            // 현재 슬라이드의 요소 업데이트
            slides[currentSlideIndex].elements = data.elements;
            
            // 캔버스 다시 렌더링
            clearCanvas();
            renderCanvasElements();
            
            // 모달 닫기
            aiEditModal.style.display = 'none';
            
            // 알림
            alert('AI가 슬라이드 요소를 생성했습니다!');
        } else {
            // 오류 처리
            alert('오류 발생: ' + (data.error || '알 수 없는 오류'));
        }
    })
    .catch(error => {
        console.error('AI 편집 요청 오류:', error);
        alert('AI 편집 요청 중 오류가 발생했습니다: ' + error.message);
    })
    .finally(() => {
        clearTimeout(timeoutId); // 타임아웃 취소 (중복 호출은 안전함)
        // 버튼 상태 복원
        aiSubmitBtn.disabled = false;
        aiSubmitBtn.textContent = 'AI에게 요청하기';
    });
});

// ... existing code ...

// 프레젠테이션 설정 관련 요소
const initialSetup = document.getElementById('initialSetup');
const promptContainer = document.getElementById('promptContainer');
const topicInput = document.getElementById('topicInput');
const slideCountInput = document.getElementById('slideCountInput');
const createPresentationBtn = document.getElementById('createPresentationBtn');

// 첫 화면에서 시작하기 버튼 클릭 시
if (startBtn) {
    startBtn.addEventListener('click', function() {
        // 스무스 스크롤
        document.getElementById('workspace').scrollIntoView({ behavior: 'smooth' });
        // 초기 설정 화면 표시
        initialSetup.style.display = 'block';
        promptContainer.style.display = 'none';
    });
}

// 프레젠테이션 설정 후 생성 버튼 클릭 시
if (createPresentationBtn) {
    createPresentationBtn.addEventListener('click', function() {
        const topic = topicInput.value.trim();
        const slideCount = parseInt(slideCountInput.value);
        
        if (!topic) {
            alert('주제를 입력해주세요.');
            return;
        }
        
        if (isNaN(slideCount) || slideCount < 1 || slideCount > 20) {
            alert('슬라이드 개수는 1에서 20 사이의 숫자로 입력해주세요.');
            return;
        }
        
        // 로딩 표시
        createPresentationBtn.disabled = true;
        createPresentationBtn.textContent = '생성 중...';
        
        // 주제와 슬라이드 개수를 기반으로 프레젠테이션 생성 요청
        generatePresentationFromTopic(topic, slideCount);
    });
}

// 주제와 슬라이드 개수로 프레젠테이션 생성
function generatePresentationFromTopic(topic, slideCount) {
    fetch('/generate_from_topic', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            topic: topic,
            slide_count: slideCount
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 슬라이드 데이터 받아서 렌더링
            slides = data.slides;
            renderSlides();
            
            // 편집 모드로 전환
            currentSlide = 0; // 첫 번째 슬라이드 선택
            initialSetup.style.display = 'none';
            promptContainer.style.display = 'none';
            
            // 슬라이드 선택 처리
            selectSlide(0);
            
            // 워크스페이스에 생성 알림 추가
            const notification = document.createElement('div');
            notification.className = 'notification success';
            notification.textContent = `"${topic}" 주제로 ${slideCount}장의 슬라이드가 생성되었습니다!`;
            document.querySelector('.workspace').appendChild(notification);
            
            // 3초 후 알림 제거
            setTimeout(() => {
                notification.remove();
            }, 3000);
        } else {
            // 오류 처리
            alert('프레젠테이션 생성 중 오류가 발생했습니다: ' + (data.error || '알 수 없는 오류'));
        }
    })
    .catch(error => {
        console.error('프레젠테이션 생성 오류:', error);
        alert('프레젠테이션 생성 중 오류가 발생했습니다.');
    })
    .finally(() => {
        // 버튼 상태 복원
        createPresentationBtn.disabled = false;
        createPresentationBtn.textContent = '프레젠테이션 생성';
    });
}

// ... existing code ...

// 도형 드롭다운 표시/숨김 기능 수정
if (addShapeBtn) {
    addShapeBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // 이벤트 버블링 방지
        const dropdown = document.getElementById('shape-dropdown');
        
        // 드롭다운 위치 조정
        const rect = addShapeBtn.getBoundingClientRect();
        dropdown.style.top = rect.bottom + 'px';
        dropdown.style.left = rect.left + 'px';
        
        // 토글 표시
        if (dropdown.style.display === 'grid') {
            dropdown.style.display = 'none';
        } else {
            dropdown.style.display = 'grid';
        }
    });
    
    // 다른 곳 클릭 시 드롭다운 닫기
    document.addEventListener('click', function(e) {
        if (!e.target.matches('#add-shape-btn') && !e.target.closest('#shape-dropdown')) {
            const dropdown = document.getElementById('shape-dropdown');
            if (dropdown) dropdown.style.display = 'none';
        }
    });
}

// 도형 드롭다운 아이템 클릭 이벤트
const shapeItems = document.querySelectorAll('#shape-dropdown div');
shapeItems.forEach(item => {
    item.addEventListener('click', function() {
        const shapeType = this.getAttribute('data-shape');
        addShape(shapeType);
        
        // 드롭다운 닫기
        document.getElementById('shape-dropdown').style.display = 'none';
    });
});

// 화살표 도형 렌더링 수정
function renderShape(element, container) {
    const shape = document.createElement('div');
    shape.className = 'canvas-element shape';
    shape.id = element.id;
    shape.dataset.type = 'shape';
    shape.dataset.shape = element.content;
    shape.style.left = element.x + 'px';
    shape.style.top = element.y + 'px';
    shape.style.width = element.width + 'px';
    shape.style.height = element.height + 'px';
    
    if (element.rotation) {
        shape.style.transform = `rotate(${element.rotation}deg)`;
    }
    
    // 스타일 적용
    if (element.style) {
        if (element.style.color) shape.style.backgroundColor = element.style.color;
        if (element.style.borderStyle) shape.style.borderStyle = element.style.borderStyle;
    }
    
    // 특수 도형 처리
    if (element.content === 'arrow') {
        shape.style.position = 'absolute';
        shape.style.height = '2px';
        shape.style.backgroundColor = element.style?.color || '#000';
        
        // 화살표 헤드 추가
        const arrowHead = document.createElement('div');
        arrowHead.className = 'arrow-head';
        arrowHead.style.position = 'absolute';
        arrowHead.style.right = '-8px';
        arrowHead.style.top = '-4px';
        arrowHead.style.width = '0';
        arrowHead.style.height = '0';
        arrowHead.style.borderTop = '5px solid transparent';
        arrowHead.style.borderBottom = '5px solid transparent';
        arrowHead.style.borderLeft = `10px solid ${element.style?.color || '#000'}`;
        
        shape.appendChild(arrowHead);
    } else if (element.content === 'double-arrow') {
        shape.style.position = 'absolute';
        shape.style.height = '2px';
        shape.style.backgroundColor = element.style?.color || '#000';
        
        // 왼쪽 화살표 헤드
        const leftArrowHead = document.createElement('div');
        leftArrowHead.className = 'arrow-head left';
        leftArrowHead.style.position = 'absolute';
        leftArrowHead.style.left = '-8px';
        leftArrowHead.style.top = '-4px';
        leftArrowHead.style.width = '0';
        leftArrowHead.style.height = '0';
        leftArrowHead.style.borderTop = '5px solid transparent';
        leftArrowHead.style.borderBottom = '5px solid transparent';
        leftArrowHead.style.borderRight = `10px solid ${element.style?.color || '#000'}`;
        
        // 오른쪽 화살표 헤드
        const rightArrowHead = document.createElement('div');
        rightArrowHead.className = 'arrow-head right';
        rightArrowHead.style.position = 'absolute';
        rightArrowHead.style.right = '-8px';
        rightArrowHead.style.top = '-4px';
        rightArrowHead.style.width = '0';
        rightArrowHead.style.height = '0';
        rightArrowHead.style.borderTop = '5px solid transparent';
        rightArrowHead.style.borderBottom = '5px solid transparent';
        rightArrowHead.style.borderLeft = `10px solid ${element.style?.color || '#000'}`;
        
        shape.appendChild(leftArrowHead);
        shape.appendChild(rightArrowHead);
    }
    
    container.appendChild(shape);
    setupElementEvents(shape);
    
    return shape;
}

// ... existing code ...

// 슬라이드 분석 관련 요소
const analyzeBtn = document.getElementById('analyzeBtn');
const analyzeModal = document.getElementById('analyze-modal');
const analysisLoading = document.getElementById('analysis-loading');
const analysisContent = document.getElementById('analysis-content');
const overallFeedbackText = document.getElementById('overall-feedback-text');
const suggestionsList = document.getElementById('suggestions-list');
const suggestionTemplate = document.getElementById('suggestion-template');
const closeAnalyzeBtn = analyzeModal.querySelector('.close');

// 현재 분석 데이터 저장 변수
let currentAnalysis = null;

// 분석 버튼 클릭 이벤트
if (analyzeBtn) {
    analyzeBtn.addEventListener('click', function() {
        if (slides.length === 0) {
            alert('분석할 슬라이드가 없습니다. 먼저 슬라이드를 생성해주세요.');
            return;
        }
        
        // 모달 표시
        analyzeModal.style.display = 'block';
        analysisLoading.style.display = 'flex';
        analysisContent.style.display = 'none';
        
        // 슬라이드 분석 요청
        analyzeSlides();
    });
}

// 분석 모달 닫기
if (closeAnalyzeBtn) {
    closeAnalyzeBtn.addEventListener('click', function() {
        analyzeModal.style.display = 'none';
    });
}

// 모달 외부 클릭 시 닫기
window.addEventListener('click', function(event) {
    if (event.target === analyzeModal) {
        analyzeModal.style.display = 'none';
    }
});

// 슬라이드 분석 함수
function analyzeSlides() {
    fetch('/analyze_slides', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`서버 오류: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // 분석 데이터 저장
            currentAnalysis = data.analysis;
            
            // 분석 결과 표시
            displayAnalysisResults(currentAnalysis);
        } else {
            // 오류 처리
            alert('슬라이드 분석 중 오류가 발생했습니다: ' + (data.error || '알 수 없는 오류'));
            analyzeModal.style.display = 'none';
        }
    })
    .catch(error => {
        console.error('슬라이드 분석 오류:', error);
        alert('슬라이드 분석 중 오류가 발생했습니다: ' + error.message);
        analyzeModal.style.display = 'none';
    })
    .finally(() => {
        // 로딩 표시 숨기기
        analysisLoading.style.display = 'none';
    });
}

// 분석 결과 표시 함수
function displayAnalysisResults(analysis) {
    // 전체 피드백 표시
    overallFeedbackText.textContent = analysis.overall_feedback;
    
    // 제안 목록 초기화
    suggestionsList.innerHTML = '';
    
    // 제안 목록 표시
    analysis.improvement_suggestions.forEach((suggestion, index) => {
        // 템플릿 복제
        const item = suggestionTemplate.content.cloneNode(true);
        
        // 제안 내용 채우기
        item.querySelector('.slide-number').textContent = `슬라이드 ${suggestion.slide_index + 1}`;
        
        // 우선순위 설정
        const priorityElem = item.querySelector('.priority');
        priorityElem.textContent = getPriorityText(suggestion.priority);
        priorityElem.className = `priority ${suggestion.priority}`;
        
        // 제안 내용
        item.querySelector('.suggestion-text').textContent = suggestion.suggestion;
        
        // 적용 버튼 설정
        const applyBtn = item.querySelector('.apply-btn');
        if (suggestion.auto_applicable && suggestion.changes) {
            applyBtn.addEventListener('click', function() {
                applySuggestion(index, suggestion);
            });
        } else {
            applyBtn.disabled = true;
            applyBtn.textContent = '수동 적용 필요';
        }
        
        // 아이템 추가
        suggestionsList.appendChild(item);
    });
    
    // 분석 내용 표시
    analysisContent.style.display = 'block';
}

// 우선순위 텍스트 변환
function getPriorityText(priority) {
    switch(priority) {
        case 'high': return '높음';
        case 'medium': return '중간';
        case 'low': return '낮음';
        default: return priority;
    }
}

// 제안 적용 함수
function applySuggestion(suggestionIndex, suggestion) {
    // 적용 버튼 비활성화
    const applyBtn = suggestionsList.querySelectorAll('.apply-btn')[suggestionIndex];
    applyBtn.disabled = true;
    applyBtn.textContent = '적용 중...';
    
    fetch('/apply_suggestion', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            suggestion_index: suggestionIndex,
            analysis: currentAnalysis
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`서버 오류: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // 성공 처리
            slides[suggestion.slide_index] = data.slide;
            
            // 현재 슬라이드가 변경된 슬라이드라면 UI 업데이트
            if (currentSlide === suggestion.slide_index) {
                selectSlide(currentSlide);
            }
            
            // 슬라이드 목록 다시 그리기
            renderSlides();
            
            // 버튼 상태 변경
            applyBtn.textContent = '적용됨 ✓';
            
            // 알림 추가
            const notification = document.createElement('div');
            notification.className = 'notification success';
            notification.textContent = `슬라이드 ${suggestion.slide_index + 1}에 개선사항이 적용되었습니다!`;
            document.querySelector('.workspace').appendChild(notification);
            
            // 3초 후 알림 제거
            setTimeout(() => {
                notification.remove();
            }, 3000);
        } else {
            // 오류 처리
            alert('개선사항 적용 중 오류가 발생했습니다: ' + (data.error || '알 수 없는 오류'));
            applyBtn.disabled = false;
            applyBtn.textContent = '제가 할까요?';
        }
    })
    .catch(error => {
        console.error('개선사항 적용 오류:', error);
        alert('개선사항 적용 중 오류가 발생했습니다: ' + error.message);
        applyBtn.disabled = false;
        applyBtn.textContent = '제가 할까요?';
    });
}

// ... existing code ...