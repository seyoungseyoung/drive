/**
 * UI module to handle PowerPoint-like interface elements
 */

import { AppState, addNewSlide, duplicateCurrentSlide, deleteSelectedElement, undo, redo, exportPresentation } from '../index.js';
import { changeSlideBackground, getCurrentColorPalette, getThemeByName } from './themes.js';

// Initialize UI components
export function initUI() {
    console.log('Initializing PowerPoint-like UI');
    setupRibbonTabs();
    setupFormatPanel();
    setupPowerPointView();
    setupButtonEvents();
    setupStickyMenuBar();
    setupModalEvents();
    setupIndependentScroll();
    updateUIState();
}

// Show the PowerPoint UI after initial setup
export function showPowerPointUI() {
    // Hide initial setup
    document.querySelector('.hero').style.display = 'none';
    document.getElementById('initialSetup').style.display = 'none';
    
    // Show PowerPoint UI
    document.getElementById('powerpoint-ui').style.display = 'block';
}

// Setup ribbon tab functionality
function setupRibbonTabs() {
    const ribbonTabs = document.querySelectorAll('.ribbon-tab');
    const ribbonContents = document.querySelectorAll('.ribbon-content');
    
    ribbonTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            
            // Remove active class from all tabs
            ribbonTabs.forEach(t => t.classList.remove('active'));
            ribbonContents.forEach(c => c.classList.remove('active'));
            
            // Select the clicked tab
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
    // New slide button
    document.querySelectorAll('#newSlideBtn, #addSlideBtn').forEach(btn => {
        btn?.addEventListener('click', () => {
            addNewSlide();
        });
    });
    
    // Duplicate slide button
    document.querySelectorAll('#duplicateSlideBtn, #duplicateSlideBtn2').forEach(btn => {
        btn?.addEventListener('click', () => {
            duplicateCurrentSlide();
        });
    });
    
    // Delete slide button
    document.querySelectorAll('#deleteSlideBtn, #deleteSlideBtn2').forEach(btn => {
        btn?.addEventListener('click', () => {
            if (AppState.slides.length > 1) {
                const index = AppState.currentSlideIndex;
                AppState.slides.splice(index, 1);
                AppState.currentSlideIndex = Math.min(index, AppState.slides.length - 1);
                updateSlideList();
                updateCurrentSlide();
            } else {
                alert('Minimum 1 slide is required');
            }
        });
    });
    
    // Undo/Redo buttons
    document.getElementById('undoBtn')?.addEventListener('click', () => {
        if (AppState.slideHistory.undo.length > 0) {
            undo();
        }
    });
    
    document.getElementById('redoBtn')?.addEventListener('click', () => {
        if (AppState.slideHistory.redo.length > 0) {
            redo();
        }
    });
    
    // Add text button
    document.getElementById('addTextBtn')?.addEventListener('click', () => {
        addTextElement();
    });
    
    // Add shape button
    document.getElementById('addShapeBtn')?.addEventListener('click', () => {
        openShapeModal();
    });
    
    // Add image button
    document.getElementById('addImageBtn')?.addEventListener('click', () => {
        openImageModal();
    });
    
    // Add chart button
    document.getElementById('addChartBtn')?.addEventListener('click', () => {
        openChartModal();
    });
    
    // Export button
    document.getElementById('exportBtn')?.addEventListener('click', () => {
        openExportModal();
    });
    
    // Background color button
    document.getElementById('bgColorBtn')?.addEventListener('click', () => {
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.style.position = 'absolute';
        colorPicker.style.left = '-9999px';
        document.body.appendChild(colorPicker);
        
        colorPicker.addEventListener('change', (e) => {
            changeSlideBackground(e.target.value);
            document.body.removeChild(colorPicker);
        });
        
        colorPicker.addEventListener('cancel', () => {
            document.body.removeChild(colorPicker);
        });
        
        colorPicker.click();
    });
    
    // Slide show button
    document.getElementById('slideShowBtn')?.addEventListener('click', () => {
        startSlideshow();
    });
    
    // AI toggle button
    document.getElementById('toggleAIBtn')?.addEventListener('click', () => {
        toggleAIPanel();
    });
    
    // Element style controls
    setupElementStyleControls();
}

// Element style controls
function setupElementStyleControls() {
    // Background color change
    document.getElementById('elementBgColor')?.addEventListener('change', (e) => {
        if (AppState.selectedElement) {
            updateSelectedElementStyle('backgroundColor', e.target.value);
        }
    });
    
    // Border color change
    document.getElementById('elementBorderColor')?.addEventListener('change', (e) => {
        if (AppState.selectedElement) {
            updateSelectedElementStyle('borderColor', e.target.value);
        }
    });
    
    // Opacity change
    document.getElementById('elementOpacity')?.addEventListener('input', (e) => {
        if (AppState.selectedElement) {
            const opacity = parseInt(e.target.value) / 100;
            updateSelectedElementStyle('opacity', opacity);
            
            // Opacity value update
            document.getElementById('opacityValue').textContent = `${e.target.value}%`;
        }
    });
    
    // Border width change
    document.getElementById('borderWidth')?.addEventListener('change', (e) => {
        if (AppState.selectedElement) {
            updateSelectedElementStyle('borderWidth', `${e.target.value}px`);
        }
    });
    
    // Border style change
    document.getElementById('borderStyle')?.addEventListener('change', (e) => {
        if (AppState.selectedElement) {
            updateSelectedElementStyle('borderStyle', e.target.value);
        }
    });
    
    // Element position change
    document.getElementById('elementX')?.addEventListener('change', (e) => {
        if (AppState.selectedElement) {
            updateSelectedElementPosition('x', parseInt(e.target.value));
        }
    });
    
    document.getElementById('elementY')?.addEventListener('change', (e) => {
        if (AppState.selectedElement) {
            updateSelectedElementPosition('y', parseInt(e.target.value));
        }
    });
    
    // Element size change
    document.getElementById('elementWidth')?.addEventListener('change', (e) => {
        if (AppState.selectedElement) {
            const width = parseInt(e.target.value);
            updateSelectedElementSize('width', width);
            
            // Fixed aspect ratio case
            if (document.getElementById('lockAspectRatio').checked) {
                const aspectRatio = AppState.selectedElement.height / AppState.selectedElement.width;
                const newHeight = Math.round(width * aspectRatio);
                document.getElementById('elementHeight').value = newHeight;
                updateSelectedElementSize('height', newHeight);
            }
        }
    });
    
    document.getElementById('elementHeight')?.addEventListener('change', (e) => {
        if (AppState.selectedElement) {
            const height = parseInt(e.target.value);
            updateSelectedElementSize('height', height);
            
            // Fixed aspect ratio case
            if (document.getElementById('lockAspectRatio').checked) {
                const aspectRatio = AppState.selectedElement.width / AppState.selectedElement.height;
                const newWidth = Math.round(height * aspectRatio);
                document.getElementById('elementWidth').value = newWidth;
                updateSelectedElementSize('width', newWidth);
            }
        }
    });
    
    // Rotation change
    document.getElementById('elementRotation')?.addEventListener('input', (e) => {
        if (AppState.selectedElement) {
            const rotation = parseInt(e.target.value);
            updateSelectedElementStyle('transform', `rotate(${rotation}deg)`);
            
            // Rotation value update
            document.getElementById('rotationValue').textContent = `${rotation}°`;
        }
    });
    
    // Bring to front button
    document.getElementById('bringToFrontBtn')?.addEventListener('click', () => {
        if (AppState.selectedElement) {
            bringElementToFront();
        }
    });
    
    document.getElementById('sendToBackBtn')?.addEventListener('click', () => {
        if (AppState.selectedElement) {
            sendElementToBack();
        }
    });
}

// Setup sticky menu bar
function setupStickyMenuBar() {
    const ribbonMenu = document.querySelector('.ribbon-menu');
    const workspace = document.querySelector('.workspace');
    
    if (!ribbonMenu || !workspace) return;
    
    // Save initial position of ribbon menu
    const ribbonTop = ribbonMenu.offsetTop;
    
    // Add scroll event listener
    window.addEventListener('scroll', () => {
        if (window.scrollY >= ribbonTop) {
            ribbonMenu.classList.add('sticky');
            workspace.style.marginTop = ribbonMenu.offsetHeight + 'px';
        } else {
            ribbonMenu.classList.remove('sticky');
            workspace.style.marginTop = '0';
        }
    });
}

// Setup modal events
function setupModalEvents() {
    // Close button
    document.querySelectorAll('.modal .close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Close modal on external click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Shape selection modal events
    setupShapeModalEvents();
    
    // Image upload modal events
    setupImageModalEvents();
    
    // Export modal events
    setupExportModalEvents();
}

// Shape selection modal events
function setupShapeModalEvents() {
    const shapeModal = document.getElementById('shapeModal');
    const shapeItems = document.querySelectorAll('.shape-item');
    
    shapeItems.forEach(item => {
        item.addEventListener('click', () => {
            const shapeType = item.getAttribute('data-shape');
            addShapeElement(shapeType);
            shapeModal.style.display = 'none';
        });
    });
}

// Image upload modal events
function setupImageModalEvents() {
    const imageModal = document.getElementById('imageModal');
    const uploadInput = document.getElementById('imageUploadInput');
    const uploadBtn = document.getElementById('uploadImageBtn');
    const cancelBtn = document.getElementById('cancelImageBtn');
    const addToSlideBtn = document.getElementById('addImageToSlideBtn');
    const imagePreview = document.getElementById('imagePreview');
    
    // File select button
    uploadBtn?.addEventListener('click', () => {
        uploadInput.click();
    });
    
    // File select preview
    uploadInput?.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                imagePreview.src = event.target.result;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    // Cancel button
    cancelBtn?.addEventListener('click', () => {
        imageModal.style.display = 'none';
    });
    
    // Add to slide button
    addToSlideBtn?.addEventListener('click', () => {
        if (imagePreview.src) {
            addImageElement(imagePreview.src);
            imageModal.style.display = 'none';
        }
    });
}

// Export modal events
function setupExportModalEvents() {
    const exportModal = document.getElementById('exportModal');
    const cancelBtn = document.getElementById('cancelExportBtn');
    const confirmBtn = document.getElementById('confirmExportBtn');
    
    // Cancel button
    cancelBtn?.addEventListener('click', () => {
        exportModal.style.display = 'none';
    });
    
    // Export button
    confirmBtn?.addEventListener('click', () => {
        const format = document.getElementById('exportFormat').value;
        const quality = document.getElementById('exportQuality').value;
        
        // Update export status
        AppState.exportConfig = {
            format,
            quality
        };
        
        // Execute export
        exportPresentation();
        
        exportModal.style.display = 'none';
    });
}

// Setup independent scroll
function setupIndependentScroll() {
    const slideEditor = document.querySelector('.slide-editor');
    const slideExplorer = document.querySelector('.slide-explorer');
    
    if (slideEditor) {
        slideEditor.classList.add('independent-scroll');
    }
    
    if (slideExplorer) {
        slideExplorer.classList.add('independent-scroll');
    }
}

// Initial UI state setup
function updateUIState() {
    // Ribbon menu initial state
    document.querySelector('.ribbon-tab[data-tab="home"]')?.classList.add('active');
    document.getElementById('home-ribbon')?.classList.add('active');
    
    // Properties panel initial state
    document.querySelector('.panel-tab[data-panel="style"]')?.classList.add('active');
    document.getElementById('style-panel')?.classList.add('active');
}

// Selected element style update
function updateSelectedElementStyle(property, value) {
    if (!AppState.selectedElement) return;
    
    const elementId = AppState.selectedElement.elementId;
    const elementEl = document.getElementById(`element-${elementId}`);
    
    if (elementEl) {
        // DOM element style update
        elementEl.style[property] = value;
        
        // App state update
        const currentSlide = AppState.slides[AppState.currentSlideIndex];
        const element = currentSlide.elements.find(el => el.id === elementId);
        
        if (element) {
            if (!element.style) element.style = {};
            element.style[property] = value;
            
            // Element update event
            document.dispatchEvent(new CustomEvent('element-updated', {
                detail: { element }
            }));
        }
    }
}

// Selected element position update
function updateSelectedElementPosition(axis, value) {
    if (!AppState.selectedElement) return;
    
    const elementId = AppState.selectedElement.elementId;
    const elementEl = document.getElementById(`element-${elementId}`);
    
    if (elementEl) {
        // DOM element position update
        elementEl.style[axis === 'x' ? 'left' : 'top'] = `${value}px`;
        
        // App state update
        const currentSlide = AppState.slides[AppState.currentSlideIndex];
        const element = currentSlide.elements.find(el => el.id === elementId);
        
        if (element) {
            element[axis] = value;
            
            // Element update event
            document.dispatchEvent(new CustomEvent('element-updated', {
                detail: { element }
            }));
        }
    }
}

// Selected element size update
function updateSelectedElementSize(dimension, value) {
    if (!AppState.selectedElement) return;
    
    const elementId = AppState.selectedElement.elementId;
    const elementEl = document.getElementById(`element-${elementId}`);
    
    if (elementEl) {
        // DOM element size update
        elementEl.style[dimension] = `${value}px`;
        
        // App state update
        const currentSlide = AppState.slides[AppState.currentSlideIndex];
        const element = currentSlide.elements.find(el => el.id === elementId);
        
        if (element) {
            element[dimension] = value;
            
            // Element update event
            document.dispatchEvent(new CustomEvent('element-updated', {
                detail: { element }
            }));
        }
    }
}

// Modal open functions
function openShapeModal() {
    document.getElementById('shapeModal').style.display = 'block';
}

function openImageModal() {
    document.getElementById('imageModal').style.display = 'block';
}

function openChartModal() {
    // Chart modal implementation needed
    alert('Chart addition feature is still under development.');
}

function openExportModal() {
    document.getElementById('exportModal').style.display = 'block';
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

// Element rendering (simple version, reference index.js functions)
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
    
    if (element.style) {
        Object.keys(element.style).forEach(key => {
            elementEl.style[key] = element.style[key];
        });
    }
    
    // Type-specific rendering
    switch (element.type) {
        case 'text':
            elementEl.innerHTML = element.content || 'Enter text here';
            elementEl.contentEditable = true;
            break;
        case 'shape':
            if (element.shape === 'circle') {
                elementEl.style.borderRadius = '50%';
            }
            break;
        case 'image':
            elementEl.style.backgroundImage = `url(${element.url})`;
            elementEl.style.backgroundSize = 'contain';
            elementEl.style.backgroundPosition = 'center';
            elementEl.style.backgroundRepeat = 'no-repeat';
            break;
    }
    
    // Event listener
    elementEl.addEventListener('click', (e) => {
        e.stopPropagation();
        selectElement(element.id, elementEl);
    });
    
    // Make element draggable
    makeElementDraggable(elementEl);
    
    container.appendChild(elementEl);
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

// Element draggable
function makeElementDraggable(element) {
    let isDragging = false;
    let startX, startY;
    let elementX, elementY;
    
    element.addEventListener('mousedown', startDrag);
    
    function startDrag(e) {
        if (e.target !== element) return;
        
        e.preventDefault();
        
        // Element selection
        selectElement(parseInt(element.dataset.id), element);
        
        // Drag start
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        elementX = parseInt(element.style.left) || 0;
        elementY = parseInt(element.style.top) || 0;
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
    }
    
    function drag(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        
        // Move distance calculation
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        // New position calculation
        const newX = elementX + deltaX;
        const newY = elementY + deltaY;
        
        // Position update
        element.style.left = `${newX}px`;
        element.style.top = `${newY}px`;
        
        // Properties panel position field update
        document.getElementById('elementX').value = newX;
        document.getElementById('elementY').value = newY;
    }
    
    function stopDrag() {
        if (!isDragging) return;
        
        isDragging = false;
        
        // Remove event listeners
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
        
        // App state update
        const elementId = parseInt(element.dataset.id);
        const currentSlide = AppState.slides[AppState.currentSlideIndex];
        const slideElement = currentSlide.elements.find(el => el.id === elementId);
        
        if (slideElement) {
            slideElement.x = parseInt(element.style.left);
            slideElement.y = parseInt(element.style.top);
            
            // Element update event
            document.dispatchEvent(new CustomEvent('element-updated', {
                detail: { element: slideElement }
            }));
        }
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