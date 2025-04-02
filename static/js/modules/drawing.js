/**
 * Drawing module for freeform drawing, connectors and annotations
 */

// Drawing state
let isDrawing = false;
let currentTool = 'pen';
let currentColor = '#000000';
let currentWidth = 2;
let currentOpacity = 1;
let currentPoints = [];
let currentPath = null;
let selectedDrawing = null;

// SVG namespace
const SVG_NS = 'http://www.w3.org/2000/svg';

// Available tools
const DRAWING_TOOLS = {
    PEN: 'pen',
    HIGHLIGHTER: 'highlighter',
    ARROW: 'arrow',
    LINE: 'line',
    CONNECTOR: 'connector'
};

// Initialize drawing module
export function initDrawing() {
    console.log('Initializing drawing module');
    setupDrawingTools();
    setupToolPanel();
}

// Setup drawing tools UI
function setupDrawingTools() {
    const drawingBtn = document.getElementById('drawingToolBtn');
    if (drawingBtn) {
        drawingBtn.addEventListener('click', toggleDrawingMode);
    }
    
    const toolButtons = document.querySelectorAll('.drawing-tool-btn');
    toolButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tool = e.currentTarget.getAttribute('data-tool');
            if (tool) {
                selectDrawingTool(tool);
            }
        });
    });
    
    // Color picker
    const colorPicker = document.getElementById('drawingColor');
    if (colorPicker) {
        colorPicker.addEventListener('input', (e) => {
            setDrawingColor(e.target.value);
        });
    }
    
    // Width slider
    const widthSlider = document.getElementById('drawingWidth');
    if (widthSlider) {
        widthSlider.addEventListener('input', (e) => {
            setDrawingWidth(parseInt(e.target.value));
        });
    }
    
    // Opacity slider
    const opacitySlider = document.getElementById('drawingOpacity');
    if (opacitySlider) {
        opacitySlider.addEventListener('input', (e) => {
            setDrawingOpacity(parseFloat(e.target.value));
        });
    }
    
    // Eraser button
    const eraserBtn = document.getElementById('eraserBtn');
    if (eraserBtn) {
        eraserBtn.addEventListener('click', () => {
            if (selectedDrawing) {
                removeDrawing(selectedDrawing);
                selectedDrawing = null;
            }
        });
    }
    
    // Clear all button
    const clearAllBtn = document.getElementById('clearDrawingsBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllDrawings);
    }
}

// Setup tool panel
function setupToolPanel() {
    const toolPanel = document.getElementById('drawing-tools-panel');
    if (!toolPanel) return;
    
    // Close button
    const closeBtn = toolPanel.querySelector('.close-panel-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            deactivateDrawingMode();
        });
    }
}

// Toggle drawing mode
function toggleDrawingMode() {
    const canvas = document.getElementById('slide-canvas');
    if (!canvas) return;
    
    const drawingLayer = getDrawingLayer();
    if (!drawingLayer) return;
    
    const toolPanel = document.getElementById('drawing-tools-panel');
    if (!toolPanel) return;
    
    // Toggle active state
    const isActive = canvas.classList.toggle('drawing-mode-active');
    
    if (isActive) {
        // Activate drawing mode
        toolPanel.style.display = 'block';
        
        // Setup canvas event handlers
        setupDrawingEvents(drawingLayer);
        
        // Select default tool
        selectDrawingTool(DRAWING_TOOLS.PEN);
        
        console.log('Drawing mode activated');
    } else {
        // Deactivate drawing mode
        deactivateDrawingMode();
    }
}

// Deactivate drawing mode
function deactivateDrawingMode() {
    const canvas = document.getElementById('slide-canvas');
    if (!canvas) return;
    
    const toolPanel = document.getElementById('drawing-tools-panel');
    if (toolPanel) {
        toolPanel.style.display = 'none';
    }
    
    // Remove active class
    canvas.classList.remove('drawing-mode-active');
    
    // Reset state
    isDrawing = false;
    currentPath = null;
    currentPoints = [];
    
    console.log('Drawing mode deactivated');
}

// Get or create the SVG drawing layer
function getDrawingLayer() {
    const canvas = document.getElementById('slide-canvas');
    if (!canvas) return null;
    
    // Check if drawing layer exists
    let drawingLayer = canvas.querySelector('.drawing-layer');
    
    if (!drawingLayer) {
        // Create SVG container
        drawingLayer = document.createElementNS(SVG_NS, 'svg');
        drawingLayer.classList.add('drawing-layer');
        drawingLayer.setAttribute('width', '100%');
        drawingLayer.setAttribute('height', '100%');
        drawingLayer.style.position = 'absolute';
        drawingLayer.style.top = '0';
        drawingLayer.style.left = '0';
        drawingLayer.style.pointerEvents = 'none';
        drawingLayer.style.zIndex = '100';
        
        // Add to canvas
        canvas.appendChild(drawingLayer);
    }
    
    return drawingLayer;
}

// Setup event handlers for drawing
function setupDrawingEvents(drawingLayer) {
    if (!drawingLayer) return;
    
    // Enable pointer events during drawing mode
    drawingLayer.style.pointerEvents = 'auto';
    
    // Remove old listeners to prevent duplicates
    drawingLayer.removeEventListener('mousedown', startDrawing);
    drawingLayer.removeEventListener('mousemove', draw);
    document.removeEventListener('mouseup', endDrawing);
    
    // Add event listeners
    drawingLayer.addEventListener('mousedown', startDrawing);
    drawingLayer.addEventListener('mousemove', draw);
    document.addEventListener('mouseup', endDrawing);
    
    // Click handler for selecting drawings
    drawingLayer.addEventListener('click', selectDrawingElement);
}

// Start drawing on mouse down
function startDrawing(e) {
    if (!isDrawingModeActive()) return;
    
    // Prevent default behavior
    e.preventDefault();
    
    // Set drawing state
    isDrawing = true;
    currentPoints = [];
    
    // Get mouse coordinates relative to SVG
    const drawingLayer = getDrawingLayer();
    const rect = drawingLayer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Start with current point
    currentPoints.push({ x, y });
    
    // Create path based on tool type
    if (currentTool === DRAWING_TOOLS.PEN || currentTool === DRAWING_TOOLS.HIGHLIGHTER) {
        // Create path element for freeform drawing
        currentPath = document.createElementNS(SVG_NS, 'path');
        currentPath.setAttribute('fill', 'none');
        currentPath.setAttribute('stroke', currentColor);
        currentPath.setAttribute('stroke-width', currentWidth);
        currentPath.setAttribute('stroke-opacity', currentOpacity);
        currentPath.setAttribute('stroke-linecap', 'round');
        currentPath.setAttribute('stroke-linejoin', 'round');
        
        if (currentTool === DRAWING_TOOLS.HIGHLIGHTER) {
            currentPath.setAttribute('stroke-opacity', '0.5');
            currentPath.classList.add('highlighter');
        }
        
        // Initial path data
        const d = `M ${x} ${y}`;
        currentPath.setAttribute('d', d);
        
    } else if (currentTool === DRAWING_TOOLS.LINE || currentTool === DRAWING_TOOLS.ARROW) {
        // Create line element
        currentPath = document.createElementNS(SVG_NS, 'line');
        currentPath.setAttribute('x1', x);
        currentPath.setAttribute('y1', y);
        currentPath.setAttribute('x2', x);
        currentPath.setAttribute('y2', y);
        currentPath.setAttribute('stroke', currentColor);
        currentPath.setAttribute('stroke-width', currentWidth);
        currentPath.setAttribute('stroke-opacity', currentOpacity);
        
        if (currentTool === DRAWING_TOOLS.ARROW) {
            // Create marker for arrow
            const markerId = `arrow-${Date.now()}`;
            const marker = document.createElementNS(SVG_NS, 'marker');
            marker.setAttribute('id', markerId);
            marker.setAttribute('viewBox', '0 0 10 10');
            marker.setAttribute('refX', '10');
            marker.setAttribute('refY', '5');
            marker.setAttribute('markerWidth', '6');
            marker.setAttribute('markerHeight', '6');
            marker.setAttribute('orient', 'auto');
            
            // Arrow path
            const arrowPath = document.createElementNS(SVG_NS, 'path');
            arrowPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
            arrowPath.setAttribute('fill', currentColor);
            
            // Add arrow to marker
            marker.appendChild(arrowPath);
            
            // Add marker to SVG
            const defs = drawingLayer.querySelector('defs') || document.createElementNS(SVG_NS, 'defs');
            if (!drawingLayer.contains(defs)) {
                drawingLayer.appendChild(defs);
            }
            defs.appendChild(marker);
            
            // Apply marker to line
            currentPath.setAttribute('marker-end', `url(#${markerId})`);
        }
    } else if (currentTool === DRAWING_TOOLS.CONNECTOR) {
        // Create polyline for connector
        currentPath = document.createElementNS(SVG_NS, 'polyline');
        currentPath.setAttribute('fill', 'none');
        currentPath.setAttribute('stroke', currentColor);
        currentPath.setAttribute('stroke-width', currentWidth);
        currentPath.setAttribute('stroke-opacity', currentOpacity);
        currentPath.setAttribute('points', `${x},${y}`);
    }
    
    // Add class for type
    currentPath.classList.add('drawing-element');
    currentPath.setAttribute('data-tool', currentTool);
    
    // Add to SVG
    drawingLayer.appendChild(currentPath);
}

// Draw on mouse move
function draw(e) {
    if (!isDrawing || !currentPath) return;
    
    // Get mouse coordinates relative to SVG
    const drawingLayer = getDrawingLayer();
    const rect = drawingLayer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Add to points array
    currentPoints.push({ x, y });
    
    // Update path based on tool type
    if (currentTool === DRAWING_TOOLS.PEN || currentTool === DRAWING_TOOLS.HIGHLIGHTER) {
        // Create path string from points
        let d = `M ${currentPoints[0].x} ${currentPoints[0].y}`;
        
        // Add all points as curves for smooth drawing
        for (let i = 1; i < currentPoints.length; i++) {
            const p = currentPoints[i];
            d += ` L ${p.x} ${p.y}`;
        }
        
        // Update path
        currentPath.setAttribute('d', d);
        
    } else if (currentTool === DRAWING_TOOLS.LINE || currentTool === DRAWING_TOOLS.ARROW) {
        // Update end point
        currentPath.setAttribute('x2', x);
        currentPath.setAttribute('y2', y);
        
    } else if (currentTool === DRAWING_TOOLS.CONNECTOR) {
        // Get points string
        let points = '';
        currentPoints.forEach(p => {
            points += `${p.x},${p.y} `;
        });
        
        // Update polyline
        currentPath.setAttribute('points', points);
    }
}

// End drawing on mouse up
function endDrawing() {
    if (!isDrawing || !currentPath) return;
    
    // Set drawing state
    isDrawing = false;
    
    // Finalize path
    if (currentPoints.length <= 1) {
        // Remove path if it's just a click
        currentPath.parentNode.removeChild(currentPath);
    } else {
        // Simplify path data if necessary
        if (currentTool === DRAWING_TOOLS.PEN || currentTool === DRAWING_TOOLS.HIGHLIGHTER) {
            // Simplify only if there are many points
            if (currentPoints.length > 20) {
                const simplifiedPoints = simplifyPath(currentPoints, 2);
                
                // Create new path string
                let d = `M ${simplifiedPoints[0].x} ${simplifiedPoints[0].y}`;
                for (let i = 1; i < simplifiedPoints.length; i++) {
                    const p = simplifiedPoints[i];
                    d += ` L ${p.x} ${p.y}`;
                }
                
                // Update path
                currentPath.setAttribute('d', d);
            }
        }
    }
    
    // Reset current path
    currentPath = null;
    currentPoints = [];
}

// Select drawing tool
function selectDrawingTool(tool) {
    if (!Object.values(DRAWING_TOOLS).includes(tool)) return;
    
    // Update current tool
    currentTool = tool;
    
    // Update UI
    const toolButtons = document.querySelectorAll('.drawing-tool-btn');
    toolButtons.forEach(btn => {
        const btnTool = btn.getAttribute('data-tool');
        if (btnTool === tool) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Set default properties for tool
    if (tool === DRAWING_TOOLS.HIGHLIGHTER) {
        setDrawingWidth(8);
        setDrawingOpacity(0.5);
    } else if (tool === DRAWING_TOOLS.PEN) {
        setDrawingWidth(2);
        setDrawingOpacity(1);
    } else if (tool === DRAWING_TOOLS.ARROW || tool === DRAWING_TOOLS.LINE) {
        setDrawingWidth(2);
        setDrawingOpacity(1);
    } else if (tool === DRAWING_TOOLS.CONNECTOR) {
        setDrawingWidth(2);
        setDrawingOpacity(1);
    }
    
    console.log(`Selected drawing tool: ${tool}`);
}

// Set drawing color
function setDrawingColor(color) {
    currentColor = color;
    
    // Update UI
    const colorPicker = document.getElementById('drawingColor');
    if (colorPicker) {
        colorPicker.value = color;
    }
    
    // Update selected drawing if any
    if (selectedDrawing) {
        selectedDrawing.setAttribute('stroke', color);
        
        // Update marker color for arrows
        if (selectedDrawing.hasAttribute('marker-end')) {
            const markerId = selectedDrawing.getAttribute('marker-end').replace('url(#', '').replace(')', '');
            const marker = document.getElementById(markerId);
            if (marker) {
                const arrowPath = marker.querySelector('path');
                if (arrowPath) {
                    arrowPath.setAttribute('fill', color);
                }
            }
        }
    }
}

// Set drawing width
function setDrawingWidth(width) {
    currentWidth = width;
    
    // Update UI
    const widthSlider = document.getElementById('drawingWidth');
    if (widthSlider) {
        widthSlider.value = width;
    }
    
    // Update selected drawing if any
    if (selectedDrawing) {
        selectedDrawing.setAttribute('stroke-width', width);
    }
}

// Set drawing opacity
function setDrawingOpacity(opacity) {
    currentOpacity = opacity;
    
    // Update UI
    const opacitySlider = document.getElementById('drawingOpacity');
    if (opacitySlider) {
        opacitySlider.value = opacity;
    }
    
    // Update selected drawing if any
    if (selectedDrawing) {
        selectedDrawing.setAttribute('stroke-opacity', opacity);
    }
}

// Select a drawing element
function selectDrawingElement(e) {
    if (!isDrawingModeActive()) return;
    
    // Check if clicked on a drawing element
    const element = e.target.closest('.drawing-element');
    if (!element) {
        // Deselect if clicked elsewhere
        if (selectedDrawing) {
            selectedDrawing.classList.remove('selected');
            selectedDrawing = null;
        }
        return;
    }
    
    // Deselect previous selection
    if (selectedDrawing) {
        selectedDrawing.classList.remove('selected');
    }
    
    // Select new element
    selectedDrawing = element;
    selectedDrawing.classList.add('selected');
    
    // Update controls with element properties
    updateControlsFromDrawing(selectedDrawing);
}

// Update controls based on selected drawing
function updateControlsFromDrawing(element) {
    if (!element) return;
    
    // Update color
    const stroke = element.getAttribute('stroke');
    if (stroke) {
        setDrawingColor(stroke);
    }
    
    // Update width
    const strokeWidth = element.getAttribute('stroke-width');
    if (strokeWidth) {
        setDrawingWidth(parseInt(strokeWidth));
    }
    
    // Update opacity
    const strokeOpacity = element.getAttribute('stroke-opacity');
    if (strokeOpacity) {
        setDrawingOpacity(parseFloat(strokeOpacity));
    }
    
    // Update tool button
    const tool = element.getAttribute('data-tool');
    if (tool) {
        selectDrawingTool(tool);
    }
}

// Remove a drawing element
function removeDrawing(element) {
    if (!element) return;
    
    // Remove marker if this is an arrow
    if (element.hasAttribute('marker-end')) {
        const markerId = element.getAttribute('marker-end').replace('url(#', '').replace(')', '');
        const marker = document.getElementById(markerId);
        if (marker) {
            marker.parentNode.removeChild(marker);
        }
    }
    
    // Remove element
    element.parentNode.removeChild(element);
}

// Clear all drawings
function clearAllDrawings() {
    const drawingLayer = getDrawingLayer();
    if (!drawingLayer) return;
    
    // Get all drawing elements
    const drawings = drawingLayer.querySelectorAll('.drawing-element');
    drawings.forEach(drawing => {
        removeDrawing(drawing);
    });
    
    // Reset state
    selectedDrawing = null;
}

// Check if drawing mode is active
function isDrawingModeActive() {
    const canvas = document.getElementById('slide-canvas');
    return canvas && canvas.classList.contains('drawing-mode-active');
}

// Simplify a path using the Ramer-Douglas-Peucker algorithm
function simplifyPath(points, tolerance) {
    if (points.length <= 2) return points;
    
    // Find the point with the maximum distance
    let maxDistance = 0;
    let maxIndex = 0;
    
    const start = points[0];
    const end = points[points.length - 1];
    
    for (let i = 1; i < points.length - 1; i++) {
        const distance = pointToLineDistance(points[i], start, end);
        if (distance > maxDistance) {
            maxDistance = distance;
            maxIndex = i;
        }
    }
    
    // If max distance is greater than tolerance, recursively simplify
    if (maxDistance > tolerance) {
        const firstHalf = simplifyPath(points.slice(0, maxIndex + 1), tolerance);
        const secondHalf = simplifyPath(points.slice(maxIndex), tolerance);
        
        // Concatenate the two halves
        return firstHalf.slice(0, -1).concat(secondHalf);
    } else {
        // Return just the endpoints
        return [start, end];
    }
}

// Calculate distance from a point to a line segment
function pointToLineDistance(point, lineStart, lineEnd) {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    
    // Line length squared
    const lenSq = dx * dx + dy * dy;
    
    // If line is a point, return distance to the point
    if (lenSq === 0) {
        return Math.sqrt(
            (point.x - lineStart.x) * (point.x - lineStart.x) +
            (point.y - lineStart.y) * (point.y - lineStart.y)
        );
    }
    
    // Calculate projection onto the line
    const t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lenSq;
    
    // Clamp t to line segment
    const tClamped = Math.max(0, Math.min(1, t));
    
    // Get closest point on line
    const closestX = lineStart.x + tClamped * dx;
    const closestY = lineStart.y + tClamped * dy;
    
    // Calculate distance
    return Math.sqrt(
        (point.x - closestX) * (point.x - closestX) +
        (point.y - closestY) * (point.y - closestY)
    );
}

// Get all drawing tools
export function getDrawingTools() {
    return DRAWING_TOOLS;
}

// Export drawing as SVG
export function exportDrawingsAsSVG() {
    const drawingLayer = getDrawingLayer();
    if (!drawingLayer) return null;
    
    // Clone the SVG
    const svgClone = drawingLayer.cloneNode(true);
    
    // Remove selection class from any elements
    const selectedElements = svgClone.querySelectorAll('.selected');
    selectedElements.forEach(el => {
        el.classList.remove('selected');
    });
    
    // Return SVG as string
    return svgClone.outerHTML;
} 