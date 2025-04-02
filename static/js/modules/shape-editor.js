/**
 * Shape Editor Module
 * 향상된 도형 편집 기능 제공 (PPT와 유사한 미세 조정 제공)
 */

// 전역 상태
let selectedShape = null;
let resizeHandles = [];
let rotationHandle = null;
let fineControlsVisible = false;

// 상수 정의
const HANDLE_POSITIONS = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
const ROTATION_HANDLE_OFFSET = 30; // 회전 핸들 오프셋

// 모듈 초기화
export function initShapeEditor() {
    console.log('도형 편집 모듈 초기화');
    setupEventListeners();
    createFineControlPanel();
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 슬라이드 캔버스에서 도형 선택 이벤트 리스닝
    document.addEventListener('element-selected', (e) => {
        const elementId = e.detail.elementId;
        const elementType = e.detail.elementType;
        
        if (elementType === 'shape' || elementType === 'text' || elementType === 'image') {
            const element = document.getElementById(elementId);
            if (element) {
                selectShape(element);
            } else {
                deselectShape();
            }
        } else {
            deselectShape();
        }
    });
    
    // 키보드 단축키 설정
    document.addEventListener('keydown', handleKeyDown);
    
    // 슬라이드 캔버스 클릭 시 선택 해제
    const slideCanvas = document.getElementById('currentSlide');
    if (slideCanvas) {
        slideCanvas.addEventListener('click', (e) => {
            if (e.target === slideCanvas) {
                deselectShape();
            }
        });
    }
}

// 도형 선택 처리
export function selectShape(element) {
    // 기존 선택 해제
    deselectShape();
    
    // 새 도형 선택
    selectedShape = element;
    selectedShape.classList.add('selected');
    
    // 크기 조절 및 회전 핸들 추가
    addResizeHandles(selectedShape);
    addRotationHandle(selectedShape);
    
    // 정밀 편집 패널 표시
    showFineControlPanel(selectedShape);
    
    // 선택된 요소 정보를 속성 패널에 표시
    updatePropertiesPanel(selectedShape);
}

// 도형 선택 해제
export function deselectShape() {
    if (selectedShape) {
        selectedShape.classList.remove('selected');
        
        // 핸들 제거
        removeHandles();
        
        // 정밀 편집 패널 숨기기
        hideFineControlPanel();
        
        selectedShape = null;
    }
}

// 크기 조절 핸들 추가
function addResizeHandles(element) {
    const rect = element.getBoundingClientRect();
    
    HANDLE_POSITIONS.forEach(position => {
        const handle = document.createElement('div');
        handle.className = `resize-handle handle-${position}`;
        handle.setAttribute('data-position', position);
        
        // 핸들 위치 조정
        positionHandle(handle, position, rect);
        
        // 마우스 이벤트 리스너
        handle.addEventListener('mousedown', startResize);
        
        // 도형에 핸들 추가
        element.appendChild(handle);
        resizeHandles.push(handle);
    });
}

// 회전 핸들 추가
function addRotationHandle(element) {
    const handle = document.createElement('div');
    handle.className = 'rotation-handle';
    
    // 핸들 위치 조정 (상단 중앙 + 오프셋)
    const rect = element.getBoundingClientRect();
    handle.style.left = '50%';
    handle.style.top = `-${ROTATION_HANDLE_OFFSET}px`;
    handle.style.transform = 'translateX(-50%)';
    
    // 회전 핸들 라인 추가
    const line = document.createElement('div');
    line.className = 'rotation-line';
    handle.appendChild(line);
    
    // 마우스 이벤트 리스너
    handle.addEventListener('mousedown', startRotation);
    
    // 도형에 핸들 추가
    element.appendChild(handle);
    rotationHandle = handle;
}

// 핸들 위치 설정
function positionHandle(handle, position, rect) {
    switch (position) {
        case 'nw': // 좌상단
            handle.style.left = '-5px';
            handle.style.top = '-5px';
            handle.style.cursor = 'nwse-resize';
            break;
        case 'n': // 상단 중앙
            handle.style.left = '50%';
            handle.style.top = '-5px';
            handle.style.transform = 'translateX(-50%)';
            handle.style.cursor = 'ns-resize';
            break;
        case 'ne': // 우상단
            handle.style.right = '-5px';
            handle.style.top = '-5px';
            handle.style.cursor = 'nesw-resize';
            break;
        case 'e': // 우측 중앙
            handle.style.right = '-5px';
            handle.style.top = '50%';
            handle.style.transform = 'translateY(-50%)';
            handle.style.cursor = 'ew-resize';
            break;
        case 'se': // 우하단
            handle.style.right = '-5px';
            handle.style.bottom = '-5px';
            handle.style.cursor = 'nwse-resize';
            break;
        case 's': // 하단 중앙
            handle.style.left = '50%';
            handle.style.bottom = '-5px';
            handle.style.transform = 'translateX(-50%)';
            handle.style.cursor = 'ns-resize';
            break;
        case 'sw': // 좌하단
            handle.style.left = '-5px';
            handle.style.bottom = '-5px';
            handle.style.cursor = 'nesw-resize';
            break;
        case 'w': // 좌측 중앙
            handle.style.left = '-5px';
            handle.style.top = '50%';
            handle.style.transform = 'translateY(-50%)';
            handle.style.cursor = 'ew-resize';
            break;
    }
}

// 핸들 제거
function removeHandles() {
    // 크기 조절 핸들 제거
    resizeHandles.forEach(handle => {
        if (handle.parentNode) {
            handle.parentNode.removeChild(handle);
        }
    });
    resizeHandles = [];
    
    // 회전 핸들 제거
    if (rotationHandle && rotationHandle.parentNode) {
        rotationHandle.parentNode.removeChild(rotationHandle);
    }
    rotationHandle = null;
}

// 크기 조절 시작
function startResize(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!selectedShape) return;
    
    const position = this.getAttribute('data-position');
    const shapeRect = selectedShape.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    
    // 초기 크기와 위치
    const initialWidth = selectedShape.offsetWidth;
    const initialHeight = selectedShape.offsetHeight;
    const initialLeft = selectedShape.offsetLeft;
    const initialTop = selectedShape.offsetTop;
    
    // 크기 조절 이벤트 등록
    function resize(e) {
        let newWidth = initialWidth;
        let newHeight = initialHeight;
        let newLeft = initialLeft;
        let newTop = initialTop;
        
        // 방향에 따른 크기 및 위치 조정
        switch (position) {
            case 'nw': // 좌상단
                newWidth = initialWidth - (e.clientX - startX);
                newHeight = initialHeight - (e.clientY - startY);
                newLeft = initialLeft + (e.clientX - startX);
                newTop = initialTop + (e.clientY - startY);
                break;
            case 'n': // 상단 중앙
                newHeight = initialHeight - (e.clientY - startY);
                newTop = initialTop + (e.clientY - startY);
                break;
            case 'ne': // 우상단
                newWidth = initialWidth + (e.clientX - startX);
                newHeight = initialHeight - (e.clientY - startY);
                newTop = initialTop + (e.clientY - startY);
                break;
            case 'e': // 우측 중앙
                newWidth = initialWidth + (e.clientX - startX);
                break;
            case 'se': // 우하단
                newWidth = initialWidth + (e.clientX - startX);
                newHeight = initialHeight + (e.clientY - startY);
                break;
            case 's': // 하단 중앙
                newHeight = initialHeight + (e.clientY - startY);
                break;
            case 'sw': // 좌하단
                newWidth = initialWidth - (e.clientX - startX);
                newHeight = initialHeight + (e.clientY - startY);
                newLeft = initialLeft + (e.clientX - startX);
                break;
            case 'w': // 좌측 중앙
                newWidth = initialWidth - (e.clientX - startX);
                newLeft = initialLeft + (e.clientX - startX);
                break;
        }
        
        // 최소 크기 제한
        newWidth = Math.max(20, newWidth);
        newHeight = Math.max(20, newHeight);
        
        // 도형 크기 및 위치 업데이트
        selectedShape.style.width = `${newWidth}px`;
        selectedShape.style.height = `${newHeight}px`;
        selectedShape.style.left = `${newLeft}px`;
        selectedShape.style.top = `${newTop}px`;
        
        // 정밀 편집 패널 업데이트
        updateFineControlPanel(selectedShape);
        
        // 핸들 위치 업데이트는 크기 조절 완료 후 수행
    }
    
    // 크기 조절 종료
    function stopResize() {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
        
        // 도형 데이터 저장 (실제 구현 시 필요)
        saveElementData(selectedShape);
        
        // 핸들 위치 갱신
        removeHandles();
        addResizeHandles(selectedShape);
        addRotationHandle(selectedShape);
    }
    
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
}

// 회전 시작
function startRotation(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!selectedShape) return;
    
    const rect = selectedShape.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // 현재 회전 각도 가져오기
    let currentRotation = 0;
    const transform = selectedShape.style.transform;
    const rotateMatch = transform.match(/rotate\((-?\d+(?:\.\d+)?)deg\)/);
    if (rotateMatch) {
        currentRotation = parseFloat(rotateMatch[1]);
    }
    
    // 초기 각도 계산
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    
    // 회전 이벤트 등록
    function rotate(e) {
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        let newRotation = currentRotation + (angle - startAngle);
        
        // Shift 키를 누르면 15도 단위로 회전
        if (e.shiftKey) {
            newRotation = Math.round(newRotation / 15) * 15;
        }
        
        // 회전 각도를 0-360 범위로 정규화
        newRotation = (newRotation % 360 + 360) % 360;
        
        // 기존 transform 스타일에서 rotate 부분만 업데이트
        let newTransform = transform.replace(/rotate\(-?\d+(?:\.\d+)?deg\)/, '');
        if (newTransform.trim() === '') {
            newTransform = `rotate(${newRotation}deg)`;
        } else {
            newTransform += ` rotate(${newRotation}deg)`;
        }
        
        selectedShape.style.transform = newTransform;
        
        // 정밀 편집 패널 업데이트
        updateFineControlPanel(selectedShape);
    }
    
    // 회전 종료
    function stopRotation() {
        document.removeEventListener('mousemove', rotate);
        document.removeEventListener('mouseup', stopRotation);
        
        // 도형 데이터 저장 (실제 구현 시 필요)
        saveElementData(selectedShape);
    }
    
    document.addEventListener('mousemove', rotate);
    document.addEventListener('mouseup', stopRotation);
}

// 정밀 편집 패널 생성
function createFineControlPanel() {
    // 이미 존재하는 경우 제거
    const existingPanel = document.getElementById('fine-control-panel');
    if (existingPanel) {
        existingPanel.parentNode.removeChild(existingPanel);
    }
    
    // 패널 생성
    const panel = document.createElement('div');
    panel.id = 'fine-control-panel';
    panel.style.display = 'none';
    
    // 패널 내용
    panel.innerHTML = `
        <div class="panel-header">
            <h4>정밀 편집</h4>
            <button class="close-btn">&times;</button>
        </div>
        <div class="fine-control-group">
            <label for="shape-x">X 위치</label>
            <input type="number" id="shape-x" min="0" step="1">
        </div>
        <div class="fine-control-group">
            <label for="shape-y">Y 위치</label>
            <input type="number" id="shape-y" min="0" step="1">
        </div>
        <div class="fine-control-group">
            <label for="shape-width">너비</label>
            <input type="number" id="shape-width" min="10" step="1">
        </div>
        <div class="fine-control-group">
            <label for="shape-height">높이</label>
            <input type="number" id="shape-height" min="10" step="1">
        </div>
        <div class="fine-control-group">
            <label for="shape-rotation">회전</label>
            <input type="number" id="shape-rotation" min="0" max="359" step="1">
        </div>
        <div class="fine-control-group">
            <label for="shape-opacity">투명도</label>
            <input type="range" id="shape-opacity" min="0" max="100" step="1">
            <span id="opacity-value">100%</span>
        </div>
        <div class="fine-control-group">
            <label for="shape-background">배경색</label>
            <input type="color" id="shape-background">
        </div>
        <div class="fine-control-group">
            <label for="shape-border">테두리</label>
            <div class="border-controls">
                <input type="color" id="shape-border-color">
                <input type="number" id="shape-border-width" min="0" max="10" step="1" placeholder="두께">
                <select id="shape-border-style">
                    <option value="solid">실선</option>
                    <option value="dashed">점선</option>
                    <option value="dotted">점선 (점)</option>
                    <option value="double">이중선</option>
                    <option value="none">없음</option>
                </select>
            </div>
        </div>
        <div class="aspect-control">
            <label>
                <input type="checkbox" id="shape-lock-aspect">
                비율 고정
            </label>
        </div>
    `;
    
    // 문서에 추가
    document.body.appendChild(panel);
    
    // 닫기 버튼 이벤트 리스너
    const closeBtn = panel.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        panel.style.display = 'none';
        fineControlsVisible = false;
    });
    
    // 정밀 편집 입력 이벤트 리스너
    setupFineControlListeners();
}

// 정밀 편집 패널 입력 이벤트 리스너 설정
function setupFineControlListeners() {
    // X 위치 변경
    const shapeX = document.getElementById('shape-x');
    shapeX.addEventListener('input', () => {
        if (!selectedShape) return;
        selectedShape.style.left = `${shapeX.value}px`;
        saveElementData(selectedShape);
    });
    
    // Y 위치 변경
    const shapeY = document.getElementById('shape-y');
    shapeY.addEventListener('input', () => {
        if (!selectedShape) return;
        selectedShape.style.top = `${shapeY.value}px`;
        saveElementData(selectedShape);
    });
    
    // 너비 변경
    const shapeWidth = document.getElementById('shape-width');
    shapeWidth.addEventListener('input', () => {
        if (!selectedShape) return;
        
        // 비율 고정 확인
        const lockAspect = document.getElementById('shape-lock-aspect').checked;
        const newWidth = parseInt(shapeWidth.value);
        
        selectedShape.style.width = `${newWidth}px`;
        
        // 비율 고정이 활성화된 경우 높이도 비례하여 변경
        if (lockAspect) {
            const aspectRatio = selectedShape.getAttribute('data-aspect-ratio');
            if (aspectRatio) {
                const newHeight = Math.round(newWidth / aspectRatio);
                selectedShape.style.height = `${newHeight}px`;
                document.getElementById('shape-height').value = newHeight;
            } else {
                // 비율 정보가 없으면 현재 비율 계산 및 저장
                const ratio = newWidth / selectedShape.offsetHeight;
                selectedShape.setAttribute('data-aspect-ratio', ratio);
            }
        }
        
        saveElementData(selectedShape);
        
        // 핸들 위치 업데이트
        removeHandles();
        addResizeHandles(selectedShape);
        addRotationHandle(selectedShape);
    });
    
    // 높이 변경
    const shapeHeight = document.getElementById('shape-height');
    shapeHeight.addEventListener('input', () => {
        if (!selectedShape) return;
        
        // 비율 고정 확인
        const lockAspect = document.getElementById('shape-lock-aspect').checked;
        const newHeight = parseInt(shapeHeight.value);
        
        selectedShape.style.height = `${newHeight}px`;
        
        // 비율 고정이 활성화된 경우 너비도 비례하여 변경
        if (lockAspect) {
            const aspectRatio = selectedShape.getAttribute('data-aspect-ratio');
            if (aspectRatio) {
                const newWidth = Math.round(newHeight * aspectRatio);
                selectedShape.style.width = `${newWidth}px`;
                document.getElementById('shape-width').value = newWidth;
            } else {
                // 비율 정보가 없으면 현재 비율 계산 및 저장
                const ratio = selectedShape.offsetWidth / newHeight;
                selectedShape.setAttribute('data-aspect-ratio', ratio);
            }
        }
        
        saveElementData(selectedShape);
        
        // 핸들 위치 업데이트
        removeHandles();
        addResizeHandles(selectedShape);
        addRotationHandle(selectedShape);
    });
    
    // 회전 변경
    const shapeRotation = document.getElementById('shape-rotation');
    shapeRotation.addEventListener('input', () => {
        if (!selectedShape) return;
        
        const angle = parseInt(shapeRotation.value);
        
        // 기존 transform 스타일에서 rotate 부분만 업데이트
        let transform = selectedShape.style.transform || '';
        transform = transform.replace(/rotate\(-?\d+(?:\.\d+)?deg\)/, '').trim();
        
        if (transform === '') {
            transform = `rotate(${angle}deg)`;
        } else {
            transform += ` rotate(${angle}deg)`;
        }
        
        selectedShape.style.transform = transform;
        saveElementData(selectedShape);
    });
    
    // 투명도 변경
    const shapeOpacity = document.getElementById('shape-opacity');
    const opacityValue = document.getElementById('opacity-value');
    shapeOpacity.addEventListener('input', () => {
        if (!selectedShape) return;
        
        const opacity = shapeOpacity.value;
        selectedShape.style.opacity = opacity / 100;
        opacityValue.textContent = `${opacity}%`;
        saveElementData(selectedShape);
    });
    
    // 배경색 변경
    const shapeBackground = document.getElementById('shape-background');
    shapeBackground.addEventListener('input', () => {
        if (!selectedShape) return;
        selectedShape.style.backgroundColor = shapeBackground.value;
        saveElementData(selectedShape);
    });
    
    // 테두리 색상 변경
    const shapeBorderColor = document.getElementById('shape-border-color');
    shapeBorderColor.addEventListener('input', () => {
        if (!selectedShape) return;
        updateBorder();
    });
    
    // 테두리 두께 변경
    const shapeBorderWidth = document.getElementById('shape-border-width');
    shapeBorderWidth.addEventListener('input', () => {
        if (!selectedShape) return;
        updateBorder();
    });
    
    // 테두리 스타일 변경
    const shapeBorderStyle = document.getElementById('shape-border-style');
    shapeBorderStyle.addEventListener('change', () => {
        if (!selectedShape) return;
        updateBorder();
    });
    
    // 비율 고정 변경
    const shapeLockAspect = document.getElementById('shape-lock-aspect');
    shapeLockAspect.addEventListener('change', () => {
        if (!selectedShape) return;
        
        if (shapeLockAspect.checked) {
            // 현재 비율 계산 및 저장
            const ratio = selectedShape.offsetWidth / selectedShape.offsetHeight;
            selectedShape.setAttribute('data-aspect-ratio', ratio);
        } else {
            // 비율 정보 제거
            selectedShape.removeAttribute('data-aspect-ratio');
        }
    });
}

// 테두리 업데이트 헬퍼 함수
function updateBorder() {
    if (!selectedShape) return;
    
    const color = document.getElementById('shape-border-color').value;
    const width = document.getElementById('shape-border-width').value;
    const style = document.getElementById('shape-border-style').value;
    
    if (style === 'none') {
        selectedShape.style.border = 'none';
    } else {
        selectedShape.style.border = `${width}px ${style} ${color}`;
    }
    
    saveElementData(selectedShape);
}

// 정밀 편집 패널 표시
function showFineControlPanel(element) {
    const panel = document.getElementById('fine-control-panel');
    if (!panel) return;
    
    // 패널 위치 설정 (요소 가까이)
    const rect = element.getBoundingClientRect();
    panel.style.left = `${rect.right + 10}px`;
    panel.style.top = `${rect.top}px`;
    
    // 패널 표시
    panel.style.display = 'block';
    fineControlsVisible = true;
    
    // 패널 값 업데이트
    updateFineControlPanel(element);
}

// 정밀 편집 패널 숨기기
function hideFineControlPanel() {
    const panel = document.getElementById('fine-control-panel');
    if (panel) {
        panel.style.display = 'none';
    }
    fineControlsVisible = false;
}

// 정밀 편집 패널 값 업데이트
function updateFineControlPanel(element) {
    if (!element) return;
    
    // 크기 및 위치 값 설정
    document.getElementById('shape-x').value = Math.round(element.offsetLeft);
    document.getElementById('shape-y').value = Math.round(element.offsetTop);
    document.getElementById('shape-width').value = Math.round(element.offsetWidth);
    document.getElementById('shape-height').value = Math.round(element.offsetHeight);
    
    // 회전 값 설정
    let rotation = 0;
    const transform = element.style.transform;
    const rotateMatch = transform.match(/rotate\((-?\d+(?:\.\d+)?)deg\)/);
    if (rotateMatch) {
        rotation = parseFloat(rotateMatch[1]);
        // 0-359 범위로 정규화
        rotation = (rotation % 360 + 360) % 360;
    }
    document.getElementById('shape-rotation').value = Math.round(rotation);
    
    // 투명도 값 설정
    const opacity = element.style.opacity !== '' ? parseFloat(element.style.opacity) * 100 : 100;
    document.getElementById('shape-opacity').value = Math.round(opacity);
    document.getElementById('opacity-value').textContent = `${Math.round(opacity)}%`;
    
    // 배경색 값 설정
    const backgroundColor = element.style.backgroundColor;
    if (backgroundColor && backgroundColor !== 'transparent') {
        document.getElementById('shape-background').value = rgbToHex(backgroundColor);
    }
    
    // 테두리 값 설정
    const border = element.style.border;
    if (border && border !== 'none') {
        const borderMatch = border.match(/(\d+)px\s+(\w+)\s+([^,)]+)/);
        if (borderMatch) {
            document.getElementById('shape-border-width').value = borderMatch[1];
            document.getElementById('shape-border-style').value = borderMatch[2];
            document.getElementById('shape-border-color').value = rgbToHex(borderMatch[3]);
        }
    } else {
        document.getElementById('shape-border-width').value = 0;
        document.getElementById('shape-border-style').value = 'none';
    }
}

// 키보드 단축키 처리
function handleKeyDown(e) {
    if (!selectedShape) return;
    
    switch (e.key) {
        case 'Delete':
            // 선택된 요소 삭제
            if (selectedShape.parentNode) {
                selectedShape.parentNode.removeChild(selectedShape);
                deselectShape();
            }
            break;
        case 'ArrowUp':
            // 위로 이동
            moveShape(0, e.shiftKey ? -10 : -1);
            e.preventDefault();
            break;
        case 'ArrowDown':
            // 아래로 이동
            moveShape(0, e.shiftKey ? 10 : 1);
            e.preventDefault();
            break;
        case 'ArrowLeft':
            // 왼쪽으로 이동
            moveShape(e.shiftKey ? -10 : -1, 0);
            e.preventDefault();
            break;
        case 'ArrowRight':
            // 오른쪽으로 이동
            moveShape(e.shiftKey ? 10 : 1, 0);
            e.preventDefault();
            break;
        case 'r':
            if (e.ctrlKey) {
                // Ctrl+R: 회전 초기화
                resetRotation();
                e.preventDefault();
            }
            break;
        case '0':
            if (e.ctrlKey) {
                // Ctrl+0: 불투명도 100%
                resetOpacity();
                e.preventDefault();
            }
            break;
    }
}

// 도형 이동
function moveShape(deltaX, deltaY) {
    if (!selectedShape) return;
    
    const currentLeft = parseInt(selectedShape.style.left) || 0;
    const currentTop = parseInt(selectedShape.style.top) || 0;
    
    selectedShape.style.left = `${currentLeft + deltaX}px`;
    selectedShape.style.top = `${currentTop + deltaY}px`;
    
    // 정밀 편집 패널 업데이트
    updateFineControlPanel(selectedShape);
    
    // 도형 데이터 저장
    saveElementData(selectedShape);
}

// 회전 초기화
function resetRotation() {
    if (!selectedShape) return;
    
    // 기존 transform 스타일에서 rotate 부분 제거
    let transform = selectedShape.style.transform || '';
    transform = transform.replace(/rotate\(-?\d+(?:\.\d+)?deg\)/, '').trim();
    
    selectedShape.style.transform = transform;
    
    // 정밀 편집 패널 업데이트
    updateFineControlPanel(selectedShape);
    
    // 도형 데이터 저장
    saveElementData(selectedShape);
}

// 불투명도 초기화
function resetOpacity() {
    if (!selectedShape) return;
    
    selectedShape.style.opacity = 1;
    
    // 정밀 편집 패널 업데이트
    updateFineControlPanel(selectedShape);
    
    // 도형 데이터 저장
    saveElementData(selectedShape);
}

// 속성 패널 업데이트
function updatePropertiesPanel(element) {
    // 여기서는 메인 코드에 맞게 구현해야 함
    // 예시 코드이며, 요소 유형에 따라 다른 속성 패널 표시
    const elementType = element.getAttribute('data-type');
    console.log(`속성 패널 업데이트: ${elementType}`);
    
    // 예시: 이벤트 디스패치하여 메인 코드에 알림
    const event = new CustomEvent('update-properties-panel', {
        detail: {
            elementId: element.id,
            elementType: elementType,
            element: element
        }
    });
    document.dispatchEvent(event);
}

// 요소 데이터 저장
function saveElementData(element) {
    // 예시: 이벤트 디스패치하여 메인 코드에 알림
    const event = new CustomEvent('save-element-data', {
        detail: {
            elementId: element.id,
            elementType: element.getAttribute('data-type'),
            properties: {
                x: element.offsetLeft,
                y: element.offsetTop,
                width: element.offsetWidth,
                height: element.offsetHeight,
                backgroundColor: element.style.backgroundColor,
                border: element.style.border,
                opacity: element.style.opacity,
                transform: element.style.transform
            }
        }
    });
    document.dispatchEvent(event);
}

// RGB -> HEX 변환 유틸리티
function rgbToHex(rgb) {
    // 이미 HEX 형식이면 그대로 반환
    if (rgb.startsWith('#')) return rgb;
    
    // RGB 형식 변환
    const rgbMatch = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (rgbMatch) {
        return `#${
            ('0' + parseInt(rgbMatch[1], 10).toString(16)).slice(-2)
        }${
            ('0' + parseInt(rgbMatch[2], 10).toString(16)).slice(-2)
        }${
            ('0' + parseInt(rgbMatch[3], 10).toString(16)).slice(-2)
        }`;
    }
    
    return rgb;
}

// 테두리 스타일 가져오기
export function getBorderStyles() {
    return [
        { value: 'solid', label: '실선' },
        { value: 'dashed', label: '점선' },
        { value: 'dotted', label: '점선 (점)' },
        { value: 'double', label: '이중선' },
        { value: 'none', label: '없음' }
    ];
}

// 프리셋 색상 가져오기
export function getColorPresets() {
    return [
        { value: '#000000', label: '검정' },
        { value: '#FFFFFF', label: '흰색' },
        { value: '#FF0000', label: '빨강' },
        { value: '#00FF00', label: '녹색' },
        { value: '#0000FF', label: '파랑' },
        { value: '#FFFF00', label: '노랑' },
        { value: '#FF00FF', label: '자홍' },
        { value: '#00FFFF', label: '청록' },
        { value: '#FFA500', label: '주황' },
        { value: '#800080', label: '보라' },
        { value: '#808080', label: '회색' }
    ];
}

// 도형 유형 가져오기
export function getShapeTypes() {
    return [
        { value: 'rectangle', label: '직사각형' },
        { value: 'square', label: '정사각형' },
        { value: 'circle', label: '원' },
        { value: 'ellipse', label: '타원' },
        { value: 'triangle', label: '삼각형' },
        { value: 'right-triangle', label: '직각삼각형' },
        { value: 'pentagon', label: '오각형' },
        { value: 'hexagon', label: '육각형' },
        { value: 'octagon', label: '팔각형' },
        { value: 'star', label: '별' },
        { value: 'arrow', label: '화살표' },
        { value: 'double-arrow', label: '양방향 화살표' },
        { value: 'line', label: '선' },
        { value: 'dashed-line', label: '점선' },
        { value: 'dotted-line', label: '점선 (점)' }
    ];
} 