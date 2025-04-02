/**
 * AI Integration Module
 * Connects the UI with AI functionality
 */

import { analyzeCurrentSlide, suggestImprovements, generateContent, 
    suggestDesign, suggestImages, analyzePresentationStructure, 
    generatePresentationTemplate } from './ai.js';
import { AppState } from '../index.js';

// Initialize AI integration
export function initAIIntegration() {
    console.log('Initializing AI integration...');
    
    // Attach event listeners to AI ribbon buttons
    attachAIButtonListeners();
    
    // Initialize AI features state
    AppState.aiFeatures = {
        enabled: false,
        lastAnalysis: null,
        suggestions: [],
        activeGenerations: 0
    };
    
    console.log('AI integration initialized');
}

// Attach event listeners to AI buttons in the ribbon
function attachAIButtonListeners() {
    // Content Creation
    document.getElementById('aiGenerateSlideBtn')?.addEventListener('click', handleGenerateSlide);
    document.getElementById('aiGenerateTemplateBtn')?.addEventListener('click', handleGenerateTemplate);
    document.getElementById('aiTransformTextBtn')?.addEventListener('click', handleTransformText);
    
    // Design Assistance
    document.getElementById('aiImproveLayoutBtn')?.addEventListener('click', handleImproveLayout);
    document.getElementById('aiSuggestDesignBtn')?.addEventListener('click', handleSuggestDesign);
    document.getElementById('aiSuggestImagesBtn')?.addEventListener('click', handleSuggestImages);
    
    // Analysis & Feedback
    document.getElementById('aiAnalyzeSlideBtn')?.addEventListener('click', handleAnalyzeSlide);
    document.getElementById('aiAnalyzePresentationBtn')?.addEventListener('click', handleAnalyzePresentation);
    document.getElementById('aiGenerateNotesBtn')?.addEventListener('click', handleGenerateNotes);
    
    // Toggle AI Assistant button
    document.getElementById('toggleAIBtn')?.addEventListener('click', toggleAIAssistant);
}

// Toggle AI Assistant
function toggleAIAssistant() {
    AppState.aiFeatures.enabled = !AppState.aiFeatures.enabled;
    
    // Update UI to reflect the state
    const toggleBtn = document.getElementById('toggleAIBtn');
    if (toggleBtn) {
        if (AppState.aiFeatures.enabled) {
            toggleBtn.classList.add('active');
            showNotification('AI Assistant enabled', 'info');
        } else {
            toggleBtn.classList.remove('active');
            showNotification('AI Assistant disabled', 'info');
        }
    }
    
    // Save preference
    saveAIPreference(AppState.aiFeatures.enabled);
}

// Save AI preference
function saveAIPreference(enabled) {
    // This would normally send a request to the server
    console.log(`Saving AI preference: ${enabled ? 'enabled' : 'disabled'}`);
    
    fetch('/toggle_extension', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            extension: 'ai',
            enabled: enabled
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('AI preference saved:', data);
    })
    .catch(error => {
        console.error('Error saving AI preference:', error);
        showNotification('Failed to save AI preference', 'error');
    });
}

// Generate a new slide based on user description
function handleGenerateSlide() {
    showAIPromptDialog('Generate Slide', 'Describe the slide you want to create', handleGenerateSlideContent);
}

// Process the generate slide prompt
function handleGenerateSlideContent(prompt) {
    if (!prompt) return;
    
    showLoadingOverlay('Generating slide content...');
    
    generateContent(prompt)
        .then(result => {
            if (result.success) {
                // Create a new slide with the generated content
                const slideData = createSlideFromAIContent(result.data);
                addNewSlide(slideData);
                
                showNotification('Slide created successfully', 'success');
            } else {
                showNotification('Failed to generate slide', 'error');
            }
        })
        .catch(error => {
            console.error('Error generating slide:', error);
            showNotification('Error generating slide', 'error');
        })
        .finally(() => {
            hideLoadingOverlay();
        });
}

// Create slide object from AI content
function createSlideFromAIContent(content) {
    // Default slide template
    const slide = {
        id: generateUniqueId(),
        background: { type: 'solid', color: '#ffffff' },
        elements: []
    };
    
    // Add title if exists
    if (content.title) {
        slide.elements.push({
            id: generateUniqueId(),
            type: 'text',
            content: content.title,
            x: 50,
            y: 50,
            width: 860,
            height: 80,
            style: {
                fontSize: 36,
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#333333'
            }
        });
    }
    
    // Add subtitle if exists
    if (content.subtitle) {
        slide.elements.push({
            id: generateUniqueId(),
            type: 'text',
            content: content.subtitle,
            x: 50,
            y: 140,
            width: 860,
            height: 40,
            style: {
                fontSize: 20,
                fontWeight: 'normal',
                textAlign: 'center',
                color: '#666666'
            }
        });
    }
    
    // Add content if exists
    if (content.content) {
        slide.elements.push({
            id: generateUniqueId(),
            type: 'text',
            content: content.content,
            x: 50,
            y: 200,
            width: 860,
            height: 300,
            style: {
                fontSize: 24,
                fontWeight: 'normal',
                textAlign: 'left',
                color: '#333333'
            }
        });
    }
    
    // Add bullets if exists
    if (content.bullets || content.items) {
        const bullets = content.bullets || content.items;
        slide.elements.push({
            id: generateUniqueId(),
            type: 'text',
            content: bullets.map(bullet => `• ${bullet}`).join('\n'),
            x: 50,
            y: 200,
            width: 860,
            height: 300,
            style: {
                fontSize: 24,
                fontWeight: 'normal',
                textAlign: 'left',
                color: '#333333'
            }
        });
    }
    
    return slide;
}

// Generate a complete presentation template
function handleGenerateTemplate() {
    showAIPromptDialog(
        'Generate Presentation Template',
        'Enter presentation topic and select style',
        handleGenerateTemplateContent,
        true // Use advanced dialog with style selection
    );
}

// Process the template generation
function handleGenerateTemplateContent(data) {
    if (!data || !data.prompt) return;
    
    const topic = data.prompt;
    const style = data.style || 'business';
    
    showLoadingOverlay('Generating presentation template...');
    
    generatePresentationTemplate(topic, style)
        .then(result => {
            if (result.success && result.template) {
                // Clear existing slides
                if (AppState.slides.length > 0) {
                    // Ask for confirmation
                    showConfirmDialog(
                        'Replace Existing Slides?',
                        'This will replace all existing slides with the new template.',
                        () => {
                            replaceWithTemplate(result.template);
                        }
                    );
                } else {
                    replaceWithTemplate(result.template);
                }
            } else {
                showNotification('Failed to generate template', 'error');
            }
        })
        .catch(error => {
            console.error('Error generating template:', error);
            showNotification('Error generating template', 'error');
        })
        .finally(() => {
            hideLoadingOverlay();
        });
}

// Replace current slides with template
function replaceWithTemplate(template) {
    // Convert template to slides
    const slides = template.map(slideTemplate => {
        return createSlideFromAIContent(slideTemplate);
    });
    
    // Replace slides in AppState
    AppState.slides = slides;
    AppState.currentSlideIndex = 0;
    
    // Update UI
    updateSlideNavigator();
    renderCurrentSlide();
    
    showNotification(`Generated template with ${slides.length} slides`, 'success');
}

// Improve text on selected element
function handleTransformText() {
    if (!AppState.selectedElement) {
        showNotification('Please select a text element first', 'warning');
        return;
    }
    
    const element = AppState.selectedElement;
    
    if (element.type !== 'text') {
        showNotification('Please select a text element', 'warning');
        return;
    }
    
    showAIPromptDialog(
        'Enhance Text',
        'How would you like to transform this text?',
        prompt => {
            if (!prompt) return;
            
            showLoadingOverlay('Enhancing text...');
            
            // Simulate AI text transformation
            setTimeout(() => {
                // Get original text
                const originalText = element.content;
                
                // Simple transformations based on prompt
                let transformedText = originalText;
                
                if (prompt.toLowerCase().includes('shorter') || prompt.toLowerCase().includes('concise')) {
                    // Make it shorter (simplified algorithm for demo)
                    transformedText = originalText.split('.').slice(0, Math.ceil(originalText.split('.').length / 2)).join('.');
                } else if (prompt.toLowerCase().includes('longer') || prompt.toLowerCase().includes('elaborate')) {
                    // Make it longer (simplified algorithm for demo)
                    const sentences = originalText.split('.');
                    transformedText = sentences.map(s => s + (s ? ' In other words, ' + s.toLowerCase() : '')).join('.');
                } else if (prompt.toLowerCase().includes('formal')) {
                    // Make it more formal (simplified algorithm for demo)
                    transformedText = originalText
                        .replace(/don't/g, 'do not')
                        .replace(/can't/g, 'cannot')
                        .replace(/won't/g, 'will not')
                        .replace(/I'm/g, 'I am')
                        .replace(/you're/g, 'you are');
                } else if (prompt.toLowerCase().includes('bullet') || prompt.toLowerCase().includes('list')) {
                    // Convert to bullet points
                    transformedText = '• ' + originalText.split('.').filter(s => s.trim()).join('\n• ');
                }
                
                // Update the element
                element.content = transformedText;
                
                // Re-render the slide
                renderCurrentSlide();
                
                hideLoadingOverlay();
                showNotification('Text enhanced successfully', 'success');
            }, 1000);
        }
    );
}

// Improve layout of current slide
function handleImproveLayout() {
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    if (!currentSlide) {
        showNotification('No slide to improve', 'warning');
        return;
    }
    
    showLoadingOverlay('Analyzing and improving layout...');
    
    // Call the AI analysis function
    analyzeCurrentSlide()
        .then(result => {
            if (result.success) {
                const analysis = result.analysis;
                
                // Apply layout improvements
                if (analysis.layout.score !== 'good') {
                    improveSlideLayout(currentSlide, analysis);
                    renderCurrentSlide();
                    showNotification('Layout has been improved!', 'success');
                } else {
                    showNotification('Layout already looks good!', 'info');
                }
            } else {
                showNotification('Failed to analyze the slide', 'error');
            }
        })
        .catch(error => {
            console.error('Error improving layout:', error);
            showNotification('Error improving layout', 'error');
        })
        .finally(() => {
            hideLoadingOverlay();
        });
}

// Apply layout improvements
function improveSlideLayout(slide, analysis) {
    // Simple automatic layout improvements
    const elements = slide.elements;
    
    // Sort elements by size (larger ones first)
    elements.sort((a, b) => (b.width * b.height) - (a.width * a.height));
    
    // Define grid for clean layout
    const gridColumns = 12;
    const gridRows = 9;
    const slideWidth = 960;
    const slideHeight = 540;
    const colWidth = slideWidth / gridColumns;
    const rowHeight = slideHeight / gridRows;
    
    // Assign positions based on element type and size
    let titlePlaced = false;
    let row = 0;
    
    elements.forEach((element, index) => {
        // Check if element is likely a title
        const isTitle = element.type === 'text' && 
                        (element.style?.fontSize > 28 || 
                         element.style?.fontWeight === 'bold' && element.style?.fontSize > 24);
        
        if (isTitle && !titlePlaced) {
            // Place title at the top
            element.x = slideWidth * 0.1;
            element.y = slideHeight * 0.1;
            element.width = slideWidth * 0.8;
            element.height = rowHeight * 1.5;
            titlePlaced = true;
            row = 2; // Start content after title
        } else {
            // For other elements, place in a grid-like layout
            if (element.type === 'image') {
                // Images might go to the side
                element.x = slideWidth * 0.6;
                element.y = rowHeight * row;
                element.width = slideWidth * 0.3;
                element.height = slideHeight * 0.3;
            } else if (element.type === 'shape') {
                // Shapes can be decorative or functional
                element.x = colWidth * (index % 4);
                element.y = rowHeight * row;
                element.width = colWidth * 3;
                element.height = rowHeight * 2;
            } else {
                // Text and other content
                element.x = slideWidth * 0.1;
                element.y = rowHeight * row;
                element.width = element.type === 'chart' ? slideWidth * 0.6 : slideWidth * 0.5;
                element.height = element.type === 'chart' ? slideHeight * 0.5 : slideHeight * 0.3;
            }
            
            row += element.type === 'chart' ? 5 : 2.5;
        }
        
        // Fix any elements that might be outside the slide
        element.x = Math.max(10, Math.min(element.x, slideWidth - element.width - 10));
        element.y = Math.max(10, Math.min(element.y, slideHeight - element.height - 10));
    });
    
    // Return the improved slide
    return slide;
}

// Show utility functions
function showAIPromptDialog(title, description, callback, advanced = false) {
    alert(`AI Dialog: ${title} - ${description}`);
    const result = prompt("Enter your request:");
    callback(result);
}

function showLoadingOverlay(message) {
    console.log("Loading:", message);
}

function hideLoadingOverlay() {
    console.log("Loading complete");
}

function showNotification(message, type) {
    console.log(`Notification (${type}): ${message}`);
    alert(message);
}

function showConfirmDialog(title, message, onConfirm) {
    const confirmed = confirm(`${title}\n\n${message}`);
    if (confirmed) onConfirm();
}

// Generate a unique ID for elements
function generateUniqueId() {
    return 'el_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

// Update slide navigator (this should be defined in your codebase)
function updateSlideNavigator() {
    // This function should update the slide thumbnails on the left
    // It's assumed this is already implemented in your codebase
    const event = new CustomEvent('slides-updated');
    document.dispatchEvent(event);
}

// Render current slide (this should be defined in your codebase)
function renderCurrentSlide() {
    // This function should render the current slide in the editor
    // It's assumed this is already implemented in your codebase
    const event = new CustomEvent('slide-render-requested');
    document.dispatchEvent(event);
}

// Add a new slide
function addNewSlide(slideData) {
    // Add the slide to AppState
    AppState.slides.push(slideData);
    AppState.currentSlideIndex = AppState.slides.length - 1;
    
    // Update UI
    updateSlideNavigator();
    renderCurrentSlide();
}

// Other handler functions (simplified implementations)
function handleSuggestDesign() {
    showNotification("Suggesting design improvements...", "info");
    // Implementation would call suggestDesign() and show results
}

function handleSuggestImages() {
    showNotification("Suggesting relevant images...", "info");
    // Implementation would call suggestImages() and show results
}

function handleAnalyzeSlide() {
    showNotification("Analyzing current slide...", "info");
    // Implementation would call analyzeCurrentSlide() and show results
}

function handleAnalyzePresentation() {
    showNotification("Analyzing full presentation...", "info");
    // Implementation would call analyzePresentationStructure() and show results
}

function handleGenerateNotes() {
    showNotification("Generating speaker notes...", "info");
    // Implementation would generate speaker notes for the current slide
}

export { initAIIntegration };
