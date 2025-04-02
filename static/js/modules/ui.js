/**
 * UI module to handle PowerPoint-like interface elements
 */

// Initialize UI components
export function initUI() {
    console.log('Initializing PowerPoint-like UI');
    setupRibbonTabs();
    setupFormatPanel();
    setupPowerPointView();
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
    const tabs = document.querySelectorAll('.ribbon-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // In a real implementation, this would show different ribbon content
            // based on the active tab
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