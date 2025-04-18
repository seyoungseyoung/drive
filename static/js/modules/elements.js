/**
 * Elements module for managing slide elements (shapes, text, images)
 */

// Track currently selected element
let selectedElement = null;

import { rgbToHex } from './ui-core.js';

// Font options for text elements
const availableFonts = [
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Times New Roman', value: 'Times New Roman, serif' },
    { name: 'Courier New', value: 'Courier New, monospace' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
    { name: 'Tahoma', value: 'Tahoma, sans-serif' },
    { name: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
    { name: 'Impact', value: 'Impact, sans-serif' },
    { name: 'Comic Sans MS', value: 'Comic Sans MS, cursive' },
    { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif' }
];

// Initialize elements module
export function initElements() {
    console.log('Initializing elements module');
    setupElementButtons();
    setupShapeMenu();
    setupDragAndResize();
    setupTextFormatting();
}

// Initialization function for ui.js to call
export function initElementHandlers() {
    console.log('초기화 요소 핸들러');
    initElements();
    console.log('요소 핸들러 초기화 완료');
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
    
    // Add text to shape button
    const addTextToShapeBtn = document.getElementById('addTextToShapeBtn');
    if (addTextToShapeBtn) {
        addTextToShapeBtn.addEventListener('click', () => {
            if (selectedElement && selectedElement.getAttribute('data-type') === 'shape') {
                addTextToShape(selectedElement);
            }
        });
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
    
    // Format control buttons for shapes and text
    setupFormatControlButtons();
    
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

// Setup format control buttons
function setupFormatControlButtons() {
    // Fill color change
    const fillColor = document.getElementById('fillColor');
    if (fillColor) {
        fillColor.addEventListener('input', (e) => {
            applyColorChange('fill', e.target.value);
        });
    }
    
    // Border color change
    const borderColor = document.getElementById('borderColor');
    if (borderColor) {
        borderColor.addEventListener('input', (e) => {
            applyColorChange('border', e.target.value);
        });
    }
    
    // Text color change
    const textColor = document.getElementById('textColor');
    if (textColor) {
        textColor.addEventListener('input', (e) => {
            applyColorChange('text', e.target.value);
        });
    }
    
    // Fill opacity change
    const fillOpacity = document.getElementById('fillOpacity');
    if (fillOpacity) {
        fillOpacity.addEventListener('input', (e) => {
            applyOpacityChange(e.target.value);
        });
    }
    
    // Border width change
    const borderWidth = document.getElementById('borderWidth');
    if (borderWidth) {
        borderWidth.addEventListener('input', (e) => {
            applyBorderWidthChange(e.target.value);
        });
    }
    
    // Text size change
    const fontSize = document.getElementById('fontSize');
    if (fontSize) {
        fontSize.addEventListener('change', (e) => {
            applyTextSizeChange(e.target.value);
        });
    }
    
    // Text alignment buttons
    const alignLeft = document.getElementById('alignLeft');
    const alignCenter = document.getElementById('alignCenter');
    const alignRight = document.getElementById('alignRight');
    
    if (alignLeft) alignLeft.addEventListener('click', () => applyTextAlignChange('left'));
    if (alignCenter) alignCenter.addEventListener('click', () => applyTextAlignChange('center'));
    if (alignRight) alignRight.addEventListener('click', () => applyTextAlignChange('right'));
}

// Setup text formatting controls
function setupTextFormatting() {
    // Font family selector
    const fontFamilySelect = document.getElementById('fontFamily');
    if (fontFamilySelect) {
        // Populate font options
        availableFonts.forEach(font => {
            const option = document.createElement('option');
            option.value = font.value;
            option.textContent = font.name;
            option.style.fontFamily = font.value;
            fontFamilySelect.appendChild(option);
        });
        
        // Add change event
        fontFamilySelect.addEventListener('change', (e) => {
            applyFontFamily(e.target.value);
        });
    }
    
    // Font size input
    const fontSize = document.getElementById('fontSize');
    if (fontSize) {
        fontSize.addEventListener('change', (e) => {
            applyTextSizeChange(e.target.value);
        });
    }
    
    // Bold button
    const boldBtn = document.getElementById('boldTextBtn');
    if (boldBtn) {
        boldBtn.addEventListener('click', () => {
            toggleTextStyle('bold');
        });
    }
    
    // Italic button
    const italicBtn = document.getElementById('italicTextBtn');
    if (italicBtn) {
        italicBtn.addEventListener('click', () => {
            toggleTextStyle('italic');
        });
    }
    
    // Underline button
    const underlineBtn = document.getElementById('underlineTextBtn');
    if (underlineBtn) {
        underlineBtn.addEventListener('click', () => {
            toggleTextStyle('underline');
        });
    }
    
    // Text alignment buttons
    const alignLeft = document.getElementById('alignLeft');
    const alignCenter = document.getElementById('alignCenter');
    const alignRight = document.getElementById('alignRight');
    
    if (alignLeft) alignLeft.addEventListener('click', () => applyTextAlignChange('left'));
    if (alignCenter) alignCenter.addEventListener('click', () => applyTextAlignChange('center'));
    if (alignRight) alignRight.addEventListener('click', () => applyTextAlignChange('right'));
    
    // Bullet list button
    const bulletListBtn = document.getElementById('bulletListBtn');
    if (bulletListBtn) {
        bulletListBtn.addEventListener('click', () => {
            applyBulletList();
        });
    }
    
    // Numbered list button
    const numberedListBtn = document.getElementById('numberedListBtn');
    if (numberedListBtn) {
        numberedListBtn.addEventListener('click', () => {
            applyNumberedList();
        });
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
    
    // For dragging (improved implementation)
    let isDragging = false;
    let dragStartX, dragStartY;
    let elementStartX, elementStartY;
    let dragThrottle = false;
    const throttleDelay = 10; // milliseconds
    let draggedElement = null;
    let dragGhost = null;
    
    // Mouse down on element - start drag
    canvas.addEventListener('mousedown', function(e) {
        const element = e.target.closest('.slide-element');
        if (!element) return;
        
        // Check if we're clicking on a handle (don't start drag in that case)
        if (e.target.closest('.selection-handle')) return;
        
        // Select the element if not already selected or if not holding shift
        if (!element.classList.contains('selected') || !e.shiftKey) {
            if (!e.shiftKey) {
                deselectAllElements();
            }
            selectElement(element);
        }
        
        // Start drag if not a text element being edited
        if (element.getAttribute('data-type') === 'text' && 
            document.activeElement === element) {
            return; // Don't start drag if editing text
        }
        
        draggedElement = element;
        
        // Start drag
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        elementStartX = parseInt(element.style.left) || 0;
        elementStartY = parseInt(element.style.top) || 0;
        
        // Create a ghost for visual feedback
        createDragGhost(element);
        
        // Add dragging class for visual feedback
        element.classList.add('dragging');
        
        // Prevent default to avoid text selection
        e.preventDefault();
    });
    
    // Mouse move - drag element with throttling for smoothness
    document.addEventListener('mousemove', function(e) {
        if (!isDragging || !draggedElement) return;
        
        // Throttle the movement updates for better performance
        if (!dragThrottle) {
            dragThrottle = true;
            
            const dx = e.clientX - dragStartX;
            const dy = e.clientY - dragStartY;
            
            // Update both the element and its ghost
            draggedElement.style.left = `${elementStartX + dx}px`;
            draggedElement.style.top = `${elementStartY + dy}px`;
            
            if (dragGhost) {
                dragGhost.style.left = `${elementStartX + dx}px`;
                dragGhost.style.top = `${elementStartY + dy}px`;
            }
            
            // If this is a grouped element, move all elements in the group
            if (draggedElement.getAttribute('data-group-id')) {
                const groupId = draggedElement.getAttribute('data-group-id');
                const groupElements = document.querySelectorAll(`.slide-element[data-group-id="${groupId}"]`);
                
                groupElements.forEach(groupElement => {
                    if (groupElement !== draggedElement) {
                        const elStartX = parseInt(groupElement.getAttribute('data-start-x')) || 0;
                        const elStartY = parseInt(groupElement.getAttribute('data-start-y')) || 0;
                        groupElement.style.left = `${elStartX + dx}px`;
                        groupElement.style.top = `${elStartY + dy}px`;
                    }
                });
            }
            
            // Reset throttle after delay
            setTimeout(() => {
                dragThrottle = false;
            }, throttleDelay);
        }
    });
    
    // Mouse up - end drag
    document.addEventListener('mouseup', function() {
        if (isDragging && draggedElement) {
            // Save the new position to the element data
            const newX = parseInt(draggedElement.style.left) || 0;
            const newY = parseInt(draggedElement.style.top) || 0;
            
            // Update the data attributes for future reference
            draggedElement.setAttribute('data-x', newX);
            draggedElement.setAttribute('data-y', newY);
            
            // If this is a grouped element, update all elements in the group
            if (draggedElement.getAttribute('data-group-id')) {
                const groupId = draggedElement.getAttribute('data-group-id');
                const groupElements = document.querySelectorAll(`.slide-element[data-group-id="${groupId}"]`);
                
                groupElements.forEach(groupElement => {
                    const elementX = parseInt(groupElement.style.left) || 0;
                    const elementY = parseInt(groupElement.style.top) || 0;
                    groupElement.setAttribute('data-start-x', elementX);
                    groupElement.setAttribute('data-start-y', elementY);
                });
            }
            
            // Remove dragging class and ghost
            draggedElement.classList.remove('dragging');
            removeDragGhost();
        }
        
        isDragging = false;
        draggedElement = null;
    });
    
    // Create a drag ghost for visual feedback
    function createDragGhost(element) {
        removeDragGhost(); // Remove any existing ghost
        
        // Create ghost element
        dragGhost = document.createElement('div');
        dragGhost.className = 'drag-ghost';
        dragGhost.style.position = 'absolute';
        dragGhost.style.left = element.style.left;
        dragGhost.style.top = element.style.top;
        dragGhost.style.width = `${element.offsetWidth}px`;
        dragGhost.style.height = `${element.offsetHeight}px`;
        dragGhost.style.backgroundColor = 'rgba(43, 87, 154, 0.1)';
        dragGhost.style.border = '1px dashed #2b579a';
        dragGhost.style.pointerEvents = 'none';
        dragGhost.style.zIndex = '1000';
        
        // Add to canvas
        canvas.appendChild(dragGhost);
    }
    
    // Remove drag ghost
    function removeDragGhost() {
        if (dragGhost) {
            dragGhost.remove();
            dragGhost = null;
        }
    }
    
    // Add multi-selection with shift key
    canvas.addEventListener('mousedown', function(e) {
        // Only handle shift + click for multi-selection
        if (!e.shiftKey) return;
        
        const element = e.target.closest('.slide-element');
        if (!element) return;
        
        // Toggle selection on this element
        if (element.classList.contains('selected')) {
            deselectElement(element);
        } else {
            selectElement(element, true); // true = add to selection
        }
        
        e.preventDefault();
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
    element.style.opacity = '1'; // Add default opacity
    element.style.border = '1px solid #2980b9';
    
    // Add data attributes to store properties for easier access
    element.setAttribute('data-fill-color', '#3498db');
    element.setAttribute('data-fill-opacity', '100');
    element.setAttribute('data-border-color', '#2980b9');
    element.setAttribute('data-border-width', '1');
    
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

// Export alias for compatibility with ui-modals.js
export const addShapeElement = addShape;

// Add a text box to the slide
export function addTextBox() {
    const canvas = document.getElementById('slide-canvas');
    if (!canvas) return;
    
    // Create element
    const element = document.createElement('div');
    element.className = 'slide-element text';
    element.id = `text-${Date.now()}`;
    element.setAttribute('data-type', 'text');
    element.contentEditable = true;
    
    // Set default position and size
    element.style.position = 'absolute';
    element.style.left = '50%';
    element.style.top = '50%';
    element.style.transform = 'translate(-50%, -50%)';
    element.style.width = '200px';
    element.style.minHeight = '40px';
    element.style.padding = '10px';
    
    // Set default styling
    element.style.backgroundColor = 'transparent';
    element.style.border = '1px dashed #ccc';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.fontSize = '16px';
    element.style.color = '#000000';
    element.style.textAlign = 'center';
    element.style.cursor = 'text';
    
    // Set default content
    element.innerHTML = 'Click to edit text';
    
    // Add to canvas
    canvas.appendChild(element);
    
    // Make interactive
    makeElementInteractive(element);
    
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
    
    // Return the element
    return element;
}

// Apply font family to selected text element
function applyFontFamily(fontFamily) {
    if (!selectedElement || !isTextElement(selectedElement)) return;
    
    // Check if there's selected text within the element
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && selection.toString().length > 0 && selectedElement.contains(selection.anchorNode)) {
        // Apply to selected text only
        document.execCommand('fontName', false, fontFamily);
    } else {
        // Apply to entire element
        selectedElement.style.fontFamily = fontFamily;
    }
}

// Toggle text style (bold, italic, underline)
function toggleTextStyle(style) {
    if (!selectedElement || !isTextElement(selectedElement)) return;
    
    // Get current element to store state
    const element = selectedElement;
    
    // Check if there's a selection
    const selection = window.getSelection();
    const hasSelection = selection.rangeCount > 0 && 
                        selection.toString().length > 0 && 
                        element.contains(selection.anchorNode);
    
    if (hasSelection) {
        // Apply style to selection only
        switch (style) {
            case 'bold':
                document.execCommand('bold', false, null);
                break;
            case 'italic':
                document.execCommand('italic', false, null);
                break;
            case 'underline':
                document.execCommand('underline', false, null);
                break;
        }
    } else {
        // Apply style to entire element
        switch (style) {
            case 'bold':
                if (element.style.fontWeight === 'bold') {
                    element.style.fontWeight = 'normal';
                } else {
                    element.style.fontWeight = 'bold';
                }
                break;
            case 'italic':
                if (element.style.fontStyle === 'italic') {
                    element.style.fontStyle = 'normal';
                } else {
                    element.style.fontStyle = 'italic';
                }
                break;
            case 'underline':
                if (element.style.textDecoration === 'underline') {
                    element.style.textDecoration = 'none';
                } else {
                    element.style.textDecoration = 'underline';
                }
                break;
        }
    }
    
    // Update the formatting buttons to reflect current state
    updateTextFormattingButtons();
}

// Apply bullet list formatting
function applyBulletList() {
    if (!selectedElement || !isTextElement(selectedElement)) return;
    
    document.execCommand('insertUnorderedList', false, null);
}

// Apply numbered list formatting
function applyNumberedList() {
    if (!selectedElement || !isTextElement(selectedElement)) return;
    
    document.execCommand('insertOrderedList', false, null);
}

// Update the text formatting buttons to reflect current state
function updateTextFormattingButtons() {
    if (!selectedElement || !isTextElement(selectedElement)) return;
    
    // Check current state
    const computedStyle = window.getComputedStyle(selectedElement);
    
    // Update bold button
    const boldBtn = document.getElementById('boldTextBtn');
    if (boldBtn) {
        boldBtn.classList.toggle('active', computedStyle.fontWeight === 'bold' || parseInt(computedStyle.fontWeight) >= 700);
    }
    
    // Update italic button
    const italicBtn = document.getElementById('italicTextBtn');
    if (italicBtn) {
        italicBtn.classList.toggle('active', computedStyle.fontStyle === 'italic');
    }
    
    // Update underline button
    const underlineBtn = document.getElementById('underlineTextBtn');
    if (underlineBtn) {
        underlineBtn.classList.toggle('active', computedStyle.textDecoration.includes('underline'));
    }
    
    // Update font family selector
    const fontFamilySelect = document.getElementById('fontFamily');
    if (fontFamilySelect) {
        const currentFont = computedStyle.fontFamily;
        
        // Find the best match
        for (let i = 0; i < fontFamilySelect.options.length; i++) {
            const option = fontFamilySelect.options[i];
            if (currentFont.includes(option.text)) {
                fontFamilySelect.selectedIndex = i;
                break;
            }
        }
    }
    
    // Update font size
    const fontSize = document.getElementById('fontSize');
    if (fontSize) {
        // Extract the size value (remove 'px')
        const size = parseInt(computedStyle.fontSize);
        if (!isNaN(size)) {
            fontSize.value = size;
        }
    }
    
    // Update alignment buttons
    const textAlign = computedStyle.textAlign;
    
    const alignLeft = document.getElementById('alignLeft');
    const alignCenter = document.getElementById('alignCenter');
    const alignRight = document.getElementById('alignRight');
    
    if (alignLeft) alignLeft.classList.toggle('active', textAlign === 'left');
    if (alignCenter) alignCenter.classList.toggle('active', textAlign === 'center');
    if (alignRight) alignRight.classList.toggle('active', textAlign === 'right');
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

// Export alias for compatibility with ui-modals.js
export const addImageElement = addImage;

// Check if an element is a text element
function isTextElement(element) {
    return element && element.getAttribute('data-type') === 'text';
}

// Deselect a specific element
function deselectElement(element) {
    if (!element) return;
    
    element.classList.remove('selected');
    
    // Remove selection handles
    const handles = element.querySelectorAll('.selection-handle');
    handles.forEach(handle => handle.remove());
    
    // Check if it was the only selected element
    const selectedElements = document.querySelectorAll('.slide-element.selected');
    if (selectedElements.length === 0) {
        selectedElement = null;
        disableElementButtons();
    }
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

// Select an element for editing
export function selectElement(element, addToSelection = false) {
    if (!element) return;
    
    // If not adding to selection, deselect all elements first
    if (!addToSelection) {
        deselectAllElements();
    }
    
    // Add selected class
    element.classList.add('selected');
    
    // Store as selected element
    selectedElement = element;
    
    // Show selection handles
    addSelectionHandles(element);
    
    // Enable buttons
    enableElementButtons();
    
    // Update formatting panel
    updateFormatPanel(element);
    
    // If this is a text element, update text formatting buttons
    if (isTextElement(element)) {
        updateTextFormattingButtons();
    }
    
    // Check if we have multiple elements selected
    const selectedElements = document.querySelectorAll('.slide-element.selected');
    if (selectedElements.length > 1) {
        showGroupControls(Array.from(selectedElements));
    }
}

// Show controls for grouped elements
function showGroupControls(elements) {
    // First check if all elements are already in the same group
    const firstGroupId = elements[0].getAttribute('data-group-id');
    const allSameGroup = Array.from(elements).every(el => 
        el.getAttribute('data-group-id') === firstGroupId && firstGroupId !== null
    );
    
    // Show the group button in the format panel
    const formatPanel = document.querySelector('.panel-content[data-panel="format"]');
    if (!formatPanel) return;
    
    // Check if group controls section exists
    let groupSection = document.getElementById('groupControlsSection');
    if (!groupSection) {
        groupSection = document.createElement('div');
        groupSection.id = 'groupControlsSection';
        groupSection.className = 'panel-section';
        groupSection.innerHTML = `
            <h4>그룹 컨트롤</h4>
            <div class="button-group">
                <button id="groupElementsBtn" class="btn-secondary">
                    <i class="fas fa-object-group"></i> 그룹화
                </button>
                <button id="ungroupElementsBtn" class="btn-secondary" style="display: none;">
                    <i class="fas fa-object-ungroup"></i> 그룹 해제
                </button>
            </div>
        `;
        formatPanel.prepend(groupSection);
        
        // Add event listeners
        const groupBtn = document.getElementById('groupElementsBtn');
        const ungroupBtn = document.getElementById('ungroupElementsBtn');
        
        if (groupBtn) {
            groupBtn.addEventListener('click', () => {
                groupElements(document.querySelectorAll('.slide-element.selected'));
            });
        }
        
        if (ungroupBtn) {
            ungroupBtn.addEventListener('click', () => {
                ungroupElements(document.querySelectorAll('.slide-element.selected'));
            });
        }
    }
    
    // Show/hide appropriate buttons based on grouping state
    const groupBtn = document.getElementById('groupElementsBtn');
    const ungroupBtn = document.getElementById('ungroupElementsBtn');
    
    if (groupBtn && ungroupBtn) {
        if (allSameGroup && firstGroupId) {
            groupBtn.style.display = 'none';
            ungroupBtn.style.display = 'inline-flex';
        } else {
            groupBtn.style.display = 'inline-flex';
            ungroupBtn.style.display = 'none';
        }
    }
    
    // Show the section
    groupSection.style.display = 'block';
}

// Group selected elements
export function groupElements(elements) {
    if (!elements || elements.length < 2) return;
    
    // Generate a unique group ID
    const groupId = 'group-' + Date.now();
    
    // Store initial positions for dragging
    Array.from(elements).forEach(element => {
        element.setAttribute('data-group-id', groupId);
        element.setAttribute('data-start-x', parseInt(element.style.left) || 0);
        element.setAttribute('data-start-y', parseInt(element.style.top) || 0);
        
        // Remove individual selection handles
        const handles = element.querySelectorAll('.selection-handle');
        handles.forEach(handle => handle.remove());
    });
    
    // Create a group selection box
    createGroupSelectionBox(elements, groupId);
    
    // Update UI
    showGroupControls(Array.from(elements));
}

// Ungroup elements
export function ungroupElements(elements) {
    if (!elements || elements.length === 0) return;
    
    // Get the group ID from the first element
    const groupId = elements[0].getAttribute('data-group-id');
    if (!groupId) return;
    
    // Get all elements with this group ID
    const groupElements = document.querySelectorAll(`.slide-element[data-group-id="${groupId}"]`);
    
    // Remove group ID and start positions
    Array.from(groupElements).forEach(element => {
        element.removeAttribute('data-group-id');
        element.removeAttribute('data-start-x');
        element.removeAttribute('data-start-y');
        
        // Add selection handles back to selected elements
        if (element.classList.contains('selected')) {
            addSelectionHandles(element);
        }
    });
    
    // Remove group selection box
    const groupBox = document.querySelector(`.group-selection-box[data-group-id="${groupId}"]`);
    if (groupBox) groupBox.remove();
    
    // Update UI
    const groupSection = document.getElementById('groupControlsSection');
    if (groupSection) {
        groupSection.style.display = 'none';
    }
}

// Create a box around grouped elements
function createGroupSelectionBox(elements, groupId) {
    // Find the bounding box that contains all elements
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    Array.from(elements).forEach(element => {
        const left = parseInt(element.style.left) || 0;
        const top = parseInt(element.style.top) || 0;
        const width = element.offsetWidth;
        const height = element.offsetHeight;
        
        minX = Math.min(minX, left);
        minY = Math.min(minY, top);
        maxX = Math.max(maxX, left + width);
        maxY = Math.max(maxY, top + height);
    });
    
    // Create a group selection box
    const canvas = document.getElementById('slide-canvas');
    if (!canvas) return;
    
    const groupBox = document.createElement('div');
    groupBox.className = 'group-selection-box';
    groupBox.setAttribute('data-group-id', groupId);
    groupBox.style.position = 'absolute';
    groupBox.style.left = `${minX}px`;
    groupBox.style.top = `${minY}px`;
    groupBox.style.width = `${maxX - minX}px`;
    groupBox.style.height = `${maxY - minY}px`;
    groupBox.style.border = '2px dashed #106ebe';
    groupBox.style.backgroundColor = 'rgba(16, 110, 190, 0.05)';
    groupBox.style.pointerEvents = 'none';
    groupBox.style.zIndex = '5';
    
    canvas.appendChild(groupBox);
}

// Add selection handles to an element
function addSelectionHandles(element) {
    // Add corner handles for resize
    const positions = ['nw', 'ne', 'se', 'sw', 'n', 'e', 's', 'w'];
    
    positions.forEach(pos => {
        const handle = document.createElement('div');
        handle.className = `selection-handle handle-${pos}`;
        element.appendChild(handle);
    });
    
    // Setup resize functionality for handles
    setupResizeHandles(element);
}

// Setup resize handles for an element
function setupResizeHandles(element) {
    const handles = element.querySelectorAll('.selection-handle');
    
    handles.forEach(handle => {
        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = element.offsetWidth;
            const startHeight = element.offsetHeight;
            const startLeft = parseInt(element.style.left) || 0;
            const startTop = parseInt(element.style.top) || 0;
            const handleClass = handle.className;
            
            const onMouseMove = (moveEvent) => {
                moveEvent.preventDefault();
                
                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;
                
                // Handle different resize directions
                if (handleClass.includes('handle-e') || handleClass.includes('handle-ne') || handleClass.includes('handle-se')) {
                    // Right side handles
                    element.style.width = `${Math.max(20, startWidth + dx)}px`;
                }
                
                if (handleClass.includes('handle-w') || handleClass.includes('handle-nw') || handleClass.includes('handle-sw')) {
                    // Left side handles
                    element.style.width = `${Math.max(20, startWidth - dx)}px`;
                    element.style.left = `${startLeft + startWidth - parseInt(element.style.width)}px`;
                }
                
                if (handleClass.includes('handle-n') || handleClass.includes('handle-nw') || handleClass.includes('handle-ne')) {
                    // Top handles
                    element.style.height = `${Math.max(20, startHeight - dy)}px`;
                    element.style.top = `${startTop + startHeight - parseInt(element.style.height)}px`;
                }
                
                if (handleClass.includes('handle-s') || handleClass.includes('handle-sw') || handleClass.includes('handle-se')) {
                    // Bottom handles
                    element.style.height = `${Math.max(20, startHeight + dy)}px`;
                }
            };
            
            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                
                // Update format panel
                updateFormatPanel(element);
            };
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    });
}

// Enable element-related buttons
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

// Disable element-related buttons
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

// Bring selected element forward
function bringElementForward() {
    if (!selectedElement) return;
    
    const parent = selectedElement.parentNode;
    parent.appendChild(selectedElement);
}

// Send selected element backward
function sendElementBackward() {
    if (!selectedElement) return;
    
    const parent = selectedElement.parentNode;
    parent.insertBefore(selectedElement, parent.firstChild);
}

// Update format panel with element properties
function updateFormatPanel(element) {
    if (!element) return;
    
    // Show/hide appropriate controls based on element type
    const textControls = document.getElementById('text-formatting-controls');
    const shapeControls = document.getElementById('shape-formatting-controls');
    
    if (element.getAttribute('data-type') === 'text') {
        // Show text controls, hide shape controls
        if (textControls) textControls.style.display = 'block';
        if (shapeControls) shapeControls.style.display = 'none';
        
        // Update text formatting controls
        updateTextFormattingButtons();
    } else {
        // Show shape controls, hide text controls
        if (textControls) textControls.style.display = 'none';
        if (shapeControls) shapeControls.style.display = 'block';
    }
    
    // Common properties
    const fillColor = document.getElementById('fillColor');
    const borderColor = document.getElementById('borderColor');
    const fillOpacity = document.getElementById('fillOpacity');
    const borderWidth = document.getElementById('borderWidth');
    
    // Get computed style
    const computedStyle = window.getComputedStyle(element);
    
    // Set fill color
    if (fillColor) {
        const bgColor = computedStyle.backgroundColor;
        if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
            // Convert to hex and set value
            fillColor.value = rgbToHex(bgColor);
        } else {
            fillColor.value = '#ffffff';
        }
    }
    
    // Set border color
    if (borderColor) {
        const bColor = computedStyle.borderColor;
        if (bColor) {
            borderColor.value = rgbToHex(bColor);
        }
    }
    
    // Set opacity
    if (fillOpacity) {
        const opacity = computedStyle.opacity;
        fillOpacity.value = opacity !== '' ? opacity * 100 : 100;
    }
    
    // Set border width
    if (borderWidth) {
        const bWidth = parseInt(computedStyle.borderWidth);
        if (!isNaN(bWidth)) {
            borderWidth.value = bWidth;
        } else {
            borderWidth.value = 1;
        }
    }
}

// Add text to a shape
export function addTextToShape(shapeElement) {
    if (!shapeElement || !shapeElement.classList.contains('shape')) return;
    
    // Create text element inside shape
    const textElement = document.createElement('div');
    textElement.className = 'shape-text';
    textElement.contentEditable = true;
    textElement.textContent = '텍스트 입력';
    textElement.style.position = 'absolute';
    textElement.style.top = '50%';
    textElement.style.left = '50%';
    textElement.style.transform = 'translate(-50%, -50%)';
    textElement.style.width = '90%';
    textElement.style.textAlign = 'center';
    textElement.style.color = '#ffffff';
    textElement.style.fontFamily = 'Pretendard';
    textElement.style.fontSize = '14px';
    textElement.style.padding = '5px';
    
    // Store text properties in data attributes
    shapeElement.setAttribute('data-has-text', 'true');
    shapeElement.setAttribute('data-text-color', '#ffffff');
    shapeElement.setAttribute('data-text-size', '14px');
    shapeElement.setAttribute('data-text-align', 'center');
    
    // Add to shape
    shapeElement.appendChild(textElement);
    
    // Focus text element for immediate editing
    setTimeout(() => {
        textElement.focus();
        
        // Select all text
        const range = document.createRange();
        range.selectNodeContents(textElement);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }, 10);
    
    // Update format panel
    updateFormatPanel(shapeElement);
    
    return textElement;
}

// Apply color change to element
export function applyColorChange(property, value) {
    if (!selectedElement) return;
    
    switch (property) {
        case 'fill':
            selectedElement.style.backgroundColor = value;
            selectedElement.setAttribute('data-fill-color', value);
            break;
        case 'border':
            selectedElement.style.borderColor = value;
            selectedElement.setAttribute('data-border-color', value);
            break;
        case 'text':
            if (selectedElement.getAttribute('data-type') === 'text') {
                selectedElement.style.color = value;
                selectedElement.setAttribute('data-text-color', value);
            } else if (selectedElement.querySelector('.shape-text')) {
                selectedElement.querySelector('.shape-text').style.color = value;
                selectedElement.setAttribute('data-text-color', value);
            }
            break;
    }
}

// Apply opacity change to element
export function applyOpacityChange(value) {
    if (!selectedElement) return;
    
    const opacityValue = value / 100;
    selectedElement.style.opacity = opacityValue;
    selectedElement.setAttribute('data-fill-opacity', value);
}

// Apply border width change to element
export function applyBorderWidthChange(value) {
    if (!selectedElement) return;
    
    selectedElement.style.borderWidth = `${value}px`;
    selectedElement.setAttribute('data-border-width', value);
}

// Apply text size change to element
export function applyTextSizeChange(value) {
    if (!selectedElement) return;
    
    // Check if we have selected text
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && selection.toString().length > 0 && 
        selectedElement.contains(selection.anchorNode)) {
        // Apply to selected text
        document.execCommand('fontSize', false, value / 16); // fontSize command uses 1-7 scale
    } else {
        // Apply to entire element
        selectedElement.style.fontSize = `${value}px`;
    }
}

// Apply text alignment change to element
export function applyTextAlignChange(value) {
    if (!selectedElement) return;
    
    if (selectedElement.getAttribute('data-type') === 'text') {
        selectedElement.style.textAlign = value;
        selectedElement.setAttribute('data-text-align', value);
    } else if (selectedElement.querySelector('.shape-text')) {
        selectedElement.querySelector('.shape-text').style.textAlign = value;
        selectedElement.setAttribute('data-text-align', value);
    }
}

// Get available fonts
export function getAvailableFonts() {
    return availableFonts;
}

// Check if an element has a specified format
export function hasTextFormat(element, format) {
    if (!element || !isTextElement(element)) return false;
    
    const computedStyle = window.getComputedStyle(element);
    
    switch (format) {
        case 'bold':
            return computedStyle.fontWeight === 'bold' || parseInt(computedStyle.fontWeight) >= 700;
        case 'italic':
            return computedStyle.fontStyle === 'italic';
        case 'underline':
            return computedStyle.textDecoration.includes('underline');
        default:
            return false;
    }
} 