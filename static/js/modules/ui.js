/**
 * UI module to handle PowerPoint-like interface elements
 */

import { AppState, addNewSlide, duplicateCurrentSlide, deleteSelectedElement, undo, redo, exportPresentation } from '../index.js';
import { changeSlideBackground, getCurrentColorPalette, getThemeByName } from './themes.js';

// Initialize UI components
export function initUI() {
    console.log('PowerPoint 스타일 UI 초기화');
    
    // 기본 UI 설정
    setupRibbonTabs();
    setupFormatPanel();
    setupStickyMenuBar();
    
    // 이벤트 리스너 설정
    setupButtonEvents();
    setupModalEvents();
    setupIndependentScroll();
    
    // 발표자 노트 및 발표자 모드 설정 추가
    setupPresenterNotes();
    setupPresenterMode();
    
    // 초기 상태 설정
    document.addEventListener('DOMContentLoaded', () => {
        // UI 상태 업데이트
        updateUIState();
        
        // UI 표시
        showPowerPointUI();
    });
    
    console.log('UI 초기화 완료');
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

// Setup the main PowerPoint view
function setupPowerPointView() {
    // Slide canvas setup
    const canvas = document.getElementById('slide-canvas');
    if (canvas) {
        // Make sure slide-canvas is the right size and aspect ratio
        canvas.style.width = '960px';
        canvas.style.height = '540px'; // 16:9 aspect ratio
    }
    
    // Zoom level change event
    const zoomSelect = document.getElementById('zoom-level');
    if (zoomSelect) {
        zoomSelect.addEventListener('change', function() {
            const zoomLevel = parseFloat(this.value);
            if (canvas) {
                canvas.style.transform = `scale(${zoomLevel})`;
                canvas.style.transformOrigin = 'top center';
            }
        });
    }
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

// Helper function to convert RGB to HEX
function rgbToHex(rgb) {
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

// Setup button events
function setupButtonEvents() {
    // 슬라이드 관련 버튼
    setupSlideButtons();
    
    // 텍스트 서식 버튼
    setupTextFormattingButtons();
    
    // 도형 버튼
    setupShapeButtons();
    
    // 단락 서식 버튼
    setupParagraphButtons();
    
    // 디자인 버튼
    setupDesignButtons();
    
    // 요소 스타일 컨트롤
    setupElementStyleControls();
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

// Element style controls
function setupElementStyleControls() {
    // 요소 속성 필드들
    const elementBgColor = document.getElementById('elementBgColor');
    const elementBorderColor = document.getElementById('elementBorderColor');
    const elementOpacity = document.getElementById('elementOpacity');
    const opacityValue = document.getElementById('opacityValue');
    const borderWidth = document.getElementById('borderWidth');
    const borderStyle = document.getElementById('borderStyle');
    const shadowStyle = document.getElementById('shadowStyle');
    const elementX = document.getElementById('elementX');
    const elementY = document.getElementById('elementY');
    const elementWidth = document.getElementById('elementWidth');
    const elementHeight = document.getElementById('elementHeight');
    const elementRotation = document.getElementById('elementRotation');
    const rotationValue = document.getElementById('rotationValue');
    
    // 기울이기(skew) 컨트롤 추가
    const elementSkewX = document.getElementById('elementSkewX');
    const elementSkewY = document.getElementById('elementSkewY');

    // AI 분석 버튼 추가
    const propertiesPanel = document.querySelector('.properties-panel');
    if (propertiesPanel) {
        const aiAnalysisContainer = document.createElement('div');
        aiAnalysisContainer.className = 'panel-section ai-analysis-section';
        aiAnalysisContainer.innerHTML = `
            <h4>AI 분석 및 개선</h4>
            <div class="button-group">
                <button id="analyzeElementBtn" class="btn-secondary" disabled>
                    <i class="fas fa-magic"></i> 요소 분석
                </button>
            </div>
        `;
        
        // 속성 패널에 AI 분석 섹션 추가
        const formatContent = document.getElementById('formatContent');
        if (formatContent) {
            formatContent.appendChild(aiAnalysisContainer);
            
            // 요소 분석 버튼 이벤트 추가
            const analyzeElementBtn = document.getElementById('analyzeElementBtn');
            if (analyzeElementBtn) {
                analyzeElementBtn.addEventListener('click', () => {
                    if (window.AppState && window.AppState.selectedElement) {
                        showElementAnalysisModal(window.AppState.selectedElement.elementId);
                    }
                });
            }
        }
    }

    // 요소 선택 시 UI 업데이트 함수
    function updateElementStyles(element) {
        if (!element) return;
        
        // 공통 속성 설정
        if (elementBgColor) elementBgColor.value = element.fillColor || '#ffffff';
        if (elementBorderColor) elementBorderColor.value = element.strokeColor || '#000000';
        if (elementOpacity) {
            elementOpacity.value = (element.opacity || 1) * 100;
            if (opacityValue) opacityValue.textContent = `${Math.round((element.opacity || 1) * 100)}%`;
        }
        
        // 테두리 설정
        if (borderWidth) borderWidth.value = element.strokeWidth || 0;
        if (borderStyle) borderStyle.value = element.strokeStyle || 'solid';
        
        // 그림자 설정
        if (shadowStyle) shadowStyle.value = element.shadow || 'none';
        
        // 위치 및 크기 설정
        if (elementX) elementX.value = Math.round(element.x || 0);
        if (elementY) elementY.value = Math.round(element.y || 0);
        if (elementWidth) elementWidth.value = Math.round(element.width || 100);
        if (elementHeight) elementHeight.value = Math.round(element.height || 100);
        
        // 회전 설정
        if (elementRotation) {
            elementRotation.value = element.rotation || 0;
            if (rotationValue) rotationValue.textContent = `${Math.round(element.rotation || 0)}°`;
        }
        
        // 기울이기 설정
        if (elementSkewX) {
            elementSkewX.value = element.skewX || 0;
            if (skewXValue) skewXValue.textContent = `${Math.round(element.skewX || 0)}°`;
        }
        if (elementSkewY) {
            elementSkewY.value = element.skewY || 0;
            if (skewYValue) skewYValue.textContent = `${Math.round(element.skewY || 0)}°`;
        }

        // AI 분석 버튼 활성화
        const analyzeElementBtn = document.getElementById('analyzeElementBtn');
        if (analyzeElementBtn) {
            analyzeElementBtn.disabled = false;
        }
    }
    
    // 이벤트 리스너 등록
    if (elementBgColor) {
        elementBgColor.addEventListener('input', () => {
            if (!AppState.selectedElement) return;
            updateElement(AppState.selectedElement.elementId, { fillColor: elementBgColor.value });
        });
    }
    
    if (elementBorderColor) {
        elementBorderColor.addEventListener('input', () => {
            if (!AppState.selectedElement) return;
            updateElement(AppState.selectedElement.elementId, { strokeColor: elementBorderColor.value });
        });
    }
    
    if (elementOpacity) {
        elementOpacity.addEventListener('input', () => {
            if (!AppState.selectedElement) return;
            const opacity = parseInt(elementOpacity.value) / 100;
            updateElement(AppState.selectedElement.elementId, { opacity: opacity });
            if (opacityValue) opacityValue.textContent = `${Math.round(opacity * 100)}%`;
        });
    }
    
    if (borderWidth) {
        borderWidth.addEventListener('input', () => {
            if (!AppState.selectedElement) return;
            updateElement(AppState.selectedElement.elementId, { strokeWidth: parseInt(borderWidth.value) });
        });
    }
    
    if (borderStyle) {
        borderStyle.addEventListener('change', () => {
            if (!AppState.selectedElement) return;
            updateElement(AppState.selectedElement.elementId, { strokeStyle: borderStyle.value });
        });
    }
    
    if (shadowStyle) {
        shadowStyle.addEventListener('change', () => {
            if (!AppState.selectedElement) return;
            updateElement(AppState.selectedElement.elementId, { shadow: shadowStyle.value });
        });
    }
    
    if (elementX) {
        elementX.addEventListener('input', () => {
            if (!AppState.selectedElement) return;
            updateElement(AppState.selectedElement.elementId, { x: parseInt(elementX.value) });
        });
    }
    
    if (elementY) {
        elementY.addEventListener('input', () => {
            if (!AppState.selectedElement) return;
            updateElement(AppState.selectedElement.elementId, { y: parseInt(elementY.value) });
        });
    }
    
    if (elementWidth) {
        elementWidth.addEventListener('input', () => {
            if (!AppState.selectedElement) return;
            updateElement(AppState.selectedElement.elementId, { width: parseInt(elementWidth.value) });
        });
    }
    
    if (elementHeight) {
        elementHeight.addEventListener('input', () => {
            if (!AppState.selectedElement) return;
            updateElement(AppState.selectedElement.elementId, { height: parseInt(elementHeight.value) });
        });
    }
    
    if (elementRotation) {
        elementRotation.addEventListener('input', () => {
            if (!AppState.selectedElement) return;
            const rotation = parseInt(elementRotation.value);
            updateElement(AppState.selectedElement.elementId, { rotation: rotation });
            if (rotationValue) rotationValue.textContent = `${rotation}°`;
        });
    }
    
    // 기울이기 컨트롤 이벤트 리스너
    if (elementSkewX) {
        elementSkewX.addEventListener('input', () => {
            if (!AppState.selectedElement) return;
            const skewX = parseInt(elementSkewX.value);
            updateElement(AppState.selectedElement.elementId, { skewX: skewX });
            if (skewXValue) skewXValue.textContent = `${skewX}°`;
        });
    }
    
    if (elementSkewY) {
        elementSkewY.addEventListener('input', () => {
            if (!AppState.selectedElement) return;
            const skewY = parseInt(elementSkewY.value);
            updateElement(AppState.selectedElement.elementId, { skewY: skewY });
            if (skewYValue) skewYValue.textContent = `${skewY}°`;
        });
    }
    
    // 요소 분석 버튼 클릭 이벤트
    if (analyzeElementBtn) {
        analyzeElementBtn.addEventListener('click', () => {
            if (!AppState.selectedElement) return;
            
            // 요소 분석 모달 표시
            showElementAnalysisModal(AppState.selectedElement.elementId);
        });
    }
    
    // 선택된 요소가 변경될 때마다 속성 업데이트
    document.addEventListener('element-selected', (event) => {
        const selectedElement = event.detail.element;
        updateElementStyles(selectedElement);
    });
    
    document.addEventListener('element-deselected', () => {
        // 필드 초기화 (필요한 경우)
    });
}

// 요소 분석 모달 표시
function showElementAnalysisModal(elementId) {
    if (!elementId) return;
    
    // 로딩 상태 표시
    const modalContent = `
        <div class="analysis-loading">
            <div class="deep-seek-spinner"></div>
            <p>요소 분석 중...</p>
        </div>
    `;
    
    // 모달 생성
    showModal('요소 AI 분석', modalContent, () => {
        // 모달 닫을 때 처리
    });
    
    // AI 모듈 로드 및 분석 요청
    import('./ai.js').then(aiModule => {
        aiModule.analyzeElement(elementId)
            .then(analysis => {
                // 분석 결과를 모달 내용으로 업데이트
                updateElementAnalysisModal(analysis);
            })
            .catch(error => {
                console.error('요소 분석 오류:', error);
                // 오류 메시지 표시
                const modalBody = document.querySelector('.modal-body');
                if (modalBody) {
                    modalBody.innerHTML = `
                        <div class="analysis-error">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>요소를 분석하는 중 오류가 발생했습니다: ${error.message}</p>
                        </div>
                    `;
                }
            });
    });
}

// 요소 분석 결과 모달 업데이트
function updateElementAnalysisModal(analysis) {
    const modalBody = document.querySelector('.modal-body');
    if (!modalBody) return;
    
    // 요소 타입에 따른 아이콘 및 타이틀
    const typeIcons = {
        'text': 'fas fa-font',
        'image': 'fas fa-image',
        'shape': 'fas fa-shapes',
        'chart': 'fas fa-chart-bar'
    };
    
    const typeIcon = typeIcons[analysis.type] || 'fas fa-object-group';
    const typeTitle = {
        'text': '텍스트',
        'image': '이미지',
        'shape': '도형',
        'chart': '차트'
    }[analysis.type] || '요소';
    
    // 분석 헤더 생성
    let modalContent = `
        <div class="analysis-header">
            <div class="analysis-type">
                <i class="${typeIcon}"></i>
                <h3>${typeTitle} 요소 분석</h3>
            </div>
            <div class="analysis-summary">
                <p>총 <strong>${analysis.recommendations.length}</strong>개의 개선 제안이 있습니다.</p>
            </div>
        </div>
    `;
    
    // 우선순위별 분류
    const highPriority = analysis.recommendations.filter(rec => rec.priority === 'high');
    const mediumPriority = analysis.recommendations.filter(rec => rec.priority === 'medium');
    const lowPriority = analysis.recommendations.filter(rec => rec.priority === 'low');
    
    // 높은 우선순위 제안 표시
    if (highPriority.length > 0) {
        modalContent += `
            <div class="analysis-section">
                <h4>높은 우선순위</h4>
                <div class="ai-recommendations">
                    ${generateRecommendationHTML(highPriority, elementId)}
                </div>
            </div>
        `;
    }
    
    // 중간 우선순위 제안 표시
    if (mediumPriority.length > 0) {
        modalContent += `
            <div class="analysis-section">
                <h4>중간 우선순위</h4>
                <div class="ai-recommendations">
                    ${generateRecommendationHTML(mediumPriority, elementId)}
                </div>
            </div>
        `;
    }
    
    // 낮은 우선순위 제안 표시
    if (lowPriority.length > 0) {
        modalContent += `
            <div class="analysis-section">
                <h4>낮은 우선순위</h4>
                <div class="ai-recommendations">
                    ${generateRecommendationHTML(lowPriority, elementId)}
                </div>
            </div>
        `;
    }
    
    // 제안이 없는 경우
    if (analysis.recommendations.length === 0) {
        modalContent += `
            <div class="analysis-empty">
                <i class="fas fa-check-circle"></i>
                <p>이 요소는 현재 최적화된 상태입니다. 특별한 개선 제안이 없습니다.</p>
            </div>
        `;
    }
    
    // 모달 콘텐츠 업데이트
    modalBody.innerHTML = modalContent;
    
    // 제안 적용 버튼 이벤트 추가
    const applyButtons = modalBody.querySelectorAll('.apply-recommendation');
    applyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            const elemId = this.getAttribute('data-element-id');
            
            // 해당 액션 처리
            handleRecommendationAction(action, elemId);
            
            // 버튼 상태 업데이트
            this.textContent = '적용됨';
            this.disabled = true;
            this.classList.add('applied');
            
            // 부모 요소에 적용 완료 클래스 추가
            const recItem = this.closest('.recommendation-item');
            if (recItem) {
                recItem.classList.add('applied');
            }
        });
    });
}

// 추천 사항 HTML 생성 함수
function generateRecommendationHTML(recommendations, elementId) {
    return recommendations.map(rec => `
        <div class="recommendation-item" data-type="${rec.type}">
            <i class="${getRecommendationIcon(rec.type)}"></i>
            <div class="recommendation-content">
                <strong>${rec.title}</strong>
                <p>${rec.description}</p>
                <button class="apply-recommendation" data-action="${rec.action}" data-element-id="${elementId}">
                    ${rec.actionText || '적용하기'}
                </button>
            </div>
        </div>
    `).join('');
}

// 추천 유형별 아이콘 가져오기
function getRecommendationIcon(type) {
    const icons = {
        'position': 'fas fa-arrows-alt',
        'size': 'fas fa-expand-arrows-alt',
        'text_density': 'fas fa-text-height',
        'text_size': 'fas fa-text-width',
        'text_format': 'fas fa-font',
        'color_harmony': 'fas fa-palette',
        'readability': 'fas fa-glasses',
        'layout': 'fas fa-th-large',
        'visual_balance': 'fas fa-balance-scale',
        'image_ratio': 'fas fa-crop',
        'image_size': 'fas fa-image',
        'shape_color': 'fas fa-fill-drip',
        'shape_ratio': 'fas fa-vector-square',
        'chart_label': 'fas fa-tags',
        'chart_colors': 'fas fa-chart-pie',
        'usage_tip': 'fas fa-lightbulb'
    };
    
    return icons[type] || 'fas fa-magic';
}

// 추천 액션 처리 함수
function handleRecommendationAction(action, elementId) {
    // 요소 가져오기
    import('../index.js').then(module => {
        if (!module.AppState.slides || module.AppState.currentSlideIndex < 0) return;
        
        const slide = module.AppState.slides[module.AppState.currentSlideIndex];
        if (!slide || !slide.elements) return;
        
        const element = slide.elements.find(el => el.id.toString() === elementId.toString());
        if (!element) return;
        
        // 액션 처리
        switch (action) {
            case 'center_horizontally':
                // 수평 중앙 정렬
                const slideWidth = 960;
                const newX = (slideWidth - element.width) / 2;
                module.updateElement(elementId, { x: newX });
                break;
                
            case 'adjust_margins':
                // 여백 조정
                const margin = 30;
                let updatedX = element.x;
                let updatedY = element.y;
                
                if (updatedX < margin) updatedX = margin;
                if (updatedY < margin) updatedY = margin;
                if (updatedX + element.width > 960 - margin) updatedX = 960 - element.width - margin;
                if (updatedY + element.height > 540 - margin) updatedY = 540 - element.height - margin;
                
                module.updateElement(elementId, { x: updatedX, y: updatedY });
                break;
                
            case 'increase_size':
                // 크기 증가
                const sizeIncrease = 1.3; // 30% 증가
                module.updateElement(elementId, {
                    width: element.width * sizeIncrease,
                    height: element.height * sizeIncrease
                });
                break;
                
            case 'increase_font':
                // 폰트 크기 증가
                if (element.type === 'text') {
                    const currentSize = parseInt(element.fontSize) || 16;
                    const newSize = Math.max(20, currentSize * 1.25);
                    module.updateElement(elementId, { fontSize: newSize });
                }
                break;
                
            case 'fix_aspect_ratio':
                // 이미지 비율 수정
                if (element.type === 'image') {
                    // 원본 이미지 비율을 알 수 없으므로 표준 16:9 비율 적용
                    const standardRatio = 16/9;
                    const newHeight = element.width / standardRatio;
                    module.updateElement(elementId, { height: newHeight });
                }
                break;
                
            case 'equalize_dimensions':
                // 도형 가로세로 크기 동일하게
                if (element.type === 'shape') {
                    const size = Math.max(element.width, element.height);
                    module.updateElement(elementId, { width: size, height: size });
                }
                break;
                
            case 'simplify_transform':
                // 변형 단순화
                if (element.rotation || element.skewX || element.skewY) {
                    module.updateElement(elementId, { rotation: 0, skewX: 0, skewY: 0 });
                }
                break;
                
            case 'change_stroke_color':
                // 테두리 색상 변경
                if (element.fillColor && element.strokeColor && element.fillColor === element.strokeColor) {
                    // 현재 색상에서 어두운 변형 만들기
                    const darkerColor = generateDarkerColor(element.fillColor);
                    module.updateElement(elementId, { strokeColor: darkerColor });
                }
                break;
                
            default:
                console.log(`액션 '${action}'에 대한 처리가 아직 구현되지 않았습니다.`);
        }
    });
}

// 더 어두운 색상 생성
function generateDarkerColor(hexColor) {
    // HEX를 RGB로 변환
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // 색상 어둡게 (70%)
    const darkerR = Math.round(r * 0.7);
    const darkerG = Math.round(g * 0.7);
    const darkerB = Math.round(b * 0.7);
    
    // RGB를 HEX로 변환
    return `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
}

// 모달 표시 함수
function showModal(title, content, onClose) {
    // 이미 있는 모달 확인
    let modalElement = document.getElementById('dynamic-modal');
    
    if (!modalElement) {
        // 모달 요소 생성
        modalElement = document.createElement('div');
        modalElement.id = 'dynamic-modal';
        modalElement.className = 'modal';
        modalElement.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modal-title"></h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body" id="modal-body"></div>
            </div>
        `;
        
        document.body.appendChild(modalElement);
    }
    
    // 모달 내용 설정
    const modalTitle = modalElement.querySelector('#modal-title');
    const modalBody = modalElement.querySelector('#modal-body');
    
    if (modalTitle) modalTitle.textContent = title;
    if (modalBody) modalBody.innerHTML = content;
    
    // 닫기 버튼 이벤트
    const closeBtn = modalElement.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modalElement.style.display = 'none';
            if (typeof onClose === 'function') {
                onClose();
            }
        });
    }
    
    // 모달 외부 클릭 시 닫기
    modalElement.addEventListener('click', (event) => {
        if (event.target === modalElement) {
            modalElement.style.display = 'none';
            if (typeof onClose === 'function') {
                onClose();
            }
        }
    });
    
    // 모달 표시
    modalElement.style.display = 'block';
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

// Setup modal events
function setupModalEvents() {
    // 모달 닫기 버튼
    document.querySelectorAll('.modal .close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) {
                closeModal(modal);
            }
        });
    });
    
    // 모달 외부 클릭 시 닫기
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal.show');
            if (openModals.length > 0) {
                closeModal(openModals[openModals.length - 1]);
            }
        }
    });
    
    // 도형 모달 이벤트
    setupShapeModalEvents();
    
    // 이미지 모달 이벤트
    setupImageModalEvents();
    
    // 내보내기 모달 이벤트
    setupExportModalEvents();
}

// 모달 열기 함수
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // 모달 표시
    modal.style.display = 'block';
    
    // 강제 리플로우
    modal.offsetHeight;
    
    // show 클래스 추가 (트랜지션을 위해)
    modal.classList.add('show');
    
    // 스크롤 방지
    document.body.style.overflow = 'hidden';
}

// 모달 닫기 함수
function closeModal(modal) {
    if (!modal) return;
    
    // show 클래스 제거
    modal.classList.remove('show');
    
    // 애니메이션 후 display 속성 변경
    setTimeout(() => {
        modal.style.display = 'none';
        
        // 스크롤 복원 (다른 모달이 열려있지 않은 경우)
        if (!document.querySelector('.modal.show')) {
            document.body.style.overflow = '';
        }
    }, 300);
}

// Shape selection modal events
function setupShapeModalEvents() {
    const shapeItems = document.querySelectorAll('.shape-item');
    
    shapeItems.forEach(item => {
        item.addEventListener('click', () => {
            const shape = item.getAttribute('data-shape');
            console.log(`도형 선택: ${shape}`);
            addShapeElement(shape);
            closeModal(document.getElementById('shapeModal'));
        });
    });
}

// Image upload modal events
function setupImageModalEvents() {
    const imageModal = document.getElementById('imageModal');
    if (!imageModal) return;
    
    const uploadInput = document.getElementById('imageUploadInput');
    const uploadBtn = document.getElementById('uploadImageBtn');
    const cancelBtn = document.getElementById('cancelImageBtn');
    const addToSlideBtn = document.getElementById('addImageToSlideBtn');
    const imagePreview = document.getElementById('imagePreview');
    const uploadArea = imageModal.querySelector('.upload-area');
    
    // 드래그 앤 드롭 기능
    if (uploadArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('highlight');
            });
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('highlight');
            });
        });
        
        uploadArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
        });
    }
    
    // 파일 선택 버튼
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            uploadInput.click();
        });
    }
    
    // 파일 선택 처리
    if (uploadInput) {
        uploadInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
            }
        });
    }
    
    // 파일 처리 함수
    function handleFileSelect(file) {
        if (!file.type.match('image.*')) {
            alert('이미지 파일만 선택할 수 있습니다.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            addToSlideBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }
    
    // 취소 버튼
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            closeModal(imageModal);
        });
    }
    
    // 슬라이드에 추가 버튼
    if (addToSlideBtn) {
        addToSlideBtn.addEventListener('click', () => {
            if (imagePreview.src) {
                addImageElement(imagePreview.src);
                closeModal(imageModal);
                
                // 초기화
                setTimeout(() => {
                    imagePreview.src = '';
                    imagePreview.style.display = 'none';
                    if (uploadInput) uploadInput.value = '';
                    addToSlideBtn.disabled = true;
                }, 300);
            }
        });
    }
}

// Export modal events
function setupExportModalEvents() {
    const exportModal = document.getElementById('exportModal');
    if (!exportModal) return;
    
    const confirmBtn = document.getElementById('confirmExportBtn');
    const cancelBtn = document.getElementById('cancelExportBtn');
    
    // 확인 버튼
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            const format = document.getElementById('exportFormat')?.value || 'pptx';
            const quality = document.getElementById('exportQuality')?.value || 'high';
            
            // 내보내기 설정 업데이트
            AppState.exportConfig = {
                format,
                quality
            };
            
            // 내보내기 진행 중 UI 표시
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 내보내는 중...';
            
            // 내보내기 실행
            exportPresentation()
                .then(() => {
                    confirmBtn.disabled = false;
                    confirmBtn.innerHTML = '내보내기';
                    closeModal(exportModal);
                })
                .catch(error => {
                    confirmBtn.disabled = false;
                    confirmBtn.innerHTML = '내보내기';
                    alert(`내보내기 중 오류가 발생했습니다: ${error.message}`);
                });
        });
    }
    
    // 취소 버튼
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            closeModal(exportModal);
        });
    }
}

// 모달 열기 함수들
function openShapeModal() {
    openModal('shapeModal');
}

function openImageModal() {
    openModal('imageModal');
}

function openChartModal() {
    // 현재 차트 기능은 구현 중
    alert('차트 기능은 현재 개발 중입니다.');
}

function openExportModal() {
    openModal('exportModal');
}

// Element addition functions
function addTextElement() {
    if (!AppState.slides.length) return;
    
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    const newElement = {
        id: Date.now(),
        type: 'text',
        content: 'Enter text here',
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        style: {
            fontSize: '16px',
            fontFamily: AppState.currentFontFamily,
            color: '#000000',
            backgroundColor: 'transparent',
            textAlign: 'left'
        }
    };
    
    currentSlide.elements.push(newElement);
    updateCurrentSlide();
    
    // Slides update event
    document.dispatchEvent(new CustomEvent('slides-updated'));
}

function addShapeElement(shapeType) {
    if (!AppState.slides.length) return;
    
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    const colors = getCurrentColorPalette();
    
    const newElement = {
        id: Date.now(),
        type: 'shape',
        shape: shapeType,
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        style: {
            backgroundColor: colors[0],
            borderColor: colors[1],
            borderWidth: '2px',
            borderStyle: 'solid',
            opacity: 1
        }
    };
    
    currentSlide.elements.push(newElement);
    updateCurrentSlide();
    
    // Slides update event
    document.dispatchEvent(new CustomEvent('slides-updated'));
}

function addImageElement(imageUrl) {
    if (!AppState.slides.length) return;
    
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    const newElement = {
        id: Date.now(),
        type: 'image',
        url: imageUrl,
        x: 100,
        y: 100,
        width: 320,
        height: 240,
        style: {
            borderWidth: '0',
            borderColor: 'transparent',
            borderStyle: 'none',
            opacity: 1
        }
    };
    
    currentSlide.elements.push(newElement);
    updateCurrentSlide();
    
    // Slides update event
    document.dispatchEvent(new CustomEvent('slides-updated'));
}

// Element order change functions
function bringElementToFront() {
    if (!AppState.selectedElement) return;
    
    const elementId = AppState.selectedElement.elementId;
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    const elementIndex = currentSlide.elements.findIndex(el => el.id === elementId);
    
    if (elementIndex !== -1 && elementIndex < currentSlide.elements.length - 1) {
        // Move element to end of array
        const element = currentSlide.elements.splice(elementIndex, 1)[0];
        currentSlide.elements.push(element);
        updateCurrentSlide();
        
        // Slides update event
        document.dispatchEvent(new CustomEvent('slides-updated'));
    }
}

function sendElementToBack() {
    if (!AppState.selectedElement) return;
    
    const elementId = AppState.selectedElement.elementId;
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    const elementIndex = currentSlide.elements.findIndex(el => el.id === elementId);
    
    if (elementIndex > 0) {
        // Move element to start of array
        const element = currentSlide.elements.splice(elementIndex, 1)[0];
        currentSlide.elements.unshift(element);
        updateCurrentSlide();
        
        // Slides update event
        document.dispatchEvent(new CustomEvent('slides-updated'));
    }
}

// AI panel toggle
function toggleAIPanel() {
    const aiPanel = document.getElementById('ai-panel');
    const aiEnabled = !AppState.extensions.aiEnabled;
    
    AppState.extensions.aiEnabled = aiEnabled;
    
    if (aiPanel) {
        aiPanel.style.display = aiEnabled ? 'block' : 'none';
    }
    
    // Deactivate currently active panel tab
    document.querySelectorAll('.panel-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Deactivate all panel contents
    document.querySelectorAll('.panel-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (aiEnabled) {
        // Activate AI panel
        aiPanel.classList.add('active');
    } else {
        // Return to default panel
        document.querySelector('.panel-tab[data-panel="style"]').classList.add('active');
        document.getElementById('style-panel').classList.add('active');
    }
}

// Slide show start
function startSlideshow() {
    // Slide show implementation needed
    alert('Slide show feature is still under development.');
}

// Slide list update (index.js functions)
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
            updateSlideList();
            updateCurrentSlide();
            
            // Slide change event
            document.dispatchEvent(new CustomEvent('slide-changed', {
                detail: { index }
            }));
        });
        
        slideList.appendChild(slideThumb);
    });
    
    // Slide info update
    document.getElementById('slideInfo').textContent = `Slide ${AppState.currentSlideIndex + 1}/${AppState.slides.length}`;
}

// Current slide update (index.js functions)
function updateCurrentSlide() {
    const slideCanvas = document.getElementById('currentSlide');
    if (!slideCanvas) return;
    
    // Return if no slide
    if (AppState.slides.length === 0) return;
    
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    slideCanvas.innerHTML = '';
    
    // Background color setup
    slideCanvas.style.backgroundColor = currentSlide.background || '#FFFFFF';
    
    // Element rendering
    currentSlide.elements.forEach(element => {
        renderElement(element, slideCanvas);
    });
}

// Element rendering (existing function) with improved event handling
function renderElement(element, container) {
    const elementEl = document.createElement('div');
    elementEl.className = `slide-element ${element.type}`;
    elementEl.id = `element-${element.id}`;
    elementEl.dataset.type = element.type;
    elementEl.dataset.id = element.id;
    
    // Common styles
    elementEl.style.position = 'absolute';
    elementEl.style.left = `${element.x || 0}px`;
    elementEl.style.top = `${element.y || 0}px`;
    elementEl.style.width = `${element.width || 100}px`;
    elementEl.style.height = `${element.height || 100}px`;
    elementEl.style.zIndex = element.zIndex || 1; // Add z-index support
    
    if (element.style) {
        Object.keys(element.style).forEach(key => {
            elementEl.style[key] = element.style[key];
        });
    }
    
    // Type-specific rendering
    switch (element.type) {
        case 'text':
            elementEl.contentEditable = true;
            elementEl.innerHTML = element.content || 'Enter text here';
            elementEl.style.overflow = 'hidden';
            elementEl.style.wordWrap = 'break-word';
            
            // Add text editing event
            elementEl.addEventListener('input', (e) => {
                // Update element content when edited
                const elementId = parseInt(elementEl.dataset.id);
                const currentSlide = AppState.slides[AppState.currentSlideIndex];
                const textElement = currentSlide.elements.find(el => el.id === elementId);
                if (textElement) {
                    textElement.content = elementEl.innerHTML;
                    
                    // Trigger element update event
                    document.dispatchEvent(new CustomEvent('element-updated', {
                        detail: { element: textElement }
                    }));
                }
            });
            break;
            
        case 'shape':
            // Apply shape styles based on shape type
            if (element.shape === 'circle') {
                elementEl.style.borderRadius = '50%';
            } else if (element.shape === 'triangle') {
                elementEl.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
            } else if (element.shape === 'pentagon') {
                elementEl.style.clipPath = 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)';
            } else if (element.shape === 'hexagon') {
                elementEl.style.clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
            } else if (element.shape === 'star') {
                elementEl.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
            } else if (element.shape === 'arrow') {
                elementEl.style.clipPath = 'polygon(0% 30%, 70% 30%, 70% 0%, 100% 50%, 70% 100%, 70% 70%, 0% 70%)';
            } else if (element.shape === 'line') {
                elementEl.style.height = '2px';
                elementEl.style.backgroundColor = element.style?.backgroundColor || '#000000';
            }
            break;
            
        case 'image':
            elementEl.style.backgroundImage = `url(${element.url})`;
            elementEl.style.backgroundSize = element.style?.backgroundSize || 'contain';
            elementEl.style.backgroundPosition = 'center';
            elementEl.style.backgroundRepeat = 'no-repeat';
            break;
            
        case 'chart':
            // Create a chart container
            const chartContainer = document.createElement('div');
            chartContainer.style.width = '100%';
            chartContainer.style.height = '100%';
            chartContainer.id = `chart-container-${element.id}`;
            elementEl.appendChild(chartContainer);
            
            // Create chart canvas
            const canvas = document.createElement('canvas');
            canvas.id = `chart-${element.id}`;
            chartContainer.appendChild(canvas);
            
            // Initialize chart (this would be done in a separate function)
            setTimeout(() => {
                if (element.chartData && element.chartType && window.Chart) {
                    new Chart(canvas, {
                        type: element.chartType,
                        data: element.chartData,
                        options: element.chartOptions || {}
                    });
                }
            }, 100);
            break;
    }
    
    // Event listeners for selection and drag/drop
    elementEl.addEventListener('mousedown', (e) => {
        // Make sure we're not handling clicks on handles
        if (e.target.classList.contains('selection-handle')) {
            return;
        }
        
        e.stopPropagation();
        
        // Select the element
        selectElement(parseInt(elementEl.dataset.id), elementEl);
        
        // Start drag operation
        startDragging(e, elementEl);
    });
    
    // Add selection handles when element is first rendered
    if (AppState.selectedElement && AppState.selectedElement.elementId === element.id) {
        elementEl.classList.add('selected');
        addSelectionHandles(elementEl);
    }
    
    container.appendChild(elementEl);
    return elementEl;
}

// Start dragging operation
function startDragging(e, element) {
    if (!element) return;
    
    let isDragging = false;
    let startX = e.clientX;
    let startY = e.clientY;
    let startLeft = parseInt(element.style.left) || 0;
    let startTop = parseInt(element.style.top) || 0;
    
    function handleDrag(moveEvent) {
        // Only start dragging after moving a few pixels
        if (!isDragging) {
            if (Math.abs(moveEvent.clientX - startX) > 5 || Math.abs(moveEvent.clientY - startY) > 5) {
                isDragging = true;
                // Add dragging class
                element.classList.add('dragging');
            } else {
                return;
            }
        }
        
        moveEvent.preventDefault();
        
        // Calculate new position
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        
        // Update element position
        element.style.left = `${startLeft + dx}px`;
        element.style.top = `${startTop + dy}px`;
        
        // Update position fields in properties panel
        const elementX = document.getElementById('elementX');
        const elementY = document.getElementById('elementY');
        if (elementX) elementX.value = startLeft + dx;
        if (elementY) elementY.value = startTop + dy;
    }
    
    function handleDragEnd(endEvent) {
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', handleDragEnd);
        
        // Only update if we actually dragged
        if (isDragging) {
            element.classList.remove('dragging');
            
            // Get final position
            const finalLeft = parseInt(element.style.left);
            const finalTop = parseInt(element.style.top);
            
            // Update element position in state
            const elementId = parseInt(element.dataset.id);
            const currentSlide = AppState.slides[AppState.currentSlideIndex];
            const slideElement = currentSlide.elements.find(el => el.id === elementId);
            
            if (slideElement) {
                slideElement.x = finalLeft;
                slideElement.y = finalTop;
                
                // Trigger element update event
                document.dispatchEvent(new CustomEvent('element-updated', {
                    detail: { element: slideElement }
                }));
            }
        }
    }
    
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
}

// Add selection handles to an element
function addSelectionHandles(element) {
    // First, remove any existing handles
    element.querySelectorAll('.selection-handle').forEach(handle => handle.remove());
    
    // Create resize handles
    const handles = [
        { class: 'handle-nw', cursor: 'nw-resize' },
        { class: 'handle-n', cursor: 'n-resize' },
        { class: 'handle-ne', cursor: 'ne-resize' },
        { class: 'handle-e', cursor: 'e-resize' },
        { class: 'handle-se', cursor: 'se-resize' },
        { class: 'handle-s', cursor: 's-resize' },
        { class: 'handle-sw', cursor: 'sw-resize' },
        { class: 'handle-w', cursor: 'w-resize' }
    ];
    
    handles.forEach(handleInfo => {
        const handle = document.createElement('div');
        handle.className = `selection-handle ${handleInfo.class}`;
        handle.style.cursor = handleInfo.cursor;
        
        // Add resize logic for handles
        handle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            startResizing(e, element, handleInfo.class);
        });
        
        element.appendChild(handle);
    });
    
    // Add rotation handle if needed
    if (element.dataset.type !== 'line') {
        const rotateHandle = document.createElement('div');
        rotateHandle.className = 'selection-handle handle-rotate';
        rotateHandle.style.cursor = 'pointer';
        
        // Add rotation logic
        rotateHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            startRotating(e, element);
        });
        
        element.appendChild(rotateHandle);
    }
}

// Start resizing operation
function startResizing(e, element, handleClass) {
    e.preventDefault();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = parseInt(element.style.width);
    const startHeight = parseInt(element.style.height);
    const startLeft = parseInt(element.style.left);
    const startTop = parseInt(element.style.top);
    
    // Check if aspect ratio should be maintained
    const lockAspectRatio = document.getElementById('lockAspectRatio');
    const preserveRatio = lockAspectRatio && lockAspectRatio.checked;
    const aspectRatio = startWidth / startHeight;
    
    function handleResize(moveEvent) {
        moveEvent.preventDefault();
        
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        
        let newWidth = startWidth;
        let newHeight = startHeight;
        let newLeft = startLeft;
        let newTop = startTop;
        
        // Handle each type of resize based on the handle used
        switch (handleClass) {
            case 'handle-e':
                newWidth = Math.max(20, startWidth + dx);
                if (preserveRatio) {
                    newHeight = newWidth / aspectRatio;
                }
                break;
                
            case 'handle-se':
                newWidth = Math.max(20, startWidth + dx);
                newHeight = Math.max(20, startHeight + dy);
                if (preserveRatio) {
                    const useWidth = Math.abs(dx) > Math.abs(dy);
                    if (useWidth) {
                        newHeight = newWidth / aspectRatio;
                    } else {
                        newWidth = newHeight * aspectRatio;
                    }
                }
                break;
                
            case 'handle-s':
                newHeight = Math.max(20, startHeight + dy);
                if (preserveRatio) {
                    newWidth = newHeight * aspectRatio;
                }
                break;
                
            case 'handle-sw':
                newWidth = Math.max(20, startWidth - dx);
                newHeight = Math.max(20, startHeight + dy);
                newLeft = startLeft + (startWidth - newWidth);
                if (preserveRatio) {
                    const useWidth = Math.abs(dx) > Math.abs(dy);
                    if (useWidth) {
                        newHeight = newWidth / aspectRatio;
                    } else {
                        const oldWidth = newWidth;
                        newWidth = newHeight * aspectRatio;
                        newLeft = startLeft + (startWidth - newWidth);
                    }
                }
                break;
                
            case 'handle-w':
                newWidth = Math.max(20, startWidth - dx);
                newLeft = startLeft + (startWidth - newWidth);
                if (preserveRatio) {
                    const oldHeight = newHeight;
                    newHeight = newWidth / aspectRatio;
                    newTop = startTop + (oldHeight - newHeight) / 2;
                }
                break;
                
            case 'handle-nw':
                newWidth = Math.max(20, startWidth - dx);
                newHeight = Math.max(20, startHeight - dy);
                newLeft = startLeft + (startWidth - newWidth);
                newTop = startTop + (startHeight - newHeight);
                if (preserveRatio) {
                    const useWidth = Math.abs(dx) > Math.abs(dy);
                    if (useWidth) {
                        newHeight = newWidth / aspectRatio;
                        newTop = startTop + (startHeight - newHeight);
                    } else {
                        const oldWidth = newWidth;
                        newWidth = newHeight * aspectRatio;
                        newLeft = startLeft + (startWidth - newWidth);
                    }
                }
                break;
                
            case 'handle-n':
                newHeight = Math.max(20, startHeight - dy);
                newTop = startTop + (startHeight - newHeight);
                if (preserveRatio) {
                    const oldWidth = newWidth;
                    newWidth = newHeight * aspectRatio;
                    newLeft = startLeft + (oldWidth - newWidth) / 2;
                }
                break;
                
            case 'handle-ne':
                newWidth = Math.max(20, startWidth + dx);
                newHeight = Math.max(20, startHeight - dy);
                newTop = startTop + (startHeight - newHeight);
                if (preserveRatio) {
                    const useWidth = Math.abs(dx) > Math.abs(dy);
                    if (useWidth) {
                        newHeight = newWidth / aspectRatio;
                        newTop = startTop + (startHeight - newHeight);
                    } else {
                        newWidth = newHeight * aspectRatio;
                    }
                }
                break;
        }
        
        // Apply the new dimensions and position
        element.style.width = `${newWidth}px`;
        element.style.height = `${newHeight}px`;
        element.style.left = `${newLeft}px`;
        element.style.top = `${newTop}px`;
        
        // Update properties panel fields
        updatePropertiesPanelFields();
    }
    
    function handleResizeEnd() {
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', handleResizeEnd);
        
        // Update element state
        const elementId = parseInt(element.dataset.id);
        const currentSlide = AppState.slides[AppState.currentSlideIndex];
        const slideElement = currentSlide.elements.find(el => el.id === elementId);
        
        if (slideElement) {
            slideElement.width = parseInt(element.style.width);
            slideElement.height = parseInt(element.style.height);
            slideElement.x = parseInt(element.style.left);
            slideElement.y = parseInt(element.style.top);
            
            // Trigger element update event
            document.dispatchEvent(new CustomEvent('element-updated', {
                detail: { element: slideElement }
            }));
        }
    }
    
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', handleResizeEnd);
}

// Start rotation operation
function startRotating(e, element) {
    e.preventDefault();
    
    const elementRect = element.getBoundingClientRect();
    const centerX = elementRect.left + elementRect.width / 2;
    const centerY = elementRect.top + elementRect.height / 2;
    
    // Get current rotation or default to 0
    let currentRotation = 0;
    const transform = element.style.transform;
    if (transform) {
        const match = transform.match(/rotate\(([0-9.-]+)deg\)/);
        if (match) {
            currentRotation = parseFloat(match[1]);
        }
    }
    
    // Calculate initial angle
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
    
    function handleRotate(moveEvent) {
        moveEvent.preventDefault();
        
        // Calculate new angle
        const newAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * 180 / Math.PI;
        let rotationAngle = currentRotation + (newAngle - startAngle);
        
        // Snap to 15 degree increments if Shift key is pressed
        if (moveEvent.shiftKey) {
            rotationAngle = Math.round(rotationAngle / 15) * 15;
        }
        
        // Apply rotation
        element.style.transform = `rotate(${rotationAngle}deg)`;
        
        // Update rotation value in properties panel
        const rotationInput = document.getElementById('elementRotation');
        const rotationValue = document.getElementById('rotationValue');
        if (rotationInput) rotationInput.value = Math.round(rotationAngle);
        if (rotationValue) rotationValue.textContent = `${Math.round(rotationAngle)}°`;
    }
    
    function handleRotateEnd() {
        document.removeEventListener('mousemove', handleRotate);
        document.removeEventListener('mouseup', handleRotateEnd);
        
        // Get final rotation
        const transform = element.style.transform;
        let finalRotation = 0;
        if (transform) {
            const match = transform.match(/rotate\(([0-9.-]+)deg\)/);
            if (match) {
                finalRotation = parseFloat(match[1]);
            }
        }
        
        // Update element state
        const elementId = parseInt(element.dataset.id);
        const currentSlide = AppState.slides[AppState.currentSlideIndex];
        const slideElement = currentSlide.elements.find(el => el.id === elementId);
        
        if (slideElement) {
            if (!slideElement.style) slideElement.style = {};
            slideElement.style.transform = `rotate(${finalRotation}deg)`;
            
            // Trigger element update event
            document.dispatchEvent(new CustomEvent('element-updated', {
                detail: { element: slideElement }
            }));
        }
    }
    
    document.addEventListener('mousemove', handleRotate);
    document.addEventListener('mouseup', handleRotateEnd);
}

// Element selection
function selectElement(elementId, element) {
    // Deactivate previously selected element
    document.querySelectorAll('.slide-element.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // New element selection
    element.classList.add('selected');
    
    // App state update
    AppState.selectedElement = {
        elementId,
        elementType: element.dataset.type,
        element
    };
    
    // Properties panel fields update
    updatePropertiesPanelFields();
    
    // Element selection event
    document.dispatchEvent(new CustomEvent('element-selected', {
        detail: AppState.selectedElement
    }));
}

// Properties panel fields update
function updatePropertiesPanelFields() {
    if (!AppState.selectedElement) return;
    
    const elementId = AppState.selectedElement.elementId;
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    const element = currentSlide.elements.find(el => el.id === elementId);
    
    if (!element) return;
    
    // Position and size fields update
    document.getElementById('elementX').value = element.x || 0;
    document.getElementById('elementY').value = element.y || 0;
    document.getElementById('elementWidth').value = element.width || 100;
    document.getElementById('elementHeight').value = element.height || 100;
    
    // Style fields update
    if (element.style) {
        document.getElementById('elementBgColor').value = element.style.backgroundColor || '#ffffff';
        document.getElementById('elementBorderColor').value = element.style.borderColor || '#000000';
        
        // Opacity update
        const opacityValue = Math.round((element.style.opacity || 1) * 100);
        document.getElementById('elementOpacity').value = opacityValue;
        document.getElementById('opacityValue').textContent = `${opacityValue}%`;
        
        // Border update
        document.getElementById('borderWidth').value = parseInt(element.style.borderWidth) || 0;
        document.getElementById('borderStyle').value = element.style.borderStyle || 'none';
        
        // Rotation update
        let rotation = 0;
        if (element.style.transform) {
            const match = element.style.transform.match(/rotate\(([0-9]+)deg\)/);
            if (match) rotation = parseInt(match[1]);
        }
        document.getElementById('elementRotation').value = rotation;
        document.getElementById('rotationValue').textContent = `${rotation}°`;
    }
    
    // Type-specific special fields update
    if (element.type === 'text') {
        document.getElementById('textFontFamily').value = element.style.fontFamily || AppState.currentFontFamily;
        document.getElementById('textFontSize').value = parseInt(element.style.fontSize) || 16;
        document.getElementById('textColor').value = element.style.color || '#000000';
    }
}

// Helper functions
function getCurrentColorPalette() {
    const themeName = AppState.currentTheme || 'modern';
    const colorPalette = AppState.currentColorPalette || 'blue';
    const theme = getThemeByName(themeName);
    
    return theme.colorPalettes[colorPalette] || theme.colorPalettes.blue;
}

function getThemeByName(themeName) {
    // themes.js should be imported
    // Temporary return default color palette
    return {
        colorPalettes: {
            blue: ['#3498db', '#2980b9', '#1f618d', '#154360', '#5dade2']
        }
    };
}

function undo() {
    // index.js should be imported
    console.log('Undo');
}

function redo() {
    // index.js should be imported
    console.log('Redo');
}

function exportPresentation() {
    // index.js should be imported
    console.log('Export');
}

// Update UI state
function updateUIState() {
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

// Update selected element style
function updateSelectedElementStyle(property, value) {
    if (!AppState.selectedElement) return;
    
    // Update element DOM style
    AppState.selectedElement.element.style[property] = value;
    
    // Update element data in slides
    const elementId = AppState.selectedElement.elementId;
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    const element = currentSlide.elements.find(el => el.id === elementId);
    
    if (element) {
        if (!element.style) element.style = {};
        element.style[property] = value;
        
        // Trigger element update event
        document.dispatchEvent(new CustomEvent('element-updated', {
            detail: { element }
        }));
    }
}

// Update selected element position
function updateSelectedElementPosition(axis, value) {
    if (!AppState.selectedElement) return;
    
    // Update element DOM style
    if (axis === 'x') {
        AppState.selectedElement.element.style.left = `${value}px`;
    } else if (axis === 'y') {
        AppState.selectedElement.element.style.top = `${value}px`;
    }
    
    // Update element data in slides
    const elementId = AppState.selectedElement.elementId;
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    const element = currentSlide.elements.find(el => el.id === elementId);
    
    if (element) {
        element[axis] = value;
        
        // Trigger element update event
        document.dispatchEvent(new CustomEvent('element-updated', {
            detail: { element }
        }));
    }
}

// Update selected element size
function updateSelectedElementSize(dimension, value) {
    if (!AppState.selectedElement) return;
    
    // Update element DOM style
    AppState.selectedElement.element.style[dimension] = `${value}px`;
    
    // Update element data in slides
    const elementId = AppState.selectedElement.elementId;
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    const element = currentSlide.elements.find(el => el.id === elementId);
    
    if (element) {
        element[dimension] = value;
        
        // Trigger element update event
        document.dispatchEvent(new CustomEvent('element-updated', {
            detail: { element }
        }));
    }
}

// Apply a slide layout template
function applySlideLayout(layout) {
    if (!AppState.slides[AppState.currentSlideIndex]) return;
    
    const slide = AppState.slides[AppState.currentSlideIndex];
    
    // 기존 요소 삭제
    slide.elements = [];
    
    // 레이아웃에 따른 요소 추가
    switch (layout) {
        case 'blank':
            // 빈 슬라이드 - 요소 없음
            break;
            
        case 'title':
            // Title slide layout
            slide.elements.push({
                id: Date.now(),
                type: 'text',
                content: '프레젠테이션 제목',
                x: 120,
                y: 150,
                width: 720,
                height: 80,
                style: {
                    fontSize: '36px',
                    fontFamily: AppState.currentFontFamily || 'Pretendard',
                    color: '#000000',
                    backgroundColor: 'transparent',
                    textAlign: 'center',
                    fontWeight: 'bold'
                }
            });
            
            slide.elements.push({
                id: Date.now() + 1,
                type: 'text',
                content: '부제목',
                x: 200,
                y: 250,
                width: 560,
                height: 50,
                style: {
                    fontSize: '24px',
                    fontFamily: AppState.currentFontFamily || 'Pretendard',
                    color: '#666666',
                    backgroundColor: 'transparent',
                    textAlign: 'center'
                }
            });
            break;
            
        case 'title-content':
            // Title and content layout
            slide.elements.push({
                id: Date.now(),
                type: 'text',
                content: '슬라이드 제목',
                x: 60,
                y: 40,
                width: 840,
                height: 60,
                style: {
                    fontSize: '28px',
                    fontFamily: AppState.currentFontFamily || 'Pretendard',
                    color: '#000000',
                    backgroundColor: 'transparent',
                    textAlign: 'left',
                    fontWeight: 'bold'
                }
            });
            
            slide.elements.push({
                id: Date.now() + 1,
                type: 'text',
                content: '• 첫 번째 항목\n• 두 번째 항목\n• 세 번째 항목',
                x: 60,
                y: 120,
                width: 840,
                height: 350,
                style: {
                    fontSize: '20px',
                    fontFamily: AppState.currentFontFamily || 'Pretendard',
                    color: '#333333',
                    backgroundColor: 'transparent',
                    textAlign: 'left'
                }
            });
            break;
            
        case 'two-column':
            // Two column layout
            slide.elements.push({
                id: Date.now(),
                type: 'text',
                content: '슬라이드 제목',
                x: 60,
                y: 40,
                width: 840,
                height: 60,
                style: {
                    fontSize: '28px',
                    fontFamily: AppState.currentFontFamily || 'Pretendard',
                    color: '#000000',
                    backgroundColor: 'transparent',
                    textAlign: 'left',
                    fontWeight: 'bold'
                }
            });
            
            slide.elements.push({
                id: Date.now() + 1,
                type: 'text',
                content: '왼쪽 열\n• 항목 1\n• 항목 2\n• 항목 3',
                x: 60,
                y: 120,
                width: 400,
                height: 350,
                style: {
                    fontSize: '20px',
                    fontFamily: AppState.currentFontFamily || 'Pretendard',
                    color: '#333333',
                    backgroundColor: 'transparent',
                    textAlign: 'left'
                }
            });
            
            slide.elements.push({
                id: Date.now() + 2,
                type: 'text',
                content: '오른쪽 열\n• 항목 1\n• 항목 2\n• 항목 3',
                x: 500,
                y: 120,
                width: 400,
                height: 350,
                style: {
                    fontSize: '20px',
                    fontFamily: AppState.currentFontFamily || 'Pretendard',
                    color: '#333333',
                    backgroundColor: 'transparent',
                    textAlign: 'left'
                }
            });
            break;
    }
    
    // Update the UI
    updateCurrentSlide();
    
    // Trigger slides updated event
    document.dispatchEvent(new CustomEvent('slides-updated'));
}

// Setup text formatting buttons
function setupTextFormattingButtons() {
    // Bold button
    document.querySelectorAll('#boldBtn, #textBoldBtn').forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                console.log('Bold button clicked');
                if (AppState.selectedElement && AppState.selectedElement.elementType === 'text') {
                    const element = AppState.selectedElement.element;
                    document.execCommand('bold', false, null);
                    btn.classList.toggle('active');
                    
                    // Update element content in state
                    const elementId = AppState.selectedElement.elementId;
                    const currentSlide = AppState.slides[AppState.currentSlideIndex];
                    const textElement = currentSlide.elements.find(el => el.id === elementId);
                    if (textElement) {
                        textElement.content = element.innerHTML;
                        
                        // Trigger element update event
                        document.dispatchEvent(new CustomEvent('element-updated', {
                            detail: { element: textElement }
                        }));
                    }
                }
            });
        }
    });
    
    // Italic button
    document.querySelectorAll('#italicBtn, #textItalicBtn').forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                console.log('Italic button clicked');
                if (AppState.selectedElement && AppState.selectedElement.elementType === 'text') {
                    const element = AppState.selectedElement.element;
                    document.execCommand('italic', false, null);
                    btn.classList.toggle('active');
                    
                    // Update element content
                    const elementId = AppState.selectedElement.elementId;
                    const currentSlide = AppState.slides[AppState.currentSlideIndex];
                    const textElement = currentSlide.elements.find(el => el.id === elementId);
                    if (textElement) {
                        textElement.content = element.innerHTML;
                        
                        // Trigger element update event
                        document.dispatchEvent(new CustomEvent('element-updated', {
                            detail: { element: textElement }
                        }));
                    }
                }
            });
        }
    });
    
    // Underline button
    document.querySelectorAll('#underlineBtn, #textUnderlineBtn').forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                console.log('Underline button clicked');
                if (AppState.selectedElement && AppState.selectedElement.elementType === 'text') {
                    const element = AppState.selectedElement.element;
                    document.execCommand('underline', false, null);
                    btn.classList.toggle('active');
                    
                    // Update element content
                    const elementId = AppState.selectedElement.elementId;
                    const currentSlide = AppState.slides[AppState.currentSlideIndex];
                    const textElement = currentSlide.elements.find(el => el.id === elementId);
                    if (textElement) {
                        textElement.content = element.innerHTML;
                        
                        // Trigger element update event
                        document.dispatchEvent(new CustomEvent('element-updated', {
                            detail: { element: textElement }
                        }));
                    }
                }
            });
        }
    });
    
    // Font family select
    const fontFamilySelect = document.getElementById('fontFamilySelect');
    if (fontFamilySelect) {
        fontFamilySelect.addEventListener('change', () => {
            console.log('Font family changed');
            if (AppState.selectedElement && AppState.selectedElement.elementType === 'text') {
                const fontFamily = fontFamilySelect.value;
                AppState.selectedElement.element.style.fontFamily = fontFamily;
                
                // Update element style
                updateSelectedElementStyle('fontFamily', fontFamily);
            }
        });
    }
    
    // Font size input
    const fontSizeInput = document.getElementById('fontSizeInput');
    if (fontSizeInput) {
        fontSizeInput.addEventListener('change', () => {
            console.log('Font size changed');
            if (AppState.selectedElement && AppState.selectedElement.elementType === 'text') {
                const fontSize = fontSizeInput.value + 'px';
                AppState.selectedElement.element.style.fontSize = fontSize;
                
                // Update element style
                updateSelectedElementStyle('fontSize', fontSize);
            }
        });
    }
    
    // Increase font size button
    const increaseFontBtn = document.getElementById('increaseFontBtn');
    if (increaseFontBtn) {
        increaseFontBtn.addEventListener('click', () => {
            console.log('Increase font size clicked');
            if (AppState.selectedElement && AppState.selectedElement.elementType === 'text') {
                const fontSizeInput = document.getElementById('fontSizeInput');
                if (fontSizeInput) {
                    const fontSize = parseInt(fontSizeInput.value) + 1;
                    fontSizeInput.value = fontSize;
                    AppState.selectedElement.element.style.fontSize = fontSize + 'px';
                    
                    // Update element style
                    updateSelectedElementStyle('fontSize', fontSize + 'px');
                }
            }
        });
    }
    
    // Decrease font size button
    const decreaseFontBtn = document.getElementById('decreaseFontBtn');
    if (decreaseFontBtn) {
        decreaseFontBtn.addEventListener('click', () => {
            console.log('Decrease font size clicked');
            if (AppState.selectedElement && AppState.selectedElement.elementType === 'text') {
                const fontSizeInput = document.getElementById('fontSizeInput');
                if (fontSizeInput) {
                    const fontSize = Math.max(8, parseInt(fontSizeInput.value) - 1);
                    fontSizeInput.value = fontSize;
                    AppState.selectedElement.element.style.fontSize = fontSize + 'px';
                    
                    // Update element style
                    updateSelectedElementStyle('fontSize', fontSize + 'px');
                }
            }
        });
    }
    
    // Text color input
    const textColor = document.getElementById('textColor');
    if (textColor) {
        textColor.addEventListener('change', (e) => {
            console.log('Text color changed');
            if (AppState.selectedElement && AppState.selectedElement.elementType === 'text') {
                const color = e.target.value;
                AppState.selectedElement.element.style.color = color;
                
                // Update element style
                updateSelectedElementStyle('color', color);
            }
        });
    }
}

// Setup shape buttons
function setupShapeButtons() {
    // Shape menu items for shape modal
    document.querySelectorAll('.shape-item').forEach(item => {
        item.addEventListener('click', () => {
            const shape = item.getAttribute('data-shape');
            console.log(`Shape selected: ${shape}`);
            addShapeElement(shape);
            closeModal(document.getElementById('shapeModal'));
        });
    });
    
    // Shape style controls - add specific handlers for shapes
    // Background color for shapes
    const shapeBgColor = document.getElementById('elementBgColor');
    if (shapeBgColor) {
        shapeBgColor.addEventListener('change', (e) => {
            console.log('Shape background color changed');
            if (AppState.selectedElement && AppState.selectedElement.elementType === 'shape') {
                const color = e.target.value;
                AppState.selectedElement.element.style.backgroundColor = color;
                
                // Update element style
                updateSelectedElementStyle('backgroundColor', color);
            }
        });
    }
    
    // Border color for shapes
    const shapeBorderColor = document.getElementById('elementBorderColor');
    if (shapeBorderColor) {
        shapeBorderColor.addEventListener('change', (e) => {
            console.log('Shape border color changed');
            if (AppState.selectedElement && AppState.selectedElement.elementType === 'shape') {
                const color = e.target.value;
                AppState.selectedElement.element.style.borderColor = color;
                
                // Update element style
                updateSelectedElementStyle('borderColor', color);
            }
        });
    }
    
    // Shadow style for shapes
    const shadowStyle = document.getElementById('shadowStyle');
    if (shadowStyle) {
        shadowStyle.addEventListener('change', (e) => {
            console.log('Shadow style changed');
            if (AppState.selectedElement) {
                const style = e.target.value;
                
                // Apply different shadow styles based on selection
                let shadowValue = 'none';
                switch (style) {
                    case 'light':
                        shadowValue = '2px 2px 4px rgba(0,0,0,0.1)';
                        break;
                    case 'medium':
                        shadowValue = '4px 4px 8px rgba(0,0,0,0.2)';
                        break;
                    case 'strong':
                        shadowValue = '6px 6px 12px rgba(0,0,0,0.3)';
                        break;
                    default:
                        shadowValue = 'none';
                }
                
                // Apply shadow to element
                AppState.selectedElement.element.style.boxShadow = shadowValue;
                
                // Update element style
                updateSelectedElementStyle('boxShadow', shadowValue);
            }
        });
    }
}

// Setup paragraph formatting buttons
function setupParagraphButtons() {
    // Text align left
    document.querySelectorAll('#alignLeftBtn, #textAlignLeftBtn').forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                console.log('Align left clicked');
                if (AppState.selectedElement && AppState.selectedElement.elementType === 'text') {
                    // Remove active class from all alignment buttons
                    document.querySelectorAll('#alignLeftBtn, #alignCenterBtn, #alignRightBtn, #alignJustifyBtn, #textAlignLeftBtn, #textAlignCenterBtn, #textAlignRightBtn, #textAlignJustifyBtn').forEach(b => {
                        b.classList.remove('active');
                    });
                    
                    // Add active class to this button
                    btn.classList.add('active');
                    
                    // Apply alignment
                    AppState.selectedElement.element.style.textAlign = 'left';
                    
                    // Update element style
                    updateSelectedElementStyle('textAlign', 'left');
                }
            });
        }
    });
    
    // Text align center
    document.querySelectorAll('#alignCenterBtn, #textAlignCenterBtn').forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                console.log('Align center clicked');
                if (AppState.selectedElement && AppState.selectedElement.elementType === 'text') {
                    // Remove active class from all alignment buttons
                    document.querySelectorAll('#alignLeftBtn, #alignCenterBtn, #alignRightBtn, #alignJustifyBtn, #textAlignLeftBtn, #textAlignCenterBtn, #textAlignRightBtn, #textAlignJustifyBtn').forEach(b => {
                        b.classList.remove('active');
                    });
                    
                    // Add active class to this button
                    btn.classList.add('active');
                    
                    // Apply alignment
                    AppState.selectedElement.element.style.textAlign = 'center';
                    
                    // Update element style
                    updateSelectedElementStyle('textAlign', 'center');
                }
            });
        }
    });
    
    // Text align right
    document.querySelectorAll('#alignRightBtn, #textAlignRightBtn').forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                console.log('Align right clicked');
                if (AppState.selectedElement && AppState.selectedElement.elementType === 'text') {
                    // Remove active class from all alignment buttons
                    document.querySelectorAll('#alignLeftBtn, #alignCenterBtn, #alignRightBtn, #alignJustifyBtn, #textAlignLeftBtn, #textAlignCenterBtn, #textAlignRightBtn, #textAlignJustifyBtn').forEach(b => {
                        b.classList.remove('active');
                    });
                    
                    // Add active class to this button
                    btn.classList.add('active');
                    
                    // Apply alignment
                    AppState.selectedElement.element.style.textAlign = 'right';
                    
                    // Update element style
                    updateSelectedElementStyle('textAlign', 'right');
                }
            });
        }
    });
    
    // Text align justify
    document.querySelectorAll('#alignJustifyBtn, #textAlignJustifyBtn').forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                console.log('Align justify clicked');
                if (AppState.selectedElement && AppState.selectedElement.elementType === 'text') {
                    // Remove active class from all alignment buttons
                    document.querySelectorAll('#alignLeftBtn, #alignCenterBtn, #alignRightBtn, #alignJustifyBtn, #textAlignLeftBtn, #textAlignCenterBtn, #textAlignRightBtn, #textAlignJustifyBtn').forEach(b => {
                        b.classList.remove('active');
                    });
                    
                    // Add active class to this button
                    btn.classList.add('active');
                    
                    // Apply alignment
                    AppState.selectedElement.element.style.textAlign = 'justify';
                    
                    // Update element style
                    updateSelectedElementStyle('textAlign', 'justify');
                }
            });
        }
    });
    
    // Line height control
    const lineHeightInput = document.getElementById('lineHeightInput');
    if (lineHeightInput) {
        lineHeightInput.addEventListener('change', () => {
            console.log('Line height changed');
            if (AppState.selectedElement && AppState.selectedElement.elementType === 'text') {
                const lineHeight = lineHeightInput.value;
                AppState.selectedElement.element.style.lineHeight = lineHeight;
                
                // Update element style
                updateSelectedElementStyle('lineHeight', lineHeight);
            }
        });
    }
    
    // List style controls
    const bulletListBtn = document.getElementById('bulletListBtn');
    if (bulletListBtn) {
        bulletListBtn.addEventListener('click', () => {
            console.log('Bullet list button clicked');
            if (AppState.selectedElement && AppState.selectedElement.elementType === 'text') {
                document.execCommand('insertUnorderedList', false, null);
                
                // Update element content
                const elementId = AppState.selectedElement.elementId;
                const currentSlide = AppState.slides[AppState.currentSlideIndex];
                const textElement = currentSlide.elements.find(el => el.id === elementId);
                if (textElement) {
                    textElement.content = AppState.selectedElement.element.innerHTML;
                    
                    // Trigger element update event
                    document.dispatchEvent(new CustomEvent('element-updated', {
                        detail: { element: textElement }
                    }));
                }
            }
        });
    }
    
    const numberedListBtn = document.getElementById('numberedListBtn');
    if (numberedListBtn) {
        numberedListBtn.addEventListener('click', () => {
            console.log('Numbered list button clicked');
            if (AppState.selectedElement && AppState.selectedElement.elementType === 'text') {
                document.execCommand('insertOrderedList', false, null);
                
                // Update element content
                const elementId = AppState.selectedElement.elementId;
                const currentSlide = AppState.slides[AppState.currentSlideIndex];
                const textElement = currentSlide.elements.find(el => el.id === elementId);
                if (textElement) {
                    textElement.content = AppState.selectedElement.element.innerHTML;
                    
                    // Trigger element update event
                    document.dispatchEvent(new CustomEvent('element-updated', {
                        detail: { element: textElement }
                    }));
                }
            }
        });
    }
}

// element style controls 코드 아래에 발표자 노트 기능 추가
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

// 상태에서 노트 업데이트
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

// 발표자 모드 설정
function setupPresenterMode() {
    console.log('발표자 모드 설정 중...');
    
    // 발표자 모드 버튼 이벤트
    const presenterViewBtn = document.getElementById('presenterViewBtn');
    const presenterModal = document.getElementById('presenterModal');
    
    if (presenterViewBtn && presenterModal) {
        presenterViewBtn.addEventListener('click', () => {
            // 발표자 모드 모달 열기
            openModal('presenterModal');
            
            // 발표자 모드 초기화
            initPresenterMode();
        });
        
        // 닫기 버튼 이벤트
        const closeBtn = presenterModal.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                closeModal(presenterModal);
                stopPresenterTimer();
            });
        }
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

// 발표자 모드 초기화
function initPresenterMode() {
    // 현재 슬라이드 표시
    updatePresenterView();
    
    // 타이머 초기화
    resetPresenterTimer();
}

// 발표자 뷰 업데이트
function updatePresenterView() {
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
function togglePresenterTimer() {
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

// 타이머 초기화
function resetPresenterTimer() {
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

// 타이머 중지
function stopPresenterTimer() {
    if (presenterTimerRunning) {
        clearInterval(presenterTimerInterval);
        presenterTimerRunning = false;
    }
}

// 키보드 이벤트 처리
function handlePresenterKeydown(event) {
    // 발표자 모드가 열려있지 않으면 무시
    const presenterModal = document.getElementById('presenterModal');
    if (!presenterModal || !presenterModal.classList.contains('show')) return;
    
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
        closeModal(presenterModal);
        stopPresenterTimer();
        event.preventDefault();
    }
} 