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

// 앱 시작
initApp(); 