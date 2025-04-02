/**
 * Presenter module for presentation mode with presenter view
 */

// Track presentation state
let isPresenting = false;
let currentSlideIndex = 0;
let presentationWindow = null;
let presentationTimer = null;
let presentationStartTime = null;
let timerInterval = null;

// Import slide functions
import { getAllSlides, getCurrentSlideIndex } from './slides.js';

// Initialize presenter module
export function initPresenter() {
    console.log('Initializing presenter module');
    setupPresenterButtons();
}

// Setup presenter UI buttons
function setupPresenterButtons() {
    const presentBtn = document.getElementById('presentBtn');
    if (presentBtn) {
        presentBtn.addEventListener('click', startPresentation);
    }
}

// Start presentation mode
export function startPresentation() {
    // Get all slides
    const slides = getAllSlides();
    
    if (!slides || slides.length === 0) {
        alert('No slides to present');
        return;
    }
    
    // Set initial slide
    currentSlideIndex = getCurrentSlideIndex();
    
    // Create presentation window
    const presentationWidth = window.screen.width * 0.8;
    const presentationHeight = window.screen.height * 0.8;
    const left = (window.screen.width - presentationWidth) / 2;
    const top = (window.screen.height - presentationHeight) / 2;
    
    presentationWindow = window.open('', 'presentation', 
        `width=${presentationWidth},height=${presentationHeight},left=${left},top=${top}`);
    
    if (!presentationWindow) {
        alert('Popup blocked. Please allow popups for presentation mode.');
        return;
    }
    
    // Set presentation state
    isPresenting = true;
    
    // Create presentation HTML
    const presentationHTML = createPresentationHTML(slides);
    presentationWindow.document.write(presentationHTML);
    
    // Close presentation when window is closed
    presentationWindow.onunload = endPresentation;
    
    // Setup keyboard controls in both windows
    setupKeyboardControls();
    
    // Show presenter view controls
    showPresenterControls();
    
    // Start timer
    startPresentationTimer();
    
    console.log('Presentation started');
}

// Create HTML for presentation window
function createPresentationHTML(slides) {
    // Basic HTML structure
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Presentation</title>
            <style>
                body, html {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    background-color: #000;
                    font-family: Arial, sans-serif;
                }
                
                #presentation-container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                
                .slide {
                    display: none;
                    width: 960px;
                    height: 540px;
                    background-color: white;
                    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
                    position: relative;
                }
                
                .slide.active {
                    display: block;
                }
                
                .slide-content {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }
                
                .slide-number {
                    position: absolute;
                    bottom: 10px;
                    right: 10px;
                    font-size: 14px;
                    color: #666;
                }
                
                .slide-title {
                    margin-top: 40px;
                    text-align: center;
                    font-size: 32px;
                    font-weight: bold;
                }
                
                /* Animation classes */
                .transition-fade {
                    opacity: 0;
                    transition: opacity 0.5s ease;
                }
                
                .transition-fade.active {
                    opacity: 1;
                }
                
                /* Laser pointer */
                #laser-pointer {
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background-color: red;
                    box-shadow: 0 0 5px 2px rgba(255, 0, 0, 0.5);
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.1s;
                    z-index: 9999;
                }
            </style>
        </head>
        <body>
            <div id="presentation-container">
                ${slides.map((slide, index) => `
                    <div id="slide-${index}" class="slide ${index === currentSlideIndex ? 'active' : ''}">
                        <div class="slide-content">
                            ${getSlideSvgContent(slide, index)}
                        </div>
                        <div class="slide-number">${index + 1} / ${slides.length}</div>
                    </div>
                `).join('')}
            </div>
            <div id="laser-pointer"></div>
            
            <script>
                let isLaserActive = false;
                const laserPointer = document.getElementById('laser-pointer');
                
                // Listen for messages from presenter view
                window.addEventListener('message', function(event) {
                    if (event.data.type === 'navigation') {
                        navigateToSlide(event.data.index);
                    } else if (event.data.type === 'laser') {
                        if (event.data.state === 'on') {
                            isLaserActive = true;
                            laserPointer.style.opacity = '1';
                        } else {
                            isLaserActive = false;
                            laserPointer.style.opacity = '0';
                        }
                    } else if (event.data.type === 'laserMove') {
                        if (isLaserActive) {
                            laserPointer.style.left = event.data.x + 'px';
                            laserPointer.style.top = event.data.y + 'px';
                        }
                    }
                });
                
                // Navigation function
                function navigateToSlide(index) {
                    const slides = document.querySelectorAll('.slide');
                    slides.forEach((slide, i) => {
                        slide.classList.remove('active');
                        if (i === index) {
                            slide.classList.add('active');
                        }
                    });
                }
                
                // Key controls for presentation window
                window.addEventListener('keydown', function(e) {
                    const slides = document.querySelectorAll('.slide');
                    let currentIndex = Array.from(slides).findIndex(slide => slide.classList.contains('active'));
                    
                    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
                        if (currentIndex < slides.length - 1) {
                            navigateToSlide(currentIndex + 1);
                            window.opener.postMessage({ type: 'slideChanged', index: currentIndex + 1 }, '*');
                        }
                    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'Backspace') {
                        if (currentIndex > 0) {
                            navigateToSlide(currentIndex - 1);
                            window.opener.postMessage({ type: 'slideChanged', index: currentIndex - 1 }, '*');
                        }
                    } else if (e.key === 'Escape') {
                        window.close();
                    }
                });
            </script>
        </body>
        </html>
    `;
    
    return html;
}

// Get SVG content for a slide
function getSlideSvgContent(slide, index) {
    // This is a simplified version - in a real implementation, you would
    // need to properly convert all slide elements to SVG or HTML
    
    let content = '';
    
    // Add title if it exists
    if (slide.title) {
        content += `<div class="slide-title">${slide.title}</div>`;
    }
    
    // Add slide content if it exists
    if (slide.content) {
        content += `<div class="slide-text" style="margin: 20px; font-size: 24px;">${slide.content}</div>`;
    }
    
    // Add elements if they exist (simplified)
    if (slide.elements && Array.isArray(slide.elements)) {
        // This is a placeholder - in a real implementation, you would
        // need to convert all elements to SVG or HTML
        content += `<div id="elements-container-${index}" class="elements-container"></div>`;
    }
    
    return content;
}

// Show presenter controls
function showPresenterControls() {
    const presenterView = document.createElement('div');
    presenterView.id = 'presenter-view';
    presenterView.className = 'presenter-view';
    
    // Create presenter view content
    presenterView.innerHTML = `
        <div class="presenter-header">
            <div class="presenter-timer" id="presenter-timer">00:00:00</div>
            <div class="presenter-controls">
                <button id="prev-slide-btn" class="presenter-btn"><i class="fas fa-arrow-left"></i> Previous</button>
                <button id="next-slide-btn" class="presenter-btn">Next <i class="fas fa-arrow-right"></i></button>
                <button id="laser-pointer-btn" class="presenter-btn"><i class="fas fa-circle"></i> Laser</button>
                <button id="end-presentation-btn" class="presenter-btn"><i class="fas fa-times"></i> End</button>
            </div>
        </div>
        <div class="presenter-content">
            <div class="current-slide-preview">
                <h3>Current Slide</h3>
                <div id="current-slide-container" class="slide-preview"></div>
            </div>
            <div class="next-slide-preview">
                <h3>Next Slide</h3>
                <div id="next-slide-container" class="slide-preview"></div>
            </div>
            <div class="presenter-notes">
                <h3>Notes</h3>
                <div id="slide-notes" class="notes-content">
                    <p>No notes for this slide.</p>
                </div>
            </div>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(presenterView);
    
    // Add CSS for presenter view
    const style = document.createElement('style');
    style.textContent = `
        .presenter-view {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background-color: #f5f5f5;
            border-top: 1px solid #ddd;
            z-index: 9999;
            padding: 10px;
        }
        
        .presenter-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 10px;
            border-bottom: 1px solid #ddd;
        }
        
        .presenter-timer {
            font-size: 24px;
            font-weight: bold;
            font-family: monospace;
        }
        
        .presenter-controls {
            display: flex;
            gap: 10px;
        }
        
        .presenter-btn {
            padding: 8px 16px;
            background-color: #2980b9;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .presenter-btn:hover {
            background-color: #3498db;
        }
        
        .presenter-content {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            padding-top: 10px;
            height: 200px;
        }
        
        .slide-preview {
            background-color: white;
            border: 1px solid #ddd;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        
        .notes-content {
            background-color: white;
            border: 1px solid #ddd;
            height: 100%;
            padding: 10px;
            overflow-y: auto;
        }
        
        .laser-active {
            background-color: #e74c3c;
        }
    `;
    document.head.appendChild(style);
    
    // Setup controls
    setupPresenterControls();
    
    // Update slide previews
    updateSlidePreviews();
}

// Setup presenter controls
function setupPresenterControls() {
    // Previous slide button
    const prevSlideBtn = document.getElementById('prev-slide-btn');
    if (prevSlideBtn) {
        prevSlideBtn.addEventListener('click', () => {
            navigateToSlide(currentSlideIndex - 1);
        });
    }
    
    // Next slide button
    const nextSlideBtn = document.getElementById('next-slide-btn');
    if (nextSlideBtn) {
        nextSlideBtn.addEventListener('click', () => {
            navigateToSlide(currentSlideIndex + 1);
        });
    }
    
    // Laser pointer button
    const laserBtn = document.getElementById('laser-pointer-btn');
    if (laserBtn) {
        laserBtn.addEventListener('click', () => {
            toggleLaserPointer();
            laserBtn.classList.toggle('laser-active');
        });
    }
    
    // End presentation button
    const endBtn = document.getElementById('end-presentation-btn');
    if (endBtn) {
        endBtn.addEventListener('click', endPresentation);
    }
    
    // Listen for messages from presentation window
    window.addEventListener('message', (event) => {
        if (event.data.type === 'slideChanged') {
            currentSlideIndex = event.data.index;
            updateSlidePreviews();
        }
    });
    
    // Setup laser pointer movement
    document.addEventListener('mousemove', (e) => {
        if (presentationWindow && !presentationWindow.closed && isLaserActive) {
            // Convert mouse position to presentation window coordinates
            const presentationX = (e.clientX / window.innerWidth) * presentationWindow.innerWidth;
            const presentationY = (e.clientY / window.innerHeight) * presentationWindow.innerHeight;
            
            // Send position to presentation window
            presentationWindow.postMessage({
                type: 'laserMove',
                x: presentationX,
                y: presentationY
            }, '*');
        }
    });
}

// Update slide previews in presenter view
function updateSlidePreviews() {
    const slides = getAllSlides();
    if (!slides || slides.length === 0) return;
    
    // Get preview containers
    const currentPreview = document.getElementById('current-slide-container');
    const nextPreview = document.getElementById('next-slide-container');
    const notesContainer = document.getElementById('slide-notes');
    
    if (currentPreview) {
        // Current slide preview
        const currentSlide = slides[currentSlideIndex];
        currentPreview.innerHTML = `
            <div class="preview-slide">
                <div class="preview-title">${currentSlide.title || ''}</div>
                <div class="preview-number">${currentSlideIndex + 1} / ${slides.length}</div>
            </div>
        `;
    }
    
    if (nextPreview) {
        // Next slide preview
        if (currentSlideIndex < slides.length - 1) {
            const nextSlide = slides[currentSlideIndex + 1];
            nextPreview.innerHTML = `
                <div class="preview-slide">
                    <div class="preview-title">${nextSlide.title || ''}</div>
                    <div class="preview-number">${currentSlideIndex + 2} / ${slides.length}</div>
                </div>
            `;
        } else {
            nextPreview.innerHTML = `
                <div class="preview-slide">
                    <div class="preview-end">End of Presentation</div>
                </div>
            `;
        }
    }
    
    // Update notes
    if (notesContainer) {
        const currentSlide = slides[currentSlideIndex];
        if (currentSlide.notes) {
            notesContainer.innerHTML = `<p>${currentSlide.notes}</p>`;
        } else {
            notesContainer.innerHTML = `<p>No notes for this slide.</p>`;
        }
    }
}

// Navigate to slide
function navigateToSlide(index) {
    const slides = getAllSlides();
    
    // Check if index is valid
    if (index < 0 || index >= slides.length) {
        return;
    }
    
    // Update current index
    currentSlideIndex = index;
    
    // Send message to presentation window
    if (presentationWindow && !presentationWindow.closed) {
        presentationWindow.postMessage({
            type: 'navigation',
            index: currentSlideIndex
        }, '*');
    }
    
    // Update previews
    updateSlidePreviews();
}

// Toggle laser pointer
let isLaserActive = false;
function toggleLaserPointer() {
    isLaserActive = !isLaserActive;
    
    if (presentationWindow && !presentationWindow.closed) {
        presentationWindow.postMessage({
            type: 'laser',
            state: isLaserActive ? 'on' : 'off'
        }, '*');
    }
}

// Start presentation timer
function startPresentationTimer() {
    presentationStartTime = new Date();
    
    // Update timer display
    const timerElement = document.getElementById('presenter-timer');
    
    timerInterval = setInterval(() => {
        if (timerElement) {
            const currentTime = new Date();
            const elapsedTime = new Date(currentTime - presentationStartTime);
            
            // Format time as HH:MM:SS
            const hours = String(elapsedTime.getUTCHours()).padStart(2, '0');
            const minutes = String(elapsedTime.getUTCMinutes()).padStart(2, '0');
            const seconds = String(elapsedTime.getUTCSeconds()).padStart(2, '0');
            
            timerElement.textContent = `${hours}:${minutes}:${seconds}`;
        }
    }, 1000);
}

// Setup keyboard controls for navigation
function setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        if (!isPresenting) return;
        
        if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
            // Next slide
            navigateToSlide(currentSlideIndex + 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'Backspace') {
            // Previous slide
            navigateToSlide(currentSlideIndex - 1);
        } else if (e.key === 'Escape') {
            // End presentation
            endPresentation();
        } else if (e.key === 'l' || e.key === 'L') {
            // Toggle laser pointer
            toggleLaserPointer();
            const laserBtn = document.getElementById('laser-pointer-btn');
            if (laserBtn) {
                laserBtn.classList.toggle('laser-active');
            }
        }
    });
}

// End presentation
function endPresentation() {
    // Close presentation window
    if (presentationWindow && !presentationWindow.closed) {
        presentationWindow.close();
    }
    
    // Clear timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Remove presenter view
    const presenterView = document.getElementById('presenter-view');
    if (presenterView) {
        presenterView.remove();
    }
    
    // Reset state
    isPresenting = false;
    presentationWindow = null;
    presentationTimer = null;
    presentationStartTime = null;
    isLaserActive = false;
    
    console.log('Presentation ended');
}

// Check if presentation is active
export function isPresentationActive() {
    return isPresenting;
}

// Get the active slide index
export function getPresentationSlideIndex() {
    return currentSlideIndex;
} 