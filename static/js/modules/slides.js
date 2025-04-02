/**
 * Slides module for managing slides and their content
 */

// Store current slides
let slides = [];
let currentSlideIndex = 0;

// Initialize slides functionality
export function initSlides() {
    console.log('Initializing slides module');
    setupSlideControls();
}

// Setup slide control buttons
function setupSlideControls() {
    // New slide button
    const newSlideBtn = document.getElementById('newSlideBtn');
    if (newSlideBtn) {
        newSlideBtn.addEventListener('click', addNewSlide);
    }
    
    // Slides pane event delegation for slide selection
    const slidesPane = document.getElementById('slides-pane');
    if (slidesPane) {
        slidesPane.addEventListener('click', function(e) {
            const slideItem = e.target.closest('.slide-item');
            if (slideItem) {
                const index = parseInt(slideItem.getAttribute('data-index'));
                if (!isNaN(index)) {
                    selectSlide(index);
                }
            }
        });
    }
}

// Load slides from the server
export function loadSlides() {
    return fetch('/get_slides')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                slides = data.slides;
                renderSlides();
                
                // Select the first slide if available
                if (slides.length > 0) {
                    selectSlide(0);
                }
                
                return slides;
            } else {
                console.error('Failed to load slides:', data.error);
                return [];
            }
        })
        .catch(error => {
            console.error('Error loading slides:', error);
            return [];
        });
}

// Create slides from a topic
export function createSlidesFromTopic(topic, slideCount) {
    return fetch('/generate_from_topic', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, slide_count: slideCount })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            slides = data.slides;
            renderSlides();
            
            // Select the first slide
            if (slides.length > 0) {
                selectSlide(0);
            }
            
            return slides;
        } else {
            console.error('Failed to create slides:', data.error);
            throw new Error(data.error);
        }
    });
}

// Save current slides to the server
export function saveSlides() {
    return fetch('/save_slides', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slides })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Slides saved successfully');
            return true;
        } else {
            console.error('Failed to save slides:', data.error);
            return false;
        }
    })
    .catch(error => {
        console.error('Error saving slides:', error);
        return false;
    });
}

// Render all slides in the thumbnails list
function renderSlides() {
    const slidesPane = document.getElementById('slides-pane');
    if (!slidesPane) return;
    
    // Clear existing slides
    slidesPane.innerHTML = '';
    
    // Create slide thumbnails
    slides.forEach((slide, index) => {
        const slideItem = document.createElement('div');
        slideItem.className = 'slide-item';
        slideItem.setAttribute('data-index', index);
        
        if (index === currentSlideIndex) {
            slideItem.classList.add('active');
        }
        
        const slideNumber = document.createElement('div');
        slideNumber.className = 'slide-number';
        slideNumber.textContent = index + 1;
        
        const slideThumbnail = document.createElement('div');
        slideThumbnail.className = 'slide-thumbnail';
        slideThumbnail.textContent = slide.title || `Slide ${index + 1}`;
        
        slideItem.appendChild(slideNumber);
        slideItem.appendChild(slideThumbnail);
        slidesPane.appendChild(slideItem);
    });
    
    // Update slide counter in status bar
    updateSlideCounter();
}

// Add a new slide
function addNewSlide() {
    const newSlideIndex = slides.length;
    
    // Create a simple empty slide
    const newSlide = {
        title: `Slide ${newSlideIndex + 1}`,
        content: '',
        elements: []
    };
    
    // Add to slides array
    slides.push(newSlide);
    
    // Render slides and select the new one
    renderSlides();
    selectSlide(newSlideIndex);
    
    // Save the updated slides
    saveSlides();
}

// Select a slide to display
export function selectSlide(index) {
    if (index < 0 || index >= slides.length) return;
    
    // Update current slide index
    currentSlideIndex = index;
    
    // Update active state in thumbnails
    const slideItems = document.querySelectorAll('.slide-item');
    slideItems.forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Render the selected slide in the canvas
    renderCurrentSlide();
    
    // Update slide counter
    updateSlideCounter();
}

// Render the current slide in the editor
function renderCurrentSlide() {
    const slideCanvas = document.getElementById('slide-canvas');
    if (!slideCanvas) return;
    
    // Clear the canvas
    slideCanvas.innerHTML = '';
    
    if (slides.length === 0 || currentSlideIndex >= slides.length) return;
    
    const slide = slides[currentSlideIndex];
    
    // Add slide title if it exists
    if (slide.title) {
        const titleElement = document.createElement('div');
        titleElement.className = 'slide-title';
        titleElement.textContent = slide.title;
        titleElement.style.position = 'absolute';
        titleElement.style.top = '40px';
        titleElement.style.left = '0';
        titleElement.style.width = '100%';
        titleElement.style.textAlign = 'center';
        slideCanvas.appendChild(titleElement);
    }
    
    // Add slide content if it exists
    if (slide.content) {
        const contentElement = document.createElement('div');
        contentElement.className = 'slide-content';
        contentElement.textContent = slide.content;
        contentElement.style.position = 'absolute';
        contentElement.style.top = '100px';
        contentElement.style.left = '60px';
        contentElement.style.width = 'calc(100% - 120px)';
        slideCanvas.appendChild(contentElement);
    }
    
    // Add slide elements if they exist
    if (slide.elements && Array.isArray(slide.elements)) {
        slide.elements.forEach(element => {
            const elementNode = createElementNode(element);
            if (elementNode) {
                slideCanvas.appendChild(elementNode);
            }
        });
    }
}

// Create a DOM node for a slide element
function createElementNode(element) {
    if (!element || !element.type) return null;
    
    const node = document.createElement('div');
    node.className = `slide-element ${element.type}`;
    node.id = element.id || `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    node.setAttribute('data-type', element.type);
    
    // Set position and size
    node.style.position = 'absolute';
    node.style.left = `${element.x || 0}px`;
    node.style.top = `${element.y || 0}px`;
    node.style.width = `${element.width || 100}px`;
    node.style.height = `${element.height || 100}px`;
    
    // Set rotation if it exists
    if (element.rotation) {
        node.style.transform = `rotate(${element.rotation}deg)`;
    }
    
    // Set style properties
    if (element.style) {
        if (element.style.color) {
            node.style.backgroundColor = element.style.color;
        }
        
        if (element.style.borderColor) {
            node.style.borderColor = element.style.borderColor;
        }
        
        if (element.style.borderWidth) {
            node.style.borderWidth = typeof element.style.borderWidth === 'string' 
                ? element.style.borderWidth 
                : `${element.style.borderWidth}px`;
        }
        
        if (element.style.borderStyle) {
            node.style.borderStyle = element.style.borderStyle;
        }
    }
    
    // Handle different element types
    if (element.type === 'shape') {
        // Shape rendering logic
        node.setAttribute('data-shape', element.content);
        renderShape(node, element.content);
    } else if (element.type === 'text') {
        // Text element
        node.style.backgroundColor = 'transparent';
        node.style.color = element.style?.textColor || '#000000';
        node.style.fontSize = element.style?.fontSize || '16px';
        node.style.textAlign = element.style?.textAlign || 'center';
        node.style.display = 'flex';
        node.style.alignItems = 'center';
        node.style.justifyContent = 'center';
        node.textContent = element.content || '';
    }
    
    // Make element selectable and draggable (in a real implementation)
    makeElementInteractive(node);
    
    return node;
}

// Render specific shapes
function renderShape(node, shapeType) {
    // Simple implementation - in a real app, we'd use SVG or canvas
    // Special handling for various shapes
    switch (shapeType) {
        case 'circle':
            node.style.borderRadius = '50%';
            break;
        case 'triangle':
            node.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
            break;
        case 'star':
            node.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
            break;
        // Add more shapes as needed
    }
}

// Add interaction capabilities to elements
function makeElementInteractive(node) {
    // Add click handler
    node.addEventListener('click', function(e) {
        e.stopPropagation();
        selectElement(this);
    });
    
    // For simplicity, we're not implementing drag functionality here
    // In a real app, we'd add proper drag and resize handlers
}

// Select an element for editing
function selectElement(element) {
    // Remove selection from all elements
    document.querySelectorAll('.slide-element').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Add selection to this element
    element.classList.add('selected');
    
    // Enable delete button
    const deleteBtn = document.getElementById('deleteBtn');
    if (deleteBtn) {
        deleteBtn.disabled = false;
    }
    
    // Update formatting panel to show element properties
    updateFormatPanelForElement(element);
}

// Update the format panel based on selected element
function updateFormatPanelForElement(element) {
    // This would be implemented to show current element styles in the format panel
    console.log('Selected element:', element.id);
    
    // In a real implementation, we would extract current styling and 
    // update the format panel inputs
}

// Update slide counter in the status bar
function updateSlideCounter() {
    const currentSlideNumber = document.getElementById('current-slide-number');
    const totalSlides = document.getElementById('total-slides');
    
    if (currentSlideNumber) {
        currentSlideNumber.textContent = currentSlideIndex + 1;
    }
    
    if (totalSlides) {
        totalSlides.textContent = slides.length;
    }
} 