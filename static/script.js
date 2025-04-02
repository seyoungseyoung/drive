// 기본 변수 초기화
let slides = [];
let currentSlide = 0;
let selectedElement = null;

// 문서 로드 완료 시 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // 기본 이벤트 리스너 설정
    setupEventListeners();
    
    // 스타일 패널 탭 이벤트 설정
    setupStylePanelTabs();
    
    // 스타일 변경 이벤트 설정
    setupStyleChangeEvents();
    
    // 삭제 버튼 설정
    setupDeleteButton();
});

// 기본 이벤트 리스너 설정
function setupEventListeners() {
    // 시작하기 버튼
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            console.log('Start button clicked');
            const workspace = document.getElementById('workspace');
            if (workspace) {
                workspace.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // 프레젠테이션 생성 버튼
    const createPresentationBtn = document.getElementById('createPresentationBtn');
    if (createPresentationBtn) {
        createPresentationBtn.addEventListener('click', function() {
            console.log('Create presentation button clicked');
            const topic = document.getElementById('topicInput').value.trim();
            const slideCount = parseInt(document.getElementById('slideCountInput').value);
            
            if (!topic) {
                alert('주제를 입력해주세요.');
                return;
            }
            
            if (isNaN(slideCount) || slideCount < 1 || slideCount > 20) {
                alert('슬라이드 개수는 1에서 20 사이의 숫자로 입력해주세요.');
                return;
            }
            
            // 로딩 표시
            this.disabled = true;
            this.innerHTML = '<span class="loading"></span> 생성 중...';
            
            // 데모용 슬라이드 생성 (실제로는 서버에 요청해야 함)
            createDemoSlides(topic, slideCount);
        });
    }
    
    // 슬라이드 추가 버튼
    const addSlideBtn = document.getElementById('addSlideBtn');
    if (addSlideBtn) {
        addSlideBtn.addEventListener('click', function() {
            console.log('Add slide button clicked');
            const newSlideIndex = slides.length;
            
            // 새 슬라이드 추가 (빈 슬라이드)
            slides.push({
                elements: []
            });
            
            // 화면 업데이트
            renderSlidesList();
            selectSlide(newSlideIndex);
            
            // 기본 제목과 내용 텍스트 상자 추가
            addTextElement('슬라이드 제목', 100, 50, 500, 50, '24px', true);
            addTextElement('슬라이드 내용을 입력하세요.', 100, 150, 500, 200);
            
            alert('새 슬라이드가 추가되었습니다.');
        });
    }
    
    // 미리보기 및 다운로드 버튼 등의 다른 이벤트 리스너도 설정...
    setupOtherEventListeners();
    
    // 슬라이드 편집 버튼들
    setupSlideEditingButtons();
}

// 스타일 패널 탭 이벤트 설정
function setupStylePanelTabs() {
    const tabs = document.querySelectorAll('.style-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 활성 탭 변경
            document.querySelectorAll('.style-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 탭 내용 변경
            const tabName = this.getAttribute('data-tab');
            document.querySelectorAll('.style-tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(tabName + 'Tab').classList.add('active');
        });
    });
}

// 스타일 변경 이벤트 설정
function setupStyleChangeEvents() {
    // 채우기 색상 변경
    const fillColor = document.getElementById('fillColor');
    if (fillColor) {
        fillColor.addEventListener('input', function() {
            if (!selectedElement) return;
            
            // 선택한 요소의 색상 변경
            selectedElement.style.color = this.value;
            updateSelectedElementStyle();
        });
    }
    
    // 채우기 투명도 변경
    const fillOpacity = document.getElementById('fillOpacity');
    const fillOpacityValue = document.getElementById('fillOpacityValue');
    if (fillOpacity && fillOpacityValue) {
        fillOpacity.addEventListener('input', function() {
            fillOpacityValue.textContent = this.value + '%';
            
            if (!selectedElement) return;
            
            // 선택한 요소의 투명도 변경
            selectedElement.style.opacity = this.value / 100;
            updateSelectedElementStyle();
        });
    }
    
    // 테두리 색상 변경
    const borderColor = document.getElementById('borderColor');
    if (borderColor) {
        borderColor.addEventListener('input', function() {
            if (!selectedElement) return;
            
            // 선택한 요소의 테두리 색상 변경
            selectedElement.style.borderColor = this.value;
            updateSelectedElementStyle();
        });
    }
    
    // 테두리 두께 변경
    const borderWidth = document.getElementById('borderWidth');
    const borderWidthValue = document.getElementById('borderWidthValue');
    if (borderWidth && borderWidthValue) {
        borderWidth.addEventListener('input', function() {
            borderWidthValue.textContent = this.value + 'px';
            
            if (!selectedElement) return;
            
            // 선택한 요소의 테두리 두께 변경
            selectedElement.style.borderWidth = this.value + 'px';
            updateSelectedElementStyle();
        });
    }
    
    // 테두리 스타일 변경
    const borderStyle = document.getElementById('borderStyle');
    if (borderStyle) {
        borderStyle.addEventListener('change', function() {
            if (!selectedElement) return;
            
            // 선택한 요소의 테두리 스타일 변경
            selectedElement.style.borderStyle = this.value;
            updateSelectedElementStyle();
        });
    }
    
    // 텍스트 색상 변경
    const textColor = document.getElementById('textColor');
    if (textColor) {
        textColor.addEventListener('input', function() {
            if (!selectedElement) return;
            
            // 선택한 요소의 텍스트 색상 변경
            if (selectedElement.type === 'text' || selectedElement.hasText) {
                selectedElement.style.textColor = this.value;
                updateSelectedElementStyle();
            }
        });
    }
    
    // 글꼴 크기 변경
    const fontSize = document.getElementById('fontSize');
    if (fontSize) {
        fontSize.addEventListener('change', function() {
            if (!selectedElement) return;
            
            // 선택한 요소의 글꼴 크기 변경
            if (selectedElement.type === 'text' || selectedElement.hasText) {
                selectedElement.style.fontSize = this.value;
                updateSelectedElementStyle();
            }
        });
    }
    
    // 텍스트 정렬 변경
    const alignBtns = document.querySelectorAll('.align-btn');
    if (alignBtns) {
        alignBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // 활성 버튼 변경
                document.querySelectorAll('.align-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                if (!selectedElement) return;
                
                // 선택한 요소의 텍스트 정렬 변경
                if (selectedElement.type === 'text' || selectedElement.hasText) {
                    let textAlign = 'center';
                    if (this.id === 'alignLeft') textAlign = 'left';
                    else if (this.id === 'alignRight') textAlign = 'right';
                    
                    selectedElement.style.textAlign = textAlign;
                    updateSelectedElementStyle();
                }
            });
        });
    }
    
    // 텍스트 내용 변경
    const elementText = document.getElementById('elementText');
    if (elementText) {
        elementText.addEventListener('input', function() {
            if (!selectedElement) return;
            
            // 선택한 요소의 텍스트 내용 변경
            if (selectedElement.type === 'text' || selectedElement.hasText) {
                selectedElement.content = this.value;
                updateSelectedElementStyle();
            }
        });
    }
    
    // 요소 투명도 변경
    const elementOpacity = document.getElementById('elementOpacity');
    const elementOpacityValue = document.getElementById('elementOpacityValue');
    if (elementOpacity && elementOpacityValue) {
        elementOpacity.addEventListener('input', function() {
            elementOpacityValue.textContent = this.value + '%';
            
            if (!selectedElement) return;
            
            // 선택한 요소의 전체 투명도 변경
            selectedElement.opacity = this.value / 100;
            updateSelectedElementStyle();
        });
    }
    
    // 회전 변경
    const elementRotation = document.getElementById('elementRotation');
    const elementRotationValue = document.getElementById('elementRotationValue');
    if (elementRotation && elementRotationValue) {
        elementRotation.addEventListener('input', function() {
            elementRotationValue.textContent = this.value + '°';
            
            if (!selectedElement) return;
            
            // 선택한 요소의 회전 변경
            selectedElement.rotation = parseInt(this.value);
            updateSelectedElementStyle();
        });
    }
}

// 삭제 버튼 설정
function setupDeleteButton() {
    const deleteElementBtn = document.getElementById('deleteElementBtn');
    if (deleteElementBtn) {
        deleteElementBtn.addEventListener('click', function() {
            if (!selectedElement) return;
            
            // 선택한 요소 삭제
            deleteSelectedElement();
        });
        
        // 키보드 Delete 키로도 삭제 가능하게 설정
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Delete' && selectedElement) {
                deleteSelectedElement();
            }
        });
    }
}

// 도형 요소 추가
function addShapeElement(shapeType) {
    if (slides.length === 0) return;
    
    const newElement = {
        type: 'shape',
        id: 'shape_' + Date.now(),
        content: shapeType,
        x: 150,
        y: 150,
        width: 100,
        height: 100,
        style: {
            color: getRandomColor(),
            borderColor: '#000000',
            borderWidth: '1px',
            borderStyle: 'solid',
            textColor: '#000000',
            fontSize: '16px',
            textAlign: 'center'
        },
        hasText: false,
        opacity: 1,
        rotation: 0
    };
    
    // 도형 유형에 따라 크기와 속성 조정
    if (shapeType === 'line' || shapeType === 'arrow' || shapeType.includes('arrow')) {
        newElement.width = 200;
        newElement.height = 2;
    } else if (shapeType === 'circle' || shapeType === 'square') {
        newElement.width = 100;
        newElement.height = 100;
    } else if (shapeType === 'star') {
        newElement.width = 120;
        newElement.height = 120;
    }
    
    if (!slides[currentSlide].elements) {
        slides[currentSlide].elements = [];
    }
    
    slides[currentSlide].elements.push(newElement);
    renderSlideElements();
    
    // 새로 추가된 요소 선택
    selectElement(newElement);
}

// 텍스트 요소 추가
function addTextElement(initialText = '텍스트를 입력하세요', x = 150, y = 150, width = 200, height = 50, fontSize = '16px', isTitle = false) {
    if (slides.length === 0) return;
    
    const newElement = {
        type: 'text',
        id: 'text_' + Date.now(),
        content: initialText,
        x: x,
        y: y,
        width: width,
        height: height,
        style: {
            color: 'transparent',
            borderColor: 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
            textColor: isTitle ? '#000000' : '#333333',
            fontSize: fontSize,
            textAlign: 'center'
        },
        opacity: 1,
        rotation: 0
    };
    
    if (!slides[currentSlide].elements) {
        slides[currentSlide].elements = [];
    }
    
    slides[currentSlide].elements.push(newElement);
    renderSlideElements();
    
    // 새로 추가된 요소 선택
    selectElement(newElement);
}

// 선택된 요소 삭제
function deleteSelectedElement() {
    if (!selectedElement) return;
    
    // DOM에서 요소 제거
    const el = document.getElementById(selectedElement.id);
    if (el) {
        el.remove();
    }
    
    // 데이터에서 요소 제거
    if (slides[currentSlide].elements) {
        slides[currentSlide].elements = slides[currentSlide].elements.filter(e => e.id !== selectedElement.id);
    }
    
    // 선택 해제
    selectedElement = null;
    
    // 삭제 버튼 비활성화
    const deleteBtn = document.getElementById('deleteElementBtn');
    if (deleteBtn) {
        deleteBtn.disabled = true;
    }
    
    // 스타일 패널 업데이트
    updateStylePanel();
}

// 요소 선택
function selectElement(element) {
    // 이전 선택 해제
    selectedElement = null;
    document.querySelectorAll('.slide-element').forEach(el => {
        el.classList.remove('selected');
    });
    
    // 새 요소 선택
    selectedElement = element;
    const el = document.getElementById(element.id);
    if (el) {
        el.classList.add('selected');
    }
    
    // 스타일 패널 업데이트
    updateStylePanel();
    
    // 삭제 버튼 활성화
    const deleteBtn = document.getElementById('deleteElementBtn');
    if (deleteBtn) {
        deleteBtn.disabled = false;
    }
}

// 스타일 패널 업데이트
function updateStylePanel() {
    if (!selectedElement) {
        // 선택된 요소가 없으면 기본값으로 설정
        resetStylePanel();
        return;
    }
    
    // 채우기 탭
    const fillColor = document.getElementById('fillColor');
    const fillOpacity = document.getElementById('fillOpacity');
    const fillOpacityValue = document.getElementById('fillOpacityValue');
    
    if (fillColor) fillColor.value = selectedElement.style.color || '#3498db';
    if (fillOpacity) {
        const opacity = selectedElement.style.opacity || 1;
        fillOpacity.value = opacity * 100;
        if (fillOpacityValue) fillOpacityValue.textContent = Math.round(opacity * 100) + '%';
    }
    
    // 테두리 탭
    const borderColor = document.getElementById('borderColor');
    const borderWidth = document.getElementById('borderWidth');
    const borderWidthValue = document.getElementById('borderWidthValue');
    const borderStyle = document.getElementById('borderStyle');
    
    if (borderColor) borderColor.value = selectedElement.style.borderColor || '#000000';
    if (borderWidth) {
        const width = parseInt(selectedElement.style.borderWidth) || 1;
        borderWidth.value = width;
        if (borderWidthValue) borderWidthValue.textContent = width + 'px';
    }
    if (borderStyle) borderStyle.value = selectedElement.style.borderStyle || 'solid';
    
    // 텍스트 탭
    const textColor = document.getElementById('textColor');
    const fontSize = document.getElementById('fontSize');
    const textAlignBtns = document.querySelectorAll('.align-btn');
    const textInput = document.getElementById('elementText');
    const textInputContainer = document.getElementById('textInputContainer');
    
    // 텍스트 관련 옵션은 텍스트 요소나 텍스트가 있는 도형에서만 표시
    if (selectedElement.type === 'text' || selectedElement.hasText) {
        if (textColor) textColor.value = selectedElement.style.textColor || '#000000';
        if (fontSize) fontSize.value = selectedElement.style.fontSize || '16px';
        
        // 텍스트 정렬 버튼 상태 업데이트
        if (textAlignBtns) {
            const align = selectedElement.style.textAlign || 'center';
            textAlignBtns.forEach(btn => {
                btn.classList.remove('active');
                if ((btn.id === 'alignLeft' && align === 'left') ||
                    (btn.id === 'alignCenter' && align === 'center') ||
                    (btn.id === 'alignRight' && align === 'right')) {
                    btn.classList.add('active');
                }
            });
        }
        
        // 텍스트 입력 필드 표시 및 값 설정
        if (textInput && textInputContainer) {
            textInputContainer.style.display = 'block';
            textInput.value = selectedElement.content || '';
        }
    } else {
        // 텍스트가 없는 요소에서는 텍스트 입력 필드 숨기기
        if (textInputContainer) {
            textInputContainer.style.display = 'none';
        }
    }
    
    // 효과 탭
    const elementOpacity = document.getElementById('elementOpacity');
    const elementOpacityValue = document.getElementById('elementOpacityValue');
    const elementRotation = document.getElementById('elementRotation');
    const elementRotationValue = document.getElementById('elementRotationValue');
    
    if (elementOpacity) {
        const opacity = selectedElement.opacity || 1;
        elementOpacity.value = opacity * 100;
        if (elementOpacityValue) elementOpacityValue.textContent = Math.round(opacity * 100) + '%';
    }
    
    if (elementRotation) {
        const rotation = selectedElement.rotation || 0;
        elementRotation.value = rotation;
        if (elementRotationValue) elementRotationValue.textContent = rotation + '°';
    }
}

// 스타일 패널 초기화
function resetStylePanel() {
    // 채우기 탭
    const fillColor = document.getElementById('fillColor');
    const fillOpacity = document.getElementById('fillOpacity');
    const fillOpacityValue = document.getElementById('fillOpacityValue');
    
    if (fillColor) fillColor.value = '#3498db';
    if (fillOpacity) {
        fillOpacity.value = 100;
        if (fillOpacityValue) fillOpacityValue.textContent = '100%';
    }
    
    // 나머지 탭들도 초기화
    // ... (생략) ...
    
    // 텍스트 입력 필드 숨기기
    const textInputContainer = document.getElementById('textInputContainer');
    if (textInputContainer) {
        textInputContainer.style.display = 'none';
    }
}

// 선택된 요소의 스타일 업데이트
function updateSelectedElementStyle() {
    if (!selectedElement) return;
    
    const el = document.getElementById(selectedElement.id);
    if (!el) return;
    
    // 기본 스타일 적용
    if (selectedElement.style.color) {
        el.style.backgroundColor = selectedElement.style.color;
    }
    
    // 테두리 스타일 적용
    if (selectedElement.style.borderColor) {
        el.style.borderColor = selectedElement.style.borderColor;
    }
    
    if (selectedElement.style.borderWidth) {
        el.style.borderWidth = selectedElement.style.borderWidth;
    }
    
    if (selectedElement.style.borderStyle) {
        el.style.borderStyle = selectedElement.style.borderStyle;
    }
    
    // 텍스트 스타일 적용
    if (selectedElement.type === 'text' || selectedElement.hasText) {
        if (selectedElement.style.textColor) {
            el.style.color = selectedElement.style.textColor;
        }
        
        if (selectedElement.style.fontSize) {
            el.style.fontSize = selectedElement.style.fontSize;
        }
        
        if (selectedElement.style.textAlign) {
            el.style.textAlign = selectedElement.style.textAlign;
        }
        
        if (selectedElement.content) {
            el.textContent = selectedElement.content;
        }
    }
    
    // 투명도 적용
    if (selectedElement.opacity !== undefined) {
        el.style.opacity = selectedElement.opacity;
    }
    
    // 회전 적용
    if (selectedElement.rotation !== undefined) {
        el.style.transform = `rotate(${selectedElement.rotation}deg)`;
    }
    
    // 특별한 도형 스타일 적용 (이전 코드 유지)
    applySpecialShapeStyles(selectedElement, el);
}

// 특별한 도형 스타일 적용
function applySpecialShapeStyles(element, el) {
    if (element.type !== 'shape') return;
    
    // 도형 타입에 따라 스타일 적용
    if (element.content === 'circle') {
        el.style.borderRadius = '50%';
    } else if (element.content === 'star') {
        el.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
    } else if (element.content === 'triangle') {
        el.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
    } else if (element.content === 'hexagon') {
        el.style.clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
    } else if (element.content === 'arrow') {
        el.style.height = '2px';
        
        // 화살표 헤드 추가
        let arrowHead = el.querySelector('.arrow-head');
        if (!arrowHead) {
            arrowHead = document.createElement('div');
            arrowHead.className = 'arrow-head';
            arrowHead.style.position = 'absolute';
            arrowHead.style.right = '-8px';
            arrowHead.style.top = '-4px';
            arrowHead.style.width = '0';
            arrowHead.style.height = '0';
            arrowHead.style.borderTop = '5px solid transparent';
            arrowHead.style.borderBottom = '5px solid transparent';
            
            el.appendChild(arrowHead);
        }
        
        arrowHead.style.borderLeft = `10px solid ${element.style.color || '#000'}`;
    }
}

// 데모 슬라이드 생성 함수 (자유 텍스트 방식으로 변경)
function createDemoSlides(topic, count, theme = 'default') {
    slides = [];
    
    // 타이틀 슬라이드
    slides.push({
        elements: [
            // 제목 텍스트 상자
            {
                type: 'text',
                id: 'text_title_1',
                content: topic,
                x: 100,
                y: 100,
                width: 600,
                height: 80,
                style: {
                    color: 'transparent',
                    borderColor: 'transparent',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    textColor: '#000000',
                    fontSize: '32px',
                    textAlign: 'center'
                },
                opacity: 1,
                rotation: 0
            },
            // 부제목 텍스트 상자
            {
                type: 'text',
                id: 'text_subtitle_1',
                content: '프레젠테이션 소개',
                x: 100,
                y: 200,
                width: 600,
                height: 50,
                style: {
                    color: 'transparent',
                    borderColor: 'transparent',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    textColor: '#666666',
                    fontSize: '20px',
                    textAlign: 'center'
                },
                opacity: 1,
                rotation: 0
            },
            // 장식 선
            {
                type: 'shape',
                id: 'shape_line_1',
                content: 'rectangle',
                x: 100,
                y: 280,
                width: 600,
                height: 3,
                style: {
                    color: '#3498db',
                    borderColor: 'transparent',
                    borderWidth: '0px',
                    borderStyle: 'none'
                },
                opacity: 1,
                rotation: 0
            }
        ]
    });
    
    // 내용 슬라이드
    for (let i = 1; i < count; i++) {
        const slide = {
            elements: [
                // 제목 텍스트 상자
                {
                    type: 'text',
                    id: `text_title_${i+1}`,
                    content: `슬라이드 ${i+1}`,
                    x: 50,
                    y: 30,
                    width: 700,
                    height: 50,
                    style: {
                        color: 'transparent',
                        borderColor: 'transparent',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        textColor: '#000000',
                        fontSize: '24px',
                        textAlign: 'left'
                    },
                    opacity: 1,
                    rotation: 0
                },
                // 내용 텍스트 상자
                {
                    type: 'text',
                    id: `text_content_${i+1}`,
                    content: `이 슬라이드는 ${topic}에 대한 내용을 담고 있습니다.`,
                    x: 50,
                    y: 100,
                    width: 400,
                    height: 200,
                    style: {
                        color: 'transparent',
                        borderColor: 'transparent',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        textColor: '#333333',
                        fontSize: '16px',
                        textAlign: 'left'
                    },
                    opacity: 1,
                    rotation: 0
                }
            ]
        };
        
        // 장식용 도형 추가
        const shapeTypes = ['circle', 'rectangle', 'star', 'triangle', 'hexagon'];
        const shapeType = shapeTypes[i % shapeTypes.length];
        
        slide.elements.push({
            type: 'shape',
            id: `shape_${i+1}`,
            content: shapeType,
            x: 500,
            y: 150,
            width: 150,
            height: 150,
            style: {
                color: getRandomColor(0.7),  // 약간 투명하게
                borderColor: '#000000',
                borderWidth: '1px',
                borderStyle: 'solid'
            },
            opacity: 0.8,
            rotation: i * 15  // 조금씩 회전
        });
        
        slides.push(slide);
    }
    
    // 프레젠테이션 생성 완료 알림
    console.log('Demo slides created:', slides);
    
    // UI 업데이트
    document.getElementById('initialSetup').style.display = 'none';
    document.getElementById('promptContainer').style.display = 'none';
    document.getElementById('slideWorkspace').style.display = 'block';
    
    // 슬라이드 목록 및 현재 슬라이드 표시
    renderSlidesList();
    selectSlide(0);
    
    alert(`"${topic}" 주제로 ${count}장의 슬라이드가 생성되었습니다!`);
}

// 슬라이드 요소 렌더링
function renderSlideElements() {
    const elementsContainer = document.getElementById('slideElements');
    if (!elementsContainer) return;
    
    elementsContainer.innerHTML = '';
    
    const slide = slides[currentSlide];
    if (!slide.elements || slide.elements.length === 0) return;
    
    slide.elements.forEach(element => {
        const el = document.createElement('div');
        el.className = `slide-element ${element.type}`;
        el.id = element.id;
        el.style.position = 'absolute';
        el.style.left = `${element.x}px`;
        el.style.top = `${element.y}px`;
        el.style.width = `${element.width}px`;
        el.style.height = `${element.height}px`;
        
        // 요소 유형에 따라 다르게 렌더링
        if (element.type === 'shape') {
            el.style.backgroundColor = element.style.color || '#3498db';
            el.style.borderColor = element.style.borderColor || 'transparent';
            el.style.borderWidth = element.style.borderWidth || '1px';
            el.style.borderStyle = element.style.borderStyle || 'solid';
            
            // 도형에 텍스트가 있는 경우
            if (element.hasText && element.content) {
                el.innerHTML = element.content;
                el.style.color = element.style.textColor || '#000000';
                el.style.fontSize = element.style.fontSize || '16px';
                el.style.textAlign = element.style.textAlign || 'center';
                el.style.display = 'flex';
                el.style.alignItems = 'center';
                el.style.justifyContent = 'center';
            }
            
            // 특별한 도형 스타일 적용
            applySpecialShapeStyles(element, el);
        } else if (element.type === 'text') {
            el.innerHTML = element.content || '텍스트를 입력하세요';
            el.style.color = element.style.textColor || '#000000';
            el.style.backgroundColor = element.style.color || 'transparent';
            el.style.borderColor = element.style.borderColor || 'transparent';
            el.style.borderWidth = element.style.borderWidth || '1px';
            el.style.borderStyle = element.style.borderStyle || 'solid';
            el.style.fontSize = element.style.fontSize || '16px';
            el.style.textAlign = element.style.textAlign || 'center';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.style.wordWrap = 'break-word';
            el.style.overflowWrap = 'break-word';
        }
        
        // 투명도 적용
        if (element.opacity !== undefined) {
            el.style.opacity = element.opacity;
        }
        
        // 회전 적용
        if (element.rotation !== undefined) {
            el.style.transform = `rotate(${element.rotation}deg)`;
        }
        
        // 요소 클릭 이벤트 (선택)
        el.addEventListener('click', function(e) {
            selectElement(element);
            e.stopPropagation();
        });
        
        // 배경 클릭 시 선택 해제
        elementsContainer.addEventListener('click', function(e) {
            if (e.target === elementsContainer) {
                unselectElements();
            }
        });
        
        // 드래그 기능 (간단 구현)
        setupDragElement(el, element);
        
        elementsContainer.appendChild(el);
    });
}

// 모든 요소 선택 해제
function unselectElements() {
    selectedElement = null;
    document.querySelectorAll('.slide-element').forEach(el => {
        el.classList.remove('selected');
    });
    
    // 삭제 버튼 비활성화
    const deleteBtn = document.getElementById('deleteElementBtn');
    if (deleteBtn) {
        deleteBtn.disabled = true;
    }
    
    // 스타일 패널 초기화
    resetStylePanel();
}

// 랜덤 색상 생성 (투명도 지정 가능)
function getRandomColor(alpha = 1) {
    const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6', '#1abc9c', '#34495e', '#e67e22'];
    let color = colors[Math.floor(Math.random() * colors.length)];
    
    // 투명도 적용
    if (alpha < 1) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        color = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    return color;
}