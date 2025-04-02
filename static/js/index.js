/**
 * PowerPoint-like Presentation Editor
 * Main Application Entry Point
 */

// App State - 중앙 상태 관리
export const AppState = {
    // 슬라이드 관련
    slides: [],
    currentSlideIndex: 0,
    
    // 선택된 요소
    selectedElement: null,
    
    // 테마 및 스타일 설정
    currentTheme: 'modern',
    currentColorPalette: 'blue',
    currentFontFamily: 'Pretendard',
    
    // 발표자 노트
    notes: {},
    
    // 기록(undo/redo)
    history: [],
    historyIndex: -1,
    
    // 내보내기 설정
    exportConfig: {
        format: 'pptx',
        quality: 'high'
    },
    
    // 확장 기능
    extensions: {
        aiEnabled: false
    }
};

// 히스토리 관리 (실행취소/다시실행)
const MAX_HISTORY = 50;

// 히스토리에 상태 추가
function addToHistory(state) {
    // 히스토리 크기 제한
    if (AppState.history.length > MAX_HISTORY) {
        AppState.history = AppState.history.slice(AppState.history.length - MAX_HISTORY);
    }
    
    // 현재 위치 이후의 히스토리 제거 (새 액션시)
    if (AppState.historyIndex < AppState.history.length - 1) {
        AppState.history = AppState.history.slice(0, AppState.historyIndex + 1);
    }
    
    // 새 상태 추가
    AppState.history.push(JSON.parse(JSON.stringify(state)));
    AppState.historyIndex = AppState.history.length - 1;
}

// 슬라이드 관리 함수
export function addNewSlide() {
    // 새 슬라이드 생성
    const newSlide = {
        id: Date.now(),
        background: '#FFFFFF',
        elements: []
    };
    
    // 히스토리 저장
    addToHistory({
        action: 'add_slide',
        slides: JSON.parse(JSON.stringify(AppState.slides)),
        currentSlideIndex: AppState.currentSlideIndex
    });
    
    // 슬라이드 추가
    AppState.slides.push(newSlide);
    AppState.currentSlideIndex = AppState.slides.length - 1;
    
    // UI 업데이트
    updateUIAfterChange();
    
    return newSlide;
}

export function duplicateCurrentSlide() {
    if (AppState.slides.length === 0) return null;
    
    // 히스토리 저장
    addToHistory({
        action: 'duplicate_slide',
        slides: JSON.parse(JSON.stringify(AppState.slides)),
        currentSlideIndex: AppState.currentSlideIndex
    });
    
    // 현재 슬라이드 복제
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    const duplicatedSlide = JSON.parse(JSON.stringify(currentSlide));
    const oldId = duplicatedSlide.id;
    duplicatedSlide.id = Date.now();
    
    // 요소 ID 재생성
    duplicatedSlide.elements.forEach(element => {
        element.id = Date.now() + Math.floor(Math.random() * 1000);
    });
    
    // 슬라이드 추가
    AppState.slides.splice(AppState.currentSlideIndex + 1, 0, duplicatedSlide);
    AppState.currentSlideIndex += 1;
    
    // 노트 복제
    if (AppState.notes[oldId]) {
        AppState.notes[duplicatedSlide.id] = AppState.notes[oldId];
    }
    
    // UI 업데이트
    updateUIAfterChange();
    
    return duplicatedSlide;
}

export function deleteCurrentSlide() {
    if (AppState.slides.length <= 1) {
        alert('프레젠테이션에는 최소 한 개의 슬라이드가 필요합니다.');
        return false;
    }
    
    // 현재 슬라이드 ID 저장
    const currentSlideId = AppState.slides[AppState.currentSlideIndex].id;
    
    // 히스토리 저장
    addToHistory({
        action: 'delete_slide',
        slides: JSON.parse(JSON.stringify(AppState.slides)),
        currentSlideIndex: AppState.currentSlideIndex,
        notesId: currentSlideId,
        notes: AppState.notes[currentSlideId] || ''
    });
    
    // 슬라이드 삭제
    AppState.slides.splice(AppState.currentSlideIndex, 1);
    
    // 노트 삭제
    if (AppState.notes[currentSlideId]) {
        delete AppState.notes[currentSlideId];
    }
    
    // 인덱스 조정
    if (AppState.currentSlideIndex >= AppState.slides.length) {
        AppState.currentSlideIndex = AppState.slides.length - 1;
    }
    
    // UI 업데이트
    updateUIAfterChange();
    
    return true;
}

export function changeSlideBackground(color) {
    if (AppState.slides.length === 0) return false;
    
    // 히스토리 저장
    addToHistory({
        action: 'change_background',
        slideIndex: AppState.currentSlideIndex,
        previousBackground: AppState.slides[AppState.currentSlideIndex].background
    });
    
    // 배경색 변경
    AppState.slides[AppState.currentSlideIndex].background = color;
    
    // UI 업데이트
    updateUIAfterChange();
    
    return true;
}

// 요소 관리 함수
export function addElement(element) {
    if (AppState.slides.length === 0) return null;
    
    // 히스토리 저장
    addToHistory({
        action: 'add_element',
        slideIndex: AppState.currentSlideIndex,
        elements: JSON.parse(JSON.stringify(AppState.slides[AppState.currentSlideIndex].elements))
    });
    
    // 요소 추가
    AppState.slides[AppState.currentSlideIndex].elements.push(element);
    
    // UI 업데이트
    updateUIAfterChange();
    
    return element;
}

export function updateElement(elementId, properties) {
    if (AppState.slides.length === 0) return false;
    
    // 현재 슬라이드에서 요소 찾기
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    const elementIndex = currentSlide.elements.findIndex(el => el.id === elementId);
    
    if (elementIndex === -1) return false;
    
    // 히스토리 저장
    addToHistory({
        action: 'update_element',
        slideIndex: AppState.currentSlideIndex,
        elementIndex,
        previousElement: JSON.parse(JSON.stringify(currentSlide.elements[elementIndex]))
    });
    
    // 요소 업데이트
    Object.assign(currentSlide.elements[elementIndex], properties);
    
    // UI 업데이트
    updateUIAfterChange();
    
    return true;
}

export function deleteSelectedElement() {
    if (!AppState.selectedElement) return false;
    
    // 현재 슬라이드와 선택된 요소 ID
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    const elementId = AppState.selectedElement.elementId;
    const elementIndex = currentSlide.elements.findIndex(el => el.id === elementId);
    
    if (elementIndex === -1) return false;
    
    // 히스토리 저장
    addToHistory({
        action: 'delete_element',
        slideIndex: AppState.currentSlideIndex,
        elementIndex,
        deletedElement: JSON.parse(JSON.stringify(currentSlide.elements[elementIndex]))
    });
    
    // 요소 삭제
    currentSlide.elements.splice(elementIndex, 1);
    
    // 선택 해제
    AppState.selectedElement = null;
    
    // UI 업데이트
    updateUIAfterChange();
    
    return true;
}

// 실행취소/다시실행 함수
export function undo() {
    if (AppState.historyIndex <= 0) return false;
    
    // 현재 상태를 복원하기 위한 히스토리 변경
    AppState.historyIndex--;
    const historyItem = AppState.history[AppState.historyIndex];
    
    // 이전 상태 복원
    applyHistoryItem(historyItem);
    
    // UI 업데이트
    updateUIAfterChange();
    
    return true;
}

export function redo() {
    if (AppState.historyIndex >= AppState.history.length - 1) return false;
    
    // 다음 상태로 히스토리 변경
    AppState.historyIndex++;
    const historyItem = AppState.history[AppState.historyIndex];
    
    // 다음 상태 복원
    applyHistoryItem(historyItem);
    
    // UI 업데이트
    updateUIAfterChange();
    
    return true;
}

// 히스토리 항목 적용
function applyHistoryItem(historyItem) {
    switch (historyItem.action) {
        case 'add_slide':
            AppState.slides = JSON.parse(JSON.stringify(historyItem.slides));
            AppState.currentSlideIndex = historyItem.currentSlideIndex;
            break;
            
        case 'duplicate_slide':
            AppState.slides = JSON.parse(JSON.stringify(historyItem.slides));
            AppState.currentSlideIndex = historyItem.currentSlideIndex;
            break;
            
        case 'delete_slide':
            AppState.slides = JSON.parse(JSON.stringify(historyItem.slides));
            AppState.currentSlideIndex = historyItem.currentSlideIndex;
            break;
            
        case 'change_background':
            AppState.slides[historyItem.slideIndex].background = historyItem.previousBackground;
            break;
            
        case 'add_element':
            AppState.slides[historyItem.slideIndex].elements = JSON.parse(JSON.stringify(historyItem.elements));
            break;
            
        case 'update_element':
            AppState.slides[historyItem.slideIndex].elements[historyItem.elementIndex] = 
                JSON.parse(JSON.stringify(historyItem.previousElement));
            break;
            
        case 'delete_element':
            AppState.slides[historyItem.slideIndex].elements.splice(
                historyItem.elementIndex, 
                0, 
                JSON.parse(JSON.stringify(historyItem.deletedElement))
            );
            break;
            
        case 'update_notes':
            AppState.notes[historyItem.slideId] = historyItem.previousNote;
            break;
    }
}

// 프레젠테이션 내보내기
export function exportPresentation() {
    return new Promise((resolve, reject) => {
        try {
            // HTML2Canvas와 같은 라이브러리를 활용해 슬라이드를 이미지로 변환
            console.log('프레젠테이션 내보내기 시작');
            
            // 파일 형식에 따른 처리
            const format = AppState.exportConfig.format || 'pptx';
            
            setTimeout(() => {
                console.log(`${format} 형식으로 프레젠테이션 내보내기 완료`);
                resolve({
                    success: true,
                    format: format,
                    slideCount: AppState.slides.length
                });
            }, 1500);
        } catch (error) {
            console.error('내보내기 오류:', error);
            reject(error);
        }
    });
}

// 프레젠테이션 저장
export function savePresentation() {
    return new Promise((resolve, reject) => {
        try {
            const presentationData = {
                slides: AppState.slides,
                theme: AppState.currentTheme,
                colorPalette: AppState.currentColorPalette,
                notes: AppState.notes
            };
            
            // localStorage에 임시 저장
            localStorage.setItem('presentation_data', JSON.stringify(presentationData));
            
            // API 요청 시뮬레이션
            setTimeout(() => {
                console.log('프레젠테이션 저장 완료');
                resolve({
                    success: true,
                    timestamp: new Date().toISOString()
                });
            }, 800);
        } catch (error) {
            console.error('저장 오류:', error);
            reject(error);
        }
    });
}

// 프레젠테이션 로드
export function loadPresentation() {
    return new Promise((resolve, reject) => {
        try {
            // localStorage에서 데이터 로드
            const savedData = localStorage.getItem('presentation_data');
            
            if (savedData) {
                const presentationData = JSON.parse(savedData);
                
                // 데이터 적용
                AppState.slides = presentationData.slides;
                AppState.currentTheme = presentationData.theme;
                AppState.currentColorPalette = presentationData.colorPalette;
                AppState.currentSlideIndex = 0;
                
                // 노트 로드
                if (presentationData.notes) {
                    AppState.notes = presentationData.notes;
                }
                
                // 히스토리 초기화
                AppState.history = [];
                AppState.historyIndex = -1;
                
                // UI 업데이트
                updateUIAfterChange();
                
                resolve({
                    success: true,
                    slideCount: AppState.slides.length
                });
            } else {
                // 기본 프레젠테이션 생성
                AppState.slides = [];
                addNewSlide();
                
                resolve({
                    success: true,
                    isNew: true
                });
            }
        } catch (error) {
            console.error('로딩 오류:', error);
            reject(error);
        }
    });
}

// UI 업데이트 함수
function updateUIAfterChange() {
    // UI 업데이트 이벤트 발생
    document.dispatchEvent(new CustomEvent('slides-updated'));
}

// 초기화 함수
export function initApp() {
    console.log('프레젠테이션 에디터 초기화');
    
    // 기본 슬라이드 생성
    if (AppState.slides.length === 0) {
        addNewSlide();
    }
    
    // 이벤트 리스너 등록
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // 'DOMContentLoaded' 이벤트가 이미 발생했는지 확인
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
    } else {
        onDOMContentLoaded();
    }
}

// DOM 로드 완료 후 실행
function onDOMContentLoaded() {
    console.log('DOM 로드 완료');
    
    // UI 모듈 초기화 (ui.js의 initUI 함수 호출)
    if (typeof initUI === 'function') {
        initUI();
    }
    
    // 슬라이드 모듈 초기화
    if (typeof initSlides === 'function') {
        initSlides();
    }
    
    // DeepSeek AI 모듈 초기화
    import('./main.js')
        .then(module => {
            if (typeof module.initDeepSeekAI === 'function') {
                module.initDeepSeekAI();
                console.log('DeepSeek AI 모듈 초기화 완료');
            }
        })
        .catch(error => {
            console.error('DeepSeek AI 모듈 로드 실패:', error);
        });
}

// 키보드 단축키 처리
function handleKeyboardShortcuts(event) {
    // Ctrl+S: 저장
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        savePresentation()
            .then(() => console.log('저장 완료'))
            .catch(error => console.error('저장 실패:', error));
    }
    
    // Ctrl+Z: 실행 취소
    if (event.ctrlKey && event.key === 'z') {
        event.preventDefault();
        undo();
    }
    
    // Ctrl+Y: 다시 실행
    if (event.ctrlKey && event.key === 'y') {
        event.preventDefault();
        redo();
    }
    
    // Delete: 선택된 요소 삭제
    if (event.key === 'Delete' && AppState.selectedElement) {
        event.preventDefault();
        deleteSelectedElement();
    }
}

// 발표자 노트 관련 함수
export function updateNotes(slideId, noteContent) {
    if (!slideId) return false;
    
    // 히스토리 저장
    const previousNote = AppState.notes[slideId] || '';
    addToHistory({
        action: 'update_notes',
        slideId,
        previousNote
    });
    
    // 노트 업데이트
    AppState.notes[slideId] = noteContent;
    
    // UI 업데이트
    updateUIAfterChange();
    
    return true;
}

export function getNotes(slideId) {
    if (!slideId) return '';
    return AppState.notes[slideId] || '';
}

// Add CSS styles for AI analysis
function addAIStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* AI Analysis Loading Spinner */
        .deep-seek-spinner {
            width: 40px;
            height: 40px;
            margin: 20px auto;
            border: 4px solid rgba(16, 110, 190, 0.2);
            border-radius: 50%;
            border-top-color: #106ebe;
            animation: spinner-rotate 1s linear infinite;
        }
        
        @keyframes spinner-rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .analysis-loading {
            text-align: center;
            padding: 30px;
        }
        
        .analysis-loading p {
            margin-top: 15px;
            color: #666;
        }
        
        /* Analysis Error */
        .analysis-error {
            padding: 20px;
            text-align: center;
            color: #d83b01;
        }
        
        .analysis-error i {
            font-size: 32px;
            margin-bottom: 10px;
        }
        
        /* Analysis Header */
        .analysis-header {
            margin-bottom: 20px;
            border-bottom: 1px solid #eaeaea;
            padding-bottom: 15px;
        }
        
        .analysis-type {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .analysis-type i {
            font-size: 24px;
            margin-right: 10px;
            color: #106ebe;
        }
        
        .analysis-type h3 {
            margin: 0;
            font-size: 20px;
        }
        
        /* Analysis Metrics Grid */
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .metric-item {
            display: flex;
            padding: 12px;
            background-color: #f9f9f9;
            border-radius: 4px;
        }
        
        .metric-icon {
            width: 40px;
            height: 40px;
            background-color: #106ebe;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
        }
        
        .metric-icon i {
            color: white;
            font-size: 16px;
        }
        
        .metric-title {
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
        }
        
        .metric-value {
            font-size: 16px;
            font-weight: bold;
        }
        
        .metric-value.good {
            color: #107c10;
        }
        
        .metric-value.warning {
            color: #ff8c00;
        }
        
        .metric-value.bad {
            color: #d83b01;
        }
        
        /* Analysis Sections */
        .analysis-section {
            margin-bottom: 20px;
        }
        
        .analysis-section h4 {
            margin-top: 0;
            margin-bottom: 10px;
            font-size: 16px;
            color: #323130;
        }
        
        .analysis-item {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 10px;
        }
        
        .item-header {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .item-header i {
            margin-right: 8px;
            color: #106ebe;
        }
        
        .item-header strong {
            margin-right: 5px;
        }
        
        .item-header span.good {
            color: #107c10;
        }
        
        .item-header span.warning {
            color: #ff8c00;
        }
        
        .item-header span.bad {
            color: #d83b01;
        }
        
        /* Analysis Actions */
        .analysis-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 20px;
        }
        
        /* AI Recommendations */
        .ai-recommendations {
            display: grid;
            gap: 15px;
        }
        
        .recommendation-item {
            display: flex;
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 4px;
            border-left: 3px solid #106ebe;
        }
        
        .recommendation-item i {
            font-size: 24px;
            margin-right: 15px;
            color: #106ebe;
            flex-shrink: 0;
            padding-top: 2px;
        }
        
        .recommendation-content {
            flex-grow: 1;
        }
        
        .recommendation-content strong {
            display: block;
            margin-bottom: 5px;
            font-size: 16px;
        }
        
        .recommendation-content p {
            margin-top: 0;
            margin-bottom: 12px;
            color: #605e5c;
        }
        
        .apply-recommendation, .suggestion-action {
            background-color: #106ebe;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 2px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .apply-recommendation:hover, .suggestion-action:hover {
            background-color: #0078d4;
        }
        
        .apply-recommendation.applied, .suggestion-action.applied {
            background-color: #107c10;
            cursor: default;
        }
        
        .recommendation-item.applied {
            border-left-color: #107c10;
        }
        
        /* Image Suggestions */
        .image-suggestions {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .image-suggestion-item {
            background-color: #f9f9f9;
            border-radius: 4px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        
        .image-suggestion-item img {
            width: 100%;
            height: 150px;
            object-fit: cover;
        }
        
        .image-caption {
            padding: 10px;
            font-size: 14px;
            color: #323130;
            font-weight: 500;
        }
        
        .add-image-btn {
            margin: 0 10px 10px;
            background-color: #106ebe;
            color: white;
            border: none;
            padding: 8px;
            border-radius: 2px;
            cursor: pointer;
        }
        
        .add-image-btn:hover {
            background-color: #0078d4;
        }
        
        /* AI Panel Section */
        .ai-analysis-section {
            background-color: #f0f8ff;
            border-top: 1px solid #deecf9;
            margin-top: 10px;
            padding-top: 5px;
        }
        
        .ai-analysis-section h4 {
            color: #106ebe;
        }
    `;
    
    document.head.appendChild(styleElement);
}

// Call the function during initialization
document.addEventListener('DOMContentLoaded', addAIStyles);

// 앱 시작
initApp(); 