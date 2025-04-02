/**
 * UI Presenter module to handle presenter mode and notes
 */

import { AppState, getNotes, updateNotes } from '../index.js';
import { openModal } from './ui-modals.js';

// Initialize presenter mode
export function initPresenter() {
    console.log('발표자 모드 초기화 중...');
    
    setupPresenterNotes();
    setupPresenterMode();
    
    console.log('발표자 모드 초기화 완료');
}

// Set up presenter notes
function setupPresenterNotes() {
    console.log('발표자 노트 설정 중...');
    
    // 노트 패널 토글 버튼 이벤트
    const toggleNotesBtn = document.getElementById('toggleNotesBtn');
    const notesPanel = document.querySelector('.presenter-notes-panel');
    
    if (toggleNotesBtn && notesPanel) {
        toggleNotesBtn.addEventListener('click', () => {
            notesPanel.classList.toggle('collapsed');
            
            // 토글 버튼 아이콘 방향 변경
            const icon = toggleNotesBtn.querySelector('i');
            if (notesPanel.classList.contains('collapsed')) {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            } else {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            }
            
            // 로컬 스토리지에 상태 저장
            localStorage.setItem('notesCollapsed', notesPanel.classList.contains('collapsed'));
        });
        
        // 로컬 스토리지에서 상태 불러오기
        const isCollapsed = localStorage.getItem('notesCollapsed') === 'true';
        if (isCollapsed) {
            notesPanel.classList.add('collapsed');
            const icon = toggleNotesBtn.querySelector('i');
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
        }
    }
    
    // 노트 입력 이벤트
    const slideNotes = document.getElementById('slideNotes');
    
    if (slideNotes) {
        // 초기 노트 로드
        updateNotesFromState();
        
        // 슬라이드 변경 시 노트 업데이트
        document.addEventListener('slides-updated', updateNotesFromState);
        
        // 입력 이벤트
        slideNotes.addEventListener('input', () => {
            if (AppState.slides.length > 0) {
                const currentSlide = AppState.slides[AppState.currentSlideIndex];
                updateNotes(currentSlide.id, slideNotes.value);
            }
        });
    }
    
    console.log('발표자 노트 설정 완료');
}

// Update notes from app state
function updateNotesFromState() {
    const slideNotes = document.getElementById('slideNotes');
    if (!slideNotes) return;
    
    if (AppState.slides.length > 0) {
        const currentSlide = AppState.slides[AppState.currentSlideIndex];
        slideNotes.value = getNotes(currentSlide.id);
    } else {
        slideNotes.value = '';
    }
}

// Set up presenter mode
function setupPresenterMode() {
    console.log('발표자 모드 설정 중...');
    
    // 발표자 모드 버튼 이벤트
    const presenterViewBtn = document.getElementById('presenterViewBtn');
    
    if (presenterViewBtn) {
        presenterViewBtn.addEventListener('click', () => {
            // 발표자 모드 모달 열기
            openModal('presenterModal');
            
            // 발표자 모드 초기화
            initPresenterMode();
        });
    }
    
    // 슬라이드 이동 버튼 이벤트
    const prevSlideBtn = document.getElementById('prevSlideBtn');
    const nextSlideBtn = document.getElementById('nextSlideBtn');
    
    if (prevSlideBtn) {
        prevSlideBtn.addEventListener('click', () => {
            if (AppState.currentSlideIndex > 0) {
                AppState.currentSlideIndex--;
                updatePresenterView();
            }
        });
    }
    
    if (nextSlideBtn) {
        nextSlideBtn.addEventListener('click', () => {
            if (AppState.currentSlideIndex < AppState.slides.length - 1) {
                AppState.currentSlideIndex++;
                updatePresenterView();
            }
        });
    }
    
    // 타이머 버튼 이벤트
    const startTimerBtn = document.getElementById('startTimerBtn');
    const resetTimerBtn = document.getElementById('resetTimerBtn');
    
    if (startTimerBtn) {
        startTimerBtn.addEventListener('click', togglePresenterTimer);
    }
    
    if (resetTimerBtn) {
        resetTimerBtn.addEventListener('click', resetPresenterTimer);
    }
    
    // 키보드 이벤트
    document.addEventListener('keydown', handlePresenterKeydown);
    
    console.log('발표자 모드 설정 완료');
}

// Initialize presenter mode
export function initPresenterMode() {
    // 현재 슬라이드 표시
    updatePresenterView();
    
    // 타이머 초기화
    resetPresenterTimer();
}

// Update presenter view
export function updatePresenterView() {
    if (AppState.slides.length === 0) return;
    
    // 현재 슬라이드 표시
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    const presenterCurrentSlide = document.getElementById('presenterCurrentSlide');
    
    if (presenterCurrentSlide) {
        presenterCurrentSlide.innerHTML = '';
        
        // 슬라이드 배경색 설정
        presenterCurrentSlide.style.backgroundColor = currentSlide.background || '#FFFFFF';
        
        // 슬라이드 요소 렌더링
        currentSlide.elements.forEach(element => {
            const elementDiv = document.createElement('div');
            elementDiv.className = 'slide-element';
            elementDiv.style.position = 'absolute';
            elementDiv.style.left = `${element.x}px`;
            elementDiv.style.top = `${element.y}px`;
            elementDiv.style.width = `${element.width}px`;
            elementDiv.style.height = `${element.height}px`;
            
            // 요소 타입에 따른 처리
            if (element.type === 'text') {
                elementDiv.innerHTML = element.content;
                elementDiv.style.color = element.style?.color || '#000000';
                elementDiv.style.fontSize = element.style?.fontSize || '16px';
                elementDiv.style.fontFamily = element.style?.fontFamily || 'Pretendard';
                elementDiv.style.fontWeight = element.style?.fontWeight || 'normal';
                elementDiv.style.textAlign = element.style?.textAlign || 'left';
            } else if (element.type === 'image') {
                const img = document.createElement('img');
                img.src = element.url;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                elementDiv.appendChild(img);
            } else if (element.type === 'shape') {
                // 도형 처리
                elementDiv.style.backgroundColor = element.style?.fill || '#2b579a';
                elementDiv.style.borderRadius = element.shape === 'circle' ? '50%' : '0';
                // 추가 도형 스타일 처리...
            }
            
            presenterCurrentSlide.appendChild(elementDiv);
        });
    }
    
    // 다음 슬라이드 표시
    const nextSlideIndex = AppState.currentSlideIndex + 1;
    const presenterNextSlide = document.getElementById('presenterNextSlide');
    
    if (presenterNextSlide) {
        if (nextSlideIndex < AppState.slides.length) {
            const nextSlide = AppState.slides[nextSlideIndex];
            
            presenterNextSlide.innerHTML = '<div class="next-slide-placeholder">다음 슬라이드</div>';
            presenterNextSlide.style.backgroundColor = nextSlide.background || '#FFFFFF';
        } else {
            presenterNextSlide.innerHTML = '<div class="next-slide-placeholder">마지막 슬라이드</div>';
            presenterNextSlide.style.backgroundColor = '#FFFFFF';
        }
    }
    
    // 발표자 노트 표시
    const presenterNotes = document.getElementById('presenterNotes');
    
    if (presenterNotes) {
        const notes = getNotes(currentSlide.id);
        presenterNotes.innerHTML = notes ? notes : '<i>이 슬라이드에 대한 노트가 없습니다.</i>';
    }
    
    // 슬라이드 카운터 업데이트
    const slideCounter = document.getElementById('slideCounter');
    
    if (slideCounter) {
        slideCounter.textContent = `${AppState.currentSlideIndex + 1}/${AppState.slides.length}`;
    }
}

// 발표자 모드 타이머 관련 변수
let presenterTimerInterval = null;
let presenterTimerStartTime = 0;
let presenterTimerElapsed = 0;
let presenterTimerRunning = false;

// 타이머 토글
export function togglePresenterTimer() {
    const startTimerBtn = document.getElementById('startTimerBtn');
    const icon = startTimerBtn?.querySelector('i');
    
    if (presenterTimerRunning) {
        // 타이머 중지
        clearInterval(presenterTimerInterval);
        presenterTimerRunning = false;
        presenterTimerElapsed += Date.now() - presenterTimerStartTime;
        
        // 버튼 아이콘 변경
        if (icon) {
            icon.className = 'fas fa-play';
        }
    } else {
        // 타이머 시작
        presenterTimerStartTime = Date.now();
        presenterTimerRunning = true;
        presenterTimerInterval = setInterval(updatePresenterTimer, 1000);
        
        // 버튼 아이콘 변경
        if (icon) {
            icon.className = 'fas fa-pause';
        }
    }
}

// 타이머 업데이트
function updatePresenterTimer() {
    const timerDisplay = document.getElementById('presenterTimer');
    if (!timerDisplay) return;
    
    // 현재 경과 시간 계산
    const totalElapsed = presenterTimerElapsed + (Date.now() - presenterTimerStartTime);
    
    // 시, 분, 초 계산
    const hours = Math.floor(totalElapsed / 3600000);
    const minutes = Math.floor((totalElapsed % 3600000) / 60000);
    const seconds = Math.floor((totalElapsed % 60000) / 1000);
    
    // 표시 형식 맞추기
    const formattedTime = [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
    ].join(':');
    
    // 타이머 표시 업데이트
    timerDisplay.textContent = formattedTime;
}

// Reset and stop presenter timer
export function resetPresenterTimer() {
    // 타이머 중지
    clearInterval(presenterTimerInterval);
    presenterTimerRunning = false;
    presenterTimerElapsed = 0;
    
    // 타이머 표시 초기화
    const timerDisplay = document.getElementById('presenterTimer');
    if (timerDisplay) {
        timerDisplay.textContent = '00:00:00';
    }
    
    // 버튼 아이콘 초기화
    const startTimerBtn = document.getElementById('startTimerBtn');
    const icon = startTimerBtn?.querySelector('i');
    if (icon) {
        icon.className = 'fas fa-play';
    }
}

// 키보드 이벤트 처리
function handlePresenterKeydown(event) {
    // 발표자 모드가 열려있지 않으면 무시
    const presenterModal = document.getElementById('presenterModal');
    if (!presenterModal || presenterModal.style.display !== 'block') return;
    
    // 방향키 이벤트 처리
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        // 이전 슬라이드
        if (AppState.currentSlideIndex > 0) {
            AppState.currentSlideIndex--;
            updatePresenterView();
        }
        event.preventDefault();
    } else if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
        // 다음 슬라이드
        if (AppState.currentSlideIndex < AppState.slides.length - 1) {
            AppState.currentSlideIndex++;
            updatePresenterView();
        }
        event.preventDefault();
    } else if (event.key === 'Escape') {
        // ESC 키로 발표자 모드 종료
        import('./ui-modals.js').then(modalsModule => {
            modalsModule.closeModal(presenterModal);
            resetPresenterTimer();
        });
        event.preventDefault();
    }
} 