/**
 * Animations module for adding and controlling element animations
 */

// Track animated elements
let animatedElements = new Map();
let selectedAnimationElement = null;

// Animation types
const ANIMATION_TYPES = {
    ENTRANCE: 'entrance',
    EXIT: 'exit',
    EMPHASIS: 'emphasis',
    MOTION_PATH: 'motion-path'
};

// Available animations
const ANIMATIONS = {
    // Entrance animations
    entrance: {
        'fade-in': {
            name: 'Fade In',
            css: 'animation-fade-in',
            duration: 1000
        },
        'fly-in-left': {
            name: 'Fly In (Left)',
            css: 'animation-fly-in-left',
            duration: 1000
        },
        'fly-in-right': {
            name: 'Fly In (Right)',
            css: 'animation-fly-in-right',
            duration: 1000
        },
        'fly-in-top': {
            name: 'Fly In (Top)',
            css: 'animation-fly-in-top',
            duration: 1000
        },
        'fly-in-bottom': {
            name: 'Fly In (Bottom)',
            css: 'animation-fly-in-bottom',
            duration: 1000
        },
        'zoom-in': {
            name: 'Zoom In',
            css: 'animation-zoom-in',
            duration: 1000
        },
        'bounce-in': {
            name: 'Bounce In',
            css: 'animation-bounce-in',
            duration: 1200
        },
        'rotate-in': {
            name: 'Rotate In',
            css: 'animation-rotate-in',
            duration: 1000
        }
    },
    
    // Exit animations
    exit: {
        'fade-out': {
            name: 'Fade Out',
            css: 'animation-fade-out',
            duration: 1000
        },
        'fly-out-left': {
            name: 'Fly Out (Left)',
            css: 'animation-fly-out-left',
            duration: 1000
        },
        'fly-out-right': {
            name: 'Fly Out (Right)',
            css: 'animation-fly-out-right',
            duration: 1000
        },
        'fly-out-top': {
            name: 'Fly Out (Top)',
            css: 'animation-fly-out-top',
            duration: 1000
        },
        'fly-out-bottom': {
            name: 'Fly Out (Bottom)',
            css: 'animation-fly-out-bottom',
            duration: 1000
        },
        'zoom-out': {
            name: 'Zoom Out',
            css: 'animation-zoom-out',
            duration: 1000
        },
        'shrink': {
            name: 'Shrink',
            css: 'animation-shrink',
            duration: 1000
        },
        'rotate-out': {
            name: 'Rotate Out',
            css: 'animation-rotate-out',
            duration: 1000
        }
    },
    
    // Emphasis animations
    emphasis: {
        'pulse': {
            name: 'Pulse',
            css: 'animation-pulse',
            duration: 800
        },
        'flash': {
            name: 'Flash',
            css: 'animation-flash',
            duration: 800
        },
        'shake': {
            name: 'Shake',
            css: 'animation-shake',
            duration: 800
        },
        'bounce': {
            name: 'Bounce',
            css: 'animation-bounce',
            duration: 1000
        },
        'teeter': {
            name: 'Teeter',
            css: 'animation-teeter',
            duration: 1000
        },
        'spin': {
            name: 'Spin',
            css: 'animation-spin',
            duration: 1000
        },
        'grow-shrink': {
            name: 'Grow & Shrink',
            css: 'animation-grow-shrink',
            duration: 1200
        }
    },
    
    // Motion path animations
    'motion-path': {
        'circle': {
            name: 'Circle',
            css: 'animation-path-circle',
            duration: 2000
        },
        'arc': {
            name: 'Arc',
            css: 'animation-path-arc',
            duration: 1500
        },
        'zigzag': {
            name: 'Zigzag',
            css: 'animation-path-zigzag',
            duration: 2000
        },
        'loop': {
            name: 'Loop',
            css: 'animation-path-loop',
            duration: 2000
        }
    }
};

// Initialize animations module
export function initAnimations() {
    console.log('Initializing animations module');
    setupAnimationButtons();
    setupAnimationPanel();
    injectAnimationStyles();
}

// Setup animation buttons and controls
function setupAnimationButtons() {
    const addAnimationBtn = document.getElementById('addAnimationBtn');
    if (addAnimationBtn) {
        addAnimationBtn.addEventListener('click', showAnimationDialog);
    }
}

// Setup animation panel
function setupAnimationPanel() {
    const animationPanel = document.getElementById('animation-panel');
    if (!animationPanel) return;
    
    // Animation type selector
    const animationTypeSelect = document.getElementById('animationTypeSelect');
    if (animationTypeSelect) {
        // Populate animation types
        for (const type in ANIMATION_TYPES) {
            const option = document.createElement('option');
            option.value = ANIMATION_TYPES[type];
            option.textContent = type.charAt(0) + type.slice(1).toLowerCase();
            animationTypeSelect.appendChild(option);
        }
        
        // Add change event
        animationTypeSelect.addEventListener('change', (e) => {
            updateAnimationsList(e.target.value);
        });
    }
    
    // Animation selector
    const animationSelect = document.getElementById('animationSelect');
    if (animationSelect) {
        animationSelect.addEventListener('change', (e) => {
            if (selectedAnimationElement) {
                applyAnimation(selectedAnimationElement.id, e.target.value);
            }
        });
    }
    
    // Duration slider
    const durationInput = document.getElementById('animationDuration');
    if (durationInput) {
        durationInput.addEventListener('input', (e) => {
            if (selectedAnimationElement) {
                updateAnimationDuration(selectedAnimationElement.id, parseInt(e.target.value));
            }
        });
    }
    
    // Delay slider
    const delayInput = document.getElementById('animationDelay');
    if (delayInput) {
        delayInput.addEventListener('input', (e) => {
            if (selectedAnimationElement) {
                updateAnimationDelay(selectedAnimationElement.id, parseInt(e.target.value));
            }
        });
    }
    
    // Play button
    const playBtn = document.getElementById('playAnimationBtn');
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (selectedAnimationElement) {
                previewAnimation(selectedAnimationElement.id);
            }
        });
    }
    
    // Remove button
    const removeBtn = document.getElementById('removeAnimationBtn');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            if (selectedAnimationElement) {
                removeAnimation(selectedAnimationElement.id);
            }
        });
    }
}

// Show animation dialog
function showAnimationDialog() {
    // Get selected element
    const selectedElement = document.querySelector('.slide-element.selected');
    if (!selectedElement) {
        alert('Please select an element to animate');
        return;
    }
    
    // Show animation panel
    const animationPanel = document.getElementById('animation-panel');
    if (animationPanel) {
        animationPanel.style.display = 'block';
    }
    
    // Store selected element
    selectedAnimationElement = selectedElement;
    
    // Update animation panel
    updateAnimationPanel();
}

// Update animation panel for selected element
function updateAnimationPanel() {
    if (!selectedAnimationElement) return;
    
    const elementId = selectedAnimationElement.id;
    const hasAnimation = animatedElements.has(elementId);
    
    // Set animation type
    const animationTypeSelect = document.getElementById('animationTypeSelect');
    if (animationTypeSelect) {
        if (hasAnimation) {
            const animData = animatedElements.get(elementId);
            animationTypeSelect.value = animData.type;
        } else {
            animationTypeSelect.value = ANIMATION_TYPES.ENTRANCE;
        }
        
        // Update animations list based on type
        updateAnimationsList(animationTypeSelect.value);
    }
    
    // Set animation
    const animationSelect = document.getElementById('animationSelect');
    if (animationSelect && hasAnimation) {
        const animData = animatedElements.get(elementId);
        animationSelect.value = animData.animation;
    }
    
    // Set duration
    const durationInput = document.getElementById('animationDuration');
    const durationValue = document.getElementById('durationValue');
    if (durationInput && durationValue) {
        if (hasAnimation) {
            const animData = animatedElements.get(elementId);
            durationInput.value = animData.duration;
            durationValue.textContent = `${animData.duration}ms`;
        } else {
            durationInput.value = 1000;
            durationValue.textContent = '1000ms';
        }
    }
    
    // Set delay
    const delayInput = document.getElementById('animationDelay');
    const delayValue = document.getElementById('delayValue');
    if (delayInput && delayValue) {
        if (hasAnimation) {
            const animData = animatedElements.get(elementId);
            delayInput.value = animData.delay;
            delayValue.textContent = `${animData.delay}ms`;
        } else {
            delayInput.value = 0;
            delayValue.textContent = '0ms';
        }
    }
}

// Update animations list based on selected type
function updateAnimationsList(type) {
    const animationSelect = document.getElementById('animationSelect');
    if (!animationSelect) return;
    
    // Clear existing options
    animationSelect.innerHTML = '';
    
    // Add new options
    const animations = ANIMATIONS[type];
    if (animations) {
        for (const anim in animations) {
            const option = document.createElement('option');
            option.value = anim;
            option.textContent = animations[anim].name;
            animationSelect.appendChild(option);
        }
    }
}

// Apply animation to element
export function applyAnimation(elementId, animationId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Get animation type
    const animationTypeSelect = document.getElementById('animationTypeSelect');
    if (!animationTypeSelect) return;
    
    const type = animationTypeSelect.value;
    const animation = ANIMATIONS[type][animationId];
    
    if (!animation) return;
    
    // Get duration and delay
    const duration = parseInt(document.getElementById('animationDuration').value) || animation.duration;
    const delay = parseInt(document.getElementById('animationDelay').value) || 0;
    
    // Store animation data
    animatedElements.set(elementId, {
        type,
        animation: animationId,
        duration,
        delay,
        css: animation.css
    });
    
    // Add animation indicator
    element.setAttribute('data-has-animation', 'true');
    element.setAttribute('data-animation-type', type);
    element.setAttribute('data-animation', animationId);
    
    // Add visual indicator
    let indicator = element.querySelector('.animation-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'animation-indicator';
        indicator.innerHTML = '<i class="fas fa-film"></i>';
        element.appendChild(indicator);
    }
    
    console.log(`Applied ${animation.name} animation to element ${elementId}`);
}

// Update animation duration
function updateAnimationDuration(elementId, duration) {
    if (!animatedElements.has(elementId)) return;
    
    const animData = animatedElements.get(elementId);
    animData.duration = duration;
    animatedElements.set(elementId, animData);
    
    // Update display
    const durationValue = document.getElementById('durationValue');
    if (durationValue) {
        durationValue.textContent = `${duration}ms`;
    }
}

// Update animation delay
function updateAnimationDelay(elementId, delay) {
    if (!animatedElements.has(elementId)) return;
    
    const animData = animatedElements.get(elementId);
    animData.delay = delay;
    animatedElements.set(elementId, animData);
    
    // Update display
    const delayValue = document.getElementById('delayValue');
    if (delayValue) {
        delayValue.textContent = `${delay}ms`;
    }
}

// Preview animation for element
export function previewAnimation(elementId) {
    const element = document.getElementById(elementId);
    if (!element || !animatedElements.has(elementId)) return;
    
    const animData = animatedElements.get(elementId);
    
    // Remove any existing animation class
    element.classList.remove(animData.css);
    
    // Force a reflow
    void element.offsetWidth;
    
    // Set animation properties
    element.style.animationDuration = `${animData.duration}ms`;
    element.style.animationDelay = `${animData.delay}ms`;
    
    // Add animation class
    element.classList.add(animData.css);
    
    // Remove class after animation completes
    setTimeout(() => {
        element.classList.remove(animData.css);
    }, animData.duration + animData.delay + 100);
}

// Remove animation from element
export function removeAnimation(elementId) {
    const element = document.getElementById(elementId);
    if (!element || !animatedElements.has(elementId)) return;
    
    // Remove from tracked animations
    animatedElements.delete(elementId);
    
    // Remove animation attributes
    element.removeAttribute('data-has-animation');
    element.removeAttribute('data-animation-type');
    element.removeAttribute('data-animation');
    
    // Remove animation classes
    for (const type in ANIMATIONS) {
        for (const anim in ANIMATIONS[type]) {
            element.classList.remove(ANIMATIONS[type][anim].css);
        }
    }
    
    // Remove indicator
    const indicator = element.querySelector('.animation-indicator');
    if (indicator) {
        element.removeChild(indicator);
    }
    
    console.log(`Removed animation from element ${elementId}`);
}

// Select element for animation
export function selectElementForAnimation(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    selectedAnimationElement = element;
    updateAnimationPanel();
}

// Play all animations in sequence
export function playSlideAnimations() {
    if (animatedElements.size === 0) return;
    
    // Sort animations by delay
    const sorted = Array.from(animatedElements.entries())
        .sort((a, b) => a[1].delay - b[1].delay);
    
    // Play each animation
    let cumulativeDelay = 0;
    sorted.forEach(([elementId, animData]) => {
        setTimeout(() => {
            previewAnimation(elementId);
        }, cumulativeDelay);
        
        // Add this animation's duration to cumulative delay
        cumulativeDelay += animData.duration + 200; // 200ms gap between animations
    });
}

// Get all animated elements
export function getAnimatedElements() {
    return animatedElements;
}

// Inject animation styles into document
function injectAnimationStyles() {
    // Create style element if it doesn't exist
    let styleElement = document.getElementById('animation-styles');
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'animation-styles';
        document.head.appendChild(styleElement);
    }
    
    // Animation CSS
    const css = `
        /* Animation indicator */
        .animation-indicator {
            position: absolute;
            top: -10px;
            right: -10px;
            width: 20px;
            height: 20px;
            background-color: #3498db;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            z-index: 10;
        }
        
        /* Entrance animations */
        .animation-fade-in {
            animation: fadeIn forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .animation-fly-in-left {
            animation: flyInLeft forwards;
        }
        @keyframes flyInLeft {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        .animation-fly-in-right {
            animation: flyInRight forwards;
        }
        @keyframes flyInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        .animation-fly-in-top {
            animation: flyInTop forwards;
        }
        @keyframes flyInTop {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .animation-fly-in-bottom {
            animation: flyInBottom forwards;
        }
        @keyframes flyInBottom {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .animation-zoom-in {
            animation: zoomIn forwards;
        }
        @keyframes zoomIn {
            from { transform: scale(0.3); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        
        .animation-bounce-in {
            animation: bounceIn forwards;
        }
        @keyframes bounceIn {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); opacity: 0.8; }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); opacity: 1; }
        }
        
        .animation-rotate-in {
            animation: rotateIn forwards;
        }
        @keyframes rotateIn {
            from { transform: rotate(-360deg) scale(0.3); opacity: 0; }
            to { transform: rotate(0) scale(1); opacity: 1; }
        }
        
        /* Exit animations */
        .animation-fade-out {
            animation: fadeOut forwards;
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        .animation-fly-out-left {
            animation: flyOutLeft forwards;
        }
        @keyframes flyOutLeft {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(-100%); opacity: 0; }
        }
        
        .animation-fly-out-right {
            animation: flyOutRight forwards;
        }
        @keyframes flyOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .animation-fly-out-top {
            animation: flyOutTop forwards;
        }
        @keyframes flyOutTop {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(-100%); opacity: 0; }
        }
        
        .animation-fly-out-bottom {
            animation: flyOutBottom forwards;
        }
        @keyframes flyOutBottom {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(100%); opacity: 0; }
        }
        
        .animation-zoom-out {
            animation: zoomOut forwards;
        }
        @keyframes zoomOut {
            from { transform: scale(1); opacity: 1; }
            to { transform: scale(0.3); opacity: 0; }
        }
        
        .animation-shrink {
            animation: shrink forwards;
        }
        @keyframes shrink {
            from { transform: scale(1); opacity: 1; }
            to { transform: scale(0); opacity: 0; }
        }
        
        .animation-rotate-out {
            animation: rotateOut forwards;
        }
        @keyframes rotateOut {
            from { transform: rotate(0) scale(1); opacity: 1; }
            to { transform: rotate(360deg) scale(0.3); opacity: 0; }
        }
        
        /* Emphasis animations */
        .animation-pulse {
            animation: pulse;
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        .animation-flash {
            animation: flash;
        }
        @keyframes flash {
            0%, 50%, 100% { opacity: 1; }
            25%, 75% { opacity: 0.5; }
        }
        
        .animation-shake {
            animation: shake;
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animation-bounce {
            animation: bounce;
        }
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-20px); }
            60% { transform: translateY(-10px); }
        }
        
        .animation-teeter {
            animation: teeter;
        }
        @keyframes teeter {
            0%, 100% { transform: rotate(0); }
            25% { transform: rotate(-5deg); }
            75% { transform: rotate(5deg); }
        }
        
        .animation-spin {
            animation: spin;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .animation-grow-shrink {
            animation: growShrink;
        }
        @keyframes growShrink {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
        }
        
        /* Motion path animations */
        .animation-path-circle {
            animation: pathCircle;
        }
        @keyframes pathCircle {
            0% { transform: translate(0, 0); }
            25% { transform: translate(30px, -30px); }
            50% { transform: translate(0, -60px); }
            75% { transform: translate(-30px, -30px); }
            100% { transform: translate(0, 0); }
        }
        
        .animation-path-arc {
            animation: pathArc;
        }
        @keyframes pathArc {
            0% { transform: translate(0, 0); }
            50% { transform: translate(40px, -50px); }
            100% { transform: translate(80px, 0); }
        }
        
        .animation-path-zigzag {
            animation: pathZigzag;
        }
        @keyframes pathZigzag {
            0% { transform: translate(0, 0); }
            25% { transform: translate(40px, -20px); }
            50% { transform: translate(80px, 0); }
            75% { transform: translate(120px, -20px); }
            100% { transform: translate(160px, 0); }
        }
        
        .animation-path-loop {
            animation: pathLoop;
        }
        @keyframes pathLoop {
            0% { transform: translate(0, 0) rotate(0); }
            25% { transform: translate(20px, -20px) rotate(90deg); }
            50% { transform: translate(0, -40px) rotate(180deg); }
            75% { transform: translate(-20px, -20px) rotate(270deg); }
            100% { transform: translate(0, 0) rotate(360deg); }
        }
    `;
    
    styleElement.textContent = css;
} 