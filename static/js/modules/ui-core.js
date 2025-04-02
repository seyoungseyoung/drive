/**
 * UI Core module to handle basic PowerPoint-like interface initialization
 */

import { AppState, addNewSlide, duplicateCurrentSlide, deleteSelectedElement, undo, redo, exportPresentation } from '../index.js';
import { getThemeByName, getCurrentColorPalette, changeSlideBackground } from './themes.js';

// Initialize core UI components
export function initCoreUI() {
    console.log('PowerPoint 스타일 UI 기본 요소 초기화');
    
    // 기본 UI 설정
    setupRibbonTabs();
    setupFormatPanel();
    setupStickyMenuBar();
    
    // 이벤트 리스너 설정
    setupButtonEvents();
    setupModalEvents();
    setupIndependentScroll();
    
    console.log('핵심 UI 초기화 완료');
}

// Show the PowerPoint UI after initial setup
export function showPowerPointUI() {
    // 초기 설정 UI 숨기기
    const hero = document.querySelector('.hero');
    const initialSetup = document.getElementById('initialSetup');
    
    if (hero) hero.style.display = 'none';
    if (initialSetup) initialSetup.style.display = 'none';
    
    // PowerPoint UI 표시
    const pptUI = document.getElementById('powerpoint-ui');
    if (pptUI) {
        pptUI.style.display = 'block';
        
        // 기본 탭 활성화
        document.querySelector('.ribbon-tab[data-tab="home"]')?.classList.add('active');
        document.getElementById('home-ribbon')?.classList.add('active');
        
        // 슬라이드 업데이트
        updateCurrentSlide();
        updateSlideList();
    }
}

// Setup ribbon tab functionality
function setupRibbonTabs() {
    const ribbonTabs = document.querySelectorAll('.ribbon-tab');
    
    ribbonTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            
            // 모든 탭 비활성화
            ribbonTabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.ribbon-content').forEach(c => c.classList.remove('active'));
            
            // 선택한 탭 활성화
            tab.classList.add('active');
            document.getElementById(`${tabName}-ribbon`)?.classList.add('active');
        });
    });
}

// Setup format panel functionality
function setupFormatPanel() {
    // Color swatches click handlers
    const colorSwatches = document.querySelectorAll('.color-swatch');
    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', function() {
            const color = this.style.backgroundColor;
            document.getElementById('fillColor').value = rgbToHex(color);
            // Trigger color change event
            document.getElementById('fillColor').dispatchEvent(new Event('input'));
        });
    });
    
    // Theme swatches click handlers
    const themeSwatches = document.querySelectorAll('.theme-swatch');
    themeSwatches.forEach(swatch => {
        swatch.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            applyTheme(theme);
        });
    });
    
    // Format panel input change event handlers
    setupFormatPanelEvents();
}

// Setup format panel input events
function setupFormatPanelEvents() {
    // Fill opacity slider
    const fillOpacity = document.getElementById('fillOpacity');
    const fillOpacityValue = document.getElementById('fillOpacityValue');
    if (fillOpacity && fillOpacityValue) {
        fillOpacity.addEventListener('input', function() {
            fillOpacityValue.textContent = this.value + '%';
        });
    }
    
    // Border width slider
    const borderWidth = document.getElementById('borderWidth');
    const borderWidthValue = document.getElementById('borderWidthValue');
    if (borderWidth && borderWidthValue) {
        borderWidth.addEventListener('input', function() {
            borderWidthValue.textContent = this.value + 'px';
        });
    }
    
    // Element rotation slider
    const elementRotation = document.getElementById('elementRotation');
    const elementRotationValue = document.getElementById('elementRotationValue');
    if (elementRotation && elementRotationValue) {
        elementRotation.addEventListener('input', function() {
            elementRotationValue.textContent = this.value + '°';
        });
    }
    
    // Element opacity slider
    const elementOpacity = document.getElementById('elementOpacity');
    const elementOpacityValue = document.getElementById('elementOpacityValue');
    if (elementOpacity && elementOpacityValue) {
        elementOpacity.addEventListener('input', function() {
            elementOpacityValue.textContent = this.value + '%';
        });
    }
}

// Apply a theme to the presentation
function applyTheme(theme) {
    console.log(`Applying theme: ${theme}`);
    // Here we would have code to change the colors and styles based on the selected theme
    
    // Update the active theme in the backend
    fetch('/update_theme', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme: theme })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Theme updated successfully');
        } else {
            console.error('Error updating theme:', data.error);
        }
    })
    .catch(error => {
        console.error('Error updating theme:', error);
    });
}

// Setup sticky menu bar
function setupStickyMenuBar() {
    const ribbonMenu = document.querySelector('.ribbon-menu');
    const workspace = document.querySelector('.workspace');
    
    if (!ribbonMenu || !workspace) return;
    
    // 리본 메뉴 초기 위치 저장
    const ribbonTop = ribbonMenu.offsetTop;
    const ribbonHeight = ribbonMenu.offsetHeight;
    
    // 스크롤 이벤트 리스너 추가
    window.addEventListener('scroll', () => {
        if (window.scrollY >= ribbonTop) {
            ribbonMenu.classList.add('sticky');
            workspace.classList.add('has-sticky-menu');
            workspace.style.paddingTop = `${ribbonHeight}px`;
        } else {
            ribbonMenu.classList.remove('sticky');
            workspace.classList.remove('has-sticky-menu');
            workspace.style.paddingTop = '0';
        }
    });
    
    // 리사이즈 옵저버 추가
    const resizeObserver = new ResizeObserver(() => {
        if (ribbonMenu.classList.contains('sticky')) {
            workspace.style.paddingTop = `${ribbonMenu.offsetHeight}px`;
        }
    });
    
    resizeObserver.observe(ribbonMenu);
}

// Setup independent scrolling for different panels
function setupIndependentScroll() {
    // 슬라이드 탐색기 독립 스크롤
    const slideExplorer = document.querySelector('.slide-explorer');
    if (slideExplorer) {
        slideExplorer.classList.add('independent-scroll');
    }
    
    // 슬라이드 편집기 독립 스크롤
    const slideEditor = document.querySelector('.slide-editor');
    if (slideEditor) {
        slideEditor.classList.add('independent-scroll');
    }
    
    // 속성 패널 독립 스크롤
    const propertiesPanel = document.querySelector('.properties-panel');
    if (propertiesPanel) {
        const panelContents = propertiesPanel.querySelectorAll('.panel-content');
        panelContents.forEach(panel => {
            panel.classList.add('independent-scroll');
        });
    }
}

// Setup button events
function setupButtonEvents() {
    // This function will be overridden to import functionality from different modules
    console.log('Basic button events registered');
}

// Setup modal events
function setupModalEvents() {
    // This function will be moved to ui-modals.js
    console.log('Basic modal events will be set up separately');
}

// Update UI state
export function updateUIState() {
    console.log('UI 상태 업데이트');
    
    // 슬라이드 목록 업데이트
    updateSlideList();
    
    // 현재 슬라이드 업데이트
    updateCurrentSlide();
    
    // 속성 패널 업데이트
    if (AppState.selectedElement) {
        updatePropertiesPanelFields();
    }
    
    // 슬라이드 정보 업데이트
    const slideInfo = document.getElementById('slideInfo');
    if (slideInfo && AppState.slides) {
        slideInfo.textContent = `슬라이드 ${AppState.currentSlideIndex + 1}/${AppState.slides.length}`;
    }
    
    // 확대/축소 정보 업데이트
    const zoomSelect = document.getElementById('zoomSelect');
    const zoomInfo = document.getElementById('zoomInfo');
    if (zoomSelect && zoomInfo) {
        zoomInfo.textContent = `${parseInt(zoomSelect.value * 100)}%`;
    }
}

// Helper functions

// Helper function to convert RGB to HEX
export function rgbToHex(rgb) {
    // If already in hex format, return it
    if (rgb.startsWith('#')) return rgb;
    
    // Handle rgb(r, g, b) format
    const rgbMatch = rgb.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
    if (rgbMatch) {
        return "#" + 
            ("0" + parseInt(rgbMatch[1], 10).toString(16)).slice(-2) +
            ("0" + parseInt(rgbMatch[2], 10).toString(16)).slice(-2) +
            ("0" + parseInt(rgbMatch[3], 10).toString(16)).slice(-2);
    }
    
    return rgb; // Return as-is if not in expected format
}

// These functions will be implemented in other modules but are referenced here
export function updateCurrentSlide() {
    console.log('updateCurrentSlide will be implemented in slides module');
}

export function updateSlideList() {
    console.log('updateSlideList will be implemented in slides module');
}

export function updatePropertiesPanelFields() {
    console.log('updatePropertiesPanelFields will be implemented in elements module');
}

// Start slideshow function
export function startSlideshow() {
    // Import and use presenter module for slideshow
    import('./ui-presenter.js').then(module => {
        // Open the presenter mode which serves as the slideshow
        document.getElementById('presenterViewBtn')?.click();
    }).catch(error => {
        console.error('Error starting slideshow:', error);
        alert('슬라이드쇼를 시작하는 중 오류가 발생했습니다.');
    });
} 