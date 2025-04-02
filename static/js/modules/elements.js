/**
 * Elements module for managing slide elements (shapes, text, images)
 */

// Track currently selected element
let selectedElement = null;

// Initialize elements module
export function initElements() {
    console.log('Initializing elements module');
    setupElementButtons();
    setupShapeMenu();
    setupDragAndResize();
}

// Setup element control buttons
function setupElementButtons() {
    // Shape button - shows shape dropdown
    const addShapeBtn = document.getElementById('addShapeBtn');
    if (addShapeBtn) {
        addShapeBtn.addEventListener('click', showShapeDropdown);
    }
    
    // Text button - adds a text box
    const addTextBoxBtn = document.getElementById('addTextBoxBtn');
    if (addTextBoxBtn) {
        addTextBoxBtn.addEventListener('click', addTextBox);
    }
    
    // Image button - shows file upload dialog
    const addImageBtn = document.getElementById('addImageBtn');
    if (addImageBtn) {
        addImageBtn.addEventListener('click', () => {
            // Create a file input
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.style.display = 'none';
            
            // Add file change handler
            input.addEventListener('change', handleImageUpload);
            
            // Trigger file selection dialog
            document.body.appendChild(input);
            input.click();
            
            // Remove input after selection
            setTimeout(() => {
                document.body.removeChild(input);
            }, 1000);
        });
    }
    
    // Delete button - deletes selected element
    const deleteBtn = document.getElementById('deleteBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', deleteSelectedElement);
    }
    
    // Duplicate button - duplicates selected element
    const duplicateBtn = document.getElementById('duplicateBtn');
    if (duplicateBtn) {
        duplicateBtn.addEventListener('click', duplicateSelectedElement);
    }
    
    // Arrange buttons - send forward/backward
    const bringForwardBtn = document.getElementById('bringForwardBtn');
    if (bringForwardBtn) {
        bringForwardBtn.addEventListener('click', bringElementForward);
    }
    
    const sendBackwardBtn = document.getElementById('sendBackwardBtn');
    if (sendBackwardBtn) {
        sendBackwardBtn.addEventListener('click', sendElementBackward);
    }
}

// Show the shape dropdown menu
function showShapeDropdown(event) {
    const dropdown = document.getElementById('shape-dropdown');
    if (!dropdown) return;
    
    // Position dropdown near the button
    dropdown.style.display = 'block';
    dropdown.style.left = `${event.clientX}px`;
    dropdown.style.top = `${event.clientY}px`;
    
    // Close dropdown when clicking outside
    const closeDropdown = (e) => {
        if (!dropdown.contains(e.target) && e.target !== event.target) {
            dropdown.style.display = 'none';
            document.removeEventListener('click', closeDropdown);
        }
    };
    
    // Add delayed event listener to prevent immediate closure
    setTimeout(() => {
        document.addEventListener('click', closeDropdown);
    }, 100);
}

// Setup shape dropdown menu
function setupShapeMenu() {
    const dropdown = document.getElementById('shape-dropdown');
    if (!dropdown) return;
    
    // Add click event to shape options
    const shapeOptions = dropdown.querySelectorAll('[data-shape]');
    shapeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const shapeType = this.getAttribute('data-shape');
            addShape(shapeType);
            dropdown.style.display = 'none';
        });
    });
}

// Setup drag and resize functionality
function setupDragAndResize() {
    // Get the slide canvas
    const canvas = document.getElementById('slide-canvas');
    if (!canvas) return;
    
    // Add click handler to deselect when clicking on empty canvas
    canvas.addEventListener('click', function(e) {
        if (e.target === canvas) {
            deselectAllElements();
        }
    });
    
    // For dragging (simplified implementation)
    let isDragging = false;
    let dragStartX, dragStartY;
    let elementStartX, elementStartY;
    
    // Mouse down on element - start drag
    canvas.addEventListener('mousedown', function(e) {
        const element = e.target.closest('.slide-element');
        if (!element) return;
        
        // Select the element
        selectElement(element);
        
        // Start drag
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        elementStartX = parseInt(element.style.left) || 0;
        elementStartY = parseInt(element.style.top) || 0;
        
        // Prevent default to avoid text selection
        e.preventDefault();
    });
    
    // Mouse move - drag element
    document.addEventListener('mousemove', function(e) {
        if (!isDragging || !selectedElement) return;
        
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        
        selectedElement.style.left = `${elementStartX + dx}px`;
        selectedElement.style.top = `${elementStartY + dy}px`;
    });
    
    // Mouse up - end drag
    document.addEventListener('mouseup', function() {
        if (isDragging && selectedElement) {
            // Save the new position to the element data
            // This would need to be implemented in a real app
            // to update the slide data structure
            console.log('Element moved to:', selectedElement.style.left, selectedElement.style.top);
        }
        
        isDragging = false;
    });
}

// Add a shape element to the slide
export function addShape(shapeType) {
    const canvas = document.getElementById('slide-canvas');
    if (!canvas) return;
    
    // Create element
    const element = document.createElement('div');
    element.className = 'slide-element shape';
    element.id = `shape-${Date.now()}`;
    element.setAttribute('data-type', 'shape');
    element.setAttribute('data-shape', shapeType);
    
    // Set default position and size
    element.style.position = 'absolute';
    element.style.left = '50%';
    element.style.top = '50%';
    element.style.transform = 'translate(-50%, -50%)';
    element.style.width = '100px';
    element.style.height = '100px';
    element.style.backgroundColor = '#3498db';
    element.style.border = '1px solid #2980b9';
    
    // Apply shape-specific styling
    switch (shapeType) {
        case 'circle':
            element.style.borderRadius = '50%';
            break;
        case 'triangle':
            element.style.width = '0';
            element.style.height = '0';
            element.style.borderLeft = '50px solid transparent';
            element.style.borderRight = '50px solid transparent';
            element.style.borderBottom = '100px solid #3498db';
            element.style.backgroundColor = 'transparent';
            break;
        case 'star':
            element.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
            break;
        // Add more shapes as needed
    }
    
    // Add to canvas
    canvas.appendChild(element);
    
    // Select the new element
    selectElement(element);
    
    // Return the element in case it's needed
    return element;
}

// Add a text box to the slide
export function addTextBox() {
    const canvas = document.getElementById('slide-canvas');
    if (!canvas) return;
    
    // Create element
    const element = document.createElement('div');
    element.className = 'slide-element text';
    element.id = `text-${Date.now()}`;
    element.setAttribute('data-type', 'text');
    
    // Set default position and size
    element.style.position = 'absolute';
    element.style.left = '50%';
    element.style.top = '50%';
    element.style.transform = 'translate(-50%, -50%)';
    element.style.width = '200px';
    element.style.height = 'auto';
    element.style.minHeight = '40px';
    element.style.backgroundColor = 'transparent';
    element.style.color = '#000000';
    element.style.fontSize = '16px';
    element.style.textAlign = 'center';
    element.style.padding = '10px';
    
    // Make editable
    element.contentEditable = true;
    element.textContent = '텍스트를 입력하세요';
    
    // Add to canvas
    canvas.appendChild(element);
    
    // Select the new element
    selectElement(element);
    
    // Focus to start editing
    setTimeout(() => {
        element.focus();
        
        // Select all text
        const range = document.createRange();
        range.selectNodeContents(element);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }, 10);
    
    return element;
}

// Handle image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        addImage(e.target.result);
    };
    reader.readAsDataURL(file);
}

// Add image to the slide
export function addImage(imageUrl) {
    const canvas = document.getElementById('slide-canvas');
    if (!canvas) return;
    
    // Create element
    const element = document.createElement('div');
    element.className = 'slide-element image';
    element.id = `image-${Date.now()}`;
    element.setAttribute('data-type', 'image');
    
    // Set default position and size
    element.style.position = 'absolute';
    element.style.left = '50%';
    element.style.top = '50%';
    element.style.transform = 'translate(-50%, -50%)';
    element.style.width = '200px';
    element.style.height = '150px';
    element.style.backgroundImage = `url(${imageUrl})`;
    element.style.backgroundSize = 'contain';
    element.style.backgroundRepeat = 'no-repeat';
    element.style.backgroundPosition = 'center';
    
    // Add to canvas
    canvas.appendChild(element);
    
    // Select the new element
    selectElement(element);
    
    return element;
}

// Select an element for editing
export function selectElement(element) {
    if (!element) return;
    
    // Deselect all elements first
    deselectAllElements();
    
    // Select this element
    selectedElement = element;
    element.classList.add('selected');
    
    // Add selection handles (simplified)
    addSelectionHandles(element);
    
    // Enable delete and other buttons
    enableElementButtons();
    
    // Update format panel with element properties
    updateFormatPanel(element);
}

// Deselect all elements
function deselectAllElements() {
    const elements = document.querySelectorAll('.slide-element');
    elements.forEach(el => {
        el.classList.remove('selected');
        
        // Remove selection handles
        const handles = el.querySelectorAll('.selection-handle');
        handles.forEach(handle => handle.remove());
    });
    
    selectedElement = null;
    
    // Disable element buttons
    disableElementButtons();
}

// Add selection handles to element
function addSelectionHandles(element) {
    // Simplified - just add corner handles
    const positions = ['nw', 'ne', 'se', 'sw'];
    
    positions.forEach(pos => {
        const handle = document.createElement('div');
        handle.className = `selection-handle handle-${pos}`;
        element.appendChild(handle);
    });
}

// Enable element control buttons
function enableElementButtons() {
    const deleteBtn = document.getElementById('deleteBtn');
    if (deleteBtn) deleteBtn.disabled = false;
    
    const duplicateBtn = document.getElementById('duplicateBtn');
    if (duplicateBtn) duplicateBtn.disabled = false;
    
    const bringForwardBtn = document.getElementById('bringForwardBtn');
    if (bringForwardBtn) bringForwardBtn.disabled = false;
    
    const sendBackwardBtn = document.getElementById('sendBackwardBtn');
    if (sendBackwardBtn) sendBackwardBtn.disabled = false;
}

// Disable element control buttons
function disableElementButtons() {
    const deleteBtn = document.getElementById('deleteBtn');
    if (deleteBtn) deleteBtn.disabled = true;
    
    const duplicateBtn = document.getElementById('duplicateBtn');
    if (duplicateBtn) duplicateBtn.disabled = true;
    
    const bringForwardBtn = document.getElementById('bringForwardBtn');
    if (bringForwardBtn) bringForwardBtn.disabled = true;
    
    const sendBackwardBtn = document.getElementById('sendBackwardBtn');
    if (sendBackwardBtn) sendBackwardBtn.disabled = true;
}

// Delete the selected element
function deleteSelectedElement() {
    if (!selectedElement) return;
    
    // Remove from DOM
    selectedElement.remove();
    
    // Clear selection
    selectedElement = null;
    
    // Disable buttons
    disableElementButtons();
}

// Duplicate the selected element
function duplicateSelectedElement() {
    if (!selectedElement) return;
    
    // Clone the element
    const clone = selectedElement.cloneNode(true);
    clone.id = `${selectedElement.getAttribute('data-type')}-${Date.now()}`;
    
    // Offset the position slightly
    const left = parseInt(selectedElement.style.left) || 0;
    const top = parseInt(selectedElement.style.top) || 0;
    clone.style.left = `${left + 20}px`;
    clone.style.top = `${top + 20}px`;
    
    // Add to canvas
    selectedElement.parentNode.appendChild(clone);
    
    // Select the new element
    selectElement(clone);
}

// Bring the selected element forward
function bringElementForward() {
    if (!selectedElement) return;
    
    const parent = selectedElement.parentNode;
    parent.appendChild(selectedElement);
}

// Send the selected element backward
function sendElementBackward() {
    if (!selectedElement) return;
    
    const parent = selectedElement.parentNode;
    parent.insertBefore(selectedElement, parent.firstChild);
}

// Update format panel with element properties
function updateFormatPanel(element) {
    if (!element) return;
    
    const type = element.getAttribute('data-type');
    
    // Show/hide text-specific controls
    const textInputContainer = document.getElementById('textInputContainer');
    if (textInputContainer) {
        textInputContainer.style.display = type === 'text' ? 'block' : 'none';
    }
    
    // Update color inputs
    const fillColor = document.getElementById('fillColor');
    if (fillColor) {
        fillColor.value = rgbToHex(element.style.backgroundColor || '#ffffff');
    }
    
    // Update border controls
    const borderColor = document.getElementById('borderColor');
    if (borderColor) {
        borderColor.value = rgbToHex(element.style.borderColor || '#000000');
    }
    
    const borderWidth = document.getElementById('borderWidth');
    if (borderWidth) {
        const width = parseInt(element.style.borderWidth) || 1;
        borderWidth.value = width;
        
        const borderWidthValue = document.getElementById('borderWidthValue');
        if (borderWidthValue) {
            borderWidthValue.textContent = `${width}px`;
        }
    }
    
    // Update text controls if it's a text element
    if (type === 'text') {
        const textColor = document.getElementById('textColor');
        if (textColor) {
            textColor.value = rgbToHex(element.style.color || '#000000');
        }
        
        const fontSize = document.getElementById('fontSize');
        if (fontSize) {
            fontSize.value = element.style.fontSize || '16px';
        }
        
        const elementText = document.getElementById('elementText');
        if (elementText) {
            elementText.value = element.textContent;
        }
        
        // Update text alignment buttons
        const textAlign = element.style.textAlign || 'center';
        const alignButtons = {
            'left': document.getElementById('alignLeft'),
            'center': document.getElementById('alignCenter'),
            'right': document.getElementById('alignRight')
        };
        
        for (const [align, button] of Object.entries(alignButtons)) {
            if (button) {
                if (align === textAlign) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            }
        }
    }
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

// 선택 핸들 생성
function createSelectionHandles(element, container) {
    // 기존 핸들 제거
    clearSelectionHandles(container);
    
    // 각 모서리 및 중간 지점에 핸들 추가
    const handlePositions = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
    
    // 핸들 생성
    handlePositions.forEach(position => {
        const handle = document.createElement('div');
        handle.className = `selection-handle handle-${position}`;
        handle.setAttribute('data-handle', position);
        container.appendChild(handle);
    });
    
    // 회전 핸들 추가
    const rotateHandle = document.createElement('div');
    rotateHandle.className = 'selection-handle handle-rotate';
    container.appendChild(rotateHandle);
    
    // 기울이기 핸들 추가
    const skewXHandle = document.createElement('div');
    skewXHandle.className = 'selection-handle handle-skew-x';
    skewXHandle.setAttribute('data-handle', 'skew-x');
    skewXHandle.style.left = '50%';
    skewXHandle.style.top = '-20px';
    skewXHandle.style.transform = 'translateX(-50%) translateY(-100%)';
    container.appendChild(skewXHandle);
    
    const skewYHandle = document.createElement('div');
    skewYHandle.className = 'selection-handle handle-skew-y';
    skewYHandle.setAttribute('data-handle', 'skew-y');
    skewYHandle.style.left = '-20px';
    skewYHandle.style.top = '50%';
    skewYHandle.style.transform = 'translateX(-100%) translateY(-50%)';
    container.appendChild(skewYHandle);
    
    // 핸들 드래그 이벤트 설정
    setupHandleDragEvents(container, element);
} 