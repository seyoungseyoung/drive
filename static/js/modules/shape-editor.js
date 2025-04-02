/**
 * 도형 에디터 모듈
 * 다양한 도형 생성 및 편집 기능
 */

// 사용 가능한 도형 목록
const AVAILABLE_SHAPES = {
    // 기본 도형
    basic: [
        { id: 'rectangle', name: '직사각형', icon: 'rectangle' },
        { id: 'rounded-rectangle', name: '둥근 직사각형', icon: 'rounded-rectangle' },
        { id: 'circle', name: '원', icon: 'circle' },
        { id: 'triangle', name: '삼각형', icon: 'triangle' },
        { id: 'pentagon', name: '오각형', icon: 'pentagon' },
        { id: 'hexagon', name: '육각형', icon: 'hexagon' },
        { id: 'octagon', name: '팔각형', icon: 'octagon' },
        { id: 'star', name: '별', icon: 'star' },
        { id: 'diamond', name: '다이아몬드', icon: 'diamond' },
        { id: 'trapezoid', name: '사다리꼴', icon: 'trapezoid' },
        { id: 'oval', name: '타원', icon: 'oval' },
    ],
    
    // 화살표 및 선
    arrows: [
        { id: 'arrow', name: '화살표', icon: 'arrow' },
        { id: 'arrow-left', name: '왼쪽 화살표', icon: 'arrow-left' },
        { id: 'double-arrow', name: '양방향 화살표', icon: 'double-arrow' },
        { id: 'curved-arrow', name: '곡선 화살표', icon: 'curved-arrow' },
        { id: 'circular-arrow', name: '원형 화살표', icon: 'circular-arrow' },
        { id: 'line', name: '선', icon: 'line' },
        { id: 'dashed-line', name: '점선', icon: 'dashed-line' },
        { id: 'curved-line', name: '곡선', icon: 'curved-line' },
        { id: 'connector', name: '연결선', icon: 'connector' },
    ],
    
    // 플로우차트
    flowchart: [
        { id: 'process', name: '프로세스', icon: 'process' },
        { id: 'decision', name: '결정', icon: 'decision' },
        { id: 'document', name: '문서', icon: 'document' },
        { id: 'predefined-process', name: '사전 정의된 프로세스', icon: 'predefined-process' },
        { id: 'data', name: '데이터', icon: 'data' },
        { id: 'database', name: '데이터베이스', icon: 'database' },
        { id: 'card', name: '카드', icon: 'card' },
    ],
    
    // 콜아웃
    callouts: [
        { id: 'rectangular-callout', name: '직사각형 설명선', icon: 'rectangular-callout' },
        { id: 'oval-callout', name: '타원형 설명선', icon: 'oval-callout' },
        { id: 'cloud-callout', name: '구름 설명선', icon: 'cloud-callout' },
        { id: 'thought-bubble', name: '생각 풍선', icon: 'thought-bubble' },
    ],
    
    // 특수 도형
    special: [
        { id: 'brace', name: '중괄호', icon: 'brace' },
        { id: 'bracket', name: '대괄호', icon: 'bracket' },
        { id: 'heart', name: '하트', icon: 'heart' },
        { id: 'lightning', name: '번개', icon: 'lightning' },
        { id: 'sun', name: '태양', icon: 'sun' },
        { id: 'moon', name: '달', icon: 'moon' },
        { id: 'cloud', name: '구름', icon: 'cloud' },
        { id: 'wave', name: '파도', icon: 'wave' },
        { id: 'cross', name: '십자가', icon: 'cross' },
        { id: 'puzzle', name: '퍼즐 조각', icon: 'puzzle' },
    ]
};

// 도형 사용자 정의 설정
const DEFAULT_SHAPE_PROPS = {
    width: 100,
    height: 100,
    fillColor: '#3498db',
    strokeColor: '#2980b9',
    strokeWidth: 2,
    opacity: 1,
    rotation: 0,
    skewX: 0,
    skewY: 0,
    shadow: 'none'
};

// 도형 에디터 모듈 초기화
export function initShapeEditor() {
    console.log('도형 에디터 모듈 초기화');
    
    // 도형 선택 모달 요소
    const shapeModal = document.getElementById('shapeModal');
    const shapeGrid = shapeModal ? shapeModal.querySelector('.shape-grid') : null;
    
    // 도형 추가 버튼들 (여러 위치에 있을 수 있음)
    const addShapeBtns = document.querySelectorAll('#addShapeBtn, #addShapeBtn2');
    
    // 이벤트 리스너 등록
    addShapeBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', openShapeModal);
        }
    });
    
    // 도형 모달 초기화
    if (shapeModal) {
        const closeBtn = shapeModal.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeShapeModal);
        }
        
        // 모달 외부 클릭 시 닫기
        window.addEventListener('click', (event) => {
            if (event.target === shapeModal) {
                closeShapeModal();
            }
        });
        
        // 도형 목록 생성
        buildShapeGallery();
    }
    
    // 변형 툴 이벤트 리스너 등록
    document.addEventListener('slides-updated', setupTransformHandlers);
    
    console.log('도형 에디터 초기화 완료');
    return true;
}

// 도형 갤러리 구성
function buildShapeGallery() {
    const shapeModal = document.getElementById('shapeModal');
    const modalBody = shapeModal ? shapeModal.querySelector('.modal-body') : null;
    
    if (!modalBody) return;
    
    // 기존 내용 초기화
    modalBody.innerHTML = '';
    
    // 각 카테고리별 도형 추가
    for (const [category, shapes] of Object.entries(AVAILABLE_SHAPES)) {
        let categoryTitle;
        switch (category) {
            case 'basic': categoryTitle = '기본 도형'; break;
            case 'arrows': categoryTitle = '화살표 및 선'; break;
            case 'flowchart': categoryTitle = '플로우차트'; break;
            case 'callouts': categoryTitle = '설명선'; break;
            case 'special': categoryTitle = '특수 도형'; break;
            default: categoryTitle = category;
        }
        
        // 카테고리 제목 추가
        const categoryElement = document.createElement('div');
        categoryElement.className = 'shape-category';
        categoryElement.textContent = categoryTitle;
        modalBody.appendChild(categoryElement);
        
        // 도형 그리드 추가
        const gridElement = document.createElement('div');
        gridElement.className = 'shape-grid';
        
        // 도형 아이템 추가
        shapes.forEach(shape => {
            const shapeItem = document.createElement('div');
            shapeItem.className = 'shape-item';
            shapeItem.setAttribute('data-shape', shape.id);
            
            shapeItem.innerHTML = `
                <div class="shape-preview ${shape.icon}"></div>
                <span>${shape.name}</span>
            `;
            
            // 클릭 이벤트
            shapeItem.addEventListener('click', () => {
                addShapeToSlide(shape.id);
                closeShapeModal();
            });
            
            gridElement.appendChild(shapeItem);
        });
        
        modalBody.appendChild(gridElement);
    }
}

// 도형 모달 열기
function openShapeModal() {
    const shapeModal = document.getElementById('shapeModal');
    if (shapeModal) {
        shapeModal.style.display = 'block';
        setTimeout(() => {
            shapeModal.classList.add('show');
        }, 10);
    }
}

// 도형 모달 닫기
function closeShapeModal() {
    const shapeModal = document.getElementById('shapeModal');
    if (shapeModal) {
        shapeModal.classList.remove('show');
        setTimeout(() => {
            shapeModal.style.display = 'none';
        }, 300);
    }
}

// 슬라이드에 도형 추가
function addShapeToSlide(shapeType) {
    import('../index.js').then(module => {
        // 새 도형 요소 생성
        const shapeElement = {
            id: Date.now(),
            type: 'shape',
            shapeType: shapeType,
            x: 400 - DEFAULT_SHAPE_PROPS.width / 2,
            y: 270 - DEFAULT_SHAPE_PROPS.height / 2,
            width: DEFAULT_SHAPE_PROPS.width,
            height: DEFAULT_SHAPE_PROPS.height,
            fillColor: DEFAULT_SHAPE_PROPS.fillColor,
            strokeColor: DEFAULT_SHAPE_PROPS.strokeColor,
            strokeWidth: DEFAULT_SHAPE_PROPS.strokeWidth,
            opacity: DEFAULT_SHAPE_PROPS.opacity,
            rotation: DEFAULT_SHAPE_PROPS.rotation,
            skewX: DEFAULT_SHAPE_PROPS.skewX,
            skewY: DEFAULT_SHAPE_PROPS.skewY,
            shadow: DEFAULT_SHAPE_PROPS.shadow
        };
        
        // 특정 도형 유형에 따른 크기 조정
        if (['line', 'dashed-line', 'curved-line', 'arrow', 'double-arrow'].includes(shapeType)) {
            shapeElement.width = 150;
            shapeElement.height = 3;
        } else if (['circle', 'oval'].includes(shapeType)) {
            shapeElement.width = 120;
            shapeElement.height = 120;
        } else if (['decision'].includes(shapeType)) {
            shapeElement.width = 120;
            shapeElement.height = 120;
        }
        
        // 요소 추가
        module.addElement(shapeElement);
    }).catch(error => {
        console.error('도형 추가 오류:', error);
    });
}

// 도형 렌더링 (SVG 경로 기반)
export function renderShape(element, container) {
    const { width, height, fillColor, strokeColor, strokeWidth, opacity, rotation, skewX, skewY, shadow } = element;
    
    // SVG 요소 생성
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    
    // 그림자 효과가 있는 경우
    if (shadow !== 'none') {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', `shadow-${element.id}`);
        
        const shadowIntensity = {
            'light': { dx: 2, dy: 2, blur: 3, opacity: 0.3 },
            'medium': { dx: 4, dy: 4, blur: 5, opacity: 0.4 },
            'strong': { dx: 6, dy: 6, blur: 8, opacity: 0.5 }
        }[shadow] || { dx: 2, dy: 2, blur: 3, opacity: 0.3 };
        
        const feDropShadow = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow');
        feDropShadow.setAttribute('dx', shadowIntensity.dx);
        feDropShadow.setAttribute('dy', shadowIntensity.dy);
        feDropShadow.setAttribute('stdDeviation', shadowIntensity.blur);
        feDropShadow.setAttribute('flood-opacity', shadowIntensity.opacity);
        
        filter.appendChild(feDropShadow);
        defs.appendChild(filter);
        svg.appendChild(defs);
    }
    
    // 도형 경로 생성
    const shapePath = createShapePath(element.shapeType, width, height);
    
    // SVG 경로 요소 생성
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', shapePath);
    path.setAttribute('fill', fillColor);
    path.setAttribute('stroke', strokeColor);
    path.setAttribute('stroke-width', strokeWidth);
    path.setAttribute('opacity', opacity);
    
    // 변형 적용 (회전, 기울이기)
    let transform = '';
    
    // 기울이기 변형이 있을 경우
    if (skewX !== 0 || skewY !== 0) {
        transform += `skew(${skewX}deg, ${skewY}deg) `;
    }
    
    // 회전 변형이 있을 경우
    if (rotation !== 0) {
        const centerX = width / 2;
        const centerY = height / 2;
        transform += `rotate(${rotation} ${centerX} ${centerY}) `;
    }
    
    if (transform !== '') {
        path.setAttribute('transform', transform);
    }
    
    // 그림자 적용
    if (shadow !== 'none') {
        path.setAttribute('filter', `url(#shadow-${element.id})`);
    }
    
    svg.appendChild(path);
    container.appendChild(svg);
}

// 도형 경로 생성 함수
function createShapePath(shapeType, width, height) {
    const w = width;
    const h = height;
    
    switch (shapeType) {
        case 'rectangle':
            return `M0,0 H${w} V${h} H0 Z`;
            
        case 'rounded-rectangle': {
            const r = Math.min(w, h) * 0.1; // 모서리 반경
            return `M${r},0 H${w-r} Q${w},0 ${w},${r} V${h-r} Q${w},${h} ${w-r},${h} H${r} Q0,${h} 0,${h-r} V${r} Q0,0 ${r},0 Z`;
        }
            
        case 'circle':
            return `M${w/2},0 A${w/2},${h/2} 0 0 1 ${w/2},${h} A${w/2},${h/2} 0 0 1 ${w/2},0 Z`;
            
        case 'triangle':
            return `M${w/2},0 L${w},${h} L0,${h} Z`;
            
        case 'pentagon': {
            const points = [];
            for (let i = 0; i < 5; i++) {
                const angle = (i * 2 * Math.PI / 5) - (Math.PI / 2);
                const x = w/2 + (w/2) * Math.cos(angle);
                const y = h/2 + (h/2) * Math.sin(angle);
                points.push(`${x},${y}`);
            }
            return `M${points[0]} L${points[1]} L${points[2]} L${points[3]} L${points[4]} Z`;
        }
            
        case 'hexagon': {
            const points = [];
            for (let i = 0; i < 6; i++) {
                const angle = (i * 2 * Math.PI / 6) - (Math.PI / 2);
                const x = w/2 + (w/2) * Math.cos(angle);
                const y = h/2 + (h/2) * Math.sin(angle);
                points.push(`${x},${y}`);
            }
            return `M${points[0]} L${points[1]} L${points[2]} L${points[3]} L${points[4]} L${points[5]} Z`;
        }
            
        case 'octagon': {
            const points = [];
            for (let i = 0; i < 8; i++) {
                const angle = (i * 2 * Math.PI / 8) - (Math.PI / 2);
                const x = w/2 + (w/2) * Math.cos(angle);
                const y = h/2 + (h/2) * Math.sin(angle);
                points.push(`${x},${y}`);
            }
            return `M${points[0]} L${points[1]} L${points[2]} L${points[3]} L${points[4]} L${points[5]} L${points[6]} L${points[7]} Z`;
        }
            
        case 'star': {
            const outerRadius = Math.min(w, h) / 2;
            const innerRadius = outerRadius * 0.4;
            const points = [];
            
            for (let i = 0; i < 10; i++) {
                const angle = (i * Math.PI / 5) - (Math.PI / 2);
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const x = w/2 + radius * Math.cos(angle);
                const y = h/2 + radius * Math.sin(angle);
                points.push(`${x},${y}`);
            }
            
            return `M${points.join(' L')} Z`;
        }
            
        case 'diamond':
            return `M${w/2},0 L${w},${h/2} L${w/2},${h} L0,${h/2} Z`;
            
        case 'trapezoid':
            return `M${w*0.2},${h} L${w*0.8},${h} L${w},0 L0,0 Z`;
            
        case 'oval':
            return `M${w/2},0 A${w/2},${h/2} 0 0 1 ${w/2},${h} A${w/2},${h/2} 0 0 1 ${w/2},0 Z`;
            
        case 'arrow':
            return `M0,${h/2} L${w-h*2},${h/2} L${w-h*2},0 L${w},${h*1.5} L${w-h*2},${h*3} L${w-h*2},${h*2} L0,${h*2} Z`;
            
        case 'arrow-left':
            return `M${w},${h/2} L${h*2},${h/2} L${h*2},0 L0,${h*1.5} L${h*2},${h*3} L${h*2},${h*2} L${w},${h*2} Z`;
            
        case 'double-arrow':
            return `M0,${h*1.5} L${h*2},0 L${h*2},${h} L${w-h*2},${h} L${w-h*2},0 L${w},${h*1.5} L${w-h*2},${h*3} L${w-h*2},${h*2} L${h*2},${h*2} L${h*2},${h*3} Z`;
            
        case 'curved-arrow':
            return `M${w*0.1},${h*0.5} C${w*0.3},${h*0.1} ${w*0.7},${h*0.1} ${w*0.9},${h*0.5} L${w*0.7},${h*0.3} M${w*0.9},${h*0.5} L${w*0.7},${h*0.7}`;
            
        case 'circular-arrow':
            return `M${w*0.5},${h*0.1} A${w*0.4},${h*0.4} 0 1 1 ${w*0.1},${h*0.5} L${w*0.2},${h*0.3} M${w*0.1},${h*0.5} L${w*0.2},${h*0.7}`;
            
        case 'line':
            return `M0,${h/2} L${w},${h/2}`;
            
        case 'dashed-line':
            return `M0,${h/2} L${w},${h/2}`; // SVG stroke-dasharray로 점선 처리
            
        case 'curved-line':
            return `M0,${h} C${w/3},0 ${w*2/3},${h} ${w},0`;
            
        case 'connector':
            return `M0,${h/2} L${w/3},${h/2} L${w/3},${h/6} L${w*2/3},${h/6} L${w*2/3},${h/2} L${w},${h/2}`;
            
        case 'process':
            return `M0,0 H${w} V${h} H0 Z`;
            
        case 'decision':
            return `M${w/2},0 L${w},${h/2} L${w/2},${h} L0,${h/2} Z`;
            
        case 'document':
            return `M0,0 H${w} V${h*0.8} C${w*0.75},${h*1.1} ${w*0.25},${h*0.7} 0,${h*0.8} Z`;
            
        case 'predefined-process':
            return `M0,0 H${w} V${h} H0 Z M${w*0.1},0 V${h} M${w*0.9},0 V${h}`;
            
        case 'data':
            return `M${w*0.1},0 H${w} L${w*0.9},${h} H0 Z`;
            
        case 'database':
            return `M0,${h*0.2} A${w/2},${h*0.2} 0 0 1 ${w},${h*0.2} V${h*0.8} A${w/2},${h*0.2} 0 0 1 0,${h*0.8} Z
                   M0,${h*0.2} A${w/2},${h*0.2} 0 0 0 ${w},${h*0.2}`;
            
        case 'card':
            return `M${w*0.1},0 H${w} V${h} H0 V${h*0.1} Z`;
            
        case 'rectangular-callout':
            return `M${w*0.1},${h*0.1} H${w*0.9} V${h*0.7} H${w*0.6} L${w*0.5},${h} L${w*0.4},${h*0.7} H${w*0.1} Z`;
            
        case 'oval-callout':
            return `M${w/2},${h*0.1} A${w*0.4},${h*0.3} 0 0 1 ${w/2},${h*0.7} A${w*0.4},${h*0.3} 0 0 1 ${w/2},${h*0.1} Z
                   M${w*0.45},${h*0.7} L${w*0.4},${h} L${w*0.35},${h*0.7}`;
            
        case 'cloud-callout': {
            const p = `M${w*0.3},${h*0.3} A${w*0.15},${h*0.15} 0 0 1 ${w*0.5},${h*0.2} A${w*0.15},${h*0.15} 0 0 1 ${w*0.7},${h*0.3}
                      A${w*0.15},${h*0.15} 0 0 1 ${w*0.75},${h*0.5} A${w*0.15},${h*0.15} 0 0 1 ${w*0.6},${h*0.65}
                      A${w*0.15},${h*0.15} 0 0 1 ${w*0.4},${h*0.65} A${w*0.15},${h*0.15} 0 0 1 ${w*0.25},${h*0.5}
                      A${w*0.15},${h*0.15} 0 0 1 ${w*0.3},${h*0.3} Z`;
            return `${p} M${w*0.45},${h*0.65} L${w*0.4},${h} L${w*0.35},${h*0.65}`;
        }
            
        case 'thought-bubble': {
            const mainBubble = `M${w*0.5},${h*0.2} A${w*0.3},${h*0.2} 0 0 1 ${w*0.5},${h*0.6} A${w*0.3},${h*0.2} 0 0 1 ${w*0.5},${h*0.2} Z`;
            const smallBubble1 = `M${w*0.3},${h*0.7} A${w*0.05},${h*0.05} 0 0 1 ${w*0.3},${h*0.8} A${w*0.05},${h*0.05} 0 0 1 ${w*0.3},${h*0.7} Z`;
            const smallBubble2 = `M${w*0.2},${h*0.85} A${w*0.03},${h*0.03} 0 0 1 ${w*0.2},${h*0.91} A${w*0.03},${h*0.03} 0 0 1 ${w*0.2},${h*0.85} Z`;
            return `${mainBubble} ${smallBubble1} ${smallBubble2}`;
        }
            
        case 'brace':
            return `M0,0 C${w*0.3},0 ${w*0.3},${h/2} ${w/2},${h/2} C${w*0.7},${h/2} ${w*0.7},${h} ${w},${h}`;
            
        case 'bracket':
            return `M${w*0.3},0 H0 V${h} H${w*0.3}`;
            
        case 'heart':
            return `M${w/2},${h*0.2} C${w*0.8},0 ${w},${h*0.4} ${w/2},${h} C0,${h*0.4} ${w*0.2},0 ${w/2},${h*0.2} Z`;
            
        case 'lightning':
            return `M${w*0.6},0 L${w*0.2},${h*0.5} L${w*0.5},${h*0.5} L${w*0.4},${h} L${w*0.8},${h*0.5} L${w*0.5},${h*0.5} Z`;
            
        case 'sun': {
            const center = `M${w*0.5},${h*0.3} A${w*0.2},${h*0.2} 0 0 1 ${w*0.5},${h*0.7} A${w*0.2},${h*0.2} 0 0 1 ${w*0.5},${h*0.3} Z`;
            const rays = `M${w*0.5},${h*0.1} V${h*0.2} M${w*0.5},${h*0.8} V${h*0.9} 
                         M${w*0.3},${h*0.2} L${w*0.2},${h*0.1} M${w*0.7},${h*0.2} L${w*0.8},${h*0.1}
                         M${w*0.3},${h*0.8} L${w*0.2},${h*0.9} M${w*0.7},${h*0.8} L${w*0.8},${h*0.9}
                         M${w*0.2},${h*0.5} H${w*0.1} M${w*0.8},${h*0.5} H${w*0.9}`;
            return `${center} ${rays}`;
        }
            
        case 'moon':
            return `M${w*0.5},${h*0.2} A${w*0.3},${h*0.3} 0 0 1 ${w*0.5},${h*0.8} A${w*0.4},${h*0.4} 0 0 0 ${w*0.5},${h*0.2} Z`;
            
        case 'cloud':
            return `M${w*0.3},${h*0.5} A${w*0.2},${h*0.2} 0 0 1 ${w*0.5},${h*0.3} A${w*0.2},${h*0.2} 0 0 1 ${w*0.7},${h*0.5} 
                   A${w*0.15},${h*0.15} 0 0 1 ${w*0.85},${h*0.6} A${w*0.15},${h*0.15} 0 0 1 ${w*0.7},${h*0.7}
                   A${w*0.2},${h*0.2} 0 0 1 ${w*0.5},${h*0.8} A${w*0.2},${h*0.2} 0 0 1 ${w*0.3},${h*0.7}
                   A${w*0.15},${h*0.15} 0 0 1 ${w*0.15},${h*0.6} A${w*0.15},${h*0.15} 0 0 1 ${w*0.3},${h*0.5} Z`;
            
        case 'wave':
            return `M0,${h*0.5} C${w*0.25},${h*0.25} ${w*0.25},${h*0.75} ${w*0.5},${h*0.5} 
                   C${w*0.75},${h*0.25} ${w*0.75},${h*0.75} ${w},${h*0.5}`;
            
        case 'cross':
            return `M${w*0.3},${h*0.1} H${w*0.7} V${h*0.35} H${w*0.9} V${h*0.65} H${w*0.7} V${h*0.9} H${w*0.3} V${h*0.65} H${w*0.1} V${h*0.35} H${w*0.3} Z`;
            
        case 'puzzle': {
            const top = `M${w*0.3},0 H${w*0.7} C${w*0.7},${h*0.1} ${w*0.8},${h*0.1} ${w*0.8},${h*0.2} H${w}`;
            const right = `V${h*0.7} C${w*0.9},${h*0.7} ${w*0.9},${h*0.8} ${w*0.8},${h*0.8} V${h}`;
            const bottom = `H${w*0.3} C${w*0.3},${h*0.9} ${w*0.2},${h*0.9} ${w*0.2},${h*0.8} H0`;
            const left = `V${h*0.3} C${w*0.1},${h*0.3} ${w*0.1},${h*0.2} ${w*0.2},${h*0.2} V0`;
            return `${top} ${right} ${bottom} ${left}`;
        }
            
        // 기본값은 직사각형
        default:
            return `M0,0 H${w} V${h} H0 Z`;
    }
}

// 자유 변형을 위한 핸들러 설정
function setupTransformHandlers() {
    const handleElements = document.querySelectorAll('.selection-handle');
    
    // 회전 핸들 이벤트
    const rotateHandle = document.querySelector('.handle-rotate');
    if (rotateHandle) {
        rotateHandle.addEventListener('mousedown', startRotation);
    }
    
    // 기울이기 핸들 이벤트 (새로 추가)
    const skewHandles = document.querySelectorAll('.handle-skew-x, .handle-skew-y');
    skewHandles.forEach(handle => {
        handle.addEventListener('mousedown', startSkew);
    });
}

// 회전 시작
function startRotation(event) {
    event.preventDefault();
    
    import('../index.js').then(module => {
        const selectedElement = module.AppState.selectedElement;
        if (!selectedElement) return;
        
        // 선택된 요소의 정보
        const elementId = selectedElement.elementId;
        const element = module.AppState.slides[module.AppState.currentSlideIndex].elements
            .find(el => el.id === elementId);
        
        if (!element) return;
        
        // 요소의 중심점
        const rect = document.querySelector(`.slide-element[data-id="${elementId}"]`).getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // 회전 처리 함수
        function handleRotation(e) {
            const dx = e.clientX - centerX;
            const dy = e.clientY - centerY;
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            
            // 회전각 업데이트 (90도 추가하여 오른쪽이 0도 기준이 되게 함)
            module.updateElement(elementId, { rotation: (angle + 90) % 360 });
        }
        
        // 마우스 이동 이벤트
        document.addEventListener('mousemove', handleRotation);
        
        // 마우스 업 이벤트 (회전 종료)
        document.addEventListener('mouseup', function endRotation() {
            document.removeEventListener('mousemove', handleRotation);
            document.removeEventListener('mouseup', endRotation);
        });
    }).catch(error => {
        console.error('회전 처리 오류:', error);
    });
}

// 기울이기 시작
function startSkew(event) {
    event.preventDefault();
    
    const isX = event.target.classList.contains('handle-skew-x');
    const startX = event.clientX;
    const startY = event.clientY;
    
    import('../index.js').then(module => {
        const selectedElement = module.AppState.selectedElement;
        if (!selectedElement) return;
        
        // 선택된 요소의 정보
        const elementId = selectedElement.elementId;
        const element = module.AppState.slides[module.AppState.currentSlideIndex].elements
            .find(el => el.id === elementId);
        
        if (!element) return;
        
        const originalSkewX = element.skewX || 0;
        const originalSkewY = element.skewY || 0;
        
        // 기울이기 처리 함수
        function handleSkew(e) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            // 마우스 이동에 따른 기울기 변화 (10픽셀당 1도)
            const skewDelta = (isX ? dx : dy) / 10;
            
            if (isX) {
                module.updateElement(elementId, { skewX: originalSkewX + skewDelta });
            } else {
                module.updateElement(elementId, { skewY: originalSkewY + skewDelta });
            }
        }
        
        // 마우스 이동 이벤트
        document.addEventListener('mousemove', handleSkew);
        
        // 마우스 업 이벤트 (기울이기 종료)
        document.addEventListener('mouseup', function endSkew() {
            document.removeEventListener('mousemove', handleSkew);
            document.removeEventListener('mouseup', endSkew);
        });
    }).catch(error => {
        console.error('기울이기 처리 오류:', error);
    });
}

// 도형 에디터 함수와 상수 내보내기
export { AVAILABLE_SHAPES, DEFAULT_SHAPE_PROPS }; 