/**
 * PowerPoint-like Presentation Editor - Traditional JavaScript
 * Main Application file without ES6 modules
 */

// Initialize app state
if (!window.AppState) {
    window.AppState = {
        slides: [],
        currentSlideIndex: 0,
        selectedElements: [],
        resizeState: null,
        rotateState: null,
        dragState: null,
        zoom: 1.0,
        isFullscreen: false,
        lastAction: {
            type: null,
            data: null,
            timestamp: null
        }
    };
}

// Global state
const AppState = {
    slides: [],
    currentSlideIndex: 0,
    history: [],
    historyIndex: -1,
    selectedElements: [],
    clipboard: null,
    notes: {},
    theme: 'default',
    isAIPanelOpen: true,
    isDirty: false,
    isFullscreen: false,
    zoom: 1,
    grid: {
        show: false,
        size: 20
    }
};

// Initialize the application
function initApp() {
    console.log('Initializing application...');
    
    // Create initial slide if none exists
    if (AppState.slides.length === 0) {
        createInitialSlide();
    }
    
    // Initialize the UI
    initUI();
    
    // Initialize AI panel
    initAIPanel();
    
    // Initialize ribbon menu
    initRibbonMenu();
    
    // Initialize event listeners
    registerEventListeners();
    
    // Initialize zoom controller
    initZoomController();
    
    // AI 어시스턴트 스타일 추가
    addAIAssistantStyles();
    
    // AI 어시스턴트 버튼 추가
    addAIAssistButton();
    
    console.log('Application initialized successfully');
}

// Initialize zoom controller
function initZoomController() {
    // Add zoom controls to the UI
    const toolbarRight = document.querySelector('.toolbar-right');
    if (!toolbarRight) return;
    
    const zoomControls = document.createElement('div');
    zoomControls.className = 'zoom-controls';
    zoomControls.innerHTML = `
        <button id="zoomOutBtn" class="btn btn-light" title="Zoom Out"><i class="fas fa-search-minus"></i></button>
        <span id="zoomLevel">100%</span>
        <button id="zoomInBtn" class="btn btn-light" title="Zoom In"><i class="fas fa-search-plus"></i></button>
        <button id="zoomResetBtn" class="btn btn-light" title="Reset Zoom"><i class="fas fa-expand"></i></button>
    `;
    
    toolbarRight.prepend(zoomControls);
    
    // Add event listeners
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const zoomResetBtn = document.getElementById('zoomResetBtn');
    const zoomLevel = document.getElementById('zoomLevel');
    
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', function() {
            changeZoom(AppState.zoom + 0.1);
        });
    }
    
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', function() {
            changeZoom(AppState.zoom - 0.1);
        });
    }
    
    if (zoomResetBtn) {
        zoomResetBtn.addEventListener('click', function() {
            changeZoom(1);
        });
    }
    
    // Apply initial zoom
    applyZoom();
    
    // Add mouse wheel zoom
    const slideEditor = document.querySelector('.slide-editor');
    if (slideEditor) {
        slideEditor.addEventListener('wheel', function(e) {
            if (e.ctrlKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.05 : 0.05;
                changeZoom(AppState.zoom + delta);
            }
        });
    }
}

// Change zoom level with bounds checking
function changeZoom(newZoom) {
    // Constrain zoom between 25% and 400%
    newZoom = Math.max(0.25, Math.min(4, newZoom));
    
    // Update state
    AppState.zoom = newZoom;
    
    // Update UI
    const zoomLevel = document.getElementById('zoomLevel');
    if (zoomLevel) {
        zoomLevel.textContent = `${Math.round(newZoom * 100)}%`;
    }
    
    // Apply zoom
    applyZoom();
}

// Apply zoom to slide
function applyZoom() {
    const currentSlide = document.getElementById('currentSlide');
    if (!currentSlide) return;
    
    currentSlide.style.transform = `scale(${AppState.zoom})`;
    currentSlide.style.transformOrigin = 'center top';
    
    // Adjust container padding based on zoom
    const slideEditor = document.querySelector('.slide-editor');
    if (slideEditor) {
        slideEditor.style.paddingBottom = `${100 * AppState.zoom}px`;
    }
}

// Create initial slide
function createInitialSlide() {
    const initialSlide = {
        id: Date.now(),
        elements: [],
        background: '#ffffff'
    };
    
    AppState.slides.push(initialSlide);
    AppState.currentSlideIndex = 0;
    console.log('Initial slide created');
}

// Initialize UI elements
function initUI() {
    console.log('Initializing UI...');
    
    // Update slide list
    updateSlideList();
    
    // Render current slide
    renderCurrentSlide();
    
    console.log('UI initialized');
}

// Initialize ribbon menu
function initRibbonMenu() {
    console.log('Initializing ribbon menu...');
    
    const ribbonTabs = document.querySelectorAll('.ribbon-tab');
    const ribbonContents = document.querySelectorAll('.ribbon-content');
    
    ribbonTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Deactivate all tabs and contents
            ribbonTabs.forEach(t => t.classList.remove('active'));
            ribbonContents.forEach(c => c.classList.remove('active'));
            
            // Activate clicked tab
            this.classList.add('active');
            
            // Activate corresponding content
            const contentId = tabName + '-ribbon';
            const content = document.getElementById(contentId);
            if (content) {
                content.classList.add('active');
            }
        });
    });
    
    console.log('Ribbon menu initialized');
}

// Update slide list with improved visuals and functionality
function updateSlideList() {
    console.log('Updating slide list...');
    
    const slideList = document.getElementById('slideList');
    if (!slideList) {
        console.warn('Slide list element not found');
        return;
    }
    
    slideList.innerHTML = '';
    
    AppState.slides.forEach((slide, index) => {
        const slideItem = document.createElement('div');
        slideItem.className = `slide-item ${index === AppState.currentSlideIndex ? 'active' : ''}`;
        
        // Create slide thumbnail
        const thumbnail = document.createElement('div');
        thumbnail.className = 'slide-thumbnail';
        thumbnail.style.backgroundColor = slide.background || '#ffffff';
        
        // Add thumbnail preview content (simplified version of elements)
        if (slide.elements && slide.elements.length > 0) {
            slide.elements.forEach(element => {
                if (element.type === 'shape') {
                    const shapePreview = document.createElement('div');
                    shapePreview.className = 'thumbnail-element shape';
                    shapePreview.style.left = `${(element.x / 960) * 100}%`;
                    shapePreview.style.top = `${(element.y / 540) * 100}%`;
                    shapePreview.style.width = `${(element.width / 960) * 100}%`;
                    shapePreview.style.height = `${(element.height / 540) * 100}%`;
                    shapePreview.style.backgroundColor = element.style?.color || '#3498db';
                    
                    if (element.content === 'circle') {
                        shapePreview.style.borderRadius = '50%';
                    }
                    
                    thumbnail.appendChild(shapePreview);
                } else if (element.type === 'text') {
                    const textPreview = document.createElement('div');
                    textPreview.className = 'thumbnail-element text';
                    textPreview.style.left = `${(element.x / 960) * 100}%`;
                    textPreview.style.top = `${(element.y / 540) * 100}%`;
                    textPreview.style.width = `${(element.width / 960) * 100}%`;
                    textPreview.style.height = `${(element.height / 540) * 100}%`;
                    textPreview.style.backgroundColor = '#ddd';
                    
                    thumbnail.appendChild(textPreview);
                }
            });
        }
        
        slideItem.appendChild(thumbnail);
        
        // Add slide number
        const slideNumber = document.createElement('div');
        slideNumber.className = 'slide-number';
        slideNumber.textContent = `${index + 1}`;
        slideItem.appendChild(slideNumber);
        
        // Add click event
        slideItem.addEventListener('click', function() {
            selectSlide(index);
        });
        
        // Add context menu for slide actions
        slideItem.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showSlideContextMenu(e, index);
        });
        
        slideList.appendChild(slideItem);
    });
    
    // Update status bar
    updateStatusBar();
    
    console.log('Slide list updated');
}

// Show slide context menu
function showSlideContextMenu(e, slideIndex) {
    // Remove any existing context menu
    const existingMenu = document.getElementById('slide-context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    // Create context menu
    const contextMenu = document.createElement('div');
    contextMenu.id = 'slide-context-menu';
    contextMenu.className = 'context-menu';
    contextMenu.style.position = 'absolute';
    contextMenu.style.left = `${e.clientX}px`;
    contextMenu.style.top = `${e.clientY}px`;
    
    // Add menu items
    const menuItems = [
        { text: 'Duplicate Slide', icon: 'copy', action: () => duplicateSlide(slideIndex) },
        { text: 'Delete Slide', icon: 'trash', action: () => deleteSlide(slideIndex) },
        { text: 'Move Up', icon: 'arrow-up', action: () => moveSlide(slideIndex, slideIndex - 1) },
        { text: 'Move Down', icon: 'arrow-down', action: () => moveSlide(slideIndex, slideIndex + 1) },
    ];
    
    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'context-menu-item';
        
        // Disable move up for first slide
        if (item.text === 'Move Up' && slideIndex === 0) {
            menuItem.classList.add('disabled');
        }
        
        // Disable move down for last slide
        if (item.text === 'Move Down' && slideIndex === AppState.slides.length - 1) {
            menuItem.classList.add('disabled');
        }
        
        // Disable delete if only one slide
        if (item.text === 'Delete Slide' && AppState.slides.length <= 1) {
            menuItem.classList.add('disabled');
        }
        
        menuItem.innerHTML = `<i class="fas fa-${item.icon}"></i> ${item.text}`;
        
        if (!menuItem.classList.contains('disabled')) {
            menuItem.addEventListener('click', () => {
                item.action();
                contextMenu.remove();
            });
        }
        
        contextMenu.appendChild(menuItem);
    });
    
    // Add to document
    document.body.appendChild(contextMenu);
    
    // Close menu when clicking outside
    document.addEventListener('click', function closeMenu() {
        contextMenu.remove();
        document.removeEventListener('click', closeMenu);
    });
}

// Move slide from one position to another
function moveSlide(fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= AppState.slides.length) {
        return; // Invalid target position
    }
    
    // Get the slide to move
    const slideToMove = AppState.slides[fromIndex];
    
    // Remove from current position
    AppState.slides.splice(fromIndex, 1);
    
    // Insert at new position
    AppState.slides.splice(toIndex, 0, slideToMove);
    
    // Update current slide index if needed
    if (AppState.currentSlideIndex === fromIndex) {
        AppState.currentSlideIndex = toIndex;
    } else if (AppState.currentSlideIndex === toIndex) {
        // If current slide is at the target position, adjust index
        AppState.currentSlideIndex = fromIndex > toIndex ? toIndex + 1 : toIndex - 1;
    }
    
    // Update UI
    updateSlideList();
    renderCurrentSlide();
}

// Duplicate a specific slide
function duplicateSlide(index) {
    console.log(`Duplicating slide at index ${index}...`);
    
    const slideToDuplicate = AppState.slides[index];
    const duplicatedSlide = JSON.parse(JSON.stringify(slideToDuplicate));
    duplicatedSlide.id = Date.now();
    
    // Insert after the original slide
    AppState.slides.splice(index + 1, 0, duplicatedSlide);
    AppState.currentSlideIndex = index + 1;
    
    updateSlideList();
    renderCurrentSlide();
    
    console.log('Slide duplicated');
}

// Delete a specific slide
function deleteSlide(index) {
    if (AppState.slides.length <= 1) {
        alert('Cannot delete the last slide');
        return;
    }
    
    console.log(`Deleting slide at index ${index}...`);
    
    AppState.slides.splice(index, 1);
    
    // Adjust current slide index if needed
    if (AppState.currentSlideIndex >= AppState.slides.length) {
        AppState.currentSlideIndex = AppState.slides.length - 1;
    } else if (AppState.currentSlideIndex === index) {
        // If deleting current slide, stay at same index (which will be the next slide)
        // unless it's the last slide
        if (AppState.currentSlideIndex >= AppState.slides.length) {
            AppState.currentSlideIndex = AppState.slides.length - 1;
        }
    }
    
    updateSlideList();
    renderCurrentSlide();
    
    console.log('Slide deleted');
}

// Render current slide
function renderCurrentSlide() {
    console.log('Rendering current slide...');
    
    const currentSlideElement = document.getElementById('currentSlide');
    if (!currentSlideElement) {
        console.warn('Current slide element not found');
        return;
    }
    
    if (AppState.slides.length === 0) {
        currentSlideElement.innerHTML = '<div class="empty-slide">No slides. Add a new slide to begin.</div>';
        return;
    }
    
    const slide = AppState.slides[AppState.currentSlideIndex];
    
    // Set background color
    currentSlideElement.style.backgroundColor = slide.background || '#ffffff';
    
    // Clear slide
    currentSlideElement.innerHTML = '';
    
    // Add elements
    if (slide.elements && slide.elements.length > 0) {
        slide.elements.forEach(element => {
            renderElement(element, currentSlideElement);
        });
    } else {
        const emptySlide = document.createElement('div');
        emptySlide.className = 'empty-slide';
        emptySlide.innerHTML = 'Click to edit this slide';
        emptySlide.addEventListener('click', function() {
            handleEmptySlideClick();
        });
        currentSlideElement.appendChild(emptySlide);
    }
    
    // Add click handler to the slide canvas for adding elements
    currentSlideElement.addEventListener('click', function(e) {
        // Only handle clicks directly on the slide canvas (not on elements)
        if (e.target === currentSlideElement) {
            // Deselect any selected elements
            deselectAllElements();
        }
    });
    
    console.log('Current slide rendered');
}

// Handle empty slide click
function handleEmptySlideClick() {
    console.log('Empty slide clicked');
    
    // Show a modal or prompt to add content
    const addTextBtn = document.getElementById('addTextBtn');
    if (addTextBtn) {
        // Simulate a click on the addTextBtn to show text options
        addTextBtn.click();
    } else {
        // Fallback: Add a default text box
        addTextElement('Click to edit text', 100, 100, 600, 100);
    }
}

// Add a text element to the current slide
function addTextElement(content, x, y, width, height) {
    console.log('Adding text element');
    
    if (AppState.slides.length === 0) {
        console.warn('No slides available');
        return;
    }
    
    const textElement = {
        id: Date.now(),
        type: 'text',
        content: content || 'New text',
        x: x || 100,
        y: y || 100,
        width: width || 200,
        height: height || 100,
        fontSize: 16,
        fontFamily: 'Arial',
        color: '#000000',
        textAlign: 'left'
    };
    
    // Add to current slide
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    if (!currentSlide.elements) {
        currentSlide.elements = [];
    }
    
    currentSlide.elements.push(textElement);
    
    // Re-render the slide
    renderCurrentSlide();
    
    // Select the new element
    selectElement(textElement.id);
    
    return textElement;
}

// Render element with improved event handling
function renderElement(element, container) {
    const elementDiv = document.createElement('div');
    elementDiv.className = `slide-element ${element.type || 'default'}`;
    elementDiv.dataset.id = element.id;
    elementDiv.style.position = 'absolute';
    elementDiv.style.left = `${element.x}px`;
    elementDiv.style.top = `${element.y}px`;
    elementDiv.style.width = `${element.width}px`;
    elementDiv.style.height = `${element.height}px`;
    
    // Apply rotation if specified
    if (element.rotation) {
        elementDiv.style.transform = `rotate(${element.rotation}deg)`;
    }
    
    // Make element interactive
    elementDiv.draggable = true;
    
    // Apply element-specific styling
    switch (element.type) {
        case 'text':
            elementDiv.innerHTML = element.content || '';
            elementDiv.style.fontSize = `${element.fontSize || 16}px`;
            elementDiv.style.fontFamily = element.fontFamily || 'Arial';
            elementDiv.style.color = element.color || '#000000';
            elementDiv.style.textAlign = element.textAlign || 'left';
            elementDiv.style.fontWeight = element.fontWeight || 'normal';
            elementDiv.style.fontStyle = element.fontStyle || 'normal';
            elementDiv.style.textDecoration = element.textDecoration || 'none';
            
            // Make text editable on double-click
            elementDiv.addEventListener('dblclick', function(e) {
                e.stopPropagation();
                makeTextEditable(elementDiv, element);
            });
            break;
            
        case 'image':
            const img = document.createElement('img');
            img.src = element.src || '';
            img.alt = element.alt || 'Image';
            img.style.width = '100%';
            img.style.height = '100%';
            elementDiv.appendChild(img);
            break;
            
        case 'shape':
            // Add shape-specific class
            elementDiv.classList.add(element.content || 'rectangle');
            
            const backgroundColor = element.style?.color || '#3498db';
            const borderStyle = element.style?.borderStyle || 'solid';
            const borderColor = element.style?.borderColor || '#000000';
            const borderWidth = element.style?.borderWidth || 1;
            const opacity = element.style?.opacity || 1;
            
            // Apply shape styling based on shape type
            switch (element.content) {
                case 'circle':
                    elementDiv.style.backgroundColor = backgroundColor;
                    elementDiv.style.borderRadius = '50%';
                    elementDiv.style.border = `${borderWidth}px ${borderStyle} ${borderColor}`;
                    break;
                
                case 'oval':
                    elementDiv.style.backgroundColor = backgroundColor;
                    elementDiv.style.borderRadius = '50%';
                    elementDiv.style.border = `${borderWidth}px ${borderStyle} ${borderColor}`;
                    break;
                
                case 'triangle':
                    // For triangle we use a different approach with borders
                    elementDiv.style.backgroundColor = 'transparent';
                    elementDiv.style.width = '0';
                    elementDiv.style.height = '0';
                    
                    // Create the triangle using borders
                    const halfWidth = Math.round(element.width / 2);
                    elementDiv.style.borderLeft = `${halfWidth}px solid transparent`;
                    elementDiv.style.borderRight = `${halfWidth}px solid transparent`;
                    elementDiv.style.borderBottom = `${element.height}px solid ${backgroundColor}`;
                    break;
                
                case 'diamond':
                    elementDiv.style.backgroundColor = 'transparent';
                    elementDiv.style.position = 'relative';
                    
                    // Create a diamond with SVG without preserving aspect ratio
                    elementDiv.innerHTML = `
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <polygon points="50,0 100,50 50,100 0,50" 
                                fill="${backgroundColor}" 
                                stroke="${borderColor}" 
                                stroke-width="${borderWidth}"/>
                        </svg>
                    `;
                    break;
                
                case 'star':
                    elementDiv.style.backgroundColor = 'transparent';
                    elementDiv.style.position = 'relative';
                    
                    // Create a star with SVG without preserving aspect ratio
                    elementDiv.innerHTML = `
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <polygon points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" 
                                fill="${backgroundColor}" 
                                stroke="${borderColor}" 
                                stroke-width="${borderWidth}"/>
                        </svg>
                    `;
                    break;
                    
                case 'arrow':
                    elementDiv.style.backgroundColor = 'transparent';
                    elementDiv.style.position = 'relative';
                    
                    // Create an arrow with SVG without preserving aspect ratio
                    elementDiv.innerHTML = `
                        <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
                            <line x1="0" y1="25" x2="70" y2="25" 
                                stroke="${backgroundColor}" 
                                stroke-width="10"/>
                            <polygon points="70,5 70,45 100,25" 
                                fill="${backgroundColor}" 
                                stroke="${backgroundColor}" 
                                stroke-width="1"/>
                        </svg>
                    `;
                    break;
                    
                case 'double-arrow':
                    elementDiv.style.backgroundColor = 'transparent';
                    elementDiv.style.position = 'relative';
                    
                    // Create a double-ended arrow with SVG without preserving aspect ratio
                    elementDiv.innerHTML = `
                        <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
                            <line x1="20" y1="25" x2="80" y2="25" 
                                stroke="${backgroundColor}" 
                                stroke-width="10"/>
                            <polygon points="70,5 70,45 100,25" 
                                fill="${backgroundColor}" 
                                stroke="${backgroundColor}" 
                                stroke-width="1"/>
                            <polygon points="30,5 30,45 0,25" 
                                fill="${backgroundColor}" 
                                stroke="${backgroundColor}" 
                                stroke-width="1"/>
                        </svg>
                    `;
                    break;
                    
                case 'callout':
                    elementDiv.style.backgroundColor = backgroundColor;
                    elementDiv.style.border = `${borderWidth}px ${borderStyle} ${borderColor}`;
                    elementDiv.style.borderRadius = '8px';
                    elementDiv.style.position = 'relative';
                    
                    // Add speech bubble triangle
                    const calloutTriangle = document.createElement('div');
                    calloutTriangle.style.position = 'absolute';
                    calloutTriangle.style.bottom = '-15px';
                    calloutTriangle.style.left = '15px';
                    calloutTriangle.style.width = '0';
                    calloutTriangle.style.height = '0';
                    calloutTriangle.style.borderLeft = '15px solid transparent';
                    calloutTriangle.style.borderRight = '15px solid transparent';
                    calloutTriangle.style.borderTop = `15px solid ${backgroundColor}`;
                    elementDiv.appendChild(calloutTriangle);
                    break;
                    
                case 'pentagon':
                    elementDiv.style.backgroundColor = 'transparent';
                    elementDiv.style.position = 'relative';
                    
                    // Create a pentagon with SVG without preserving aspect ratio
                    elementDiv.innerHTML = `
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <polygon points="50,0 100,38 82,100 18,100 0,38" 
                                fill="${backgroundColor}" 
                                stroke="${borderColor}" 
                                stroke-width="${borderWidth}"/>
                        </svg>
                    `;
                    break;
                    
                case 'hexagon':
                    elementDiv.style.backgroundColor = 'transparent';
                    elementDiv.style.position = 'relative';
                    
                    // Create a hexagon with SVG without preserving aspect ratio
                    elementDiv.innerHTML = `
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <polygon points="25,0 75,0 100,50 75,100 25,100 0,50" 
                                fill="${backgroundColor}" 
                                stroke="${borderColor}" 
                                stroke-width="${borderWidth}"/>
                        </svg>
                    `;
                    break;

                case 'parallelogram':
                    elementDiv.style.backgroundColor = 'transparent';
                    elementDiv.style.position = 'relative';
                    
                    // Create a parallelogram with SVG without preserving aspect ratio
                    elementDiv.innerHTML = `
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <polygon points="25,0 100,0 75,100 0,100" 
                                fill="${backgroundColor}" 
                                stroke="${borderColor}" 
                                stroke-width="${borderWidth}"/>
                        </svg>
                    `;
                    break;
                
                case 'trapezoid':
                    elementDiv.style.backgroundColor = 'transparent';
                    elementDiv.style.position = 'relative';
                    
                    // Create a trapezoid with SVG without preserving aspect ratio
                    elementDiv.innerHTML = `
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <polygon points="20,0 80,0 100,100 0,100" 
                                fill="${backgroundColor}" 
                                stroke="${borderColor}" 
                                stroke-width="${borderWidth}"/>
                        </svg>
                    `;
                    break;

                case 'cross':
                    elementDiv.style.backgroundColor = 'transparent';
                    elementDiv.style.position = 'relative';
                    
                    // Create a cross with SVG without preserving aspect ratio
                    elementDiv.innerHTML = `
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M30,0 L70,0 L70,30 L100,30 L100,70 L70,70 L70,100 L30,100 L30,70 L0,70 L0,30 L30,30 Z" 
                                fill="${backgroundColor}" 
                                stroke="${borderColor}" 
                                stroke-width="${borderWidth}"/>
                        </svg>
                    `;
                    break;
                
                default: // rectangle and other shapes
                    elementDiv.style.backgroundColor = backgroundColor;
                    elementDiv.style.border = `${borderWidth}px ${borderStyle} ${borderColor}`;
                    break;
            }
            
            // Apply common style properties
            elementDiv.style.opacity = opacity;
            
            // Add resize handles
            addResizeHandles(elementDiv, element);
            break;
    }
    
    // Apply opacity to all element types
    if (element.style?.opacity) {
        elementDiv.style.opacity = element.style.opacity;
    }
    
    // Add event listeners for selection
    elementDiv.addEventListener('mousedown', function(e) {
        if (e.target === elementDiv || 
            e.target.tagName === 'svg' || 
            e.target.tagName === 'polygon' || 
            e.target.tagName === 'line' ||
            e.target.tagName === 'path') {
            e.stopPropagation();
            selectElement(element.id);
        }
    });
    
    // Add HTML5 drag handlers (as backup)
    elementDiv.addEventListener('dragstart', function(e) {
        handleDragStart(e, element);
    });
    
    elementDiv.addEventListener('dragend', function(e) {
        handleDragEnd(e, element);
    });
    
    // Add direct mouse-based drag handlers for better responsiveness
    setupDirectDragHandlers(elementDiv, element);
    
    container.appendChild(elementDiv);
}

// Add resize handles to elements
function addResizeHandles(elementDiv, element) {
    // Don't add resize handles to certain shapes where it doesn't make sense
    if (element.content === 'triangle' || element.content === 'star') {
        return;
    }
    
    const positions = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    
    positions.forEach(pos => {
        const handle = document.createElement('div');
        handle.className = `resize-handle ${pos}`;
        handle.dataset.position = pos;
        
        // Add mouse down event for resize
        handle.addEventListener('mousedown', function(e) {
            e.stopPropagation();
            startResize(e, element, pos);
        });
        
        elementDiv.appendChild(handle);
    });
    
    // Add rotation handle
    const rotateHandle = document.createElement('div');
    rotateHandle.className = 'rotate-handle';
    
    rotateHandle.addEventListener('mousedown', function(e) {
        e.stopPropagation();
        startRotation(e, element);
    });
    
    elementDiv.appendChild(rotateHandle);
}

// Start resize operation - Improved for better responsiveness
function startResize(e, element, position) {
    e.preventDefault();
    e.stopPropagation();
    
    // Save initial mouse position and element dimensions
    AppState.resizeState = {
        element: element,
        position: position,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: element.width,
        startHeight: element.height,
        startLeft: element.x,
        startTop: element.y,
        aspectRatio: element.width / element.height,
        lockAspectRatio: false // Update this based on UI setting if needed
    };
    
    // Check if shift key is pressed for aspect ratio lock
    if (e.shiftKey) {
        AppState.resizeState.lockAspectRatio = true;
    }
    
    // Add document event listeners for mouse move and up
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
    
    // Prevent default behavior during resize
    document.addEventListener('selectstart', preventDefault);
    document.addEventListener('dragstart', preventDefault);
    
    // Add resizing class to element
    const elementDiv = document.querySelector(`.slide-element[data-id="${element.id}"]`);
    if (elementDiv) {
        elementDiv.classList.add('resizing');
    }
    
    function preventDefault(e) {
        e.preventDefault();
        return false;
    }
}

// Handle resize with improved calculations and responsiveness
function handleResize(e) {
    if (!AppState.resizeState) return;
    
    const state = AppState.resizeState;
    const deltaX = e.clientX - state.startX;
    const deltaY = e.clientY - state.startY;
    
    // Start with original dimensions
    let newWidth = state.startWidth;
    let newHeight = state.startHeight;
    let newLeft = state.startLeft;
    let newTop = state.startTop;
    
    // Only lock aspect ratio when Shift key is pressed
    state.lockAspectRatio = e.shiftKey;
    
    // Calculate new dimensions and position based on resize direction
    switch (state.position) {
        case 'nw': // top-left
            newWidth = state.startWidth - deltaX;
            newHeight = state.startHeight - deltaY;
            newLeft = state.startLeft + deltaX;
            newTop = state.startTop + deltaY;
            
            // Constrain aspect ratio only if explicitly locked (shift key)
            if (state.lockAspectRatio) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // X movement dominates
                    newHeight = newWidth / state.aspectRatio;
                    newTop = state.startTop + (state.startHeight - newHeight);
                } else {
                    // Y movement dominates
                    newWidth = newHeight * state.aspectRatio;
                    newLeft = state.startLeft + (state.startWidth - newWidth);
                }
            }
            break;
            
        case 'n': // top-center
            newHeight = state.startHeight - deltaY;
            newTop = state.startTop + deltaY;
            
            // Constrain aspect ratio only if explicitly locked (shift key)
            if (state.lockAspectRatio) {
                const oldCenter = state.startLeft + state.startWidth / 2;
                newWidth = newHeight * state.aspectRatio;
                newLeft = oldCenter - newWidth / 2;
            }
            break;
            
        case 'ne': // top-right
            newWidth = state.startWidth + deltaX;
            newHeight = state.startHeight - deltaY;
            newTop = state.startTop + deltaY;
            
            // Constrain aspect ratio only if explicitly locked (shift key)
            if (state.lockAspectRatio) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // X movement dominates
                    newHeight = newWidth / state.aspectRatio;
                    newTop = state.startTop + (state.startHeight - newHeight);
                } else {
                    // Y movement dominates
                    newWidth = newHeight * state.aspectRatio;
                }
            }
            break;
            
        case 'e': // middle-right
            newWidth = state.startWidth + deltaX;
            
            // Constrain aspect ratio only if explicitly locked (shift key)
            if (state.lockAspectRatio) {
                const oldMiddle = state.startTop + state.startHeight / 2;
                newHeight = newWidth / state.aspectRatio;
                newTop = oldMiddle - newHeight / 2;
            }
            break;
            
        case 'se': // bottom-right
            newWidth = state.startWidth + deltaX;
            newHeight = state.startHeight + deltaY;
            
            // Constrain aspect ratio only if explicitly locked (shift key)
            if (state.lockAspectRatio) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // X movement dominates
                    newHeight = newWidth / state.aspectRatio;
                } else {
                    // Y movement dominates
                    newWidth = newHeight * state.aspectRatio;
                }
            }
            break;
            
        case 's': // bottom-center
            newHeight = state.startHeight + deltaY;
            
            // Constrain aspect ratio only if explicitly locked (shift key)
            if (state.lockAspectRatio) {
                const oldCenter = state.startLeft + state.startWidth / 2;
                newWidth = newHeight * state.aspectRatio;
                newLeft = oldCenter - newWidth / 2;
            }
            break;
            
        case 'sw': // bottom-left
            newWidth = state.startWidth - deltaX;
            newHeight = state.startHeight + deltaY;
            newLeft = state.startLeft + deltaX;
            
            // Constrain aspect ratio only if explicitly locked (shift key)
            if (state.lockAspectRatio) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // X movement dominates
                    newHeight = newWidth / state.aspectRatio;
                } else {
                    // Y movement dominates
                    newWidth = newHeight * state.aspectRatio;
                    newLeft = state.startLeft + (state.startWidth - newWidth);
                }
            }
            break;
            
        case 'w': // middle-left
            newWidth = state.startWidth - deltaX;
            newLeft = state.startLeft + deltaX;
            
            // Constrain aspect ratio only if explicitly locked (shift key)
            if (state.lockAspectRatio) {
                const oldMiddle = state.startTop + state.startHeight / 2;
                newHeight = newWidth / state.aspectRatio;
                newTop = oldMiddle - newHeight / 2;
            }
            break;
    }
    
    // Enforce minimum size
    newWidth = Math.max(20, newWidth);
    newHeight = Math.max(20, newHeight);
    
    // Get the element div for direct manipulation
    const elementDiv = document.querySelector(`.slide-element[data-id="${state.element.id}"]`);
    if (elementDiv) {
        // Update element dimensions and position directly for immediate feedback
        elementDiv.style.width = `${newWidth}px`;
        elementDiv.style.height = `${newHeight}px`;
        elementDiv.style.left = `${newLeft}px`;
        elementDiv.style.top = `${newTop}px`;
        
        // Update SVG viewBox if it's a shape with SVG content
        const svg = elementDiv.querySelector('svg');
        if (svg) {
            svg.setAttribute('width', newWidth);
            svg.setAttribute('height', newHeight);
            
            // For shapes using polygon or path, we don't need to update the viewBox
            // as it's defined in relative coordinates
        }
        
        // Special case for triangle
        if (state.element.type === 'shape' && state.element.content === 'triangle') {
            // Update triangle proportions
            const halfWidth = Math.round(newWidth / 2);
            elementDiv.style.borderLeft = `${halfWidth}px solid transparent`;
            elementDiv.style.borderRight = `${halfWidth}px solid transparent`;
            elementDiv.style.borderBottom = `${newHeight}px solid ${state.element.style?.color || '#3498db'}`;
        }
    }
    
    // Update size fields in properties panel for live feedback
    const widthInput = document.getElementById('elementWidth');
    const heightInput = document.getElementById('elementHeight');
    const xInput = document.getElementById('elementX');
    const yInput = document.getElementById('elementY');
    
    if (widthInput) widthInput.value = Math.round(newWidth);
    if (heightInput) heightInput.value = Math.round(newHeight);
    if (xInput) xInput.value = Math.round(newLeft);
    if (yInput) yInput.value = Math.round(newTop);
}

// Stop resize operation with improved cleanup
function stopResize() {
    if (!AppState.resizeState) return;
    
    // Get the element div
    const elementDiv = document.querySelector(`.slide-element[data-id="${AppState.resizeState.element.id}"]`);
    
    // Remove resizing class
    if (elementDiv) {
        elementDiv.classList.remove('resizing');
        
        // Get the final dimensions and position
        const newWidth = parseFloat(elementDiv.style.width) || AppState.resizeState.element.width;
        const newHeight = parseFloat(elementDiv.style.height) || AppState.resizeState.element.height;
        const newLeft = parseFloat(elementDiv.style.left) || AppState.resizeState.element.x;
        const newTop = parseFloat(elementDiv.style.top) || AppState.resizeState.element.y;
        
        // Update the element state with the final values
        const element = AppState.resizeState.element;
        element.width = newWidth;
        element.height = newHeight;
        element.x = newLeft;
        element.y = newTop;
        
        // Re-render the element to ensure SVG shapes are updated correctly
        if (element.type === 'shape' && (
            element.content === 'star' || 
            element.content === 'diamond' || 
            element.content === 'pentagon' || 
            element.content === 'hexagon' ||
            element.content === 'parallelogram' ||
            element.content === 'trapezoid' ||
            element.content === 'arrow' ||
            element.content === 'double-arrow' ||
            element.content === 'cross'
        )) {
            // Get current slide
            const currentSlideElement = document.getElementById('currentSlide');
            if (currentSlideElement) {
                // Remove existing element
                const oldElement = elementDiv;
                if (oldElement && oldElement.parentNode) {
                    oldElement.parentNode.removeChild(oldElement);
                }
                
                // Re-render this specific element
                renderElement(element, currentSlideElement);
                
                // Re-select the element to restore selection state
                selectElement(element.id);
            }
        }
    }
    
    // Clear resize state
    AppState.resizeState = null;
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
    document.removeEventListener('selectstart', preventDefault);
    document.removeEventListener('dragstart', preventDefault);
    
    function preventDefault(e) {
        e.preventDefault();
        return false;
    }
}

// Start rotation operation with improved calculation and visual feedback
function startRotation(e, element) {
    e.preventDefault();
    e.stopPropagation();
    
    // Get element center
    const elementDiv = document.querySelector(`.slide-element[data-id="${element.id}"]`);
    if (!elementDiv) return;
    
    const rect = elementDiv.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate initial angle
    const initialAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    
    // Save rotation state
    AppState.rotationState = {
        element: element,
        centerX: centerX,
        centerY: centerY,
        initialAngle: initialAngle,
        startRotation: element.rotation || 0
    };
    
    // Add rotating class to element
    elementDiv.classList.add('rotating');
    
    // Add document event listeners
    document.addEventListener('mousemove', handleRotation);
    document.addEventListener('mouseup', stopRotation);
    
    // Create and show rotation guide line
    createRotationGuide(elementDiv, centerX, centerY, e.clientX, e.clientY);
}

// Create visual rotation guide
function createRotationGuide(elementDiv, centerX, centerY, mouseX, mouseY) {
    // Remove any existing rotation guide
    const existingGuide = document.getElementById('rotation-guide');
    if (existingGuide) {
        existingGuide.remove();
    }
    
    // Calculate angle and radius
    const angle = Math.atan2(mouseY - centerY, mouseX - centerX);
    const radius = Math.sqrt(Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2));
    
    // Create SVG for rotation guide
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'rotation-guide';
    svg.style.position = 'fixed';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '9999';
    
    // Create line from center to mouse
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', centerX);
    line.setAttribute('y1', centerY);
    line.setAttribute('x2', mouseX);
    line.setAttribute('y2', mouseY);
    line.setAttribute('stroke', '#27ae60');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '5,5');
    
    // Create circle at center
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', centerX);
    circle.setAttribute('cy', centerY);
    circle.setAttribute('r', '4');
    circle.setAttribute('fill', '#27ae60');
    
    // Add elements to SVG
    svg.appendChild(line);
    svg.appendChild(circle);
    
    // Add SVG to document
    document.body.appendChild(svg);
}

// Update rotation guide
function updateRotationGuide(centerX, centerY, mouseX, mouseY) {
    const guide = document.getElementById('rotation-guide');
    if (!guide) return;
    
    const line = guide.querySelector('line');
    if (line) {
        line.setAttribute('x2', mouseX);
        line.setAttribute('y2', mouseY);
    }
}

// Handle mouse move during rotation with improved calculations and visual feedback
function handleRotation(e) {
    if (!AppState.rotationState) return;
    
    const state = AppState.rotationState;
    
    // Calculate current angle
    const currentAngle = Math.atan2(e.clientY - state.centerY, e.clientX - state.centerX) * (180 / Math.PI);
    
    // Calculate rotation
    let rotation = state.startRotation + (currentAngle - state.initialAngle);
    
    // Snap to 15-degree increments if holding Shift key
    if (e.shiftKey) {
        rotation = Math.round(rotation / 15) * 15;
    }
    
    // Update rotation guide
    updateRotationGuide(state.centerX, state.centerY, e.clientX, e.clientY);
    
    // Get the element div
    const elementDiv = document.querySelector(`.slide-element[data-id="${state.element.id}"]`);
    if (elementDiv) {
        // Update transform directly for immediate feedback
        elementDiv.style.transform = `rotate(${rotation}deg)`;
    }
    
    // Update rotation display in properties panel
    const rotationInput = document.getElementById('elementRotation');
    const rotationValue = document.getElementById('rotationValue');
    
    if (rotationInput) rotationInput.value = rotation;
    if (rotationValue) rotationValue.textContent = `${Math.round(rotation)}°`;
}

// Stop rotation operation with improved cleanup
function stopRotation() {
    if (!AppState.rotationState) return;
    
    // Get the element div
    const elementDiv = document.querySelector(`.slide-element[data-id="${AppState.rotationState.element.id}"]`);
    
    // Get the current rotation from the transform style
    if (elementDiv) {
        elementDiv.classList.remove('rotating');
        
        // Parse the rotation value from the transform style
        const transform = elementDiv.style.transform;
        const rotateMatch = transform.match(/rotate\(([^)]+)deg\)/);
        
        if (rotateMatch && rotateMatch[1]) {
            const rotation = parseFloat(rotateMatch[1]);
            
            // Update the element state
            AppState.rotationState.element.rotation = rotation;
        }
    }
    
    // Remove rotation guide
    const rotationGuide = document.getElementById('rotation-guide');
    if (rotationGuide) {
        rotationGuide.remove();
    }
    
    // Clear rotation state
    AppState.rotationState = null;
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleRotation);
    document.removeEventListener('mouseup', stopRotation);
}

// Add a much smoother direct drag handler as an alternative to HTML5 drag/drop
function setupDirectDragHandlers(elementDiv, element) {
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    // Mouse down handler
    elementDiv.addEventListener('mousedown', function(e) {
        // Skip if we clicked on a resize or rotate handle
        if (e.target.classList.contains('resize-handle') || e.target.classList.contains('rotate-handle')) {
            return;
        }
        
        // Skip if target is an SVG element (for shape internals)
        if (e.target.tagName === 'svg' || e.target.tagName === 'polygon' || 
            e.target.tagName === 'line' || e.target.tagName === 'rect') {
            e.stopPropagation();
            // Pass the click to the element's main div for selection
            selectElement(element.id);
            
            // Start direct drag
            isDragging = true;
            
            // Store starting position
            startX = e.clientX;
            startY = e.clientY;
            startLeft = element.x;
            startTop = element.y;
            
            // Add dragging class
            elementDiv.classList.add('dragging');
            
            // Prevent default to avoid text selection
            e.preventDefault();
            return;
        }
        
        // If text element is in edit mode, don't start drag
        if (elementDiv.contentEditable === 'true') {
            return;
        }
        
        // Start drag operation
        isDragging = true;
        
        // Store starting position
        startX = e.clientX;
        startY = e.clientY;
        startLeft = element.x;
        startTop = element.y;
        
        // Add dragging class
        elementDiv.classList.add('dragging');
        
        // Prevent default to avoid text selection
        e.preventDefault();
    });
    
    // Add document-level mouse move and up handlers
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        // Calculate new position
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        // Apply new position to the element's visual representation immediately
        // for smooth dragging without waiting for state updates
        elementDiv.style.left = `${startLeft + deltaX}px`;
        elementDiv.style.top = `${startTop + deltaY}px`;
        
        // Prevent default to avoid text selection during drag
        e.preventDefault();
    });
    
    document.addEventListener('mouseup', function(e) {
        if (!isDragging) return;
        
        // End drag operation
        isDragging = false;
        
        // Calculate final position
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        // Update element state and finalize the position
        updateElementPosition(element.id, startLeft + deltaX, startTop + deltaY, false);
        
        // Remove dragging class
        elementDiv.classList.remove('dragging');
    });
}

// Update element position with optional render flag
function updateElementPosition(elementId, x, y, shouldRender = true) {
    const element = findElementById(elementId);
    if (!element) return;
    
    // Constrain positions to prevent elements from going completely off-screen
    element.x = Math.max(0, Math.min(x, 2000)); // Assuming max slide width
    element.y = Math.max(0, Math.min(y, 2000)); // Assuming max slide height
    
    // Update UI immediately for responsiveness
    const elementDiv = document.querySelector(`.slide-element[data-id="${elementId}"]`);
    if (elementDiv) {
        elementDiv.style.left = `${element.x}px`;
        elementDiv.style.top = `${element.y}px`;
        
        // Update position in properties panel
        const elementX = document.getElementById('elementX');
        const elementY = document.getElementById('elementY');
        if (elementX) elementX.value = element.x;
        if (elementY) elementY.value = element.y;
    }
    
    // Only do a full render if explicitly requested
    if (shouldRender) {
        renderCurrentSlide();
        selectElement(elementId);
    }
}

// Update element property
function updateElementProperty(elementId, property, value) {
    const element = findElementById(elementId);
    if (!element) return;
    
    element[property] = value;
    
    // Update UI
    renderCurrentSlide();
    
    // Keep the element selected
    selectElement(elementId);
}

// Find element by ID
function findElementById(elementId) {
    if (AppState.slides.length === 0) return null;
    
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    if (!currentSlide.elements) return null;
    
    return currentSlide.elements.find(el => el.id == elementId);
}

// Select element
function selectElement(elementId) {
    console.log('Selecting element', elementId);
    
    // Deselect all elements first
    deselectAllElements();
    
    // Find and select the element
    const elementDiv = document.querySelector(`.slide-element[data-id="${elementId}"]`);
    if (elementDiv) {
        elementDiv.classList.add('selected');
        AppState.selectedElements = [elementId];
        
        // Show properties panel
        showPropertiesPanel();
        
        // Update properties panel with element data
        updatePropertiesPanel(findElementById(elementId));
    }
}

// Deselect all elements
function deselectAllElements() {
    const selectedElements = document.querySelectorAll('.slide-element.selected');
    selectedElements.forEach(el => {
        el.classList.remove('selected');
    });
    
    AppState.selectedElements = [];
}

// Show properties panel
function showPropertiesPanel() {
    const propertiesPanel = document.querySelector('.properties-panel');
    if (propertiesPanel) {
        propertiesPanel.classList.add('active');
    }
}

// Update properties panel with element data
function updatePropertiesPanel(element) {
    if (!element) return;
    
    // Update position inputs
    const elementX = document.getElementById('elementX');
    const elementY = document.getElementById('elementY');
    if (elementX) elementX.value = element.x;
    if (elementY) elementY.value = element.y;
    
    // Update size inputs
    const elementWidth = document.getElementById('elementWidth');
    const elementHeight = document.getElementById('elementHeight');
    if (elementWidth) elementWidth.value = element.width;
    if (elementHeight) elementHeight.value = element.height;
    
    // Update rotation input
    const elementRotation = document.getElementById('elementRotation');
    const rotationValue = document.getElementById('rotationValue');
    if (elementRotation) elementRotation.value = element.rotation || 0;
    if (rotationValue) rotationValue.textContent = `${Math.round(element.rotation || 0)}°`;
    
    // Update text-specific properties if it's a text element
    if (element.type === 'text') {
        const textFontSize = document.getElementById('textFontSize');
        const textFontFamily = document.getElementById('textFontFamily');
        const textColor = document.getElementById('textColor');
        
        if (textFontSize) textFontSize.value = element.fontSize || 16;
        if (textFontFamily) textFontFamily.value = element.fontFamily || 'Arial';
        if (textColor) textColor.value = element.color || '#000000';
        
        // Set text alignment buttons
        const textAlignButtons = document.querySelectorAll('.format-btn');
        textAlignButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        const alignmentMap = {
            'left': 'textAlignLeftBtn',
            'center': 'textAlignCenterBtn',
            'right': 'textAlignRightBtn',
            'justify': 'textAlignJustifyBtn'
        };
        
        const activeBtn = document.getElementById(alignmentMap[element.textAlign] || 'textAlignLeftBtn');
        if (activeBtn) activeBtn.classList.add('active');
        
        // Set text style buttons
        const boldBtn = document.getElementById('textBoldBtn');
        const italicBtn = document.getElementById('textItalicBtn');
        const underlineBtn = document.getElementById('textUnderlineBtn');
        
        if (boldBtn) boldBtn.classList.toggle('active', element.fontWeight === 'bold');
        if (italicBtn) italicBtn.classList.toggle('active', element.fontStyle === 'italic');
        if (underlineBtn) underlineBtn.classList.toggle('active', element.textDecoration === 'underline');
    }
    
    // Update shape-specific properties if it's a shape
    if (element.type === 'shape') {
        const elementBgColor = document.getElementById('elementBgColor');
        const elementBorderColor = document.getElementById('elementBorderColor');
        const borderStyle = document.getElementById('borderStyle');
        const borderWidth = document.getElementById('borderWidth');
        const elementOpacity = document.getElementById('elementOpacity');
        const opacityValue = document.getElementById('opacityValue');
        
        if (elementBgColor) elementBgColor.value = element.style?.color || '#3498db';
        if (elementBorderColor) elementBorderColor.value = element.style?.borderColor || '#000000';
        if (borderStyle) borderStyle.value = element.style?.borderStyle || 'solid';
        if (borderWidth) borderWidth.value = element.style?.borderWidth || 1;
        
        if (elementOpacity) {
            const opacity = Math.round((element.style?.opacity || 1) * 100);
            elementOpacity.value = opacity;
            if (opacityValue) opacityValue.textContent = `${opacity}%`;
        }
    }
}

// Add a shape element to the current slide
function addShapeElement(shapeType, x, y, width, height) {
    console.log('Adding shape element', shapeType);
    
    if (AppState.slides.length === 0) {
        console.warn('No slides available');
        return;
    }
    
    const shapeElement = {
        id: Date.now(),
        type: 'shape',
        content: shapeType,
        x: x || 100,
        y: y || 100,
        width: width || 200,
        height: height || 150,
        rotation: 0,
        style: {
            color: '#3498db',
            borderStyle: 'solid',
            borderColor: '#000000',
            borderWidth: 1,
            opacity: 1
        }
    };
    
    // Add to current slide
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    if (!currentSlide.elements) {
        currentSlide.elements = [];
    }
    
    currentSlide.elements.push(shapeElement);
    
    // Re-render the slide
    renderCurrentSlide();
    
    // Select the new element
    selectElement(shapeElement.id);
    
    return shapeElement;
}

// Select slide
function selectSlide(index) {
    if (index < 0 || index >= AppState.slides.length) {
        console.warn(`Invalid slide index: ${index}`);
        return;
    }
    
    AppState.currentSlideIndex = index;
    updateSlideList();
    renderCurrentSlide();
    updateStatusBar();
    
    console.log(`Slide ${index + 1} selected`);
}

// Add new slide
function addNewSlide() {
    console.log('Adding new slide...');
    
    const newSlide = {
        id: Date.now(),
        elements: [],
        background: '#ffffff'
    };
    
    AppState.slides.push(newSlide);
    AppState.currentSlideIndex = AppState.slides.length - 1;
    
    updateSlideList();
    renderCurrentSlide();
    
    console.log('New slide added');
}

// Duplicate current slide
function duplicateCurrentSlide() {
    if (AppState.slides.length === 0) {
        console.warn('No slides to duplicate');
        return;
    }
    
    console.log('Duplicating current slide...');
    
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    const duplicatedSlide = JSON.parse(JSON.stringify(currentSlide));
    duplicatedSlide.id = Date.now();
    
    // Insert after current slide
    AppState.slides.splice(AppState.currentSlideIndex + 1, 0, duplicatedSlide);
    AppState.currentSlideIndex++;
    
    updateSlideList();
    renderCurrentSlide();
    
    console.log('Slide duplicated');
}

// Delete current slide
function deleteCurrentSlide() {
    if (AppState.slides.length <= 1) {
        alert('Cannot delete the last slide');
        return;
    }
    
    console.log('Deleting current slide...');
    
    AppState.slides.splice(AppState.currentSlideIndex, 1);
    
    if (AppState.currentSlideIndex >= AppState.slides.length) {
        AppState.currentSlideIndex = AppState.slides.length - 1;
    }
    
    updateSlideList();
    renderCurrentSlide();
    
    console.log('Slide deleted');
}

// Update status bar
function updateStatusBar() {
    const slideInfo = document.getElementById('slideInfo');
    if (slideInfo) {
        slideInfo.textContent = `Slide ${AppState.currentSlideIndex + 1}/${AppState.slides.length}`;
    }
}

// Initialize AI panel
function initAIPanel() {
    console.log('Initializing AI panel...');
    
    // Get AI panel elements
    const aiPanel = document.querySelector('.deep-seek-panel');
    const toggleBtn = document.getElementById('toggleAIPanelBtn');
    const submitBtn = document.getElementById('ai-submit');
    const promptInput = document.getElementById('ai-prompt-input');
    
    // Toggle AI panel
    if (toggleBtn && aiPanel) {
        toggleBtn.addEventListener('click', function() {
            if (aiPanel.classList.contains('collapsed')) {
                aiPanel.classList.remove('collapsed');
                toggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
            } else {
                aiPanel.classList.add('collapsed');
                toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
            }
        });
    }
    
    // Handle AI prompt submission
    if (submitBtn && promptInput) {
        submitBtn.addEventListener('click', function() {
            handleAIPrompt();
        });
        
        promptInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAIPrompt();
            }
        });
    }
    
    console.log('AI panel initialized');
}

// Handle AI prompt with improved context awareness
function handleAIPrompt() {
    const promptInput = document.getElementById('ai-prompt-input');
    if (!promptInput) {
        console.error('AI prompt input not found');
        return;
    }
    
    const prompt = promptInput.value.trim();
    if (!prompt) {
        console.log('Empty prompt, not sending request');
        return;
    }
    
    console.log('Processing AI prompt:', prompt);
    
    // Clear input
    promptInput.value = '';
    
    // Add user message
    addAIMessage('user', prompt);
    
    // Add loading message
    const loadingMsgId = addAIMessage('assistant', '<div class="loading-spinner-small"></div> 생각 중...');
    
    // 현재 슬라이드 엘리먼트들의 스크린샷으로 캡쳐해 텍스트로 변환
    const currentSlideElement = document.getElementById('currentSlide');
    let slideSnapshot = "빈 슬라이드";
    
    if (currentSlideElement) {
        const elements = currentSlideElement.querySelectorAll('.slide-element');
        if (elements.length > 0) {
            slideSnapshot = `슬라이드에 ${elements.length}개의 요소가 있습니다: `;
            elements.forEach((elem, index) => {
                const type = elem.classList.contains('text') ? '텍스트' : 
                             elem.classList.contains('shape') ? '도형' : '요소';
                const content = elem.classList.contains('text') ? elem.innerText.substring(0, 20) : 
                                elem.classList.contains('shape') ? Array.from(elem.classList)
                                    .find(c => !['slide-element', 'shape', 'selected'].includes(c)) || '기본도형' : '내용없음';
                slideSnapshot += `${index+1}. ${type} (${content}) `;
            });
        }
    }
    
    // Get detailed presentation context for AI
    const presentationContext = {
        slideCount: AppState.slides.length,
        currentSlideIndex: AppState.currentSlideIndex,
        currentSlide: null,
        selectedElements: [],
        visualDescription: slideSnapshot,
        lastAction: AppState.lastAction
    };
    
    // Add current slide data with full details
    if (AppState.slides.length > 0) {
        const currentSlide = AppState.slides[AppState.currentSlideIndex];
        
        // Deep clone to avoid circular references
        presentationContext.currentSlide = {
            id: currentSlide.id,
            background: currentSlide.background,
            elements: []
        };
        
        // Fill in element details explicitly to avoid any circular references
        if (currentSlide.elements && Array.isArray(currentSlide.elements)) {
            currentSlide.elements.forEach(elem => {
                const elemData = {
                    id: elem.id,
                    type: elem.type,
                    x: elem.x,
                    y: elem.y,
                    width: elem.width,
                    height: elem.height,
                    rotation: elem.rotation || 0
                };
                
                // Add type-specific properties
                if (elem.type === 'text') {
                    elemData.content = elem.content || '';
                    elemData.fontSize = elem.fontSize;
                    elemData.fontFamily = elem.fontFamily;
                    elemData.color = elem.color;
                    elemData.textAlign = elem.textAlign;
                } else if (elem.type === 'shape') {
                    elemData.content = elem.content || 'rectangle';
                    if (elem.style) {
                        elemData.style = { ...elem.style };
                    }
                }
                
                presentationContext.currentSlide.elements.push(elemData);
            });
        }
    }
    
    // Add selected elements with full details
    if (AppState.selectedElements.length > 0) {
        AppState.selectedElements.forEach(elementId => {
            const element = findElementById(elementId);
            if (element) {
                const elemData = {
                    id: element.id,
                    type: element.type,
                    x: element.x,
                    y: element.y,
                    width: element.width,
                    height: element.height
                };
                
                if (element.type === 'text') {
                    elemData.content = element.content || '';
                } else if (element.type === 'shape') {
                    elemData.content = element.content || 'rectangle';
                }
                
                presentationContext.selectedElements.push(elemData);
            }
        });
    }
    
    // Capture current UI state
    const editorState = {
        slideWidth: currentSlideElement ? currentSlideElement.offsetWidth : 0,
        slideHeight: currentSlideElement ? currentSlideElement.offsetHeight : 0,
        zoom: AppState.zoom,
        isFullscreen: AppState.isFullscreen,
        activePanel: document.querySelector('.panel-tab.active')?.textContent || 'None'
    };
    
    // Combine all context
    const fullContext = {
        presentation: presentationContext,
        editorState: editorState,
        userRequest: prompt
    };
    
    console.log('Sending AI request with context:', fullContext);
    
    // Call API with enhanced context
    fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: prompt,
            context: fullContext
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        // Remove loading message
        removeAIMessage(loadingMsgId);
        
        if (data.success) {
            console.log('AI response received:', data);
            
            // Add AI response
            addAIMessage('assistant', data.response);
            
            // Process any actions returned from the server
            if (data.actions && Array.isArray(data.actions)) {
                processAIActions(data.actions);
            }
        } else {
            console.error('AI API returned error:', data.error);
            addAIMessage('assistant', '죄송합니다, 요청을 처리하는 중에 오류가 발생했습니다.');
            
            // Try local processing as fallback
            processLocalAIRequest(prompt, fullContext);
        }
    })
    .catch(error => {
        // Remove loading message
        removeAIMessage(loadingMsgId);
        
        console.error('AI API error:', error);
        addAIMessage('assistant', '죄송합니다, AI 서비스에 연결하는 중에 문제가 발생했습니다.');
        
        // Try local processing as fallback
        processLocalAIRequest(prompt, fullContext);
    });
}

// Process AI request locally when server fails
function processLocalAIRequest(prompt, context) {
    console.log('Processing AI request locally due to server error');
    
    // Extract current slide info from context
    const currentSlide = context.presentation.currentSlide;
    const visualDescription = context.presentation.visualDescription;
    
    // Simple rules for common requests
    let response = "";
    let actions = [];
    
    // Check for various intents
    if (prompt.includes('설명') || prompt.includes('보이') || prompt.includes('확인')) {
        response = `현재 슬라이드 정보: ${visualDescription}`;
    } 
    else if (prompt.includes('텍스트') && (prompt.includes('추가') || prompt.includes('넣어'))) {
        response = "텍스트를 추가했습니다.";
        actions.push({
            type: 'addText',
            text: '새 텍스트',
            x: 100,
            y: 100,
            width: 400,
            height: 100
        });
    }
    else if ((prompt.includes('원') || prompt.includes('동그라미')) && (prompt.includes('추가') || prompt.includes('넣어'))) {
        response = "원을 추가했습니다.";
        actions.push({
            type: 'addShape',
            shapeType: 'circle',
            x: 100,
            y: 100,
            width: 200,
            height: 200
        });
    }
    else if ((prompt.includes('사각형') || prompt.includes('네모')) && (prompt.includes('추가') || prompt.includes('넣어'))) {
        response = "사각형을 추가했습니다.";
        actions.push({
            type: 'addShape',
            shapeType: 'rectangle',
            x: 100,
            y: 100,
            width: 200,
            height: 150
        });
    }
    else if (prompt.includes('슬라이드') && prompt.includes('추가')) {
        response = "새 슬라이드를 추가했습니다.";
        actions.push({
            type: 'addSlide'
        });
    }
    else if (prompt.includes('분석') || prompt.includes('analyze')) {
        // 분석 요청 처리
        analyzeCurrentSlideWithAPI(context)
            .then(analysisResult => {
                if (analysisResult && analysisResult.success) {
                    // 분석 결과를 응답으로 추가
                    addAIMessage('assistant', `슬라이드 분석 결과:\n${analysisResult.analysis.feedback}`);
                    
                    // 제안 사항 추가
                    if (analysisResult.analysis.suggestions && analysisResult.analysis.suggestions.length > 0) {
                        let suggestionsText = "개선 제안:\n";
                        analysisResult.analysis.suggestions.forEach((suggestion, i) => {
                            suggestionsText += `${i+1}. ${suggestion}\n`;
                        });
                        addAIMessage('assistant', suggestionsText);
                    }
                }
            })
            .catch(error => {
                console.error('분석 중 오류 발생:', error);
                addAIMessage('assistant', '슬라이드 분석 중 오류가 발생했습니다.');
            });
            
        response = "슬라이드를 분석 중입니다...";
    }
    else {
        response = "죄송합니다. 서버 연결에 문제가 있어 제한된 응답만 가능합니다. 화면에는 " + (visualDescription || "정보가 보이지 않습니다.");
    }
    
    // Show response
    addAIMessage('assistant', response);
    
    // Execute actions
    if (actions.length > 0) {
        processAIActions(actions);
    }
}

// 서버 API를 통한 현재 슬라이드 분석 함수
function analyzeCurrentSlideWithAPI(context) {
    return new Promise((resolve, reject) => {
        // API 요청을 위한 데이터 준비
        const requestData = {
            context: context,
            content: {
                type: 'slide',
                data: context.presentation.currentSlide
            }
        };
        
        // 서버에 분석 요청
        fetch('/api/ai/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('분석 결과 수신:', data);
            resolve(data);
        })
        .catch(error => {
            console.error('분석 API 오류:', error);
            reject(error);
        });
    });
}

// Update UI based on AI suggestions
function updateUIWithSuggestions(suggestions) {
    if (suggestions.layout) {
        // Apply layout suggestions
        suggestions.layout.forEach(change => {
            const element = findElementById(change.elementId);
            if (element) {
                Object.assign(element, change.properties);
            }
        });
        renderCurrentSlide();
    }
    
    if (suggestions.style) {
        // Apply style suggestions
        suggestions.style.forEach(change => {
            const element = findElementById(change.elementId);
            if (element) {
                if (!element.style) element.style = {};
                Object.assign(element.style, change.style);
            }
        });
        renderCurrentSlide();
    }
    
    if (suggestions.content) {
        // Apply content suggestions
        suggestions.content.forEach(change => {
            const element = findElementById(change.elementId);
            if (element && element.type === 'text') {
                element.content = change.content;
            }
        });
        renderCurrentSlide();
    }
    
    // Update properties panel if needed
    if (AppState.selectedElements.length > 0) {
        updatePropertiesPanel(findElementById(AppState.selectedElements[0]));
    }
}

// Process AI actions
function processAIActions(actions) {
    actions.forEach(action => {
        console.log('Processing AI action:', action);
        
        switch (action.type) {
            case 'addText':
                const text = action.text || 'AI 생성 텍스트';
                const textX = action.x || 100;
                const textY = action.y || 100;
                const textWidth = action.width || 400;
                const textHeight = action.height || 100;
                
                addTextElement(text, textX, textY, textWidth, textHeight);
                break;
                
            case 'addShape':
                const shapeType = action.shapeType || 'rectangle';
                const shapeX = action.x || 100;
                const shapeY = action.y || 100;
                const shapeWidth = action.width || 200;
                const shapeHeight = action.height || 150;
                
                addShapeElement(shapeType, shapeX, shapeY, shapeWidth, shapeHeight);
                break;
                
            case 'addSlide':
                addNewSlide();
                break;
                
            case 'setBackground':
                if (action.color && AppState.slides.length > 0) {
                    AppState.slides[AppState.currentSlideIndex].background = action.color;
                    renderCurrentSlide();
                }
                break;
                
            case 'editElement':
                if (action.elementId) {
                    const element = findElementById(action.elementId);
                    if (element) {
                        // Update properties
                        if (action.properties) {
                            Object.assign(element, action.properties);
                        }
                        
                        // Update style properties
                        if (action.style && element.style) {
                            Object.assign(element.style, action.style);
                        }
                        
                        renderCurrentSlide();
                        selectElement(action.elementId);
                    }
                }
                break;
                
            case 'deleteElement':
                if (action.elementId) {
                    const element = findElementById(action.elementId);
                    if (element) {
                        // Remove element from current slide
                        const currentSlide = AppState.slides[AppState.currentSlideIndex];
                        const elementIndex = currentSlide.elements.findIndex(el => el.id == action.elementId);
                        
                        if (elementIndex !== -1) {
                            currentSlide.elements.splice(elementIndex, 1);
                            renderCurrentSlide();
                        }
                    }
                }
                break;
        }
    });
}

// Check AI response for action requests
function checkForActionRequests(response) {
    // Check for create slide request
    if (response.toLowerCase().includes('i have created a slide') || 
        response.toLowerCase().includes('i have generated a slide')) {
        // Implement slide creation logic here if needed
    }
    
    // Check for shape insertion request
    if (response.toLowerCase().includes('i have added a shape') ||
        response.toLowerCase().includes('i have inserted a shape')) {
        // Could trigger shape insertion, but we'd need coordinates from the AI
    }
}

// Add AI message with improved UI feedback
function addAIMessage(role, content) {
    const conversation = document.querySelector('.ai-conversation');
    if (!conversation) {
        console.error('AI conversation container not found');
        return null;
    }
    
    const messageId = Date.now();
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ${role}`;
    messageDiv.dataset.id = messageId;
    messageDiv.innerHTML = content;
    
    // Add to conversation
    conversation.appendChild(messageDiv);
    
    // Scroll to the new message
    setTimeout(() => {
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
    
    return messageId;
}

// Remove AI message
function removeAIMessage(messageId) {
    const message = document.querySelector(`.ai-message[data-id="${messageId}"]`);
    if (message) {
        message.remove();
    }
}

// Register event listeners
function registerEventListeners() {
    console.log('Registering event listeners...');
    
    // Slide management buttons
    registerSlideManagementListeners();
    
    // Element creation buttons
    registerElementCreationListeners();
    
    // Properties panel listeners
    registerPropertiesPanelListeners();
    
    // Panel toggle buttons
    registerPanelToggleListeners();
    
    // AI tools listeners
    registerAIToolListeners();
    
    // Export button handlers
    registerExportHandlers();
    
    console.log('Event listeners registered');
    
    // 활동 모니터링 및 자동 분석 시작
    userActivityMonitor.start();
    contentAnalyzer.start();
    
    // 앱 액션에 대한 이벤트 후킹
    hookAppActions();
}

// Register slide management listeners
function registerSlideManagementListeners() {
    // Add slide button
    const addSlideBtn = document.getElementById('addSlideBtn');
    if (addSlideBtn) {
        addSlideBtn.addEventListener('click', addNewSlide);
    }
    
    // New slide button in ribbon
    const newSlideBtn = document.getElementById('newSlideBtn');
    if (newSlideBtn) {
        newSlideBtn.addEventListener('click', addNewSlide);
    }
    
    // Delete slide button (in ribbon)
    const deleteSlideBtn = document.getElementById('deleteSlideBtn');
    if (deleteSlideBtn) {
        deleteSlideBtn.addEventListener('click', deleteCurrentSlide);
    }
    
    // Delete slide button (in sidebar)
    const deleteSlideBtn2 = document.getElementById('deleteSlideBtn2');
    if (deleteSlideBtn2) {
        deleteSlideBtn2.addEventListener('click', deleteCurrentSlide);
    }
    
    // Duplicate slide button (in ribbon)
    const duplicateSlideBtn = document.getElementById('duplicateSlideBtn');
    if (duplicateSlideBtn) {
        duplicateSlideBtn.addEventListener('click', duplicateCurrentSlide);
    }
    
    // Duplicate slide button (in sidebar)
    const duplicateSlideBtn2 = document.getElementById('duplicateSlideBtn2');
    if (duplicateSlideBtn2) {
        duplicateSlideBtn2.addEventListener('click', duplicateCurrentSlide);
    }
}

// Register element creation listeners
function registerElementCreationListeners() {
    // Add text button
    const addTextBtn = document.getElementById('addTextBtn');
    if (addTextBtn) {
        addTextBtn.addEventListener('click', function() {
            addTextElement('Click to edit text', 100, 100, 600, 100);
        });
    }
    
    // Add shape button
    const addShapeBtn = document.getElementById('addShapeBtn');
    if (addShapeBtn) {
        addShapeBtn.addEventListener('click', function() {
            // Show shape selection modal
            const shapeModal = document.getElementById('shapeModal');
            if (shapeModal) {
                shapeModal.style.display = 'flex';
                shapeModal.classList.add('active');
                
                // Make sure the modal is visible
                shapeModal.style.opacity = '1';
                shapeModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            } else {
                // Fallback: add a rectangle
                addShapeElement('rectangle', 100, 100, 200, 150);
            }
        });
    }
    
    // Shape selection in modal
    const shapeItems = document.querySelectorAll('.shape-item');
    shapeItems.forEach(item => {
        item.addEventListener('click', function() {
            const shapeType = this.getAttribute('data-shape');
            
            // Close modal
            const shapeModal = document.getElementById('shapeModal');
            if (shapeModal) {
                shapeModal.style.display = 'none';
                shapeModal.classList.remove('active');
            }
            
            // Add the selected shape
            addShapeElement(shapeType, 100, 100, 200, 150);
        });
    });
    
    // Close buttons for modals
    const closeButtons = document.querySelectorAll('.close-btn');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Find parent modal
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
            }
        });
    });
    
    // Close modal when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            e.target.classList.remove('active');
        }
    });
    
    // Hook up keyboard events for modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close any open modals
            const modals = document.querySelectorAll('.modal.active');
            modals.forEach(modal => {
                modal.style.display = 'none';
                modal.classList.remove('active');
            });
        }
    });
}

// Register properties panel listeners
function registerPropertiesPanelListeners() {
    // Panel tabs
    const panelTabs = document.querySelectorAll('.panel-tab');
    panelTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const panelName = this.getAttribute('data-panel');
            
            // Deactivate all tabs and contents
            panelTabs.forEach(t => t.classList.remove('active'));
            const panelContents = document.querySelectorAll('.panel-content');
            panelContents.forEach(c => c.classList.remove('active'));
            
            // Activate this tab
            this.classList.add('active');
            
            // Activate corresponding panel
            const panel = document.getElementById(`${panelName}-panel`);
            if (panel) {
                panel.classList.add('active');
            }
        });
    });
    
    // Position and size inputs
    const elementX = document.getElementById('elementX');
    const elementY = document.getElementById('elementY');
    const elementWidth = document.getElementById('elementWidth');
    const elementHeight = document.getElementById('elementHeight');
    
    [elementX, elementY, elementWidth, elementHeight].forEach(input => {
        if (!input) return;
        
        input.addEventListener('change', function() {
            if (AppState.selectedElements.length === 0) return;
            
            const elementId = AppState.selectedElements[0];
            const element = findElementById(elementId);
            if (!element) return;
            
            const newX = elementX ? parseInt(elementX.value) || 0 : element.x;
            const newY = elementY ? parseInt(elementY.value) || 0 : element.y;
            const newWidth = elementWidth ? parseInt(elementWidth.value) || 100 : element.width;
            const newHeight = elementHeight ? parseInt(elementHeight.value) || 100 : element.height;
            
            // Update element dimensions and position
            updateElementSize(elementId, newWidth, newHeight, newX, newY);
        });
    });
    
    // Rotation input
    const elementRotation = document.getElementById('elementRotation');
    if (elementRotation) {
        elementRotation.addEventListener('input', function() {
            if (AppState.selectedElements.length === 0) return;
            
            const elementId = AppState.selectedElements[0];
            const rotation = parseInt(this.value) || 0;
            
            // Update rotation display
            const rotationValue = document.getElementById('rotationValue');
            if (rotationValue) rotationValue.textContent = `${rotation}°`;
            
            // Update element rotation
            updateElementRotation(elementId, rotation);
        });
    }
    
    // Border width input
    const borderWidth = document.getElementById('borderWidth');
    if (borderWidth) {
        borderWidth.addEventListener('change', function() {
            if (AppState.selectedElements.length === 0) return;
            
            const elementId = AppState.selectedElements[0];
            const element = findElementById(elementId);
            if (!element || element.type !== 'shape') return;
            
            if (!element.style) element.style = {};
            element.style.borderWidth = parseInt(this.value) || 1;
            
            renderCurrentSlide();
            selectElement(elementId);
        });
    }
    
    // Opacity slider
    const elementOpacity = document.getElementById('elementOpacity');
    if (elementOpacity) {
        elementOpacity.addEventListener('input', function() {
            if (AppState.selectedElements.length === 0) return;
            
            const elementId = AppState.selectedElements[0];
            const element = findElementById(elementId);
            if (!element) return;
            
            const opacityPercent = parseInt(this.value) || 100;
            const opacity = opacityPercent / 100;
            
            // Update opacity display
            const opacityValue = document.getElementById('opacityValue');
            if (opacityValue) opacityValue.textContent = `${opacityPercent}%`;
            
            // Update element opacity
            if (!element.style) element.style = {};
            element.style.opacity = opacity;
            
            // Update element without full re-render
            const elementDiv = document.querySelector(`.slide-element[data-id="${elementId}"]`);
            if (elementDiv) {
                elementDiv.style.opacity = opacity;
            }
        });
    }
    
    // Text formatting buttons
    const textFormatButtons = {
        'textBoldBtn': 'fontWeight',
        'textItalicBtn': 'fontStyle',
        'textUnderlineBtn': 'textDecoration',
        'textAlignLeftBtn': 'textAlign',
        'textAlignCenterBtn': 'textAlign',
        'textAlignRightBtn': 'textAlign',
        'textAlignJustifyBtn': 'textAlign'
    };
    
    Object.keys(textFormatButtons).forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        
        btn.addEventListener('click', function() {
            if (AppState.selectedElements.length === 0) return;
            
            const elementId = AppState.selectedElements[0];
            const element = findElementById(elementId);
            if (!element || element.type !== 'text') return;
            
            const property = textFormatButtons[btnId];
            let value;
            
            switch (btnId) {
                case 'textBoldBtn':
                    value = element.fontWeight === 'bold' ? 'normal' : 'bold';
                    break;
                case 'textItalicBtn':
                    value = element.fontStyle === 'italic' ? 'normal' : 'italic';
                    break;
                case 'textUnderlineBtn':
                    value = element.textDecoration === 'underline' ? 'none' : 'underline';
                    break;
                case 'textAlignLeftBtn':
                    value = 'left';
                    break;
                case 'textAlignCenterBtn':
                    value = 'center';
                    break;
                case 'textAlignRightBtn':
                    value = 'right';
                    break;
                case 'textAlignJustifyBtn':
                    value = 'justify';
                    break;
            }
            
            updateElementProperty(elementId, property, value);
            
            // Update button active state for alignment buttons
            if (btnId.includes('Align')) {
                document.querySelectorAll('[id^="textAlign"]').forEach(button => {
                    button.classList.remove('active');
                });
                btn.classList.add('active');
            } else {
                // Toggle active state for style buttons
                btn.classList.toggle('active');
            }
        });
    });
    
    // Color inputs
    const colorInputs = {
        'textColor': 'color',
        'elementBgColor': 'backgroundColor',
        'elementBorderColor': 'borderColor'
    };
    
    Object.keys(colorInputs).forEach(inputId => {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        input.addEventListener('change', function() {
            if (AppState.selectedElements.length === 0) return;
            
            const elementId = AppState.selectedElements[0];
            const element = findElementById(elementId);
            if (!element) return;
            
            const property = colorInputs[inputId];
            let value = this.value;
            
            if (property === 'backgroundColor' || property === 'borderColor') {
                if (!element.style) element.style = {};
                element.style[property === 'backgroundColor' ? 'color' : 'borderColor'] = value;
            } else {
                element[property] = value;
            }
            
            renderCurrentSlide();
            selectElement(elementId);
        });
    });
    
    // Font size and family
    const textFontSize = document.getElementById('textFontSize');
    const textFontFamily = document.getElementById('textFontFamily');
    
    if (textFontSize) {
        textFontSize.addEventListener('change', function() {
            if (AppState.selectedElements.length === 0) return;
            
            const elementId = AppState.selectedElements[0];
            const element = findElementById(elementId);
            if (!element || element.type !== 'text') return;
            
            element.fontSize = parseInt(this.value) || 16;
            renderCurrentSlide();
            selectElement(elementId);
        });
    }
    
    if (textFontFamily) {
        textFontFamily.addEventListener('change', function() {
            if (AppState.selectedElements.length === 0) return;
            
            const elementId = AppState.selectedElements[0];
            const element = findElementById(elementId);
            if (!element || element.type !== 'text') return;
            
            element.fontFamily = this.value;
            renderCurrentSlide();
            selectElement(elementId);
        });
    }
}

// Register panel toggle listeners
function registerPanelToggleListeners() {
    // Close properties panel button
    const closePropertiesBtn = document.getElementById('closePropertiesBtn');
    if (closePropertiesBtn) {
        closePropertiesBtn.addEventListener('click', function() {
            const propertiesPanel = document.querySelector('.properties-panel');
            if (propertiesPanel) {
                propertiesPanel.classList.remove('active');
            }
            
            // Deselect any selected elements
            deselectAllElements();
        });
    }
    
    // Toggle notes panel button
    const toggleNotesBtn = document.getElementById('toggleNotesBtn');
    if (toggleNotesBtn) {
        toggleNotesBtn.addEventListener('click', function() {
            const notesPanel = document.querySelector('.presenter-notes-panel');
            if (notesPanel) {
                notesPanel.classList.toggle('collapsed');
                
                // Update button icon
                const isCollapsed = notesPanel.classList.contains('collapsed');
                this.innerHTML = isCollapsed 
                    ? '<i class="fas fa-chevron-down"></i>' 
                    : '<i class="fas fa-chevron-up"></i>';
            }
        });
    }
}

// Register AI tool listeners
function registerAIToolListeners() {
    // AI tools in the AI Assistant ribbon
    const aiTools = document.querySelectorAll('.ai-tool-btn');
    aiTools.forEach(tool => {
        tool.addEventListener('click', function() {
            const toolId = this.id;
            handleAIToolClick(toolId);
        });
    });
}

// Handle AI tool click
function handleAIToolClick(toolId) {
    const aiPromptInput = document.getElementById('ai-prompt-input');
    if (!aiPromptInput) return;
    
    switch (toolId) {
        case 'aiGenerateContentBtn':
            aiPromptInput.value = "Generate content about [topic]";
            break;
            
        case 'aiImproveDesignBtn':
            aiPromptInput.value = "Suggest design improvements for this slide";
            break;
            
        case 'aiGenerateTemplateBtn':
            aiPromptInput.value = "Create a presentation template about [topic]";
            break;
            
        case 'aiAnalyzeSlideBtn':
            aiPromptInput.value = "Analyze this slide and provide feedback";
            handleAnalyzeSlide(); // 분석 직접 호출
            break;
            
        case 'aiAnalyzePresentationBtn':
            aiPromptInput.value = "Analyze the structure and flow of my presentation";
            break;
            
        case 'aiSuggestTransitionBtn':
            aiPromptInput.value = "Suggest transitions between slides";
            break;
    }
    
    // Focus the input
    aiPromptInput.focus();
}

// 슬라이드 분석 함수
function handleAnalyzeSlide() {
    // 현재 슬라이드 정보 수집
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    if (!currentSlide) {
        showNotification('분석할 슬라이드가 없습니다', 'warning');
        return;
    }
    
    showNotification('슬라이드 분석 중...', 'info');
    
    // 슬라이드 스냅샷 캡처
    const currentSlideElement = document.getElementById('currentSlide');
    let slideSnapshot = "빈 슬라이드";
    
    if (currentSlideElement) {
        const elements = currentSlideElement.querySelectorAll('.slide-element');
        if (elements.length > 0) {
            slideSnapshot = `슬라이드에 ${elements.length}개의 요소가 있습니다: `;
            elements.forEach((elem, index) => {
                const type = elem.classList.contains('text') ? '텍스트' : 
                             elem.classList.contains('shape') ? '도형' : '요소';
                const content = elem.classList.contains('text') ? elem.innerText.substring(0, 20) : 
                                elem.classList.contains('shape') ? Array.from(elem.classList)
                                    .find(c => !['slide-element', 'shape', 'selected'].includes(c)) || '기본도형' : '내용없음';
                slideSnapshot += `${index+1}. ${type} (${content}) `;
            });
        }
    }
    
    // 컨텍스트 준비
    const presentationContext = {
        slideCount: AppState.slides.length,
        currentSlideIndex: AppState.currentSlideIndex,
        currentSlide: currentSlide,
        selectedElements: AppState.selectedElements.map(id => findElementById(id)),
        visualDescription: slideSnapshot
    };
    
    // 분석 API 호출
    const requestData = {
        context: {
            presentation: presentationContext
        },
        content: {
            type: 'slide',
            data: currentSlide
        }
    };
    
    fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('분석 결과:', data);
        
        if (data.success) {
            // 분석 결과 표시
            showAnalysisResult(data.analysis);
        } else {
            showNotification('분석 처리 중 오류가 발생했습니다', 'error');
        }
    })
    .catch(error => {
        console.error('분석 API 오류:', error);
        showNotification('슬라이드 분석 요청 실패', 'error');
        
        // 로컬 폴백 처리
        showAnalysisResult({
            score: 50,
            feedback: "서버 연결 오류로 제한된 분석만 가능합니다.\n\n" + slideSnapshot,
            suggestions: [
                "슬라이드 요소들의 균형을 확인하세요",
                "텍스트 크기와 가독성을 검토하세요",
                "불필요한 요소를 제거하여 핵심 메시지에 집중하세요"
            ]
        });
    });
}

// 분석 결과 표시
function showAnalysisResult(analysis) {
    const modal = document.createElement('div');
    modal.className = 'modal analysis-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>슬라이드 분석 결과</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="analysis-details">
                <div class="analysis-score">
                    <div class="score-display">${analysis.score || 'N/A'}</div>
                    <div class="score-label">점수</div>
                </div>
                <div class="analysis-feedback">
                    ${analysis.feedback || '피드백이 없습니다.'}
                </div>
                ${analysis.suggestions && analysis.suggestions.length > 0 ? `
                <div class="analysis-suggestions">
                    <h4>개선 제안</h4>
                    <ul>
                        ${analysis.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
            <div class="modal-actions">
                <button class="btn btn-primary close-analysis-btn">확인</button>
                <button class="btn btn-secondary apply-suggestions-btn">제안 적용</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 이벤트 리스너 추가
    const closeBtn = modal.querySelector('.close-btn');
    const closeAnalysisBtn = modal.querySelector('.close-analysis-btn');
    const applySuggestionsBtn = modal.querySelector('.apply-suggestions-btn');
    
    closeBtn.addEventListener('click', () => modal.remove());
    closeAnalysisBtn.addEventListener('click', () => modal.remove());
    
    applySuggestionsBtn.addEventListener('click', () => {
        // 제안 자동 적용 로직
        if (analysis.improvements) {
            applyImprovements(analysis.improvements);
            showNotification('개선 사항을 적용했습니다', 'success');
        } else {
            showNotification('적용할 개선 사항이 없습니다', 'info');
        }
        modal.remove();
    });
    
    // 모달 바깥쪽 클릭 시 닫기
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function applyImprovements(improvements) {
    // 아직 구현되지 않은 기능
    console.log('개선 사항 적용:', improvements);
    
    // 향후 구현: 서버에서 제안한 개선 사항 적용
    if (improvements.layout) {
        // 레이아웃 개선
        // ...
    }
    
    if (improvements.content) {
        // 콘텐츠 개선
        // ...
    }
    
    // 화면 갱신
    renderCurrentSlide();
}

// Register export button handlers
function registerExportHandlers() {
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', showExportModal);
    }
}

// Show export modal dialog
function showExportModal() {
    // Remove any existing modal
    const existingModal = document.getElementById('exportModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create export modal
    const modal = document.createElement('div');
    modal.id = 'exportModal';
    modal.className = 'modal export-modal';
    modal.style.display = 'flex';
    modal.classList.add('active');
    
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Export Presentation</h3>
                <button class="close-btn">&times;</button>
            </div>
            <p>Choose export format:</p>
            <div class="export-options">
                <div class="export-option" data-format="pdf">
                    <div class="export-option-icon">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <div class="export-option-details">
                        <div class="export-option-title">PDF Document</div>
                        <div class="export-option-desc">Export as a PDF file for sharing and printing</div>
                    </div>
                </div>
                <div class="export-option" data-format="pptx">
                    <div class="export-option-icon">
                        <i class="fas fa-file-powerpoint"></i>
                    </div>
                    <div class="export-option-details">
                        <div class="export-option-title">PowerPoint (PPTX)</div>
                        <div class="export-option-desc">Export as PowerPoint presentation for editing</div>
                    </div>
                </div>
                <div class="export-option" data-format="html">
                    <div class="export-option-icon">
                        <i class="fas fa-code"></i>
                    </div>
                    <div class="export-option-details">
                        <div class="export-option-title">HTML Slides</div>
                        <div class="export-option-desc">Export as web-based presentation</div>
                    </div>
                </div>
                <div class="export-option" data-format="images">
                    <div class="export-option-icon">
                        <i class="fas fa-images"></i>
                    </div>
                    <div class="export-option-details">
                        <div class="export-option-title">Image Sequence</div>
                        <div class="export-option-desc">Export slides as individual image files</div>
                    </div>
                </div>
                <div class="export-option" data-format="json">
                    <div class="export-option-icon">
                        <i class="fas fa-file-code"></i>
                    </div>
                    <div class="export-option-details">
                        <div class="export-option-title">JSON Data</div>
                        <div class="export-option-desc">Export presentation data for backup or import</div>
                    </div>
                </div>
            </div>
            <div class="export-actions">
                <button id="cancelExportBtn" class="btn btn-light">Cancel</button>
                <button id="confirmExportBtn" class="btn btn-primary" disabled>Export</button>
            </div>
        </div>
    `;
    
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);
    
    // Add event handlers
    const closeBtn = modal.querySelector('.close-btn');
    const cancelBtn = modal.querySelector('#cancelExportBtn');
    const confirmBtn = modal.querySelector('#confirmExportBtn');
    const exportOptions = modal.querySelectorAll('.export-option');
    
    let selectedFormat = null;
    
    // Close modal handlers
    closeBtn.addEventListener('click', () => modal.remove());
    cancelBtn.addEventListener('click', () => modal.remove());
    
    // Handle format selection
    exportOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Deselect all options
            exportOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Select this option
            this.classList.add('selected');
            
            // Enable export button
            confirmBtn.removeAttribute('disabled');
            
            // Store selected format
            selectedFormat = this.getAttribute('data-format');
        });
    });
    
    // Handle export
    confirmBtn.addEventListener('click', function() {
        if (!selectedFormat) return;
        
        exportPresentation(selectedFormat);
        modal.remove();
    });
    
    // Close when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Export presentation in selected format
function exportPresentation(format) {
    console.log(`Exporting presentation as ${format}...`);
    
    switch (format) {
        case 'json':
            exportAsJSON();
            break;
            
        case 'pdf':
        case 'pptx':
        case 'html':
        case 'images':
            // Show progress notification
            showNotification(`Preparing ${format.toUpperCase()} export...`);
            
            // Call backend API for conversion
            fetch('/api/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    format: format,
                    slides: AppState.slides,
                    title: 'My Presentation'
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Export failed: ${response.status} ${response.statusText}`);
                }
                return response.blob();
            })
            .then(blob => {
                // Create a download link and click it
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `presentation.${format === 'images' ? 'zip' : format}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                showNotification('Export completed successfully!', 'success');
            })
            .catch(error => {
                console.error('Export error:', error);
                showNotification(`Export failed: ${error.message}`, 'error');
                
                // For demo purposes, use client-side fallback for JSON
                if (format === 'pdf' || format === 'pptx') {
                    showNotification('Using simplified export instead...', 'warning');
                    setTimeout(() => exportAsJSON(), 1000);
                }
            });
            break;
            
        default:
            console.warn(`Unsupported export format: ${format}`);
    }
}

// Export presentation as JSON data
function exportAsJSON() {
    // Create a JSON blob
    const presentationData = {
        slides: AppState.slides,
        title: 'My Presentation',
        exportDate: new Date().toISOString()
    };
    
    const jsonBlob = new Blob([JSON.stringify(presentationData, null, 2)], { type: 'application/json' });
    
    // Create a download link and click it
    const url = URL.createObjectURL(jsonBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('JSON export completed successfully!', 'success');
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove any existing notification
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            </div>
            <div class="notification-message">${message}</div>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add close handler
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => notification.remove());
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('notification-hiding');
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

// Start application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    try {
        initApp();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}); 

// Update element size with better SVG handling
function updateElementSize(elementId, width, height, x, y) {
    const element = findElementById(elementId);
    if (!element) return;
    
    // Update element properties
    element.width = width;
    element.height = height;
    element.x = x;
    element.y = y;
    
    // Complex SVG shapes might need a full re-render for correct appearance
    const complexSvgShapes = ['star', 'diamond', 'pentagon', 'hexagon', 'parallelogram', 
                             'trapezoid', 'arrow', 'double-arrow', 'cross'];
                             
    if (element.type === 'shape' && complexSvgShapes.includes(element.content)) {
        // Get current slide
        const currentSlideElement = document.getElementById('currentSlide');
        if (currentSlideElement) {
            // Remove existing element
            const oldElement = document.querySelector(`.slide-element[data-id="${elementId}"]`);
            if (oldElement && oldElement.parentNode) {
                oldElement.parentNode.removeChild(oldElement);
            }
            
            // Re-render this specific element
            renderElement(element, currentSlideElement);
            
            // Re-select the element
            selectElement(elementId);
        }
        return;
    }
    
    // For simpler elements, update UI without full re-render
    const elementDiv = document.querySelector(`.slide-element[data-id="${elementId}"]`);
    if (elementDiv) {
        elementDiv.style.width = `${width}px`;
        elementDiv.style.height = `${height}px`;
        elementDiv.style.left = `${x}px`;
        elementDiv.style.top = `${y}px`;
        
        // Update SVG for shape elements
        if (element.type === 'shape') {
            const svg = elementDiv.querySelector('svg');
            if (svg) {
                svg.setAttribute('width', width);
                svg.setAttribute('height', height);
                
                // For triangle, update its appearance directly
                if (element.content === 'triangle') {
                    const halfWidth = Math.round(width / 2);
                    elementDiv.style.borderLeft = `${halfWidth}px solid transparent`;
                    elementDiv.style.borderRight = `${halfWidth}px solid transparent`;
                    elementDiv.style.borderBottom = `${height}px solid ${element.style?.color || '#3498db'}`;
                }
                
                // For callout, reposition the triangle
                if (element.content === 'callout') {
                    const calloutTriangle = elementDiv.querySelector('div');
                    if (calloutTriangle) {
                        calloutTriangle.style.bottom = '-15px';
                        calloutTriangle.style.left = '15px';
                    }
                }
            }
        }
    }
} 