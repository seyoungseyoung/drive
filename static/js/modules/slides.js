/**
 * Slides module for managing slides and their content
 */

// Store current slides
let slides = [];
let currentSlideIndex = 0;

// Available transitions
const slideTransitions = {
    none: {
        name: 'None',
        duration: 0,
        apply: (slideElement) => {
            slideElement.style.transition = 'none';
        }
    },
    fade: {
        name: 'Fade',
        duration: 0.7,
        apply: (slideElement) => {
            slideElement.style.transition = `opacity ${slideTransitions.fade.duration}s ease`;
            slideElement.style.opacity = '0';
            setTimeout(() => {
                slideElement.style.opacity = '1';
            }, 50);
        }
    },
    slideLeft: {
        name: 'Slide Left',
        duration: 0.7,
        apply: (slideElement) => {
            slideElement.style.transition = `transform ${slideTransitions.slideLeft.duration}s ease`;
            slideElement.style.transform = 'translateX(100%)';
            setTimeout(() => {
                slideElement.style.transform = 'translateX(0)';
            }, 50);
        }
    },
    slideRight: {
        name: 'Slide Right',
        duration: 0.7,
        apply: (slideElement) => {
            slideElement.style.transition = `transform ${slideTransitions.slideRight.duration}s ease`;
            slideElement.style.transform = 'translateX(-100%)';
            setTimeout(() => {
                slideElement.style.transform = 'translateX(0)';
            }, 50);
        }
    },
    slideUp: {
        name: 'Slide Up',
        duration: 0.7,
        apply: (slideElement) => {
            slideElement.style.transition = `transform ${slideTransitions.slideUp.duration}s ease`;
            slideElement.style.transform = 'translateY(100%)';
            setTimeout(() => {
                slideElement.style.transform = 'translateY(0)';
            }, 50);
        }
    },
    slideDown: {
        name: 'Slide Down',
        duration: 0.7,
        apply: (slideElement) => {
            slideElement.style.transition = `transform ${slideTransitions.slideDown.duration}s ease`;
            slideElement.style.transform = 'translateY(-100%)';
            setTimeout(() => {
                slideElement.style.transform = 'translateY(0)';
            }, 50);
        }
    },
    zoom: {
        name: 'Zoom',
        duration: 0.7,
        apply: (slideElement) => {
            slideElement.style.transition = `transform ${slideTransitions.zoom.duration}s ease`;
            slideElement.style.transform = 'scale(0.5)';
            slideElement.style.opacity = '0';
            setTimeout(() => {
                slideElement.style.transform = 'scale(1)';
                slideElement.style.opacity = '1';
            }, 50);
        }
    },
    flip: {
        name: 'Flip',
        duration: 0.7,
        apply: (slideElement) => {
            slideElement.style.transition = `transform ${slideTransitions.flip.duration}s ease`;
            slideElement.style.transform = 'rotateY(90deg)';
            setTimeout(() => {
                slideElement.style.transform = 'rotateY(0deg)';
            }, 50);
        }
    }
};

// Initialize slides functionality
export function initSlides() {
    console.log('Initializing slides module');
    setupSlideControls();
    setupTransitionUI();
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

    // Add context menu for slides
    setupSlideContextMenu();
}

// Setup UI for slide transitions
function setupTransitionUI() {
    const transitionSelect = document.getElementById('slide-transition');
    if (transitionSelect) {
        // Populate transition options
        Object.keys(slideTransitions).forEach(transition => {
            const option = document.createElement('option');
            option.value = transition;
            option.textContent = slideTransitions[transition].name;
            transitionSelect.appendChild(option);
        });

        // Add change event listener
        transitionSelect.addEventListener('change', (e) => {
            if (slides.length === 0 || currentSlideIndex >= slides.length) return;
            
            // Save transition to current slide
            slides[currentSlideIndex].transition = e.target.value;
            console.log(`Applied transition "${e.target.value}" to slide ${currentSlideIndex + 1}`);
        });
    }

    // Duration slider
    const durationSlider = document.getElementById('transition-duration');
    if (durationSlider) {
        durationSlider.addEventListener('input', (e) => {
            if (slides.length === 0 || currentSlideIndex >= slides.length) return;
            
            // Save duration to current slide
            slides[currentSlideIndex].transitionDuration = parseFloat(e.target.value);
            
            // Update display
            const durationDisplay = document.getElementById('duration-value');
            if (durationDisplay) {
                durationDisplay.textContent = `${e.target.value}s`;
            }
            
            console.log(`Set transition duration to ${e.target.value}s for slide ${currentSlideIndex + 1}`);
        });
    }
}

// Setup context menu for slides in the thumbnails pane
function setupSlideContextMenu() {
    const slidesPane = document.getElementById('slides-pane');
    if (!slidesPane) return;
    
    // Create context menu
    const contextMenu = document.createElement('div');
    contextMenu.id = 'slide-context-menu';
    contextMenu.className = 'context-menu';
    contextMenu.innerHTML = `
        <ul>
            <li id="ctx-duplicate-slide">Duplicate Slide</li>
            <li id="ctx-delete-slide">Delete Slide</li>
            <li class="divider"></li>
            <li id="ctx-move-slide-up">Move Up</li>
            <li id="ctx-move-slide-down">Move Down</li>
            <li class="divider"></li>
            <li id="ctx-transition">Transition...</li>
        </ul>
    `;
    document.body.appendChild(contextMenu);
    
    // Context menu variables
    let menuVisible = false;
    let slideIndexForContext = -1;
    
    // Show context menu on right-click
    slidesPane.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        
        const slideItem = e.target.closest('.slide-item');
        if (!slideItem) return;
        
        // Get slide index
        slideIndexForContext = parseInt(slideItem.getAttribute('data-index'));
        if (isNaN(slideIndexForContext)) return;
        
        // Position and show menu
        contextMenu.style.top = `${e.clientY}px`;
        contextMenu.style.left = `${e.clientX}px`;
        contextMenu.style.display = 'block';
        menuVisible = true;
        
        // Enable/disable move options based on position
        const moveUpOption = document.getElementById('ctx-move-slide-up');
        const moveDownOption = document.getElementById('ctx-move-slide-down');
        
        if (moveUpOption) {
            moveUpOption.classList.toggle('disabled', slideIndexForContext === 0);
        }
        
        if (moveDownOption) {
            moveDownOption.classList.toggle('disabled', slideIndexForContext === slides.length - 1);
        }
    });
    
    // Hide context menu when clicking elsewhere
    document.addEventListener('click', function() {
        if (menuVisible) {
            contextMenu.style.display = 'none';
            menuVisible = false;
        }
    });
    
    // Handle context menu actions
    contextMenu.addEventListener('click', function(e) {
        if (slideIndexForContext < 0) return;
        
        const action = e.target.id;
        
        switch (action) {
            case 'ctx-duplicate-slide':
                duplicateSlide(slideIndexForContext);
                break;
            case 'ctx-delete-slide':
                deleteSlide(slideIndexForContext);
                break;
            case 'ctx-move-slide-up':
                moveSlide(slideIndexForContext, slideIndexForContext - 1);
                break;
            case 'ctx-move-slide-down':
                moveSlide(slideIndexForContext, slideIndexForContext + 1);
                break;
            case 'ctx-transition':
                showTransitionDialog(slideIndexForContext);
                break;
        }
        
        // Hide the menu
        contextMenu.style.display = 'none';
        menuVisible = false;
    });
}

// Show dialog for setting slide transition
function showTransitionDialog(slideIndex) {
    // Select the slide first
    selectSlide(slideIndex);
    
    // Get the transition panel and show it
    const transitionPanel = document.getElementById('transition-panel');
    if (transitionPanel) {
        transitionPanel.style.display = 'block';
        
        // If the slide has a transition, select it
        const slide = slides[slideIndex];
        const transitionSelect = document.getElementById('slide-transition');
        
        if (transitionSelect && slide.transition) {
            transitionSelect.value = slide.transition;
        }
        
        // Set duration if available
        const durationSlider = document.getElementById('transition-duration');
        const durationDisplay = document.getElementById('duration-value');
        
        if (durationSlider && slide.transitionDuration) {
            durationSlider.value = slide.transitionDuration;
            if (durationDisplay) {
                durationDisplay.textContent = `${slide.transitionDuration}s`;
            }
        }
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
        elements: [],
        transition: 'none',
        transitionDuration: 0.7
    };
    
    // Add to slides array
    slides.push(newSlide);
    
    // Render slides and select the new one
    renderSlides();
    selectSlide(newSlideIndex);
    
    // Save the updated slides
    saveSlides();
}

// Duplicate a slide
function duplicateSlide(index) {
    if (index < 0 || index >= slides.length) return;
    
    // Create a deep copy of the slide
    const originalSlide = slides[index];
    const duplicatedSlide = JSON.parse(JSON.stringify(originalSlide));
    
    // Update the title to indicate it's a copy
    duplicatedSlide.title = `${originalSlide.title} (Copy)`;
    
    // Insert after the original
    slides.splice(index + 1, 0, duplicatedSlide);
    
    // Render and select the new slide
    renderSlides();
    selectSlide(index + 1);
    
    // Save the updated slides
    saveSlides();
    
    console.log(`Duplicated slide ${index + 1}`);
}

// Delete a slide
function deleteSlide(index) {
    if (index < 0 || index >= slides.length) return;
    
    // Don't delete if it's the only slide
    if (slides.length <= 1) {
        alert('Cannot delete the only slide in the presentation.');
        return;
    }
    
    // Remove the slide
    slides.splice(index, 1);
    
    // Adjust current slide index if needed
    if (currentSlideIndex >= slides.length) {
        currentSlideIndex = slides.length - 1;
    }
    
    // Render and select
    renderSlides();
    selectSlide(currentSlideIndex);
    
    // Save the updated slides
    saveSlides();
    
    console.log(`Deleted slide ${index + 1}`);
}

// Move a slide from one position to another
function moveSlide(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= slides.length || 
        toIndex < 0 || toIndex >= slides.length) {
        return;
    }
    
    // Get the slide to move
    const slide = slides[fromIndex];
    
    // Remove from current position
    slides.splice(fromIndex, 1);
    
    // Insert at new position
    slides.splice(toIndex, 0, slide);
    
    // Update current slide index if needed
    if (currentSlideIndex === fromIndex) {
        currentSlideIndex = toIndex;
    } else if (currentSlideIndex > fromIndex && currentSlideIndex <= toIndex) {
        currentSlideIndex--;
    } else if (currentSlideIndex < fromIndex && currentSlideIndex >= toIndex) {
        currentSlideIndex++;
    }
    
    // Render and select
    renderSlides();
    selectSlide(currentSlideIndex);
    
    // Save the updated slides
    saveSlides();
    
    console.log(`Moved slide from position ${fromIndex + 1} to ${toIndex + 1}`);
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
    
    // Update transition UI
    updateTransitionUI();
}

// Update transition UI for the selected slide
function updateTransitionUI() {
    if (slides.length === 0 || currentSlideIndex >= slides.length) return;
    
    const slide = slides[currentSlideIndex];
    
    // Update transition selection
    const transitionSelect = document.getElementById('slide-transition');
    if (transitionSelect && slide.transition) {
        transitionSelect.value = slide.transition;
    }
    
    // Update duration slider
    const durationSlider = document.getElementById('transition-duration');
    const durationDisplay = document.getElementById('duration-value');
    
    if (durationSlider && slide.transitionDuration !== undefined) {
        durationSlider.value = slide.transitionDuration;
        if (durationDisplay) {
            durationDisplay.textContent = `${slide.transitionDuration}s`;
        }
    }
}

// Render the current slide in the editor
function renderCurrentSlide() {
    const slideCanvas = document.getElementById('slide-canvas');
    if (!slideCanvas) return;
    
    // Clear the canvas
    slideCanvas.innerHTML = '';
    
    if (slides.length === 0 || currentSlideIndex >= slides.length) return;
    
    const slide = slides[currentSlideIndex];
    
    // Apply transition if specified
    if (slide.transition && slide.transition !== 'none') {
        const transition = slideTransitions[slide.transition];
        if (transition) {
            transition.apply(slideCanvas);
        }
    }
    
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

// Get all available transitions
export function getAvailableTransitions() {
    return Object.keys(slideTransitions).map(key => ({
        id: key,
        name: slideTransitions[key].name
    }));
}

// Apply a specific transition to the current slide
export function applyTransition(transitionName) {
    if (!transitionName || slides.length === 0 || currentSlideIndex >= slides.length) return;
    
    slides[currentSlideIndex].transition = transitionName;
    updateTransitionUI();
}

// Get the current slide
export function getCurrentSlide() {
    if (slides.length === 0 || currentSlideIndex >= slides.length) return null;
    return slides[currentSlideIndex];
}

// Get all slides
export function getAllSlides() {
    return slides;
}

// Get current slide index
export function getCurrentSlideIndex() {
    return currentSlideIndex;
} 