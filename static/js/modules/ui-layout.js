/**
 * UI Layout module to handle workspace layout, panels and toolbars
 */

import { AppState } from '../index.js';

// Initialize layout components
export function initLayout() {
    console.log('UI 레이아웃 초기화 중...');
    
    setupQuickAccessToolbar();
    setupWorkspaceLayout();
    setupPropertiesPanel();
    
    console.log('UI 레이아웃 초기화 완료');
}

// Setup Quick Access Toolbar
function setupQuickAccessToolbar() {
    console.log('빠른 실행 도구 모음 설정 중...');
    
    const quickAccessToolbar = document.querySelector('.quick-access-toolbar');
    if (!quickAccessToolbar) return;
    
    // Add frequently used buttons
    const quickButtons = [
        { icon: 'save', title: '저장', action: 'savePresentation' },
        { icon: 'undo', title: '실행 취소', action: 'undo' },
        { icon: 'redo', title: '다시 실행', action: 'redo' },
        { icon: 'plus', title: '새 슬라이드', action: 'addNewSlide' },
        { icon: 'play', title: '슬라이드쇼 시작', action: 'startSlideshow' },
        { icon: 'magic', title: 'AI 분석', action: 'analyzePresentation' }
    ];
    
    quickButtons.forEach(button => {
        const btnElement = document.createElement('button');
        btnElement.className = 'quick-button';
        btnElement.title = button.title;
        btnElement.innerHTML = `<i class="fas fa-${button.icon}"></i>`;
        
        btnElement.addEventListener('click', () => {
            // Execute the corresponding action
            if (typeof window[button.action] === 'function') {
                window[button.action]();
            } else if (typeof window.AppState[button.action] === 'function') {
                window.AppState[button.action]();
            } else {
                // Try to import from index.js
                import('../index.js').then(module => {
                    if (typeof module[button.action] === 'function') {
                        module[button.action]();
                    } else {
                        console.warn(`Function ${button.action} not found`);
                    }
                });
            }
        });
        
        quickAccessToolbar.appendChild(btnElement);
    });
    
    console.log('빠른 실행 도구 모음 설정 완료');
}

// Setup workspace layout
function setupWorkspaceLayout() {
    console.log('작업 영역 레이아웃 설정 중...');
    
    // Get workspace elements
    const workspace = document.querySelector('.workspace');
    const slideExplorer = document.querySelector('.slide-explorer');
    const slideEditor = document.querySelector('.slide-editor');
    const propertiesPanel = document.querySelector('.properties-panel');
    
    if (!workspace || !slideExplorer || !slideEditor || !propertiesPanel) return;
    
    // Add resizable handles
    addResizableHandle(slideExplorer, 'right');
    addResizableHandle(propertiesPanel, 'left');
    
    // Add layout toggle buttons
    const layoutToggleContainer = document.createElement('div');
    layoutToggleContainer.className = 'layout-toggle-container';
    layoutToggleContainer.innerHTML = `
        <button class="layout-toggle" data-layout="standard" title="표준 레이아웃">
            <i class="fas fa-columns"></i>
        </button>
        <button class="layout-toggle" data-layout="maximized" title="편집기 최대화">
            <i class="fas fa-expand"></i>
        </button>
        <button class="layout-toggle" data-layout="presentation" title="발표자 보기">
            <i class="fas fa-desktop"></i>
        </button>
    `;
    
    workspace.appendChild(layoutToggleContainer);
    
    // Add layout toggle event listeners
    document.querySelectorAll('.layout-toggle').forEach(button => {
        button.addEventListener('click', () => {
            const layout = button.getAttribute('data-layout');
            applyWorkspaceLayout(layout);
            
            // Update active button
            document.querySelectorAll('.layout-toggle').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
        });
    });
    
    // Set default layout
    document.querySelector('.layout-toggle[data-layout="standard"]').classList.add('active');
    
    // Load saved layout preference
    const savedLayout = localStorage.getItem('workspace-layout');
    if (savedLayout) {
        applyWorkspaceLayout(savedLayout);
        document.querySelector(`.layout-toggle[data-layout="${savedLayout}"]`)?.classList.add('active');
    }
    
    console.log('작업 영역 레이아웃 설정 완료');
}

// Add resizable handle to element
function addResizableHandle(element, direction) {
    const handle = document.createElement('div');
    handle.className = `resize-handle resize-handle-${direction}`;
    element.appendChild(handle);
    
    let startX, startWidth, startHeight;
    
    handle.addEventListener('mousedown', e => {
        e.preventDefault();
        startX = e.clientX;
        startWidth = element.offsetWidth;
        
        document.addEventListener('mousemove', resizeMove);
        document.addEventListener('mouseup', resizeEnd);
    });
    
    function resizeMove(e) {
        if (direction === 'right') {
            const width = startWidth + (e.clientX - startX);
            element.style.width = `${Math.max(150, Math.min(400, width))}px`;
        } else if (direction === 'left') {
            const width = startWidth - (e.clientX - startX);
            element.style.width = `${Math.max(150, Math.min(400, width))}px`;
        }
    }
    
    function resizeEnd() {
        document.removeEventListener('mousemove', resizeMove);
        document.removeEventListener('mouseup', resizeEnd);
        
        // Save layout preferences
        localStorage.setItem(`${element.className}-width`, element.style.width);
    }
    
    // Load saved preferences
    const savedWidth = localStorage.getItem(`${element.className}-width`);
    if (savedWidth) {
        element.style.width = savedWidth;
    }
}

// Apply workspace layout
export function applyWorkspaceLayout(layout) {
    const workspace = document.querySelector('.workspace');
    const slideExplorer = document.querySelector('.slide-explorer');
    const slideEditor = document.querySelector('.slide-editor');
    const propertiesPanel = document.querySelector('.properties-panel');
    
    if (!workspace || !slideExplorer || !slideEditor || !propertiesPanel) return;
    
    // Reset classes
    workspace.classList.remove('layout-standard', 'layout-maximized', 'layout-presentation');
    
    // Apply layout
    switch (layout) {
        case 'standard':
            workspace.classList.add('layout-standard');
            slideExplorer.style.display = 'block';
            propertiesPanel.style.display = 'block';
            break;
            
        case 'maximized':
            workspace.classList.add('layout-maximized');
            slideExplorer.style.display = 'none';
            propertiesPanel.style.display = 'none';
            break;
            
        case 'presentation':
            workspace.classList.add('layout-presentation');
            slideExplorer.style.display = 'none';
            propertiesPanel.style.display = 'none';
            // Display presenter view
            document.getElementById('presenterViewBtn')?.click();
            break;
    }
    
    // Save preference
    localStorage.setItem('workspace-layout', layout);
}

// Setup properties panel with all necessary controls
function setupPropertiesPanel() {
    console.log('속성 패널 설정 중...');
    
    const propertiesPanel = document.querySelector('.properties-panel');
    if (!propertiesPanel) return;
    
    // Make sure the shape properties section exists
    let shapeInput = document.getElementById('shapeInputContainer');
    
    // If the shape input container doesn't exist, create it
    if (!shapeInput) {
        const formatPanel = document.querySelector('.panel-content[data-panel="format"]');
        if (formatPanel) {
            // Create shape properties section
            const shapeSection = document.createElement('div');
            shapeSection.id = 'shapeInputContainer';
            shapeSection.className = 'panel-section';
            shapeSection.style.display = 'none'; // Hidden by default
            
            shapeSection.innerHTML = `
                <h4>도형 스타일</h4>
                
                <div class="input-group">
                    <label>내부 색상</label>
                    <input type="color" id="fillColor" title="내부 색상">
                </div>
                
                <div class="slider-group">
                    <label>불투명도</label>
                    <input type="range" id="fillOpacity" min="0" max="100" value="100">
                    <span id="fillOpacityValue">100%</span>
                </div>
                
                <div class="input-group">
                    <label>테두리 색상</label>
                    <input type="color" id="borderColor" title="테두리 색상">
                </div>
                
                <div class="slider-group">
                    <label>테두리 두께</label>
                    <input type="range" id="borderWidth" min="0" max="10" value="1">
                    <span id="borderWidthValue">1px</span>
                </div>
                
                <div class="button-group" style="margin-top: 15px;">
                    <button id="addTextToShapeBtn" class="btn-secondary" style="width: 100%;">
                        <i class="fas fa-font"></i> 텍스트 추가
                    </button>
                </div>
            `;
            
            formatPanel.appendChild(shapeSection);
        }
    }
    
    // Make sure the text properties section exists
    let textInput = document.getElementById('textInputContainer');
    
    // If text input container doesn't exist, create it
    if (!textInput) {
        const formatPanel = document.querySelector('.panel-content[data-panel="format"]');
        if (formatPanel) {
            // Create text properties section
            const textSection = document.createElement('div');
            textSection.id = 'textInputContainer';
            textSection.className = 'panel-section';
            textSection.style.display = 'none'; // Hidden by default
            
            textSection.innerHTML = `
                <h4>텍스트 서식</h4>
                
                <div class="input-group">
                    <label>텍스트 색상</label>
                    <input type="color" id="textColor" title="텍스트 색상">
                </div>
                
                <div class="select-group">
                    <label>글꼴 크기</label>
                    <select id="fontSize">
                        <option value="10px">10px</option>
                        <option value="12px">12px</option>
                        <option value="14px">14px</option>
                        <option value="16px" selected>16px</option>
                        <option value="18px">18px</option>
                        <option value="20px">20px</option>
                        <option value="24px">24px</option>
                        <option value="28px">28px</option>
                        <option value="32px">32px</option>
                        <option value="36px">36px</option>
                        <option value="48px">48px</option>
                        <option value="64px">64px</option>
                    </select>
                </div>
                
                <div class="input-group" style="margin-top: 10px;">
                    <label>정렬</label>
                    <div class="button-group">
                        <button id="alignLeft" class="format-btn" title="왼쪽 정렬">
                            <i class="fas fa-align-left"></i>
                        </button>
                        <button id="alignCenter" class="format-btn active" title="가운데 정렬">
                            <i class="fas fa-align-center"></i>
                        </button>
                        <button id="alignRight" class="format-btn" title="오른쪽 정렬">
                            <i class="fas fa-align-right"></i>
                        </button>
                    </div>
                </div>
            `;
            
            formatPanel.appendChild(textSection);
        }
    }
    
    console.log('속성 패널 설정 완료');
} 