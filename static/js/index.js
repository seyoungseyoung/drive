/**
 * 프레젠테이션 에디터 메인 진입점
 * 모든 모듈을 로드하고 초기화합니다.
 */

// 모듈 임포트
import { initUI } from './modules/ui.js';
import { initElements } from './modules/elements.js';
import { initCharts } from './modules/charts.js';
import { initShapeEditor } from './modules/shape-editor.js';
import { initSlides } from './modules/slides.js';
import { initThemes } from './modules/themes.js';

// 전역 상태 관리
export const AppState = {
    // 기본 상태
    currentSlideIndex: 0,
    slides: [],
    slideHistory: {
        undo: [],
        redo: []
    },
    
    // 선택 관련 상태
    selectedElement: null,
    
    // 테마 관련 상태
    currentTheme: 'modern',
    currentColorPalette: 'blue',
    currentFontFamily: 'Pretendard',
    
    // AI 확장 관련 상태
    extensions: {
        aiEnabled: false,
        aiSuggestions: [],
        versionHistory: []
    },
    
    // 내보내기 설정
    exportConfig: {
        format: 'pptx',
        quality: 'high'
    }
};

// 도형 타입 정의
export const ShapeTypes = {
    RECTANGLE: 'rectangle',
    CIRCLE: 'circle',
    TRIANGLE: 'triangle',
    LINE: 'line',
    ARROW: 'arrow',
    PENTAGON: 'pentagon',
    HEXAGON: 'hexagon',
    STAR: 'star',
    TEXT: 'text'
};

// 차트 타입 정의
export const ChartTypes = {
    BAR: 'bar',
    LINE: 'line',
    PIE: 'pie',
    AREA: 'area',
    SCATTER: 'scatter',
    RADAR: 'radar'
};

// 애니메이션 타입 정의
export const AnimationTypes = {
    NONE: 'none',
    FADE: 'fade',
    SLIDE_UP: 'slideUp',
    SLIDE_DOWN: 'slideDown',
    SLIDE_LEFT: 'slideLeft',
    SLIDE_RIGHT: 'slideRight',
    ZOOM_IN: 'zoomIn',
    ZOOM_OUT: 'zoomOut',
    ROTATE: 'rotate'
};

// 앱 초기화
export function initApp() {
    console.log('PowerPoint 스타일 에디터 초기화');
    
    // UI 모듈 초기화
    initUI();
    
    // 슬라이드 관리 모듈 초기화
    initSlides();
    
    // 도형 관리 모듈 초기화
    initElements();
    
    // 도형 편집 모듈 초기화
    initShapeEditor();
    
    // 차트 모듈 초기화
    initCharts();
    
    // 테마 모듈 초기화
    initThemes();
    
    // 이벤트 리스너 설정
    setupGlobalEventListeners();
    
    // 단축키 설정
    setupKeyboardShortcuts();
    
    // 최초 슬라이드 로드
    loadInitialSlides();
    
    console.log('앱 초기화 완료');
}

// 전역 이벤트 리스너 설정
function setupGlobalEventListeners() {
    // 요소 선택 이벤트
    document.addEventListener('element-selected', (e) => {
        console.log('요소 선택됨:', e.detail);
        AppState.selectedElement = e.detail;
    });
    
    // 요소 선택 해제 이벤트
    document.addEventListener('element-deselected', () => {
        console.log('요소 선택 해제됨');
        AppState.selectedElement = null;
    });
    
    // 슬라이드 전환 이벤트
    document.addEventListener('slide-changed', (e) => {
        console.log('슬라이드 전환:', e.detail.index);
        AppState.currentSlideIndex = e.detail.index;
    });
    
    // 슬라이드 업데이트 이벤트
    document.addEventListener('slides-updated', (e) => {
        console.log('슬라이드 업데이트됨');
        saveState();
    });
    
    // 도형 업데이트 이벤트
    document.addEventListener('element-updated', (e) => {
        console.log('요소 업데이트됨:', e.detail);
        saveState();
    });
    
    // 내보내기 버튼 이벤트
    document.getElementById('exportBtn')?.addEventListener('click', exportPresentation);
}

// 단축키 설정
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl + S: 저장
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            savePresentation();
        }
        
        // Ctrl + Z: 실행 취소
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            undo();
        }
        
        // Ctrl + Y: 다시 실행
        if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
            e.preventDefault();
            redo();
        }
        
        // Ctrl + N: 새 슬라이드
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            addNewSlide();
        }
        
        // Ctrl + D: 슬라이드 복제
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            duplicateCurrentSlide();
        }
        
        // Delete: 선택된 요소 삭제
        if (e.key === 'Delete' && AppState.selectedElement) {
            e.preventDefault();
            deleteSelectedElement();
        }
        
        // Page Up/Down: 이전/다음 슬라이드
        if (e.key === 'PageUp') {
            e.preventDefault();
            goToPreviousSlide();
        }
        
        if (e.key === 'PageDown') {
            e.preventDefault();
            goToNextSlide();
        }
    });
}

// 초기 슬라이드 로드
function loadInitialSlides() {
    console.log('초기 슬라이드 로드');
    
    // 서버에서 슬라이드 데이터 요청
    fetch('/get_slides')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                AppState.slides = data.slides || [];
                AppState.currentTheme = data.theme || 'modern';
                AppState.currentColorPalette = data.color_palette || 'blue';
                AppState.currentFontFamily = data.font_family || 'Pretendard';
                AppState.extensions = data.extensions || { aiEnabled: false };
                
                // 슬라이드가 없으면 기본 슬라이드 추가
                if (AppState.slides.length === 0) {
                    addNewSlide();
                } else {
                    // 슬라이드 목록 및 편집 화면 업데이트
                    updateUI();
                }
                
                console.log('슬라이드 로드 완료:', AppState.slides.length);
            } else {
                console.error('슬라이드 로드 실패:', data.error);
                // 오류 시 기본 슬라이드 추가
                addNewSlide();
            }
        })
        .catch(error => {
            console.error('슬라이드 로드 오류:', error);
            // 오류 시 기본 슬라이드 추가
            addNewSlide();
        });
}

// 새 슬라이드 추가
export function addNewSlide() {
    console.log('새 슬라이드 추가');
    
    // 새 슬라이드 생성
    const newSlide = {
        id: Date.now(),
        elements: [],
        background: '#FFFFFF',
        theme: AppState.currentTheme,
        colorPalette: AppState.currentColorPalette,
        fontFamily: AppState.currentFontFamily,
        transition: 'none',
        animation: 'none'
    };
    
    // 상태 업데이트
    AppState.slides.push(newSlide);
    AppState.currentSlideIndex = AppState.slides.length - 1;
    
    // UI 업데이트
    updateUI();
    
    // 슬라이드 저장
    saveState();
}

// 현재 슬라이드 복제
export function duplicateCurrentSlide() {
    if (AppState.slides.length === 0) {
        addNewSlide();
        return;
    }
    
    console.log('현재 슬라이드 복제');
    
    // 현재 슬라이드 복제
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    const duplicateSlide = JSON.parse(JSON.stringify(currentSlide));
    duplicateSlide.id = Date.now();
    
    // 상태 업데이트
    AppState.slides.splice(AppState.currentSlideIndex + 1, 0, duplicateSlide);
    AppState.currentSlideIndex += 1;
    
    // UI 업데이트
    updateUI();
    
    // 슬라이드 저장
    saveState();
}

// 선택된 요소 삭제
export function deleteSelectedElement() {
    if (!AppState.selectedElement) return;
    
    console.log('선택된 요소 삭제');
    
    // 현재 슬라이드에서 선택된 요소 삭제
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    currentSlide.elements = currentSlide.elements.filter(element => 
        element.id !== AppState.selectedElement.elementId
    );
    
    // 선택 상태 초기화
    AppState.selectedElement = null;
    
    // 이벤트 발생
    document.dispatchEvent(new CustomEvent('element-deselected'));
    
    // UI 업데이트
    updateUI();
    
    // 슬라이드 저장
    saveState();
}

// UI 업데이트
function updateUI() {
    console.log('UI 업데이트');
    
    // 슬라이드 목록 업데이트
    updateSlideList();
    
    // 현재 슬라이드 편집 화면 업데이트
    updateCurrentSlide();
    
    // 테마 및 디자인 설정 업데이트
    updateDesignSettings();
}

// 슬라이드 목록 업데이트
function updateSlideList() {
    const slideList = document.getElementById('slideList');
    if (!slideList) return;
    
    slideList.innerHTML = '';
    
    AppState.slides.forEach((slide, index) => {
        const slideThumb = document.createElement('div');
        slideThumb.className = 'slide-thumbnail';
        slideThumb.dataset.index = index;
        
        if (index === AppState.currentSlideIndex) {
            slideThumb.classList.add('active');
        }
        
        slideThumb.innerHTML = `
            <div class="slide-number">${index + 1}</div>
            <div class="slide-preview" style="background-color: ${slide.background || '#FFFFFF'}"></div>
        `;
        
        slideThumb.addEventListener('click', () => {
            AppState.currentSlideIndex = index;
            updateUI();
            
            // 슬라이드 전환 이벤트 발생
            document.dispatchEvent(new CustomEvent('slide-changed', {
                detail: { index }
            }));
        });
        
        slideList.appendChild(slideThumb);
    });
}

// 현재 슬라이드 편집 화면 업데이트
function updateCurrentSlide() {
    const slideCanvas = document.getElementById('currentSlide');
    if (!slideCanvas) return;
    
    // 슬라이드가 없으면 반환
    if (AppState.slides.length === 0) return;
    
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    slideCanvas.innerHTML = '';
    
    // 배경색 설정
    slideCanvas.style.backgroundColor = currentSlide.background || '#FFFFFF';
    
    // 요소 렌더링
    currentSlide.elements.forEach(element => {
        renderElement(element, slideCanvas);
    });
}

// 요소 렌더링
function renderElement(element, container) {
    const elementEl = document.createElement('div');
    elementEl.className = `slide-element ${element.type}`;
    elementEl.id = `element-${element.id}`;
    elementEl.dataset.type = element.type;
    elementEl.dataset.id = element.id;
    
    // 공통 스타일
    elementEl.style.position = 'absolute';
    elementEl.style.left = `${element.x || 0}px`;
    elementEl.style.top = `${element.y || 0}px`;
    elementEl.style.width = `${element.width || 100}px`;
    elementEl.style.height = `${element.height || 100}px`;
    elementEl.style.opacity = element.opacity || 1;
    
    if (element.transform) {
        elementEl.style.transform = element.transform;
    }
    
    // 타입별 렌더링
    switch (element.type) {
        case 'text':
            renderTextElement(element, elementEl);
            break;
        case 'shape':
            renderShapeElement(element, elementEl);
            break;
        case 'image':
            renderImageElement(element, elementEl);
            break;
        case 'chart':
            renderChartElement(element, elementEl);
            break;
    }
    
    // 이벤트 리스너
    elementEl.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // 요소 선택 이벤트 발생
        document.dispatchEvent(new CustomEvent('element-selected', {
            detail: {
                elementId: element.id,
                elementType: element.type,
                element: elementEl
            }
        }));
    });
    
    container.appendChild(elementEl);
}

// 텍스트 요소 렌더링
function renderTextElement(element, container) {
    container.style.backgroundColor = element.backgroundColor || 'transparent';
    container.style.color = element.color || '#000000';
    container.style.fontSize = `${element.fontSize || 16}px`;
    container.style.fontFamily = element.fontFamily || AppState.currentFontFamily;
    container.style.textAlign = element.textAlign || 'left';
    container.style.padding = '5px';
    container.style.boxSizing = 'border-box';
    container.style.overflow = 'hidden';
    
    if (element.border) {
        container.style.border = element.border;
    }
    
    container.innerHTML = element.content || '텍스트를 입력하세요';
    container.contentEditable = true;
    
    // 편집 이벤트
    container.addEventListener('input', () => {
        // 요소 내용 업데이트
        element.content = container.innerHTML;
        
        // 요소 업데이트 이벤트 발생
        document.dispatchEvent(new CustomEvent('element-updated', {
            detail: { element }
        }));
    });
}

// 도형 요소 렌더링
function renderShapeElement(element, container) {
    container.style.backgroundColor = element.backgroundColor || '#3498db';
    
    if (element.border) {
        container.style.border = element.border;
    }
    
    // 도형 유형별 스타일
    if (element.shape) {
        container.dataset.shape = element.shape;
        
        switch (element.shape) {
            case 'circle':
                container.style.borderRadius = '50%';
                break;
            case 'triangle':
                container.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
                break;
            case 'pentagon':
                container.style.clipPath = 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)';
                break;
            case 'hexagon':
                container.style.clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
                break;
            case 'star':
                container.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
                break;
            case 'arrow':
                container.style.clipPath = 'polygon(0% 30%, 70% 30%, 70% 0%, 100% 50%, 70% 100%, 70% 70%, 0% 70%)';
                break;
            case 'line':
                container.style.height = '2px';
                break;
        }
    }
}

// 이미지 요소 렌더링
function renderImageElement(element, container) {
    container.style.overflow = 'hidden';
    container.style.backgroundImage = `url(${element.url})`;
    container.style.backgroundSize = element.backgroundSize || 'contain';
    container.style.backgroundPosition = 'center';
    container.style.backgroundRepeat = 'no-repeat';
    
    if (element.border) {
        container.style.border = element.border;
    }
}

// 차트 요소 렌더링
function renderChartElement(element, container) {
    container.style.backgroundColor = '#FFFFFF';
    container.style.overflow = 'hidden';
    
    if (element.border) {
        container.style.border = element.border;
    }
    
    // 차트 ID 설정
    const chartId = `chart-${element.id}`;
    container.dataset.chartId = chartId;
    
    // 차트 캔버스 생성
    const canvas = document.createElement('canvas');
    canvas.id = chartId;
    container.appendChild(canvas);
    
    // 차트 데이터 및 옵션이 있으면 초기화
    if (element.chartData && element.chartType) {
        // Chart.js가 로드된 후 차트 초기화
        setTimeout(() => {
            if (window.Chart) {
                new Chart(canvas, {
                    type: element.chartType,
                    data: element.chartData,
                    options: element.chartOptions || {}
                });
            }
        }, 100);
    }
}

// 디자인 설정 업데이트
function updateDesignSettings() {
    // 테마 선택
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.value = AppState.currentTheme;
    }
    
    // 색상 팔레트 선택
    const colorPaletteSelect = document.getElementById('colorPaletteSelect');
    if (colorPaletteSelect) {
        colorPaletteSelect.value = AppState.currentColorPalette;
    }
    
    // 글꼴 선택
    const fontSelect = document.getElementById('fontSelect');
    if (fontSelect) {
        fontSelect.value = AppState.currentFontFamily;
    }
}

// 상태 저장
function saveState() {
    // 실행 취소를 위한 현재 상태 저장
    AppState.slideHistory.undo.push(JSON.stringify(AppState.slides));
    AppState.slideHistory.redo = [];
    
    // 서버에 슬라이드 저장
    savePresentation();
}

// 프레젠테이션 저장
function savePresentation() {
    console.log('프레젠테이션 저장');
    
    fetch('/save_slides', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            slides: AppState.slides
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('저장 응답:', data);
    })
    .catch(error => {
        console.error('저장 오류:', error);
    });
}

// 실행 취소
export function undo() {
    if (AppState.slideHistory.undo.length === 0) return;
    
    // 현재 상태 저장 (다시 실행용)
    AppState.slideHistory.redo.push(JSON.stringify(AppState.slides));
    
    // 이전 상태 복원
    AppState.slides = JSON.parse(AppState.slideHistory.undo.pop());
    
    // UI 업데이트
    updateUI();
}

// 다시 실행
export function redo() {
    if (AppState.slideHistory.redo.length === 0) return;
    
    // 현재 상태 저장 (실행 취소용)
    AppState.slideHistory.undo.push(JSON.stringify(AppState.slides));
    
    // 다음 상태 복원
    AppState.slides = JSON.parse(AppState.slideHistory.redo.pop());
    
    // UI 업데이트
    updateUI();
}

// 이전 슬라이드로 이동
export function goToPreviousSlide() {
    if (AppState.currentSlideIndex > 0) {
        AppState.currentSlideIndex--;
        updateUI();
        
        // 슬라이드 전환 이벤트 발생
        document.dispatchEvent(new CustomEvent('slide-changed', {
            detail: { index: AppState.currentSlideIndex }
        }));
    }
}

// 다음 슬라이드로 이동
export function goToNextSlide() {
    if (AppState.currentSlideIndex < AppState.slides.length - 1) {
        AppState.currentSlideIndex++;
        updateUI();
        
        // 슬라이드 전환 이벤트 발생
        document.dispatchEvent(new CustomEvent('slide-changed', {
            detail: { index: AppState.currentSlideIndex }
        }));
    }
}

// 프레젠테이션 내보내기
export function exportPresentation() {
    console.log('프레젠테이션 내보내기');
    
    fetch('/download_ppt', {
        method: 'GET'
    })
    .then(response => response.blob())
    .then(blob => {
        // 다운로드 링크 생성
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'presentation.pptx';
        document.body.appendChild(a);
        a.click();
        
        // 정리
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    })
    .catch(error => {
        console.error('내보내기 오류:', error);
    });
}

// 모듈 초기화
document.addEventListener('DOMContentLoaded', initApp); 