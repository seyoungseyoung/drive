/**
 * UI module - Main coordinator for all UI components
 * This module imports and initializes all UI sub-modules
 */

// Import all UI-related modules
import { initCoreUI, showPowerPointUI, updateUIState, startSlideshow } from './ui-core.js';
import { initLayout } from './ui-layout.js';
import { initModals, openShapeModal, openImageModal, openChartModal, openExportModal, showModal } from './ui-modals.js';
import { initShortcuts } from './ui-shortcuts.js';
import { initAnalyzer, showPresentationAnalyzer } from './ui-analyzer.js';
import { initPresenter, updatePresenterView, initPresenterMode } from './ui-presenter.js';
import { initElementHandlers } from './elements.js';
import { AppState } from '../index.js';

// Initialize UI components
export async function initUI() {
    console.log('UI 초기화 시작');
    
    // 리본 메뉴 초기화
    initRibbonMenu();
    
    // 슬라이드 패널 초기화
    initSlidesPanel();
    
    // 편집기 패널 초기화
    initEditorPanel();
    
    // AI 패널 초기화
    initAIPanel();
    
    // 이벤트 리스너 등록
    registerEventListeners();
    
    console.log('UI 초기화 완료');
}

// 리본 메뉴 초기화
function initRibbonMenu() {
    const ribbonTabs = document.querySelectorAll('.ribbon-tab');
    const ribbonContents = document.querySelectorAll('.ribbon-content');
    
    ribbonTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 모든 탭 비활성화
            ribbonTabs.forEach(t => t.classList.remove('active'));
            ribbonContents.forEach(c => c.classList.remove('active'));
            
            // 클릭한 탭 활성화
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            const content = document.getElementById(`${tabId}-ribbon`);
            if (content) {
                content.classList.add('active');
            }
        });
    });
}

// 슬라이드 패널 초기화
function initSlidesPanel() {
    const addSlideBtn = document.getElementById('addSlideBtn');
    const deleteSlideBtn = document.getElementById('deleteSlideBtn');
    
    if (addSlideBtn) {
        addSlideBtn.addEventListener('click', () => {
            const newSlide = {
                id: Date.now(),
                elements: [],
                notes: '',
                background: '#ffffff'
            };
            
            AppState.slides.push(newSlide);
            AppState.currentSlideIndex = AppState.slides.length - 1;
            updateSlideList();
        });
    }
    
    if (deleteSlideBtn) {
        deleteSlideBtn.addEventListener('click', () => {
            if (AppState.slides.length <= 1) {
                alert('마지막 슬라이드는 삭제할 수 없습니다.');
                return;
            }
            
            AppState.slides.splice(AppState.currentSlideIndex, 1);
            AppState.currentSlideIndex = Math.min(AppState.currentSlideIndex, AppState.slides.length - 1);
            updateSlideList();
        });
    }
}

// 편집기 패널 초기화
function initEditorPanel() {
    const editorPanel = document.querySelector('.editor-panel');
    if (!editorPanel) return;
    
    // 편집기 도구모음 초기화
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    const layoutSelect = document.getElementById('slideLayoutSelect');
    
    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            // Undo 로직 구현
        });
    }
    
    if (redoBtn) {
        redoBtn.addEventListener('click', () => {
            // Redo 로직 구현
        });
    }
    
    if (layoutSelect) {
        layoutSelect.addEventListener('change', (e) => {
            const layout = e.target.value;
            applySlideLayout(layout);
        });
    }
}

// AI 패널 초기화
function initAIPanel() {
    const aiPanel = document.querySelector('.deep-seek-panel');
    const toggleBtn = document.getElementById('toggleDeepSeekPanelBtn');
    
    if (aiPanel && toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            aiPanel.classList.toggle('collapsed');
            toggleBtn.querySelector('i').classList.toggle('fa-chevron-up');
            toggleBtn.querySelector('i').classList.toggle('fa-chevron-down');
        });
    }
}

// 이벤트 리스너 등록
function registerEventListeners() {
    console.log('UI 이벤트 리스너 등록 중...');
    
    // 슬라이드 관련 버튼
    registerSlideControls();
    
    // 편집 도구 관련 버튼
    registerEditorControls();

    // 전체 리본 메뉴 버튼들
    registerRibbonButtons();
    
    // 창 크기 변경 이벤트
    window.addEventListener('resize', () => {
        updateLayout();
    });
    
    // 키보드 단축키
    document.addEventListener('keydown', (e) => {
        // Ctrl + S: 저장
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            savePresentation();
        }
        
        // Ctrl + Z: 실행 취소
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            // Undo 로직
        }
        
        // Ctrl + Y: 다시 실행
        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            // Redo 로직
        }
    });
    
    console.log('UI 이벤트 리스너 등록 완료');
}

// 슬라이드 컨트롤 버튼 이벤트 등록
function registerSlideControls() {
    // 슬라이드 추가 버튼
    const addSlideBtn = document.getElementById('addSlideBtn');
    if (addSlideBtn) {
        addSlideBtn.addEventListener('click', () => {
            console.log('슬라이드 추가 버튼 클릭');
            const newSlide = {
                id: Date.now(),
                elements: [],
                notes: '',
                background: '#ffffff'
            };
            
            AppState.slides.push(newSlide);
            AppState.currentSlideIndex = AppState.slides.length - 1;
            updateSlideList();
        });
    } else {
        console.warn('addSlideBtn 요소를 찾을 수 없습니다');
    }
    
    // 슬라이드 삭제 버튼
    const deleteSlideBtn = document.getElementById('deleteSlideBtn');
    const deleteSlideBtn2 = document.getElementById('deleteSlideBtn2');
    
    const deleteSlideHandler = () => {
        console.log('슬라이드 삭제 버튼 클릭');
        if (AppState.slides.length <= 1) {
            alert('마지막 슬라이드는 삭제할 수 없습니다.');
            return;
        }
        
        AppState.slides.splice(AppState.currentSlideIndex, 1);
        AppState.currentSlideIndex = Math.min(AppState.currentSlideIndex, AppState.slides.length - 1);
        updateSlideList();
        renderCurrentSlide();
    };
    
    if (deleteSlideBtn) {
        deleteSlideBtn.addEventListener('click', deleteSlideHandler);
    } else {
        console.warn('deleteSlideBtn 요소를 찾을 수 없습니다');
    }
    
    if (deleteSlideBtn2) {
        deleteSlideBtn2.addEventListener('click', deleteSlideHandler);
    } else {
        console.warn('deleteSlideBtn2 요소를 찾을 수 없습니다');
    }
    
    // 슬라이드 복제 버튼
    const duplicateSlideBtn = document.getElementById('duplicateSlideBtn');
    const duplicateSlideBtn2 = document.getElementById('duplicateSlideBtn2');
    
    const duplicateSlideHandler = () => {
        console.log('슬라이드 복제 버튼 클릭');
        if (AppState.slides.length === 0) return;
        
        const currentSlide = AppState.slides[AppState.currentSlideIndex];
        const duplicatedSlide = JSON.parse(JSON.stringify(currentSlide));
        duplicatedSlide.id = Date.now();
        
        AppState.slides.splice(AppState.currentSlideIndex + 1, 0, duplicatedSlide);
        AppState.currentSlideIndex++;
        updateSlideList();
        renderCurrentSlide();
    };
    
    if (duplicateSlideBtn) {
        duplicateSlideBtn.addEventListener('click', duplicateSlideHandler);
    } else {
        console.warn('duplicateSlideBtn 요소를 찾을 수 없습니다');
    }
    
    if (duplicateSlideBtn2) {
        duplicateSlideBtn2.addEventListener('click', duplicateSlideHandler);
    } else {
        console.warn('duplicateSlideBtn2 요소를 찾을 수 없습니다');
    }
}

// 편집기 컨트롤 버튼 이벤트 등록
function registerEditorControls() {
    // 실행 취소 버튼
    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            console.log('실행 취소 버튼 클릭');
            // Undo 로직
        });
    } else {
        console.warn('undoBtn 요소를 찾을 수 없습니다');
    }
    
    // 다시 실행 버튼
    const redoBtn = document.getElementById('redoBtn');
    if (redoBtn) {
        redoBtn.addEventListener('click', () => {
            console.log('다시 실행 버튼 클릭');
            // Redo 로직
        });
    } else {
        console.warn('redoBtn 요소를 찾을 수 없습니다');
    }
    
    // 슬라이드 레이아웃 선택기
    const slideLayoutSelect = document.getElementById('slideLayoutSelect');
    if (slideLayoutSelect) {
        slideLayoutSelect.addEventListener('change', (e) => {
            console.log('슬라이드 레이아웃 변경:', e.target.value);
            applySlideLayout(e.target.value);
        });
    } else {
        console.warn('slideLayoutSelect 요소를 찾을 수 없습니다');
    }
    
    // 발표자 노트 패널 토글 버튼
    const toggleNotesBtn = document.getElementById('toggleNotesBtn');
    if (toggleNotesBtn) {
        toggleNotesBtn.addEventListener('click', () => {
            console.log('발표자 노트 패널 토글 버튼 클릭');
            const notesPanel = document.querySelector('.presenter-notes-panel');
            const notesContent = document.querySelector('.presenter-notes-content');
            
            if (notesContent.style.display === 'none') {
                notesContent.style.display = 'block';
                toggleNotesBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
            } else {
                notesContent.style.display = 'none';
                toggleNotesBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
            }
        });
    } else {
        console.warn('toggleNotesBtn 요소를 찾을 수 없습니다');
    }
}

// 리본 메뉴 버튼 이벤트 등록
function registerRibbonButtons() {
    // 파일 메뉴 버튼들
    const newPresentationBtn = document.getElementById('newPresentationBtn');
    const openPresentationBtn = document.getElementById('openPresentationBtn');
    const savePresentationBtn = document.getElementById('savePresentationBtn');
    const exportPptxBtn = document.getElementById('exportPptxBtn');
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const printBtn = document.getElementById('printBtn');
    const shareBtn = document.getElementById('shareBtn');
    
    if (newPresentationBtn) {
        newPresentationBtn.addEventListener('click', () => {
            console.log('새 프레젠테이션 버튼 클릭');
            if (confirm('새 프레젠테이션을 시작하시겠습니까? 저장되지 않은 변경사항은 손실됩니다.')) {
                // 새 프레젠테이션 생성
                AppState.slides = [];
                const newSlide = {
                    id: Date.now(),
                    elements: [],
                    notes: '',
                    background: '#ffffff'
                };
                AppState.slides.push(newSlide);
                AppState.currentSlideIndex = 0;
                updateSlideList();
                renderCurrentSlide();
            }
        });
    }
    
    if (savePresentationBtn) {
        savePresentationBtn.addEventListener('click', () => {
            console.log('저장 버튼 클릭');
            savePresentation();
        });
    }
    
    // 추가 버튼들...
}

// 슬라이드 목록 업데이트
function updateSlideList() {
    const slideList = document.getElementById('slideList');
    if (!slideList) return;
    
    slideList.innerHTML = '';
    AppState.slides.forEach((slide, index) => {
        const slideItem = document.createElement('div');
        slideItem.className = `slide-item ${index === AppState.currentSlideIndex ? 'active' : ''}`;
        slideItem.innerHTML = `슬라이드 ${index + 1}`;
        slideItem.addEventListener('click', () => {
            AppState.currentSlideIndex = index;
            updateSlideList();
            renderCurrentSlide();
        });
        slideList.appendChild(slideItem);
    });
}

// 현재 슬라이드 렌더링
function renderCurrentSlide() {
    const currentSlide = document.getElementById('currentSlide');
    if (!currentSlide) return;
    
    const slide = AppState.slides[AppState.currentSlideIndex];
    currentSlide.innerHTML = '';
    
    if (slide.elements.length === 0) {
        currentSlide.innerHTML = '<div class="empty-slide">슬라이드를 편집하려면 클릭하세요</div>';
    } else {
        slide.elements.forEach(element => {
            // 요소 렌더링 로직
        });
    }
}

// 레이아웃 업데이트
function updateLayout() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    // 반응형 레이아웃 조정
    const width = window.innerWidth;
    if (width < 768) {
        mainContent.classList.add('mobile');
    } else {
        mainContent.classList.remove('mobile');
    }
}

// 슬라이드 레이아웃 적용
function applySlideLayout(layout) {
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    if (!currentSlide) return;
    
    // 레이아웃 템플릿에 따라 요소 배치
    switch (layout) {
        case 'title':
            // 제목 슬라이드 레이아웃
            break;
        case 'title-content':
            // 제목과 내용 레이아웃
            break;
        case 'two-column':
            // 두 열 레이아웃
            break;
        case 'blank':
            // 빈 슬라이드
            break;
    }
    
    renderCurrentSlide();
}

// 프레젠테이션 저장
function savePresentation() {
    try {
        localStorage.setItem('presentation', JSON.stringify(AppState.slides));
        AppState.isDirty = false;
        alert('프레젠테이션이 저장되었습니다.');
    } catch (error) {
        console.error('저장 오류:', error);
        alert('저장 중 오류가 발생했습니다.');
    }
}

// Export methods from sub-modules for convenience
export { 
    showPowerPointUI, 
    updateUIState,
    startSlideshow
} from './ui-core.js';

export {
    openShapeModal,
    openImageModal,
    openChartModal,
    openExportModal,
    showModal
} from './ui-modals.js';

export {
    showPresentationAnalyzer
} from './ui-analyzer.js';

export {
    updatePresenterView,
    initPresenterMode,
    togglePresenterTimer,
    resetPresenterTimer
} from './ui-presenter.js';