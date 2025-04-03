/**
 * UI Core module to handle basic PowerPoint-like interface initialization
 */

import { AppState, addNewSlide, duplicateCurrentSlide, deleteSelectedElement, deleteCurrentSlide, undo, redo, exportPresentation } from '../index.js';
import { getThemeByName, getCurrentColorPalette, changeSlideBackground, applyThemeToAll } from './themes.js';
import { addNewTextbox, addNewShape, addNewImage, addNewTable, addNewChart } from './elements.js';

// Initialize core UI components
export function initCoreUI() {
    console.log('Initializing PowerPoint-style UI core components');
    
    // Basic UI setup
    setupRibbonTabs();
    setupFormatPanel();
    setupStickyMenuBar();
    
    // Setup event listeners
    setupButtonEvents();
    setupModalEvents();
    setupIndependentScroll();
    
    // Initialize other components that might depend on these
    initMoreActions();
    
    console.log('Core UI initialization completed');
}

// Additional initialization for miscellaneous actions
function initMoreActions() {
    // Set up undo/redo shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+Z or Command+Z for Undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undo();
        }
        
        // Ctrl+Y or Command+Shift+Z for Redo
        if (((e.ctrlKey || e.metaKey) && e.key === 'y') || 
            ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
            e.preventDefault();
            redo();
        }
    });
    
    // Initialize any tooltips
    setupTooltips();
}

// Set up tooltips for better usability
function setupTooltips() {
    const buttons = document.querySelectorAll('[title]');
    buttons.forEach(button => {
        // This is a simplified tooltip approach
        // A real implementation would use a proper tooltip library
        button.addEventListener('mouseenter', (e) => {
            if (!button.title) return;
            
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = button.title;
            document.body.appendChild(tooltip);
            
            const rect = button.getBoundingClientRect();
            tooltip.style.left = `${rect.left + rect.width/2 - tooltip.offsetWidth/2}px`;
            tooltip.style.top = `${rect.bottom + 5}px`;
            
            button.setAttribute('data-tooltip-id', Date.now());
            tooltip.setAttribute('data-for', button.getAttribute('data-tooltip-id'));
        });
        
        button.addEventListener('mouseleave', () => {
            const tooltipId = button.getAttribute('data-tooltip-id');
            if (!tooltipId) return;
            
            const tooltip = document.querySelector(`.tooltip[data-for="${tooltipId}"]`);
            if (tooltip) {
                document.body.removeChild(tooltip);
            }
        });
    });
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
            const ribbonContent = document.getElementById(`${tabName}-ribbon`);
            if (ribbonContent) {
                ribbonContent.classList.add('active');
                
                // Setup submenu buttons if this is a newly activated ribbon
                setupSubmenuButtons(tabName, ribbonContent);
            }
        });
    });
    
    // Initial setup of the home tab submenu buttons
    const homeRibbon = document.getElementById('home-ribbon');
    if (homeRibbon) {
        setupSubmenuButtons('home', homeRibbon);
    }
}

// Setup buttons within each ribbon tab
function setupSubmenuButtons(tabName, ribbonContent) {
    console.log(`Setting up submenu buttons for ${tabName} tab`);
    
    // Setup common button handlers
    const buttons = ribbonContent.querySelectorAll('.ribbon-button');
    buttons.forEach(button => {
        // Only add listeners if they don't already exist
        if (!button.hasAttribute('data-handler-attached')) {
            button.setAttribute('data-handler-attached', 'true');
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const buttonId = button.id;
                console.log(`Button clicked: ${buttonId}`);
                
                // Handle based on button ID
                handleButtonAction(buttonId, button);
            });
        }
    });
    
    // Special handlers for dropdown selects
    const selects = ribbonContent.querySelectorAll('select');
    selects.forEach(select => {
        if (!select.hasAttribute('data-handler-attached')) {
            select.setAttribute('data-handler-attached', 'true');
            
            select.addEventListener('change', () => {
                handleSelectChange(select.id, select.value);
            });
        }
    });
    
    // Handle format buttons
    const formatButtons = ribbonContent.querySelectorAll('.format-btn');
    formatButtons.forEach(btn => {
        if (!btn.hasAttribute('data-handler-attached')) {
            btn.setAttribute('data-handler-attached', 'true');
            
            btn.addEventListener('click', () => {
                // Toggle active class for format buttons
                if (btn.classList.contains('toggle-btn')) {
                    btn.classList.toggle('active');
                }
                handleFormatButtonAction(btn.id);
            });
        }
    });
}

// Handle button actions based on ID
function handleButtonAction(buttonId, button) {
    console.log(`Button clicked: ${buttonId}`);
    
    try {
        switch (buttonId) {
            // File tab
            case 'newPresentationBtn':
                if (confirm('Create a new presentation? Current work will be lost if not saved.')) {
                    window.location.reload();
                }
                break;
                
            case 'openPresentationBtn':
                // Create and click a file input
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = '.pptx,.json';
                fileInput.style.display = 'none';
                document.body.appendChild(fileInput);
                fileInput.click();
                fileInput.addEventListener('change', (e) => {
                    if (e.target.files && e.target.files[0]) {
                        // Code to load the file would go here
                        alert('File loading not fully implemented yet.');
                    }
                    document.body.removeChild(fileInput);
                });
                break;
                
            case 'savePresentationBtn':
                exportPresentation('json');
                break;
                
            case 'exportPptxBtn':
                exportPresentation('pptx');
                break;
                
            case 'exportPdfBtn':
                exportPresentation('pdf');
                break;
                
            case 'printBtn':
                window.print();
                break;
                
            case 'shareBtn':
                // Create and show a simple share dialog
                alert('Sharing functionality would open a dialog with options.');
                break;
                
            // Home tab
            case 'newSlideBtn':
                addNewSlide();
                break;
                
            case 'duplicateSlideBtn':
                duplicateCurrentSlide();
                break;
                
            case 'deleteSlideBtn':
                if (confirm('Delete the current slide?')) {
                    deleteCurrentSlide();
                }
                break;
                
            case 'addTextBtn':
                addNewTextbox();
                break;
                
            case 'addShapeBtn':
                openShapeMenu(button);
                break;
                
            case 'addImageBtn':
                openImageUploader();
                break;
                
            case 'addTableBtn':
                openTableDialog();
                break;
                
            case 'addChartBtn':
                openChartDialog();
                break;
                
            case 'addWordArtBtn':
                addWordArt();
                break;
                
            case 'addCommentBtn':
                addComment();
                break;
                
            case 'bringForwardBtn':
                bringElementToFront();
                break;
                
            case 'sendBackwardBtn':
                sendElementToBack();
                break;
                
            case 'deleteElementBtn':
                deleteSelectedElement();
                break;
                
            // View tab
            case 'slideShowBtn':
                startSlideshow();
                break;
                
            case 'toggleAIBtn':
                toggleAIAssistant();
                break;
                
            // Default for all others
            default:
                console.log(`No direct handler for ${buttonId}`);
                break;
        }
    } catch (error) {
        console.error(`Error handling button ${buttonId}:`, error);
        alert(`An error occurred: ${error.message}`);
    }
}

// Generic handler for buttons where real implementation is in other modules
function handleGenericButtonAction(buttonId) {
    // Try to find if there's a function with the same name as the button ID
    // This allows for more dynamic handling of button actions
    const functionName = buttonId.replace(/Btn$/, '');
    
    // Look for this function in the global scope or in imported modules
    if (typeof window[functionName] === 'function') {
        window[functionName]();
    } else if (typeof window.aiActions?.[functionName] === 'function') {
        window.aiActions[functionName]();
    } else {
        console.warn(`No implementation found for ${buttonId}`);
        // Only show alert during development
        if (isDevMode()) {
            alert(`This feature (${buttonId}) is not yet fully implemented.`);
        }
    }
}

// Check if we're in development mode
function isDevMode() {
    return localStorage.getItem('devMode') === 'true' || location.hostname === 'localhost';
}

// Element manipulation functions
function bringElementToFront() {
    if (!AppState.selectedElement) {
        console.log('No element selected');
        return;
    }
    
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    if (!currentSlide) return;
    
    const elements = currentSlide.elements;
    const selectedIndex = elements.findIndex(el => el.id === AppState.selectedElement.id);
    
    if (selectedIndex !== -1 && selectedIndex < elements.length - 1) {
        // Remove the element from its current position
        const element = elements.splice(selectedIndex, 1)[0];
        // Add it at the end (top) of the elements array
        elements.push(element);
        
        // Update AppState and trigger render
        AppState.selectedElement = element;
        const event = new CustomEvent('slide-updated');
        document.dispatchEvent(event);
    }
}

function sendElementToBack() {
    if (!AppState.selectedElement) {
        console.log('No element selected');
        return;
    }
    
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    if (!currentSlide) return;
    
    const elements = currentSlide.elements;
    const selectedIndex = elements.findIndex(el => el.id === AppState.selectedElement.id);
    
    if (selectedIndex !== -1 && selectedIndex > 0) {
        // Remove the element from its current position
        const element = elements.splice(selectedIndex, 1)[0];
        // Add it at the beginning (bottom) of the elements array
        elements.unshift(element);
        
        // Update AppState and trigger render
        AppState.selectedElement = element;
        const event = new CustomEvent('slide-updated');
        document.dispatchEvent(event);
    }
}

// Dialog and menu openers
function openShapeMenu(button) {
    // Create a shape menu near the button
    const shapeMenu = document.createElement('div');
    shapeMenu.className = 'shape-menu';
    shapeMenu.innerHTML = `
        <div class="shape-menu-header">Select a Shape</div>
        <div class="shape-options">
            <div class="shape-option" data-shape="rectangle"><div class="shape-preview rectangle"></div>Rectangle</div>
            <div class="shape-option" data-shape="circle"><div class="shape-preview circle"></div>Circle</div>
            <div class="shape-option" data-shape="triangle"><div class="shape-preview triangle"></div>Triangle</div>
            <div class="shape-option" data-shape="arrow"><div class="shape-preview arrow"></div>Arrow</div>
            <div class="shape-option" data-shape="star"><div class="shape-preview star"></div>Star</div>
        </div>
    `;
    
    // Position the menu
    const rect = button.getBoundingClientRect();
    shapeMenu.style.position = 'absolute';
    shapeMenu.style.top = `${rect.bottom + 5}px`;
    shapeMenu.style.left = `${rect.left}px`;
    shapeMenu.style.zIndex = '1000';
    
    // Add it to the document
    document.body.appendChild(shapeMenu);
    
    // Close menu when clicking outside
    const closeMenu = (e) => {
        if (!shapeMenu.contains(e.target) && e.target !== button) {
            document.body.removeChild(shapeMenu);
            document.removeEventListener('click', closeMenu);
        }
    };
    
    // Prevent immediate close
    setTimeout(() => {
        document.addEventListener('click', closeMenu);
    }, 100);
    
    // Handle shape selection
    const shapeOptions = shapeMenu.querySelectorAll('.shape-option');
    shapeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const shapeType = option.getAttribute('data-shape');
            addNewShape(shapeType);
            document.body.removeChild(shapeMenu);
        });
    });
}

function openImageUploader() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    
    input.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            const formData = new FormData();
            formData.append('image', file);
            
            fetch('/upload_image', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    addNewImage(data.image_url);
                } else {
                    console.error('Image upload failed:', data.error);
                    alert('Failed to upload image: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error uploading image:', error);
                alert('Error uploading image. Please try again.');
            });
        }
        
        // Remove the input from the DOM
        document.body.removeChild(input);
    });
    
    document.body.appendChild(input);
    input.click();
}

function openTableDialog() {
    // Create a temporary table size selector
    const tableDialog = document.createElement('div');
    tableDialog.className = 'table-dialog';
    tableDialog.innerHTML = `
        <div class="table-dialog-header">Insert Table</div>
        <div class="table-size-selector">
            <div class="table-size-display">
                <span class="table-size-label">5 × 5</span>
            </div>
            <div class="table-grid-container">
                ${Array(10).fill().map((_, i) => 
                    Array(10).fill().map((_, j) => 
                        `<div class="table-cell" data-row="${i+1}" data-col="${j+1}"></div>`
                    ).join('')
                ).join('')}
            </div>
        </div>
        <div class="table-dialog-footer">
            <button class="table-cancel-btn">Cancel</button>
            <button class="table-insert-btn">Insert</button>
        </div>
    `;
    
    // Position the dialog
    tableDialog.style.position = 'fixed';
    tableDialog.style.top = '50%';
    tableDialog.style.left = '50%';
    tableDialog.style.transform = 'translate(-50%, -50%)';
    tableDialog.style.zIndex = '1000';
    
    // Add to document
    document.body.appendChild(tableDialog);
    
    // Track selected size
    let selectedRows = 5;
    let selectedCols = 5;
    
    // Highlight cells on hover
    const cells = tableDialog.querySelectorAll('.table-cell');
    cells.forEach(cell => {
        cell.addEventListener('mouseover', () => {
            const row = parseInt(cell.getAttribute('data-row'));
            const col = parseInt(cell.getAttribute('data-col'));
            
            // Update size display
            tableDialog.querySelector('.table-size-label').textContent = `${row} × ${col}`;
            
            // Highlight cells
            cells.forEach(c => {
                const cRow = parseInt(c.getAttribute('data-row'));
                const cCol = parseInt(c.getAttribute('data-col'));
                
                if (cRow <= row && cCol <= col) {
                    c.classList.add('highlighted');
                } else {
                    c.classList.remove('highlighted');
                }
            });
            
            // Update selected size
            selectedRows = row;
            selectedCols = col;
        });
    });
    
    // Handle button clicks
    tableDialog.querySelector('.table-cancel-btn').addEventListener('click', () => {
        document.body.removeChild(tableDialog);
    });
    
    tableDialog.querySelector('.table-insert-btn').addEventListener('click', () => {
        addNewTable(selectedRows, selectedCols);
        document.body.removeChild(tableDialog);
    });
    
    // Allow clicking on cells directly
    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            const row = parseInt(cell.getAttribute('data-row'));
            const col = parseInt(cell.getAttribute('data-col'));
            addNewTable(row, col);
            document.body.removeChild(tableDialog);
        });
    });
}

function openChartDialog() {
    // Create a chart type selector dialog
    const chartDialog = document.createElement('div');
    chartDialog.className = 'chart-dialog';
    chartDialog.innerHTML = `
        <div class="chart-dialog-header">Insert Chart</div>
        <div class="chart-type-selector">
            <div class="chart-type" data-type="bar">
                <div class="chart-preview bar-chart-preview"></div>
                <span>Bar</span>
            </div>
            <div class="chart-type" data-type="line">
                <div class="chart-preview line-chart-preview"></div>
                <span>Line</span>
            </div>
            <div class="chart-type" data-type="pie">
                <div class="chart-preview pie-chart-preview"></div>
                <span>Pie</span>
            </div>
            <div class="chart-type" data-type="scatter">
                <div class="chart-preview scatter-chart-preview"></div>
                <span>Scatter</span>
            </div>
            <div class="chart-type" data-type="area">
                <div class="chart-preview area-chart-preview"></div>
                <span>Area</span>
            </div>
        </div>
        <div class="chart-dialog-footer">
            <button class="chart-cancel-btn">Cancel</button>
        </div>
    `;
    
    // Position the dialog
    chartDialog.style.position = 'fixed';
    chartDialog.style.top = '50%';
    chartDialog.style.left = '50%';
    chartDialog.style.transform = 'translate(-50%, -50%)';
    chartDialog.style.zIndex = '1000';
    
    // Add to document
    document.body.appendChild(chartDialog);
    
    // Handle chart type selection
    const chartTypes = chartDialog.querySelectorAll('.chart-type');
    chartTypes.forEach(type => {
        type.addEventListener('click', () => {
            const chartType = type.getAttribute('data-type');
            addNewChart(chartType);
            document.body.removeChild(chartDialog);
        });
    });
    
    // Handle cancel button
    chartDialog.querySelector('.chart-cancel-btn').addEventListener('click', () => {
        document.body.removeChild(chartDialog);
    });
}

// Custom function implementations that were previously placeholders
function addWordArt() {
    console.log('Adding WordArt element');
    // A temporary implementation that adds styled text
    addNewTextbox({
        content: 'WordArt Text',
        style: {
            fontSize: 36,
            fontWeight: 'bold',
            fontFamily: 'Impact',
            color: '#1e88e5',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            textAlign: 'center',
            letterSpacing: '2px',
            transform: 'rotate(-10deg)'
        }
    });
}

function addComment() {
    console.log('Adding comment');
    // Implementation would create a comment tied to the current selection or slide
    if (!AppState.selectedElement) {
        alert('Please select an element to add a comment to');
        return;
    }
    
    // Create a simple comment dialog
    const commentDialog = document.createElement('div');
    commentDialog.className = 'comment-dialog';
    commentDialog.innerHTML = `
        <div class="comment-dialog-header">Add Comment</div>
        <div class="comment-content">
            <textarea id="commentText" placeholder="Enter your comment here..."></textarea>
        </div>
        <div class="comment-dialog-footer">
            <button class="comment-cancel-btn">Cancel</button>
            <button class="comment-save-btn">Save</button>
        </div>
    `;
    
    // Position the dialog
    commentDialog.style.position = 'fixed';
    commentDialog.style.top = '50%';
    commentDialog.style.left = '50%';
    commentDialog.style.transform = 'translate(-50%, -50%)';
    commentDialog.style.zIndex = '1000';
    
    // Add to document
    document.body.appendChild(commentDialog);
    
    // Handle cancel button
    commentDialog.querySelector('.comment-cancel-btn').addEventListener('click', () => {
        document.body.removeChild(commentDialog);
    });
    
    // Handle save button
    commentDialog.querySelector('.comment-save-btn').addEventListener('click', () => {
        const commentText = document.getElementById('commentText').value.trim();
        if (commentText) {
            if (!AppState.comments) {
                AppState.comments = {};
            }
            
            if (!AppState.comments[AppState.selectedElement.id]) {
                AppState.comments[AppState.selectedElement.id] = [];
            }
            
            AppState.comments[AppState.selectedElement.id].push({
                id: 'comment_' + Date.now(),
                text: commentText,
                timestamp: new Date().toISOString(),
                author: 'User'
            });
            
            // Show confirmation
            alert('Comment added successfully');
        }
        
        document.body.removeChild(commentDialog);
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

// Function to toggle AI Assistant
function toggleAIAssistant() {
    console.log('Toggling AI Assistant');
    
    // Get the AI panel if it exists or create it
    let aiPanel = document.querySelector('.ai-assistant-panel');
    
    if (!aiPanel) {
        // Create the AI assistant panel if it doesn't exist
        aiPanel = document.createElement('div');
        aiPanel.className = 'ai-assistant-panel';
        aiPanel.innerHTML = `
            <div class="ai-panel-header">
                <h3>AI Assistant</h3>
                <button class="ai-panel-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="ai-panel-content">
                <div class="ai-tabs">
                    <div class="ai-tab active" data-tab="suggestions">Suggestions</div>
                    <div class="ai-tab" data-tab="generate">Generate</div>
                    <div class="ai-tab" data-tab="analyze">Analyze</div>
                </div>
                <div class="ai-tab-content active" id="suggestions-tab">
                    <p class="ai-intro">AI suggestions for your presentation:</p>
                    <div class="ai-suggestion-list">
                        <div class="ai-suggestion">
                            <div class="ai-suggestion-title">Add a title slide</div>
                            <div class="ai-suggestion-desc">Start with a clear title slide to introduce your topic.</div>
                            <button class="ai-apply-btn" data-action="title-slide">Apply</button>
                        </div>
                        <div class="ai-suggestion">
                            <div class="ai-suggestion-title">Add an agenda</div>
                            <div class="ai-suggestion-desc">Include an agenda to outline what you'll cover.</div>
                            <button class="ai-apply-btn" data-action="agenda-slide">Apply</button>
                        </div>
                        <div class="ai-suggestion">
                            <div class="ai-suggestion-title">Balance text content</div>
                            <div class="ai-suggestion-desc">Avoid too much text on each slide.</div>
                            <button class="ai-analyze-btn" data-action="analyze-text">Analyze</button>
                        </div>
                    </div>
                </div>
                <div class="ai-tab-content" id="generate-tab">
                    <p class="ai-intro">Generate content with AI:</p>
                    <div class="ai-generate-controls">
                        <select class="ai-generate-type">
                            <option value="slide">Single Slide</option>
                            <option value="template">Full Template</option>
                            <option value="bullet">Bullet Points</option>
                            <option value="chart">Chart Data</option>
                        </select>
                        <textarea class="ai-prompt" placeholder="Describe what you want to generate..."></textarea>
                        <button class="ai-generate-btn">Generate</button>
                    </div>
                </div>
                <div class="ai-tab-content" id="analyze-tab">
                    <p class="ai-intro">Analyze your presentation:</p>
                    <div class="ai-analyze-controls">
                        <button class="ai-analyze-btn" data-type="slide">Analyze Current Slide</button>
                        <button class="ai-analyze-btn" data-type="presentation">Analyze Full Presentation</button>
                        <button class="ai-analyze-btn" data-type="design">Check Design Consistency</button>
                        <button class="ai-analyze-btn" data-type="readability">Check Readability</button>
                    </div>
                    <div class="ai-analysis-result"></div>
                </div>
            </div>
        `;
        
        // Add the panel to the document
        document.querySelector('.workspace').appendChild(aiPanel);
        
        // Add event listeners for the AI panel functionality
        setupAIPanel(aiPanel);
    }
    
    // Toggle the AI panel visibility
    aiPanel.classList.toggle('active');
    
    // Toggle the button state
    const aiToggleBtn = document.getElementById('toggleAIBtn');
    if (aiToggleBtn) {
        aiToggleBtn.classList.toggle('active');
    }
    
    // Save the state to the server
    fetch('/toggle_extension', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            extension: 'ai',
            enabled: aiPanel.classList.contains('active')
        })
    })
    .catch(error => {
        console.error('Error toggling AI extension:', error);
    });
}

// Setup AI panel event listeners and functionality
function setupAIPanel(aiPanel) {
    // Close button
    aiPanel.querySelector('.ai-panel-close').addEventListener('click', () => {
        aiPanel.classList.remove('active');
        // Update button state
        const aiToggleBtn = document.getElementById('toggleAIBtn');
        if (aiToggleBtn) {
            aiToggleBtn.classList.remove('active');
        }
    });
    
    // Tab switching
    const aiTabs = aiPanel.querySelectorAll('.ai-tab');
    aiTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            aiTabs.forEach(t => t.classList.remove('active'));
            aiPanel.querySelectorAll('.ai-tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const tabName = tab.getAttribute('data-tab');
            aiPanel.querySelector(`#${tabName}-tab`).classList.add('active');
        });
    });
    
    // Handle suggestion buttons
    const applyButtons = aiPanel.querySelectorAll('.ai-apply-btn');
    applyButtons.forEach(btn => {
        btn.addEventListener('click', e => {
            const action = e.target.getAttribute('data-action');
            
            if (action === 'title-slide') {
                addTitleSlide();
                showNotification('Added a title slide', 'success');
            } else if (action === 'agenda-slide') {
                addAgendaSlide();
                showNotification('Added an agenda slide', 'success');
            } else {
                showNotification('Action not implemented', 'warning');
            }
        });
    });
    
    // Handle analyze buttons
    const analyzeButtons = aiPanel.querySelectorAll('.ai-analyze-btn');
    analyzeButtons.forEach(btn => {
        btn.addEventListener('click', e => {
            const type = btn.getAttribute('data-type') || '';
            const action = btn.getAttribute('data-action') || '';
            
            // Show analyzing message
            const resultContainer = aiPanel.querySelector('.ai-analysis-result');
            if (resultContainer) {
                resultContainer.innerHTML = '<div class="ai-loading">Analyzing...</div>';
            }
            
            // Simulate analysis with timeout
            setTimeout(() => {
                if (resultContainer) {
                    // Show fake analysis result based on type
                    if (type === 'slide' || action === 'analyze-text') {
                        resultContainer.innerHTML = `
                            <div class="ai-analysis-item">
                                <h4>Slide Analysis</h4>
                                <div class="ai-score good">Good readability</div>
                                <div class="ai-score average">Average visual balance</div>
                                <div class="ai-score poor">Too much text</div>
                                <p>Recommendation: Consider using bullet points or breaking into multiple slides.</p>
                            </div>
                        `;
                    } else if (type === 'presentation') {
                        resultContainer.innerHTML = `
                            <div class="ai-analysis-item">
                                <h4>Presentation Structure</h4>
                                <p>Your presentation has ${AppState.slides.length} slides.</p>
                                <div class="ai-score good">Has title slide</div>
                                <div class="ai-score poor">Missing agenda</div>
                                <div class="ai-score poor">Missing conclusion</div>
                                <p>Recommendation: Add an agenda and conclusion slide for better structure.</p>
                            </div>
                        `;
                    } else {
                        resultContainer.innerHTML = `
                            <div class="ai-analysis-item">
                                <h4>Analysis Complete</h4>
                                <p>Your presentation has been analyzed for ${type}.</p>
                                <div class="ai-score good">Good overall consistency</div>
                                <p>Recommendation: Maintain current design principles throughout.</p>
                            </div>
                        `;
                    }
                }
            }, 1000);
        });
    });
    
    // Handle generate button
    const generateBtn = aiPanel.querySelector('.ai-generate-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            const type = aiPanel.querySelector('.ai-generate-type').value;
            const prompt = aiPanel.querySelector('.ai-prompt').value.trim();
            
            if (!prompt) {
                showNotification('Please enter a prompt for generation', 'error');
                return;
            }
            
            // Show generating message
            generateBtn.textContent = 'Generating...';
            generateBtn.disabled = true;
            
            // Simulate generation with timeout
            setTimeout(() => {
                generateBtn.textContent = 'Generate';
                generateBtn.disabled = false;
                
                // Handle different generation types
                switch (type) {
                    case 'slide':
                        generateSlideFromPrompt(prompt);
                        break;
                    case 'template':
                        generateTemplateFromPrompt(prompt);
                        break;
                    case 'bullet':
                        generateBulletPoints(prompt);
                        break;
                    case 'chart':
                        generateChartData(prompt);
                        break;
                }
                
                showNotification('Generation complete', 'success');
                aiPanel.querySelector('.ai-prompt').value = '';
            }, 1500);
        });
    }
}

// Show notification message
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to document
    const container = document.querySelector('.notification-container') || createNotificationContainer();
    container.appendChild(notification);
    
    // Automatic removal
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Create notification container if it doesn't exist
function createNotificationContainer() {
    const container = document.createElement('div');
    container.className = 'notification-container';
    document.body.appendChild(container);
    return container;
}

// AI assistant helper functions
function addTitleSlide() {
    const newSlide = {
        id: 'slide_' + Date.now(),
        background: { type: 'solid', color: '#ffffff' },
        elements: [
            {
                id: 'title_' + Date.now(),
                type: 'text',
                content: 'Presentation Title',
                x: 100,
                y: 150,
                width: 760,
                height: 100,
                style: {
                    fontSize: 48,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#333333'
                }
            },
            {
                id: 'subtitle_' + Date.now(),
                type: 'text',
                content: 'Presenter Name | Date',
                x: 100,
                y: 280,
                width: 760,
                height: 50,
                style: {
                    fontSize: 24,
                    fontWeight: 'normal',
                    textAlign: 'center',
                    color: '#666666'
                }
            }
        ]
    };
    
    // Add as the first slide
    AppState.slides.unshift(newSlide);
    AppState.currentSlideIndex = 0;
    
    // Trigger UI update
    updateUIState();
}

function addAgendaSlide() {
    const newSlide = {
        id: 'slide_' + Date.now(),
        background: { type: 'solid', color: '#ffffff' },
        elements: [
            {
                id: 'title_' + Date.now(),
                type: 'text',
                content: 'Agenda',
                x: 100,
                y: 50,
                width: 760,
                height: 80,
                style: {
                    fontSize: 40,
                    fontWeight: 'bold',
                    textAlign: 'left',
                    color: '#333333'
                }
            },
            {
                id: 'content_' + Date.now(),
                type: 'text',
                content: '• Introduction\n• Background\n• Key Points\n• Analysis\n• Recommendations\n• Next Steps',
                x: 100,
                y: 150,
                width: 760,
                height: 300,
                style: {
                    fontSize: 28,
                    fontWeight: 'normal',
                    textAlign: 'left',
                    color: '#333333'
                }
            }
        ]
    };
    
    // Add after the current slide
    AppState.slides.splice(AppState.currentSlideIndex + 1, 0, newSlide);
    AppState.currentSlideIndex += 1;
    
    // Trigger UI update
    updateUIState();
}

function generateSlideFromPrompt(prompt) {
    const newSlide = {
        id: 'slide_' + Date.now(),
        background: { type: 'solid', color: '#ffffff' },
        elements: [
            {
                id: 'title_' + Date.now(),
                type: 'text',
                content: capitalizeFirstLetter(prompt),
                x: 100,
                y: 50,
                width: 760,
                height: 80,
                style: {
                    fontSize: 36,
                    fontWeight: 'bold',
                    textAlign: 'left',
                    color: '#333333'
                }
            },
            {
                id: 'content_' + Date.now(),
                type: 'text',
                content: 'Generated content based on: ' + prompt,
                x: 100,
                y: 150,
                width: 760,
                height: 300,
                style: {
                    fontSize: 24,
                    fontWeight: 'normal',
                    textAlign: 'left',
                    color: '#333333'
                }
            }
        ]
    };
    
    // Add after the current slide
    AppState.slides.splice(AppState.currentSlideIndex + 1, 0, newSlide);
    AppState.currentSlideIndex += 1;
    
    // Trigger UI update
    updateUIState();
}

function generateTemplateFromPrompt(prompt) {
    // Create a basic presentation template with 5 slides
    const slides = [
        // Title slide
        {
            id: 'slide_' + (Date.now() + 1),
            background: { type: 'solid', color: '#ffffff' },
            elements: [
                {
                    id: 'title_' + Date.now(),
                    type: 'text',
                    content: capitalizeFirstLetter(prompt),
                    x: 100,
                    y: 150,
                    width: 760,
                    height: 100,
                    style: { fontSize: 48, fontWeight: 'bold', textAlign: 'center', color: '#333333' }
                },
                {
                    id: 'subtitle_' + Date.now(),
                    type: 'text',
                    content: 'Presentation Template',
                    x: 100,
                    y: 280,
                    width: 760,
                    height: 50,
                    style: { fontSize: 24, fontWeight: 'normal', textAlign: 'center', color: '#666666' }
                }
            ]
        },
        // Agenda slide
        {
            id: 'slide_' + (Date.now() + 2),
            background: { type: 'solid', color: '#ffffff' },
            elements: [
                {
                    id: 'title_' + Date.now(),
                    type: 'text',
                    content: 'Agenda',
                    x: 100,
                    y: 50,
                    width: 760,
                    height: 80,
                    style: { fontSize: 40, fontWeight: 'bold', textAlign: 'left', color: '#333333' }
                },
                {
                    id: 'content_' + Date.now(),
                    type: 'text',
                    content: '• Introduction to ' + prompt + '\n• Key Components\n• Benefits & Applications\n• Case Studies\n• Conclusion',
                    x: 100,
                    y: 150,
                    width: 760,
                    height: 300,
                    style: { fontSize: 28, fontWeight: 'normal', textAlign: 'left', color: '#333333' }
                }
            ]
        },
        // Content slide 1
        {
            id: 'slide_' + (Date.now() + 3),
            background: { type: 'solid', color: '#ffffff' },
            elements: [
                {
                    id: 'title_' + Date.now(),
                    type: 'text',
                    content: 'Introduction to ' + capitalizeFirstLetter(prompt),
                    x: 100,
                    y: 50,
                    width: 760,
                    height: 80,
                    style: { fontSize: 36, fontWeight: 'bold', textAlign: 'left', color: '#333333' }
                },
                {
                    id: 'content_' + Date.now(),
                    type: 'text',
                    content: 'Key information about ' + prompt + ' would appear here.\n\n• Background\n• Context\n• Significance',
                    x: 100,
                    y: 150,
                    width: 760,
                    height: 300,
                    style: { fontSize: 24, fontWeight: 'normal', textAlign: 'left', color: '#333333' }
                }
            ]
        },
        // Content slide 2
        {
            id: 'slide_' + (Date.now() + 4),
            background: { type: 'solid', color: '#ffffff' },
            elements: [
                {
                    id: 'title_' + Date.now(),
                    type: 'text',
                    content: 'Key Components',
                    x: 100,
                    y: 50,
                    width: 760,
                    height: 80,
                    style: { fontSize: 36, fontWeight: 'bold', textAlign: 'left', color: '#333333' }
                },
                {
                    id: 'content_' + Date.now(),
                    type: 'text',
                    content: '• Component 1: Description\n• Component 2: Description\n• Component 3: Description',
                    x: 100,
                    y: 150,
                    width: 760,
                    height: 300,
                    style: { fontSize: 24, fontWeight: 'normal', textAlign: 'left', color: '#333333' }
                }
            ]
        },
        // Summary slide
        {
            id: 'slide_' + (Date.now() + 5),
            background: { type: 'solid', color: '#ffffff' },
            elements: [
                {
                    id: 'title_' + Date.now(),
                    type: 'text',
                    content: 'Thank You',
                    x: 100,
                    y: 150,
                    width: 760,
                    height: 100,
                    style: { fontSize: 48, fontWeight: 'bold', textAlign: 'center', color: '#333333' }
                },
                {
                    id: 'subtitle_' + Date.now(),
                    type: 'text',
                    content: 'Questions & Discussion',
                    x: 100,
                    y: 280,
                    width: 760,
                    height: 50,
                    style: { fontSize: 24, fontWeight: 'normal', textAlign: 'center', color: '#666666' }
                }
            ]
        }
    ];
    
    // Confirm with the user before replacing slides
    if (AppState.slides.length > 0) {
        if (confirm('This will replace all existing slides. Continue?')) {
            AppState.slides = slides;
            AppState.currentSlideIndex = 0;
            updateUIState();
        }
    } else {
        AppState.slides = slides;
        AppState.currentSlideIndex = 0;
        updateUIState();
    }
}

function generateBulletPoints(prompt) {
    // Get current slide
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    if (!currentSlide) return;
    
    // Create bullet points based on the prompt
    const bullets = ['Main point about ' + prompt, 
                     'Secondary consideration', 
                     'Important detail to remember', 
                     'Key benefit or feature', 
                     'Final thought or conclusion'];
    
    // Format as bullet points
    const bulletPoints = bullets.map(b => '• ' + b).join('\n');
    
    // Add to the current slide
    currentSlide.elements.push({
        id: 'bullets_' + Date.now(),
        type: 'text',
        content: bulletPoints,
        x: 100,
        y: 200,
        width: 760,
        height: 300,
        style: {
            fontSize: 24,
            fontWeight: 'normal',
            textAlign: 'left',
            color: '#333333'
        }
    });
    
    // Trigger UI update
    const event = new CustomEvent('slide-updated');
    document.dispatchEvent(event);
}

function generateChartData(prompt) {
    // Get current slide
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    if (!currentSlide) return;
    
    // Create a chart element with sample data
    const chartElement = {
        id: 'chart_' + Date.now(),
        type: 'chart',
        chartType: 'bar',
        x: 100,
        y: 150,
        width: 760,
        height: 300,
        data: {
            labels: ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5'],
            datasets: [{
                label: capitalizeFirstLetter(prompt) + ' Data',
                data: [65, 59, 80, 81, 56],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            title: {
                display: true,
                text: capitalizeFirstLetter(prompt) + ' Analysis'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    };
    
    // Add to the current slide
    currentSlide.elements.push(chartElement);
    
    // Trigger UI update
    const event = new CustomEvent('slide-updated');
    document.dispatchEvent(event);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
} 