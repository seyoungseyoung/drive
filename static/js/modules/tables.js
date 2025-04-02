/**
 * Tables module for creating and managing tables in presentations
 */

// Track active tables
let activeTables = new Map();
let selectedTable = null;

// Initialize tables module
export function initTables() {
    console.log('Initializing tables module');
    setupTableButtons();
    setupTableOptionsPanel();
}

// Setup table buttons
function setupTableButtons() {
    const addTableBtn = document.getElementById('addTableBtn');
    if (addTableBtn) {
        addTableBtn.addEventListener('click', showTableDialog);
    }
}

// Show table creation dialog
function showTableDialog() {
    // Create dialog element
    const dialog = document.createElement('div');
    dialog.className = 'table-dialog modal';
    dialog.id = 'tableDialog';
    
    // Create dialog content
    dialog.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Create Table</h3>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                <div class="table-config">
                    <div class="config-group">
                        <label for="tableRows">Rows:</label>
                        <input type="number" id="tableRows" min="1" max="20" value="3">
                    </div>
                    <div class="config-group">
                        <label for="tableColumns">Columns:</label>
                        <input type="number" id="tableColumns" min="1" max="10" value="3">
                    </div>
                    <div class="config-group">
                        <label for="headerRow">Include header row:</label>
                        <input type="checkbox" id="headerRow" checked>
                    </div>
                    <div class="config-group">
                        <label for="tableWidth">Width (px):</label>
                        <input type="number" id="tableWidth" min="200" max="800" value="400">
                    </div>
                    <div class="config-group">
                        <label for="tableStyle">Style:</label>
                        <select id="tableStyle">
                            <option value="default">Default</option>
                            <option value="striped">Striped</option>
                            <option value="bordered">Bordered</option>
                            <option value="minimal">Minimal</option>
                        </select>
                    </div>
                </div>
                <div class="table-preview">
                    <h4>Preview</h4>
                    <div id="tablePreviewContainer"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button id="cancelTableBtn" class="btn-secondary">Cancel</button>
                <button id="addTableToSlideBtn" class="btn-primary">Add to Slide</button>
            </div>
        </div>
    `;
    
    // Add to DOM
    document.body.appendChild(dialog);
    
    // Show dialog
    dialog.style.display = 'block';
    
    // Add event listeners
    const closeBtn = dialog.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            dialog.style.display = 'none';
            setTimeout(() => {
                document.body.removeChild(dialog);
            }, 300);
        });
    }
    
    // Cancel button
    const cancelBtn = document.getElementById('cancelTableBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            dialog.style.display = 'none';
            setTimeout(() => {
                document.body.removeChild(dialog);
            }, 300);
        });
    }
    
    // Add table button
    const addTableBtn = document.getElementById('addTableToSlideBtn');
    if (addTableBtn) {
        addTableBtn.addEventListener('click', () => {
            // Get table configuration
            const rows = parseInt(document.getElementById('tableRows').value);
            const columns = parseInt(document.getElementById('tableColumns').value);
            const hasHeader = document.getElementById('headerRow').checked;
            const width = parseInt(document.getElementById('tableWidth').value);
            const style = document.getElementById('tableStyle').value;
            
            // Add table to slide
            addTableToSlide(rows, columns, {
                hasHeader,
                width,
                style
            });
            
            // Close dialog
            dialog.style.display = 'none';
            setTimeout(() => {
                document.body.removeChild(dialog);
            }, 300);
        });
    }
    
    // Setup preview update listeners
    const tableConfigInputs = dialog.querySelectorAll('.config-group input, .config-group select');
    tableConfigInputs.forEach(input => {
        input.addEventListener('change', updateTablePreview);
        input.addEventListener('input', updateTablePreview);
    });
    
    // Initialize preview
    updateTablePreview();
}

// Update table preview based on settings
function updateTablePreview() {
    const previewContainer = document.getElementById('tablePreviewContainer');
    if (!previewContainer) return;
    
    // Get configuration values
    const rows = parseInt(document.getElementById('tableRows').value) || 3;
    const columns = parseInt(document.getElementById('tableColumns').value) || 3;
    const hasHeader = document.getElementById('headerRow').checked;
    const style = document.getElementById('tableStyle').value;
    
    // Create table HTML
    const tableHTML = createTableHTML(rows, columns, {
        hasHeader,
        style,
        isPreview: true
    });
    
    // Update preview
    previewContainer.innerHTML = tableHTML;
}

// Create HTML for a table
function createTableHTML(rows, columns, options = {}) {
    const { hasHeader = true, style = 'default', isPreview = false, data = null } = options;
    
    // Table classes based on style
    let tableClass = 'presentation-table';
    if (style === 'striped') tableClass += ' striped-table';
    if (style === 'bordered') tableClass += ' bordered-table';
    if (style === 'minimal') tableClass += ' minimal-table';
    
    let html = `<table class="${tableClass}">`;
    
    // Create rows
    for (let i = 0; i < rows; i++) {
        html += '<tr>';
        
        // Create cells
        for (let j = 0; j < columns; j++) {
            let cellContent = '';
            
            // Use provided data if available
            if (data && data[i] && data[i][j] !== undefined) {
                cellContent = data[i][j];
            } else {
                // For preview, use placeholder content
                if (isPreview) {
                    if (i === 0 && hasHeader) {
                        cellContent = `Header ${j + 1}`;
                    } else {
                        cellContent = `Cell ${i}-${j}`;
                    }
                }
            }
            
            // Use th for header row
            if (i === 0 && hasHeader) {
                html += `<th>${cellContent}</th>`;
            } else {
                html += `<td>${cellContent}</td>`;
            }
        }
        
        html += '</tr>';
    }
    
    html += '</table>';
    return html;
}

// Add a table to the current slide
export function addTableToSlide(rows, columns, options = {}) {
    const { hasHeader = true, width = 400, style = 'default' } = options;
    const canvas = document.getElementById('slide-canvas');
    if (!canvas) return;
    
    // Create a unique ID for the table
    const tableId = `table-${Date.now()}`;
    
    // Create table container element
    const element = document.createElement('div');
    element.className = 'slide-element table-element';
    element.id = tableId;
    element.setAttribute('data-type', 'table');
    element.setAttribute('data-rows', rows);
    element.setAttribute('data-columns', columns);
    element.setAttribute('data-has-header', hasHeader);
    element.setAttribute('data-style', style);
    
    // Set position and size
    element.style.position = 'absolute';
    element.style.left = '50%';
    element.style.top = '50%';
    element.style.transform = 'translate(-50%, -50%)';
    element.style.width = `${width}px`;
    element.style.overflow = 'hidden';
    
    // Create table HTML
    const tableHTML = createTableHTML(rows, columns, {
        hasHeader,
        style,
        isPreview: false
    });
    
    // Set content
    element.innerHTML = `
        <div class="table-container">
            ${tableHTML}
        </div>
    `;
    
    // Add to canvas
    canvas.appendChild(element);
    
    // Make interactive
    setupTableElement(element);
    
    // Track active table
    activeTables.set(tableId, {
        rows,
        columns,
        hasHeader,
        style,
        width,
        data: Array(rows).fill().map(() => Array(columns).fill(''))
    });
    
    // Select the new table
    selectElement(element);
    
    console.log(`Added table with ${rows} rows and ${columns} columns`);
    return element;
}

// Setup table element for interaction
function setupTableElement(element) {
    // Make draggable
    element.addEventListener('mousedown', function(e) {
        // Ignore if clicking on a cell for editing
        if (e.target.tagName === 'TD' || e.target.tagName === 'TH') {
            return;
        }
        
        const elemRect = element.getBoundingClientRect();
        const offsetX = e.clientX - elemRect.left;
        const offsetY = e.clientY - elemRect.top;
        
        const onMouseMove = function(moveEvent) {
            const x = moveEvent.clientX - offsetX;
            const y = moveEvent.clientY - offsetY;
            
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
            element.style.transform = 'none';
        };
        
        const onMouseUp = function() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
    
    // Enable cell editing
    element.addEventListener('dblclick', function(e) {
        const cell = e.target.closest('td, th');
        if (!cell) return;
        
        // Enable content editing
        cell.contentEditable = true;
        cell.focus();
        
        // Save data when done editing
        const saveContent = function() {
            cell.contentEditable = false;
            
            // Update table data
            const tableId = element.id;
            const table = element.querySelector('table');
            if (table && activeTables.has(tableId)) {
                const tableData = activeTables.get(tableId);
                const data = Array(tableData.rows).fill().map(() => Array(tableData.columns).fill(''));
                
                // Gather data from all cells
                const rows = table.rows;
                for (let i = 0; i < rows.length; i++) {
                    const cells = rows[i].cells;
                    for (let j = 0; j < cells.length; j++) {
                        data[i][j] = cells[j].textContent;
                    }
                }
                
                // Update stored data
                tableData.data = data;
                activeTables.set(tableId, tableData);
            }
        };
        
        // Save when clicking elsewhere or pressing Enter
        cell.addEventListener('blur', saveContent, { once: true });
        cell.addEventListener('keydown', function(keyEvent) {
            if (keyEvent.key === 'Enter' && !keyEvent.shiftKey) {
                keyEvent.preventDefault();
                saveContent();
            }
        });
    });
    
    // Select table when clicked
    element.addEventListener('click', function(e) {
        // Ignore if editing a cell
        if (e.target.contentEditable === 'true') return;
        
        selectElement(element);
    });
}

// Setup the table options panel
function setupTableOptionsPanel() {
    const tableOptionsPanel = document.getElementById('table-options-panel');
    if (!tableOptionsPanel) return;
    
    // Add row button
    const addRowBtn = document.getElementById('addTableRowBtn');
    if (addRowBtn) {
        addRowBtn.addEventListener('click', () => addTableRow());
    }
    
    // Add column button
    const addColumnBtn = document.getElementById('addTableColumnBtn');
    if (addColumnBtn) {
        addColumnBtn.addEventListener('click', () => addTableColumn());
    }
    
    // Delete row button
    const deleteRowBtn = document.getElementById('deleteTableRowBtn');
    if (deleteRowBtn) {
        deleteRowBtn.addEventListener('click', () => deleteTableRow());
    }
    
    // Delete column button
    const deleteColumnBtn = document.getElementById('deleteTableColumnBtn');
    if (deleteColumnBtn) {
        deleteColumnBtn.addEventListener('click', () => deleteTableColumn());
    }
    
    // Style selector
    const tableStyleSelect = document.getElementById('tableStyleSelect');
    if (tableStyleSelect) {
        tableStyleSelect.addEventListener('change', (e) => {
            changeTableStyle(e.target.value);
        });
    }
    
    // Toggle header row
    const headerRowToggle = document.getElementById('headerRowToggle');
    if (headerRowToggle) {
        headerRowToggle.addEventListener('change', (e) => {
            toggleHeaderRow(e.target.checked);
        });
    }
}

// Select a table element
function selectElement(element) {
    // Deselect all other elements
    document.querySelectorAll('.slide-element.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Select this element
    element.classList.add('selected');
    selectedTable = element;
    
    // Show table options panel
    const tableOptionsPanel = document.getElementById('table-options-panel');
    if (tableOptionsPanel) {
        tableOptionsPanel.style.display = 'block';
    }
    
    // Hide other formatting panels
    const textFormattingPanel = document.getElementById('text-formatting-panel');
    if (textFormattingPanel) {
        textFormattingPanel.style.display = 'none';
    }
    
    // Update the options in the panel to match the selected table
    updateTableOptionsPanel();
}

// Update the table options panel based on selected table
function updateTableOptionsPanel() {
    if (!selectedTable) return;
    
    const tableId = selectedTable.id;
    if (!activeTables.has(tableId)) return;
    
    const tableData = activeTables.get(tableId);
    
    // Update style selector
    const tableStyleSelect = document.getElementById('tableStyleSelect');
    if (tableStyleSelect) {
        tableStyleSelect.value = tableData.style;
    }
    
    // Update header row toggle
    const headerRowToggle = document.getElementById('headerRowToggle');
    if (headerRowToggle) {
        headerRowToggle.checked = tableData.hasHeader;
    }
}

// Add a row to the selected table
function addTableRow() {
    if (!selectedTable) return;
    
    const tableId = selectedTable.id;
    if (!activeTables.has(tableId)) return;
    
    const tableData = activeTables.get(tableId);
    
    // Update data structure
    tableData.rows += 1;
    const newRow = Array(tableData.columns).fill('');
    tableData.data.push(newRow);
    
    // Update stored data
    activeTables.set(tableId, tableData);
    
    // Redraw table
    updateTableElement(tableId);
}

// Add a column to the selected table
function addTableColumn() {
    if (!selectedTable) return;
    
    const tableId = selectedTable.id;
    if (!activeTables.has(tableId)) return;
    
    const tableData = activeTables.get(tableId);
    
    // Update data structure
    tableData.columns += 1;
    tableData.data.forEach(row => row.push(''));
    
    // Update stored data
    activeTables.set(tableId, tableData);
    
    // Redraw table
    updateTableElement(tableId);
}

// Delete a row from the selected table
function deleteTableRow() {
    if (!selectedTable) return;
    
    const tableId = selectedTable.id;
    if (!activeTables.has(tableId)) return;
    
    const tableData = activeTables.get(tableId);
    
    // Don't delete if only one row
    if (tableData.rows <= 1) return;
    
    // Update data structure
    tableData.rows -= 1;
    tableData.data.pop();
    
    // Update stored data
    activeTables.set(tableId, tableData);
    
    // Redraw table
    updateTableElement(tableId);
}

// Delete a column from the selected table
function deleteTableColumn() {
    if (!selectedTable) return;
    
    const tableId = selectedTable.id;
    if (!activeTables.has(tableId)) return;
    
    const tableData = activeTables.get(tableId);
    
    // Don't delete if only one column
    if (tableData.columns <= 1) return;
    
    // Update data structure
    tableData.columns -= 1;
    tableData.data.forEach(row => row.pop());
    
    // Update stored data
    activeTables.set(tableId, tableData);
    
    // Redraw table
    updateTableElement(tableId);
}

// Change the style of the selected table
function changeTableStyle(style) {
    if (!selectedTable) return;
    
    const tableId = selectedTable.id;
    if (!activeTables.has(tableId)) return;
    
    const tableData = activeTables.get(tableId);
    
    // Update style
    tableData.style = style;
    
    // Update stored data
    activeTables.set(tableId, tableData);
    
    // Redraw table
    updateTableElement(tableId);
}

// Toggle header row in the selected table
function toggleHeaderRow(hasHeader) {
    if (!selectedTable) return;
    
    const tableId = selectedTable.id;
    if (!activeTables.has(tableId)) return;
    
    const tableData = activeTables.get(tableId);
    
    // Update header setting
    tableData.hasHeader = hasHeader;
    
    // Update stored data
    activeTables.set(tableId, tableData);
    
    // Redraw table
    updateTableElement(tableId);
}

// Update the table element with current data
function updateTableElement(tableId) {
    const element = document.getElementById(tableId);
    if (!element) return;
    
    if (!activeTables.has(tableId)) return;
    
    const tableData = activeTables.get(tableId);
    
    // Create updated table HTML
    const tableHTML = createTableHTML(
        tableData.rows,
        tableData.columns,
        {
            hasHeader: tableData.hasHeader,
            style: tableData.style,
            data: tableData.data
        }
    );
    
    // Update element
    const tableContainer = element.querySelector('.table-container');
    if (tableContainer) {
        tableContainer.innerHTML = tableHTML;
    } else {
        element.innerHTML = `<div class="table-container">${tableHTML}</div>`;
    }
    
    // Update element attributes
    element.setAttribute('data-rows', tableData.rows);
    element.setAttribute('data-columns', tableData.columns);
    element.setAttribute('data-has-header', tableData.hasHeader);
    element.setAttribute('data-style', tableData.style);
}

// Resize the selected table
export function resizeTable(width) {
    if (!selectedTable) return;
    
    const tableId = selectedTable.id;
    if (!activeTables.has(tableId)) return;
    
    const tableData = activeTables.get(tableId);
    
    // Update width
    tableData.width = width;
    selectedTable.style.width = `${width}px`;
    
    // Update stored data
    activeTables.set(tableId, tableData);
}

// Get all active tables
export function getActiveTables() {
    return activeTables;
}

// Clear the selected table
export function clearSelectedTable() {
    selectedTable = null;
    
    // Hide table options panel
    const tableOptionsPanel = document.getElementById('table-options-panel');
    if (tableOptionsPanel) {
        tableOptionsPanel.style.display = 'none';
    }
} 