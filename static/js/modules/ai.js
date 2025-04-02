/**
 * AI module for handling AI-related features
 */

// Initialize AI module
export function initAI() {
    console.log('Initializing AI module');
    setupAIButtons();
}

// Setup AI-related buttons
function setupAIButtons() {
    // AI edit button
    const aiEditBtn = document.getElementById('aiEditBtn');
    if (aiEditBtn) {
        aiEditBtn.addEventListener('click', showAIEditModal);
    }
    
    // AI submit button
    const aiSubmitBtn = document.getElementById('ai-submit-btn');
    if (aiSubmitBtn) {
        aiSubmitBtn.addEventListener('click', submitAIPrompt);
    }
    
    // Close modal buttons
    const closeButtons = document.querySelectorAll('.modal .close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

// Show the AI edit modal
function showAIEditModal() {
    const modal = document.getElementById('ai-edit-modal');
    if (!modal) return;
    
    // Clear previous prompt
    const promptInput = document.getElementById('ai-prompt');
    if (promptInput) {
        promptInput.value = '';
    }
    
    // Show modal
    modal.style.display = 'block';
    
    // Focus the prompt input
    if (promptInput) {
        promptInput.focus();
    }
}

// Submit AI prompt to generate elements
function submitAIPrompt() {
    const promptInput = document.getElementById('ai-prompt');
    if (!promptInput || !promptInput.value.trim()) {
        showNotification('프롬프트를 입력해주세요.', 'error');
        return;
    }
    
    // Get prompt
    const prompt = promptInput.value.trim();
    
    // Get current slide index
    const currentSlideNumber = document.getElementById('current-slide-number');
    if (!currentSlideNumber) {
        showNotification('현재 슬라이드를 찾을 수 없습니다.', 'error');
        return;
    }
    
    const slideIndex = parseInt(currentSlideNumber.textContent) - 1;
    
    // Show loading state
    const submitBtn = document.getElementById('ai-submit-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading"></span> 생성 중...';
    }
    
    // Call the API
    editSlideWithAI(slideIndex, prompt)
        .then(success => {
            if (success) {
                // Hide the modal
                const modal = document.getElementById('ai-edit-modal');
                if (modal) {
                    modal.style.display = 'none';
                }
                
                showNotification('AI가 요소를 추가했습니다.', 'success');
            }
        })
        .catch(error => {
            showNotification(`오류가 발생했습니다: ${error.message}`, 'error');
        })
        .finally(() => {
            // Reset button state
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = '생성하기';
            }
        });
}

// Call the API to edit slide with AI
function editSlideWithAI(slideIndex, prompt) {
    return fetch('/edit_slide_ai', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            index: slideIndex,
            prompt: prompt
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // This would update the slide in the main application
            // In a real implementation, this would trigger a refresh of the slide
            console.log('AI generated elements:', data.elements);
            
            // Trigger custom event for the slide to be refreshed
            const event = new CustomEvent('slide-elements-updated', {
                detail: {
                    index: slideIndex,
                    elements: data.elements
                }
            });
            document.dispatchEvent(event);
            
            return true;
        } else {
            console.error('Failed to generate elements:', data.error);
            throw new Error(data.error);
        }
    });
}

// Generate slides from a topic using AI
export function generateSlidesFromTopic(topic, slideCount) {
    return fetch('/generate_from_topic', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            topic: topic,
            slide_count: slideCount
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            return data.slides;
        } else {
            throw new Error(data.error);
        }
    });
}

// Show notification
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