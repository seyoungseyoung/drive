/**
 * Charts module for creating and managing charts in presentations
 */

// Import Chart.js library
// Note: Chart.js should be included in index.html
// <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

// Available chart types
const CHART_TYPES = {
    BAR: 'bar',
    LINE: 'line',
    PIE: 'pie',
    DOUGHNUT: 'doughnut',
    AREA: 'area',
    SCATTER: 'scatter',
    RADAR: 'radar'
};

// Default chart colors
const DEFAULT_COLORS = [
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 99, 132, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)',
    'rgba(199, 199, 199, 0.8)',
    'rgba(83, 102, 255, 0.8)',
    'rgba(40, 159, 64, 0.8)',
    'rgba(210, 199, 199, 0.8)'
];

// Default chart config
const DEFAULT_CONFIG = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                font: {
                    family: 'Arial',
                    size: 12
                }
            }
        },
        title: {
            display: true,
            text: '차트 제목',
            font: {
                family: 'Arial',
                size: 16,
                weight: 'bold'
            }
        }
    }
};

// Track active charts
let activeCharts = new Map();

// Initialize charts module
export function initCharts() {
    console.log('Initializing charts module');
    setupChartButtons();
    setupChartOptionsPanel();
}

// Set up chart buttons
function setupChartButtons() {
    const addChartBtn = document.getElementById('addChartBtn');
    if (addChartBtn) {
        addChartBtn.addEventListener('click', showChartTypesDialog);
    }
}

// Show chart types dialog
function showChartTypesDialog() {
    // Create dialog element
    const dialog = document.createElement('div');
    dialog.className = 'chart-types-dialog modal';
    dialog.id = 'chartTypesDialog';
    
    // Create dialog content
    dialog.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>차트 유형 선택</h3>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                <div class="chart-types-grid">
                    <div class="chart-type-item" data-type="${CHART_TYPES.BAR}">
                        <div class="chart-type-icon bar-icon"></div>
                        <span>막대 차트</span>
                    </div>
                    <div class="chart-type-item" data-type="${CHART_TYPES.LINE}">
                        <div class="chart-type-icon line-icon"></div>
                        <span>선 차트</span>
                    </div>
                    <div class="chart-type-item" data-type="${CHART_TYPES.PIE}">
                        <div class="chart-type-icon pie-icon"></div>
                        <span>원형 차트</span>
                    </div>
                    <div class="chart-type-item" data-type="${CHART_TYPES.DOUGHNUT}">
                        <div class="chart-type-icon doughnut-icon"></div>
                        <span>도넛 차트</span>
                    </div>
                    <div class="chart-type-item" data-type="${CHART_TYPES.AREA}">
                        <div class="chart-type-icon area-icon"></div>
                        <span>영역 차트</span>
                    </div>
                    <div class="chart-type-item" data-type="${CHART_TYPES.SCATTER}">
                        <div class="chart-type-icon scatter-icon"></div>
                        <span>산점도</span>
                    </div>
                    <div class="chart-type-item" data-type="${CHART_TYPES.RADAR}">
                        <div class="chart-type-icon radar-icon"></div>
                        <span>레이더 차트</span>
                    </div>
                </div>
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
    
    // Add click handlers to chart type items
    const chartTypeItems = dialog.querySelectorAll('.chart-type-item');
    chartTypeItems.forEach(item => {
        item.addEventListener('click', () => {
            const chartType = item.getAttribute('data-type');
            dialog.style.display = 'none';
            
            // Remove dialog and show data editor
            setTimeout(() => {
                document.body.removeChild(dialog);
                showChartDataEditor(chartType);
            }, 300);
        });
    });
}

// Show chart data editor
function showChartDataEditor(chartType) {
    // Create dialog element
    const dialog = document.createElement('div');
    dialog.className = 'chart-data-editor modal';
    dialog.id = 'chartDataEditor';
    
    // Default data structure based on chart type
    let dataStructure = '';
    let dataExample = '';
    
    if (chartType === CHART_TYPES.PIE || chartType === CHART_TYPES.DOUGHNUT) {
        dataStructure = `
            <div class="data-row header-row">
                <div class="data-cell">라벨</div>
                <div class="data-cell">값</div>
                <div class="data-cell">색상</div>
            </div>
            <div class="data-row">
                <div class="data-cell"><input type="text" value="항목 1"></div>
                <div class="data-cell"><input type="number" value="30"></div>
                <div class="data-cell"><input type="color" value="#3498db"></div>
            </div>
            <div class="data-row">
                <div class="data-cell"><input type="text" value="항목 2"></div>
                <div class="data-cell"><input type="number" value="50"></div>
                <div class="data-cell"><input type="color" value="#e74c3c"></div>
            </div>
            <div class="data-row">
                <div class="data-cell"><input type="text" value="항목 3"></div>
                <div class="data-cell"><input type="number" value="20"></div>
                <div class="data-cell"><input type="color" value="#2ecc71"></div>
            </div>
        `;
        
        dataExample = '원형 차트나 도넛 차트에 필요한 데이터입니다. 항목 이름과 값을 입력하세요.';
    } else {
        dataStructure = `
            <div class="data-grid-container">
                <div class="data-row header-row">
                    <div class="data-cell first-cell"></div>
                    <div class="data-cell"><input type="text" value="1분기"></div>
                    <div class="data-cell"><input type="text" value="2분기"></div>
                    <div class="data-cell"><input type="text" value="3분기"></div>
                    <div class="data-cell"><input type="text" value="4분기"></div>
                </div>
                <div class="data-row">
                    <div class="data-cell first-cell"><input type="text" value="제품 A"></div>
                    <div class="data-cell"><input type="number" value="120"></div>
                    <div class="data-cell"><input type="number" value="150"></div>
                    <div class="data-cell"><input type="number" value="180"></div>
                    <div class="data-cell"><input type="number" value="210"></div>
                </div>
                <div class="data-row">
                    <div class="data-cell first-cell"><input type="text" value="제품 B"></div>
                    <div class="data-cell"><input type="number" value="90"></div>
                    <div class="data-cell"><input type="number" value="125"></div>
                    <div class="data-cell"><input type="number" value="140"></div>
                    <div class="data-cell"><input type="number" value="130"></div>
                </div>
                <div class="data-row">
                    <div class="data-cell first-cell"><input type="text" value="제품 C"></div>
                    <div class="data-cell"><input type="number" value="50"></div>
                    <div class="data-cell"><input type="number" value="60"></div>
                    <div class="data-cell"><input type="number" value="70"></div>
                    <div class="data-cell"><input type="number" value="90"></div>
                </div>
            </div>
            <div class="data-controls">
                <button id="addRowBtn">행 추가</button>
                <button id="addColBtn">열 추가</button>
                <button id="deleteRowBtn">행 삭제</button>
                <button id="deleteColBtn">열 삭제</button>
            </div>
        `;
        
        dataExample = '테이블 형태로 데이터를 입력하세요. 첫번째 열은 데이터 시리즈 이름, 첫번째 행은 카테고리입니다.';
    }
    
    // Create dialog content
    dialog.innerHTML = `
        <div class="modal-content chart-modal">
            <div class="modal-header">
                <h3>${getChartTypeName(chartType)} 데이터 입력</h3>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                <div class="data-info">
                    ${dataExample}
                </div>
                <div class="chart-options">
                    <div class="option-group">
                        <label for="chartTitle">차트 제목</label>
                        <input type="text" id="chartTitle" value="${getChartTypeName(chartType)}">
                    </div>
                    <div class="option-group">
                        <label for="chartWidth">차트 너비 (px)</label>
                        <input type="number" id="chartWidth" value="400" min="200" max="800">
                    </div>
                    <div class="option-group">
                        <label for="chartHeight">차트 높이 (px)</label>
                        <input type="number" id="chartHeight" value="300" min="200" max="600">
                    </div>
                </div>
                <div class="data-editor">
                    ${dataStructure}
                </div>
                <div class="preview-container">
                    <h4>미리보기</h4>
                    <div class="chart-preview">
                        <canvas id="chartPreview"></canvas>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button id="cancelChartBtn" class="btn-secondary">취소</button>
                <button id="addChartToSlideBtn" class="btn-primary">슬라이드에 추가</button>
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
    const cancelBtn = document.getElementById('cancelChartBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            dialog.style.display = 'none';
            setTimeout(() => {
                document.body.removeChild(dialog);
            }, 300);
        });
    }
    
    // Add chart button
    const addChartBtn = document.getElementById('addChartToSlideBtn');
    if (addChartBtn) {
        addChartBtn.addEventListener('click', () => {
            // Get chart data
            const chartData = getChartDataFromEditor(chartType);
            
            // Get chart options
            const chartTitle = document.getElementById('chartTitle').value;
            const chartWidth = parseInt(document.getElementById('chartWidth').value);
            const chartHeight = parseInt(document.getElementById('chartHeight').value);
            
            // Add chart to slide
            addChartToSlide(chartType, chartData, {
                title: chartTitle,
                width: chartWidth,
                height: chartHeight
            });
            
            // Close dialog
            dialog.style.display = 'none';
            setTimeout(() => {
                document.body.removeChild(dialog);
            }, 300);
        });
    }
    
    // Add row and column buttons for table data
    const addRowBtn = document.getElementById('addRowBtn');
    const addColBtn = document.getElementById('addColBtn');
    const deleteRowBtn = document.getElementById('deleteRowBtn');
    const deleteColBtn = document.getElementById('deleteColBtn');
    
    if (addRowBtn && chartType !== CHART_TYPES.PIE && chartType !== CHART_TYPES.DOUGHNUT) {
        addRowBtn.addEventListener('click', () => {
            addDataRow();
            updateChartPreview(chartType);
        });
    }
    
    if (addColBtn && chartType !== CHART_TYPES.PIE && chartType !== CHART_TYPES.DOUGHNUT) {
        addColBtn.addEventListener('click', () => {
            addDataColumn();
            updateChartPreview(chartType);
        });
    }
    
    if (deleteRowBtn && chartType !== CHART_TYPES.PIE && chartType !== CHART_TYPES.DOUGHNUT) {
        deleteRowBtn.addEventListener('click', () => {
            deleteDataRow();
            updateChartPreview(chartType);
        });
    }
    
    if (deleteColBtn && chartType !== CHART_TYPES.PIE && chartType !== CHART_TYPES.DOUGHNUT) {
        deleteColBtn.addEventListener('click', () => {
            deleteDataColumn();
            updateChartPreview(chartType);
        });
    }
    
    // Update preview on data change
    const dataInputs = dialog.querySelectorAll('.data-cell input');
    dataInputs.forEach(input => {
        input.addEventListener('input', () => {
            updateChartPreview(chartType);
        });
    });
    
    // Initialize chart preview
    setTimeout(() => {
        updateChartPreview(chartType);
    }, 100);
}

// Get chart type display name
function getChartTypeName(chartType) {
    const names = {
        [CHART_TYPES.BAR]: '막대 차트',
        [CHART_TYPES.LINE]: '선 차트',
        [CHART_TYPES.PIE]: '원형 차트',
        [CHART_TYPES.DOUGHNUT]: '도넛 차트',
        [CHART_TYPES.AREA]: '영역 차트',
        [CHART_TYPES.SCATTER]: '산점도',
        [CHART_TYPES.RADAR]: '레이더 차트'
    };
    
    return names[chartType] || '차트';
}

// Update chart preview
function updateChartPreview(chartType) {
    const canvas = document.getElementById('chartPreview');
    if (!canvas) return;
    
    // Get chart data
    const chartData = getChartDataFromEditor(chartType);
    
    // Get chart options
    const chartTitle = document.getElementById('chartTitle').value;
    
    // Create chart config
    const config = createChartConfig(chartType, chartData, { title: chartTitle });
    
    // Check if chart already exists
    if (activeCharts.has('preview')) {
        // Update existing chart
        const chart = activeCharts.get('preview');
        chart.data = config.data;
        chart.options = config.options;
        chart.update();
    } else {
        // Create new chart
        const chart = new Chart(canvas, config);
        activeCharts.set('preview', chart);
    }
}

// Get chart data from editor
function getChartDataFromEditor(chartType) {
    if (chartType === CHART_TYPES.PIE || chartType === CHART_TYPES.DOUGHNUT) {
        // Get data from pie/doughnut editor
        const rows = document.querySelectorAll('.chart-data-editor .data-row:not(.header-row)');
        const labels = [];
        const data = [];
        const colors = [];
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('.data-cell');
            if (cells.length >= 3) {
                const label = cells[0].querySelector('input').value;
                const value = parseFloat(cells[1].querySelector('input').value);
                const color = cells[2].querySelector('input').value;
                
                labels.push(label);
                data.push(value);
                colors.push(color);
            }
        });
        
        return {
            labels,
            datasets: [{
                data,
                backgroundColor: colors
            }]
        };
    } else {
        // Get data from table editor
        const rows = document.querySelectorAll('.data-grid-container .data-row');
        if (rows.length < 2) return null;
        
        // Get labels from header row
        const headerRow = rows[0];
        const headerCells = headerRow.querySelectorAll('.data-cell:not(.first-cell)');
        const labels = Array.from(headerCells).map(cell => {
            const input = cell.querySelector('input');
            return input ? input.value : '';
        });
        
        // Get datasets from data rows
        const datasets = [];
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const firstCell = row.querySelector('.first-cell');
            const dataCells = row.querySelectorAll('.data-cell:not(.first-cell)');
            
            if (firstCell && dataCells.length > 0) {
                const label = firstCell.querySelector('input').value;
                const data = Array.from(dataCells).map(cell => {
                    const input = cell.querySelector('input');
                    return input ? parseFloat(input.value) : 0;
                });
                
                datasets.push({
                    label,
                    data,
                    backgroundColor: DEFAULT_COLORS[i - 1],
                    borderColor: DEFAULT_COLORS[i - 1],
                    fill: chartType === CHART_TYPES.AREA
                });
            }
        }
        
        return {
            labels,
            datasets
        };
    }
}

// Create chart configuration
function createChartConfig(chartType, data, options = {}) {
    const config = {
        type: chartType === CHART_TYPES.AREA ? CHART_TYPES.LINE : chartType,
        data: data,
        options: {...DEFAULT_CONFIG}
    };
    
    // Add title if provided
    if (options.title) {
        config.options.plugins.title.text = options.title;
    }
    
    // Apply chart-specific options
    switch (chartType) {
        case CHART_TYPES.BAR:
            config.options.scales = {
                y: {
                    beginAtZero: true
                }
            };
            break;
        case CHART_TYPES.LINE:
        case CHART_TYPES.AREA:
            config.options.elements = {
                line: {
                    tension: 0.4
                }
            };
            break;
        case CHART_TYPES.SCATTER:
            config.options.scales = {
                x: {
                    type: 'linear',
                    position: 'bottom'
                }
            };
            break;
    }
    
    return config;
}

// Add chart to slide
export function addChartToSlide(chartType, data, options = {}) {
    const slideCanvas = document.getElementById('currentSlide');
    if (!slideCanvas) return;
    
    // Generate a unique ID for the chart
    const chartId = `chart-${Date.now()}`;
    
    // Create chart container
    const container = document.createElement('div');
    container.className = 'slide-element chart';
    container.setAttribute('data-type', 'chart');
    container.setAttribute('data-chart-type', chartType);
    container.id = chartId;
    
    // Set position and dimensions
    container.style.position = 'absolute';
    container.style.left = '50%';
    container.style.top = '50%';
    container.style.transform = 'translate(-50%, -50%)';
    container.style.width = options.width ? `${options.width}px` : '400px';
    container.style.height = options.height ? `${options.height}px` : '300px';
    container.style.backgroundColor = '#ffffff';
    container.style.border = '1px solid #ddd';
    
    // Create canvas for chart
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    // Add to slide
    slideCanvas.appendChild(container);
    
    // Create chart config
    const config = createChartConfig(chartType, data, {
        title: options.title || getChartTypeName(chartType)
    });
    
    // Wait for canvas to be added to DOM
    setTimeout(() => {
        // Create chart
        const chart = new Chart(canvas, config);
        activeCharts.set(chartId, chart);
        
        // Save chart data to container for later restoration
        container.setAttribute('data-chart-data', JSON.stringify(data));
        container.setAttribute('data-chart-options', JSON.stringify({
            title: options.title || getChartTypeName(chartType),
            width: options.width || 400,
            height: options.height || 300
        }));
        
        // Make element selectable and provide custom actions
        setupChartElement(container, chartId);
    }, 100);
    
    return container;
}

// Set up chart element for editing
function setupChartElement(element, chartId) {
    // Make element selectable and draggable
    element.addEventListener('click', (e) => {
        selectElement(element);
        e.stopPropagation();
    });
    
    // Add double-click handler to edit chart
    element.addEventListener('dblclick', (e) => {
        editChart(chartId);
        e.stopPropagation();
    });
}

// Edit existing chart
function editChart(chartId) {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) return;
    
    // Get chart data
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}');
    const chartOptions = JSON.parse(chartElement.getAttribute('data-chart-options') || '{}');
    const chartType = chartElement.getAttribute('data-chart-type');
    
    // TODO: Open chart editor with existing data
    
    // For now, just log the action
    console.log('Edit chart:', chartId, chartType, chartData, chartOptions);
}

// Helper function to add a data row to the editor
function addDataRow() {
    const container = document.querySelector('.data-grid-container');
    if (!container) return;
    
    const rows = container.querySelectorAll('.data-row');
    if (rows.length === 0) return;
    
    // Get number of columns from first row
    const firstRow = rows[0];
    const numCols = firstRow.querySelectorAll('.data-cell').length;
    
    // Create new row
    const newRow = document.createElement('div');
    newRow.className = 'data-row';
    
    // Add cells
    for (let i = 0; i < numCols; i++) {
        const cell = document.createElement('div');
        cell.className = 'data-cell';
        if (i === 0) cell.classList.add('first-cell');
        
        const input = document.createElement('input');
        input.type = i === 0 ? 'text' : 'number';
        input.value = i === 0 ? `시리즈 ${rows.length}` : '0';
        
        cell.appendChild(input);
        newRow.appendChild(cell);
        
        // Add change handler
        input.addEventListener('input', () => {
            const chartType = document.querySelector('.chart-data-editor').getAttribute('data-chart-type');
            updateChartPreview(chartType);
        });
    }
    
    // Add to container
    container.appendChild(newRow);
}

// Helper function to add a data column to the editor
function addDataColumn() {
    const rows = document.querySelectorAll('.data-grid-container .data-row');
    if (rows.length === 0) return;
    
    // Get number of columns from first row
    const firstRow = rows[0];
    const numCols = firstRow.querySelectorAll('.data-cell').length;
    
    // Add cell to each row
    rows.forEach((row, rowIndex) => {
        const cell = document.createElement('div');
        cell.className = 'data-cell';
        
        const input = document.createElement('input');
        input.type = rowIndex === 0 ? 'text' : 'number';
        input.value = rowIndex === 0 ? `항목 ${numCols}` : '0';
        
        cell.appendChild(input);
        row.appendChild(cell);
        
        // Add change handler
        input.addEventListener('input', () => {
            const chartType = document.querySelector('.chart-data-editor').getAttribute('data-chart-type');
            updateChartPreview(chartType);
        });
    });
}

// Helper function to delete a data row from the editor
function deleteDataRow() {
    const container = document.querySelector('.data-grid-container');
    if (!container) return;
    
    const rows = container.querySelectorAll('.data-row');
    if (rows.length <= 2) return; // Keep at least one data row (plus header)
    
    // Remove last row
    container.removeChild(rows[rows.length - 1]);
}

// Helper function to delete a data column from the editor
function deleteDataColumn() {
    const rows = document.querySelectorAll('.data-grid-container .data-row');
    if (rows.length === 0) return;
    
    // Get number of columns from first row
    const firstRow = rows[0];
    const cells = firstRow.querySelectorAll('.data-cell');
    
    if (cells.length <= 2) return; // Keep at least one data column (plus labels)
    
    // Remove last cell from each row
    rows.forEach(row => {
        const cells = row.querySelectorAll('.data-cell');
        row.removeChild(cells[cells.length - 1]);
    });
}

// Function to call when resizing the chart element
export function resizeChart(chartId, width, height) {
    if (!activeCharts.has(chartId)) return;
    
    const chart = activeCharts.get(chartId);
    chart.resize(width, height);
}

// Setup chart options panel
function setupChartOptionsPanel() {
    const panel = document.getElementById('chart-options-panel');
    if (!panel) return;
    
    // Add event listeners for chart options
    const chartTitle = panel.querySelector('#chart-title');
    if (chartTitle) {
        chartTitle.addEventListener('input', updateSelectedChart);
    }
    
    const chartLegend = panel.querySelector('#chart-legend');
    if (chartLegend) {
        chartLegend.addEventListener('change', updateSelectedChart);
    }
    
    const chartStyle = panel.querySelector('#chart-style');
    if (chartStyle) {
        chartStyle.addEventListener('change', updateSelectedChart);
    }
}

// Update selected chart based on options panel
function updateSelectedChart() {
    // This would update the selected chart based on the options in the panel
    // For now, just log the action
    console.log('Update selected chart with options panel');
}

// Export a chart as an image
export function exportChartAsImage(chartId) {
    if (!activeCharts.has(chartId)) return null;
    
    const chart = activeCharts.get(chartId);
    return chart.toBase64Image();
}

// Function to select the proper element from the DOM
// This function should be imported from elements.js or provided here if not available
function selectElement(element) {
    if (!element) return;

    // Dispatch select event to be handled by the main application
    const event = new CustomEvent('element-selected', {
        detail: {
            elementId: element.id,
            elementType: element.getAttribute('data-type')
        }
    });
    
    document.dispatchEvent(event);
} 