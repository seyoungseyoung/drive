// 전역 변수
let currentSlideIndex = 0;
let slides = [];
let undoStack = [];
let redoStack = [];
let selectedElement = null;
let isDragging = false;
let startX, startY;

// 기본 변수 초기화
let currentModel = 'gpt-4';
let aiSuggestions = [];
let versionHistory = [];
let collaborators = [];

// AI 확장 기능 관련 변수
let aiEnabled = false;

// 문서 로드 완료 시 실행
document.addEventListener('DOMContentLoaded', () => {
    // 디버그 기능 초기화
    initializeDebug();
    
    // UI 초기화
    initializeUI();
    
    // 이벤트 리스너 초기화
    initializeEventListeners();
    
    // 슬라이드 로드
    loadSlides();
    
    console.log('App initialized');
});

// 디버그 기능 초기화
function initializeDebug() {
    const showDebugBtn = document.getElementById('show-debug');
    const toggleDebugBtn = document.getElementById('toggle-debug');
    const debugInfo = document.getElementById('debug-info');
    
    if (showDebugBtn) {
        showDebugBtn.addEventListener('click', () => {
            debugInfo.style.display = 'block';
            showDebugBtn.style.display = 'none';
            updateDebugInfo();
        });
    }
    
    if (toggleDebugBtn) {
        toggleDebugBtn.addEventListener('click', () => {
            debugInfo.style.display = 'none';
            showDebugBtn.style.display = 'block';
        });
    }
    
    // 디버그 정보 업데이트 간격 설정 (1초)
    setInterval(updateDebugInfo, 1000);
}

// 디버그 정보 업데이트
function updateDebugInfo() {
    const debugInfo = document.getElementById('debug-info');
    if (!debugInfo || debugInfo.style.display === 'none') return;
    
    document.getElementById('debug-slide-count').textContent = slides ? slides.length : 0;
    document.getElementById('debug-current-slide').textContent = currentSlideIndex;
    
    const elementsCount = slides && slides[currentSlideIndex] && slides[currentSlideIndex].elements ? 
        slides[currentSlideIndex].elements.length : 0;
    document.getElementById('debug-elements').textContent = elementsCount;
}

// UI 초기화
function initializeUI() {
    // 슬라이드 목록 초기화
    const slideList = document.getElementById('slideList');
    if (slideList) {
        slideList.innerHTML = '';
    } else {
        console.error('Slide list element not found');
    }
    
    // 속성 패널 탭 초기화
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;
            switchTab(tab);
        });
    });
}

// 이벤트 리스너 초기화
function initializeEventListeners() {
    // 슬라이드 관리 버튼
    attachEventListener('newSlideBtn', 'click', addNewSlide);
    attachEventListener('deleteSlideBtn', 'click', deleteCurrentSlide);
    attachEventListener('duplicateSlideBtn', 'click', duplicateCurrentSlide);
    
    // 요소 추가 버튼
    attachEventListener('addTextBtn', 'click', addTextElement);
    attachEventListener('addShapeBtn', 'click', showShapeModal);
    attachEventListener('addImageBtn', 'click', showImageModal);
    
    // 실행 취소/다시 실행
    attachEventListener('undoBtn', 'click', undo);
    attachEventListener('redoBtn', 'click', redo);
    
    // 내보내기
    attachEventListener('exportBtn', 'click', exportPresentation);
    
    // 모달 닫기 버튼
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // 도형 선택
    document.querySelectorAll('.shape-item').forEach(item => {
        item.addEventListener('click', () => {
            const shape = item.dataset.shape;
            addShapeElement(shape);
            const modal = document.getElementById('shapeModal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // 이미지 업로드
    attachEventListener('uploadImageBtn', 'click', uploadImage);
    
    // 속성 변경 이벤트
    attachEventListener('themeSelect', 'change', updateTheme);
    attachEventListener('colorPaletteSelect', 'change', updateColorPalette);
    attachEventListener('fontSelect', 'change', updateFont);
    attachEventListener('backgroundColorPicker', 'change', updateBackgroundColor);
    attachEventListener('opacitySlider', 'input', updateOpacity);
    attachEventListener('animationSelect', 'change', updateAnimation);
    attachEventListener('transitionSelect', 'change', updateTransition);
}

// 이벤트 리스너 안전하게 연결
function attachEventListener(elementId, eventType, handler) {
    const element = document.getElementById(elementId);
    if (element) {
        element.addEventListener(eventType, handler);
    } else {
        console.error(`Element with ID "${elementId}" not found`);
    }
}

// 슬라이드 관리
function addNewSlide() {
    console.log('Adding new slide');
    const slide = {
        id: Date.now(),
        elements: [],
        background: '#ffffff',
        theme: 'modern',
        colorPalette: 'blue',
        fontFamily: 'Pretendard',
        animation: 'none',
        transition: 'none'
    };
    
    slides.push(slide);
    saveSlides();
    updateSlideList();
    switchToSlide(slides.length - 1);
    console.log('New slide added, total slides:', slides.length);
}

function deleteCurrentSlide() {
    if (slides.length <= 1) return;
    
    slides.splice(currentSlideIndex, 1);
    saveSlides();
    updateSlideList();
    
    if (currentSlideIndex >= slides.length) {
        currentSlideIndex = slides.length - 1;
    }
    
    switchToSlide(currentSlideIndex);
}

function duplicateCurrentSlide() {
    const slide = JSON.parse(JSON.stringify(slides[currentSlideIndex]));
    slide.id = Date.now();
    slides.splice(currentSlideIndex + 1, 0, slide);
    saveSlides();
    updateSlideList();
    switchToSlide(currentSlideIndex + 1);
}

// 요소 추가
function addTextElement() {
    const textElement = {
        type: 'text',
        id: Date.now(),
        content: '텍스트를 입력하세요',
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        fontSize: 16,
        fontFamily: 'Pretendard',
        color: '#000000',
        backgroundColor: 'transparent',
        opacity: 1
    };
    
    addElementToCurrentSlide(textElement);
}

function addShapeElement(shape) {
    const shapeElement = {
        type: 'shape',
        id: Date.now(),
        shape: shape,
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        color: '#000000',
        backgroundColor: '#ffffff',
        opacity: 1
    };
    
    addElementToCurrentSlide(shapeElement);
}

function addImageElement(imageUrl) {
    const imageElement = {
        type: 'image',
        id: Date.now(),
        url: imageUrl,
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        opacity: 1
    };
    
    addElementToCurrentSlide(imageElement);
}

// 요소 관리
function addElementToCurrentSlide(element) {
    if (!slides || !slides[currentSlideIndex]) {
        console.error('Cannot add element - no current slide');
        return;
    }
    
    if (!slides[currentSlideIndex].elements) {
        slides[currentSlideIndex].elements = [];
    }
    
    slides[currentSlideIndex].elements.push(element);
    saveSlides();
    renderCurrentSlide();
    console.log('Element added:', element);
}

function selectElement(elementId) {
    selectedElement = slides[currentSlideIndex].elements.find(el => el.id === elementId);
    if (selectedElement) {
        updatePropertiesPanel();
    }
}

function deleteElement(elementId) {
    slides[currentSlideIndex].elements = slides[currentSlideIndex].elements.filter(el => el.id !== elementId);
    saveSlides();
    renderCurrentSlide();
}

// 드래그 앤 드롭
function startDragging(e) {
    if (!selectedElement) return;
    
    isDragging = true;
    startX = e.clientX - selectedElement.x;
    startY = e.clientY - selectedElement.y;
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);
}

function drag(e) {
    if (!isDragging || !selectedElement) return;
    
    selectedElement.x = e.clientX - startX;
    selectedElement.y = e.clientY - startY;
    
    renderCurrentSlide();
}

function stopDragging() {
    isDragging = false;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDragging);
    saveSlides();
}

// 속성 업데이트
function updateTheme() {
    const theme = document.getElementById('themeSelect').value;
    slides[currentSlideIndex].theme = theme;
    saveSlides();
    renderCurrentSlide();
}

function updateColorPalette() {
    const palette = document.getElementById('colorPaletteSelect').value;
    slides[currentSlideIndex].colorPalette = palette;
    saveSlides();
    renderCurrentSlide();
}

function updateFont() {
    const font = document.getElementById('fontSelect').value;
    slides[currentSlideIndex].fontFamily = font;
    saveSlides();
    renderCurrentSlide();
}

function updateBackgroundColor() {
    const color = document.getElementById('backgroundColorPicker').value;
    slides[currentSlideIndex].background = color;
    saveSlides();
    renderCurrentSlide();
}

function updateOpacity() {
    const opacity = document.getElementById('opacitySlider').value / 100;
    if (selectedElement) {
        selectedElement.opacity = opacity;
        saveSlides();
        renderCurrentSlide();
    }
}

function updateAnimation() {
    const animation = document.getElementById('animationSelect').value;
    slides[currentSlideIndex].animation = animation;
    saveSlides();
    renderCurrentSlide();
}

function updateTransition() {
    const transition = document.getElementById('transitionSelect').value;
    slides[currentSlideIndex].transition = transition;
    saveSlides();
    renderCurrentSlide();
}

// 렌더링
function renderCurrentSlide() {
    const slideContainer = document.getElementById('currentSlide');
    if (!slideContainer) {
        console.error('Slide container not found!');
        return;
    }
    
    slideContainer.innerHTML = '';
    
    if (!slides || slides.length === 0 || currentSlideIndex >= slides.length) {
        console.log('No slides available or invalid index');
        return;
    }
    
    const slide = slides[currentSlideIndex];
    slideContainer.style.backgroundColor = slide.background || '#ffffff';
    
    if (slide.elements && Array.isArray(slide.elements)) {
        slide.elements.forEach(element => {
            const elementEl = createElementElement(element);
            slideContainer.appendChild(elementEl);
        });
    } else {
        console.log('No elements in current slide or invalid structure', slide);
    }
}

function createElementElement(element) {
    const el = document.createElement('div');
    el.className = `slide-element ${element.type}`;
    el.dataset.id = element.id;
    
    el.style.left = `${element.x}px`;
    el.style.top = `${element.y}px`;
    el.style.width = `${element.width}px`;
    el.style.height = `${element.height}px`;
    el.style.opacity = element.opacity;
    
    switch (element.type) {
        case 'text':
            el.innerHTML = `<div class="text-content" contenteditable="true">${element.content}</div>`;
            break;
        case 'shape':
            el.innerHTML = `<div class="shape-content ${element.shape}"></div>`;
            break;
        case 'image':
            el.innerHTML = `<img src="${element.url}" alt="이미지">`;
            break;
    }
    
    el.addEventListener('mousedown', (e) => {
        selectElement(element.id);
        startDragging(e);
    });
    
    return el;
}

// 저장 및 로드
function saveSlides() {
    console.log('Saving slides:', slides);
    undoStack.push(JSON.stringify(slides));
    redoStack = [];
    
    fetch('/save_slides', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            slides: slides // 전체 슬라이드 배열 전송
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Save response:', data);
    })
    .catch(error => {
        console.error('Error saving slides:', error);
    });
}

function loadSlides() {
    console.log('Loading slides');
    fetch('/get_slides')
        .then(response => response.json())
        .then(data => {
            console.log('Loaded data:', data);
            if (data.success) {
                slides = data.slides || [];
                if (slides.length === 0) {
                    // 슬라이드가 없으면 기본 슬라이드 추가
                    addNewSlide();
                } else {
                    updateSlideList();
                    switchToSlide(0);
                    console.log('Slides loaded:', slides.length);
                }
            } else {
                console.error('Failed to load slides:', data.error);
                // 기본 슬라이드 추가
                slides = [];
                addNewSlide();
            }
        })
        .catch(error => {
            console.error('Error loading slides:', error);
            // 오류 발생 시 기본 슬라이드 추가
            slides = [];
            addNewSlide();
        });
}

// 실행 취소/다시 실행
function undo() {
    if (undoStack.length === 0) return;
    
    redoStack.push(JSON.stringify(slides));
    slides = JSON.parse(undoStack.pop());
    renderCurrentSlide();
}

function redo() {
    if (redoStack.length === 0) return;
    
    undoStack.push(JSON.stringify(slides));
    slides = JSON.parse(redoStack.pop());
    renderCurrentSlide();
}

// 내보내기
function exportPresentation() {
    fetch('/download_ppt')
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'presentation.pptx';
            a.click();
            window.URL.revokeObjectURL(url);
        });
}

// 유틸리티 함수
function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`${tab}Tab`).classList.add('active');
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
}

function updateSlideList() {
    const slideList = document.getElementById('slideList');
    slideList.innerHTML = '';
    
    slides.forEach((slide, index) => {
        const slideThumb = document.createElement('div');
        slideThumb.className = 'slide-thumbnail';
        if (index === currentSlideIndex) {
            slideThumb.classList.add('active');
        }
        
        slideThumb.innerHTML = `
            <div class="slide-number">${index + 1}</div>
            <div class="slide-preview"></div>
        `;
        
        slideThumb.addEventListener('click', () => switchToSlide(index));
        slideList.appendChild(slideThumb);
    });
}

function switchToSlide(index) {
    if (index < 0 || index >= slides.length) return;
    
    currentSlideIndex = index;
    updateSlideList();
    renderCurrentSlide();
}

function showShapeModal() {
    document.getElementById('shapeModal').style.display = 'block';
}

function showImageModal() {
    document.getElementById('imageModal').style.display = 'block';
}

function uploadImage() {
    const fileInput = document.getElementById('imageInput');
    const file = fileInput.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('image', file);
    
    fetch('/upload_image', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            addImageElement(data.image_url);
            document.getElementById('imageModal').style.display = 'none';
        }
    });
}

// AI 에이전트 기능 초기화
function initializeAIAgent() {
    // AI 모델 선택 UI
    const modelSelector = document.createElement('select');
    modelSelector.id = 'aiModel';
    modelSelector.innerHTML = `
        <option value="gpt-4">GPT-4</option>
        <option value="claude">Claude</option>
        <option value="gemini">Gemini</option>
    `;
    modelSelector.addEventListener('change', (e) => {
        currentModel = e.target.value;
    });
    
    // AI 도구 모음 추가
    const aiToolbar = document.createElement('div');
    aiToolbar.className = 'ai-toolbar';
    aiToolbar.innerHTML = `
        <button id="analyzeBtn" class="ai-btn">
            <i class="fas fa-chart-line"></i> 분석
        </button>
        <button id="generateImageBtn" class="ai-btn">
            <i class="fas fa-image"></i> 이미지 생성
        </button>
        <button id="improveDesignBtn" class="ai-btn">
            <i class="fas fa-paint-brush"></i> 디자인 개선
        </button>
        <button id="collaborateBtn" class="ai-btn">
            <i class="fas fa-users"></i> 협업
        </button>
        <button id="versionControlBtn" class="ai-btn">
            <i class="fas fa-history"></i> 버전 관리
        </button>
    `;
    
    // AI 패널 추가
    const aiPanel = document.createElement('div');
    aiPanel.className = 'ai-panel';
    aiPanel.innerHTML = `
        <div class="ai-panel-header">
            <h3>AI 에이전트</h3>
            <button class="close-panel">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="ai-panel-content">
            <div class="ai-suggestions"></div>
            <div class="ai-chat">
                <div class="chat-messages"></div>
                <div class="chat-input">
                    <textarea placeholder="AI에게 질문하세요..."></textarea>
                    <button class="send-btn">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // UI 요소 추가
    document.querySelector('.toolbar').appendChild(modelSelector);
    document.querySelector('.toolbar').appendChild(aiToolbar);
    document.querySelector('.app-container').appendChild(aiPanel);
    
    // 이벤트 리스너 등록
    setupAIEventListeners();
}

// AI 이벤트 리스너 설정
function setupAIEventListeners() {
    // 분석 버튼
    document.getElementById('analyzeBtn').addEventListener('click', async () => {
        const currentSlide = getCurrentSlide();
        if (!currentSlide) return;
        
        showLoading('슬라이드 분석 중...');
        try {
            const response = await fetch('/analyze_slide', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    slide_index: currentSlideIndex,
                    content: currentSlide.innerHTML,
                    model: currentModel
                })
            });
            
            const data = await response.json();
            if (data.success) {
                showAISuggestion(data.analysis);
            }
        } catch (error) {
            showError('분석 중 오류가 발생했습니다.');
        } finally {
            hideLoading();
        }
    });
    
    // 이미지 생성 버튼
    document.getElementById('generateImageBtn').addEventListener('click', async () => {
        const prompt = prompt('이미지 생성을 위한 설명을 입력하세요:');
        if (!prompt) return;
        
        showLoading('이미지 생성 중...');
        try {
            const response = await fetch('/generate_image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    style: 'realistic'
                })
            });
            
            const data = await response.json();
            if (data.success) {
                addImageToSlide(data.image_url);
            }
        } catch (error) {
            showError('이미지 생성 중 오류가 발생했습니다.');
        } finally {
            hideLoading();
        }
    });
    
    // 디자인 개선 버튼
    document.getElementById('improveDesignBtn').addEventListener('click', async () => {
        const currentSlide = getCurrentSlide();
        if (!currentSlide) return;
        
        showLoading('디자인 개선 중...');
        try {
            const response = await fetch('/improve_design', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    slide_data: {
                        content: currentSlide.innerHTML,
                        style: getCurrentSlideStyle()
                    }
                })
            });
            
            const data = await response.json();
            if (data.success) {
                showAISuggestion(data.suggestions);
            }
        } catch (error) {
            showError('디자인 개선 중 오류가 발생했습니다.');
        } finally {
            hideLoading();
        }
    });
    
    // 협업 버튼
    document.getElementById('collaborateBtn').addEventListener('click', () => {
        showCollaborationModal();
    });
    
    // 버전 관리 버튼
    document.getElementById('versionControlBtn').addEventListener('click', () => {
        showVersionControlModal();
    });
}

// AI 제안 표시
function showAISuggestion(suggestion) {
    const suggestionsDiv = document.querySelector('.ai-suggestions');
    const suggestionElement = document.createElement('div');
    suggestionElement.className = 'ai-suggestion';
    suggestionElement.innerHTML = `
        <div class="suggestion-header">
            <span class="timestamp">${new Date().toLocaleTimeString()}</span>
            <button class="apply-btn">적용</button>
        </div>
        <div class="suggestion-content">${suggestion}</div>
    `;
    
    suggestionElement.querySelector('.apply-btn').addEventListener('click', () => {
        applyAISuggestion(suggestion);
    });
    
    suggestionsDiv.appendChild(suggestionElement);
    suggestionsDiv.scrollTop = suggestionsDiv.scrollHeight;
}

// AI 제안 적용
function applyAISuggestion(suggestion) {
    const currentSlide = getCurrentSlide();
    if (!currentSlide) return;
    
    // 제안된 변경사항을 슬라이드에 적용
    // (실제 구현에서는 suggestion의 내용을 파싱하여 적절한 변경사항을 적용)
    currentSlide.innerHTML += `<div class="ai-improvement">${suggestion}</div>`;
}

// 협업 모달 표시
function showCollaborationModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>협업 설정</h3>
                <button class="close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="collaborators-list">
                    ${collaborators.map(collaborator => `
                        <div class="collaborator">
                            <span>${collaborator}</span>
                            <button class="remove-btn">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
                <div class="add-collaborator">
                    <input type="email" placeholder="이메일 주소 입력">
                    <button class="add-btn">추가</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setupCollaborationEventListeners(modal);
}

// 버전 관리 모달 표시
function showVersionControlModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>버전 관리</h3>
                <button class="close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="version-list">
                    ${versionHistory.map((version, index) => `
                        <div class="version-item">
                            <span>버전 ${index + 1}</span>
                            <span class="timestamp">${new Date(version.timestamp).toLocaleString()}</span>
                            <button class="restore-btn" data-index="${index}">복원</button>
                        </div>
                    `).join('')}
                </div>
                <button class="save-version-btn">현재 버전 저장</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setupVersionControlEventListeners(modal);
}

// 로딩 표시
function showLoading(message) {
    const loading = document.createElement('div');
    loading.className = 'loading-overlay';
    loading.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <div class="loading-message">${message}</div>
        </div>
    `;
    document.body.appendChild(loading);
}

// 로딩 숨기기
function hideLoading() {
    const loading = document.querySelector('.loading-overlay');
    if (loading) {
        loading.remove();
    }
}

// 에러 메시지 표시
function showError(message) {
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    document.body.appendChild(error);
    
    setTimeout(() => {
        error.remove();
    }, 3000);
}

// AI 확장 기능 초기화
function initializeAIExtension() {
    const aiPanel = document.getElementById('aiPanel');
    const toggleAIBtn = document.getElementById('toggleAIBtn');
    
    // AI 도구 토글 버튼 이벤트
    toggleAIBtn.addEventListener('click', () => {
        aiEnabled = !aiEnabled;
        toggleAIBtn.classList.toggle('active', aiEnabled);
        aiPanel.style.display = aiEnabled ? 'block' : 'none';
        
        // 서버에 AI 확장 기능 상태 업데이트
        fetch('/toggle_extension', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                extension: 'ai',
                enabled: aiEnabled
            })
        });
    });
    
    // AI 도구 버튼 이벤트
    document.getElementById('analyzeBtn').addEventListener('click', analyzeCurrentSlide);
    document.getElementById('generateImageBtn').addEventListener('click', generateImage);
    document.getElementById('improveDesignBtn').addEventListener('click', improveDesign);
}

// 현재 슬라이드 분석
async function analyzeCurrentSlide() {
    const currentSlide = getCurrentSlideData();
    if (!currentSlide) return;
    
    showLoading('분석 중...');
    
    try {
        const response = await fetch('/analyze_slide', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                slide_index: currentSlideIndex,
                content: currentSlide
            })
        });
        
        const data = await response.json();
        if (data.success) {
            addAISuggestion('분석 결과', data.analysis);
        } else {
            showError(data.error);
        }
    } catch (error) {
        showError('분석 중 오류가 발생했습니다.');
    } finally {
        hideLoading();
    }
}

// 이미지 생성
async function generateImage() {
    const prompt = prompt('이미지 생성을 위한 설명을 입력하세요:');
    if (!prompt) return;
    
    showLoading('이미지 생성 중...');
    
    try {
        const response = await fetch('/generate_image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt
            })
        });
        
        const data = await response.json();
        if (data.success) {
            addImageToSlide(data.image_url);
        } else {
            showError(data.error);
        }
    } catch (error) {
        showError('이미지 생성 중 오류가 발생했습니다.');
    } finally {
        hideLoading();
    }
}

// 디자인 개선
async function improveDesign() {
    const currentSlide = getCurrentSlideData();
    if (!currentSlide) return;
    
    showLoading('디자인 개선 중...');
    
    try {
        const response = await fetch('/improve_design', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                slide_data: currentSlide
            })
        });
        
        const data = await response.json();
        if (data.success) {
            addAISuggestion('디자인 제안', data.suggestions);
        } else {
            showError(data.error);
        }
    } catch (error) {
        showError('디자인 개선 중 오류가 발생했습니다.');
    } finally {
        hideLoading();
    }
}

// AI 제안 추가
function addAISuggestion(title, content) {
    const suggestionsContainer = document.getElementById('aiSuggestions');
    const suggestion = document.createElement('div');
    suggestion.className = 'ai-suggestion';
    suggestion.innerHTML = `
        <h4>${title}</h4>
        <p>${content}</p>
        <button class="apply-btn">적용</button>
    `;
    
    suggestion.querySelector('.apply-btn').addEventListener('click', () => {
        applyAISuggestion(content);
    });
    
    suggestionsContainer.insertBefore(suggestion, suggestionsContainer.firstChild);
}

// 버전 히스토리 업데이트
function updateVersionHistory() {
    const historyContainer = document.getElementById('versionHistory');
    historyContainer.innerHTML = '';
    
    versionHistory.forEach((version, index) => {
        const versionItem = document.createElement('div');
        versionItem.className = 'version-item';
        versionItem.innerHTML = `
            <div>버전 ${index + 1}</div>
            <div>${new Date(version.timestamp * 1000).toLocaleString()}</div>
        `;
        
        versionItem.addEventListener('click', () => {
            restoreVersion(index);
        });
        
        historyContainer.appendChild(versionItem);
    });
}

// 버전 복원
async function restoreVersion(index) {
    if (!confirm('이 버전으로 복원하시겠습니까?')) return;
    
    showLoading('버전 복원 중...');
    
    try {
        const response = await fetch('/version_control', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'restore',
                version_index: index
            })
        });
        
        const data = await response.json();
        if (data.success) {
            loadSlides();
        } else {
            showError(data.error);
        }
    } catch (error) {
        showError('버전 복원 중 오류가 발생했습니다.');
    } finally {
        hideLoading();
    }
}

// 페이지 로드 시 AI 확장 기능 초기화
document.addEventListener('DOMContentLoaded', () => {
    initializeAIExtension();
    // ... 기존 초기화 코드 ...
});