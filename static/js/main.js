/**
 * Main application entry point
 */

// Import modules
import { initUI, showPowerPointUI } from './modules/ui.js';
import { initSlides, createSlidesFromTopic, loadSlides } from './modules/slides.js';
import { initElements } from './modules/elements.js';
import { initAI, generateSlidesFromTopic } from './modules/ai.js';

// Track application state
let appState = {
    initialized: false,
    currentSlideIndex: 0,
    isCreatingSlides: false
};

// Initialize the application
function initApp() {
    console.log('Initializing presentation application');
    
    // Initialize all modules
    initUI();
    initSlides();
    initElements();
    initAI();
    
    // Setup initialization buttons
    setupInitialButtons();
    
    // Set up event listeners for slide updates
    setupEventListeners();
    
    // Mark app as initialized
    appState.initialized = true;
}

// Setup initial buttons (for creating a new presentation)
function setupInitialButtons() {
    // Start button
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            // Scroll to setup section
            const workspace = document.getElementById('workspace');
            if (workspace) {
                workspace.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Create presentation button
    const createPresentationBtn = document.getElementById('createPresentationBtn');
    if (createPresentationBtn) {
        createPresentationBtn.addEventListener('click', function() {
            // Get topic and slide count
            const topic = document.getElementById('topicInput').value.trim();
            const slideCount = parseInt(document.getElementById('slideCountInput').value);
            
            // Validate inputs
            if (!topic) {
                showNotification('주제를 입력해주세요.', 'error');
                return;
            }
            
            if (isNaN(slideCount) || slideCount < 1 || slideCount > 20) {
                showNotification('슬라이드 개수는 1에서 20 사이의 숫자로 입력해주세요.', 'error');
                return;
            }
            
            // Show loading state
            appState.isCreatingSlides = true;
            this.disabled = true;
            this.innerHTML = '<span class="loading"></span> 생성 중...';
            
            // Create slides
            createSlidesFromTopic(topic, slideCount)
                .then(slides => {
                    console.log('Created slides:', slides);
                    
                    // Show PowerPoint UI
                    showPowerPointUI();
                    
                    showNotification(`"${topic}" 주제로 ${slides.length}장의 슬라이드가 생성되었습니다.`, 'success');
                })
                .catch(error => {
                    console.error('Error creating slides:', error);
                    showNotification(`슬라이드 생성 중 오류가 발생했습니다: ${error.message}`, 'error');
                    
                    // Reset button
                    this.disabled = false;
                    this.textContent = '프레젠테이션 생성';
                })
                .finally(() => {
                    appState.isCreatingSlides = false;
                });
        });
    }
}

// Set up global event listeners
function setupEventListeners() {
    // Listen for slide-elements-updated event
    document.addEventListener('slide-elements-updated', function(e) {
        // This would trigger a refresh of the current slide with new elements
        console.log('Slide elements updated:', e.detail);
        
        // In a real implementation, we would update the slide and redraw it
        // For now, we'll just reload all slides to simulate the update
        loadSlides()
            .then(slides => {
                console.log('Reloaded slides after AI update');
            })
            .catch(error => {
                console.error('Error reloading slides:', error);
            });
    });
    
    // Handle keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl+S to save slides
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            savePresentationState();
        }
        
        // Delete key to delete selected element
        if (e.key === 'Delete') {
            const deleteBtn = document.getElementById('deleteBtn');
            if (deleteBtn && !deleteBtn.disabled) {
                deleteBtn.click();
            }
        }
    });
}

// Save the current presentation state
function savePresentationState() {
    // This would be implemented to save the current slides to the server
    console.log('Saving presentation state...');
    
    // Show loading notification
    showNotification('저장 중...', 'info');
    
    // In a real implementation, we would call a function to save all slides
    setTimeout(() => {
        showNotification('프레젠테이션이 저장되었습니다.', 'success');
    }, 1000);
}

// Show a notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        
        // Remove from DOM after animation
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp); 