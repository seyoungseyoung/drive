/**
 * 프레젠테이션 AI 모듈
 * 슬라이드 분석 및 개선 제안 기능 제공
 */

import { AppState } from '../index.js';

// AI 기능 초기화
export function initAI() {
    console.log('AI 모듈 초기화');
    
    // AI 분석 기능 전역 노출
    window.slideAnalyzer = {
        analyzeCurrentSlide,
        suggestImprovements,
        generateContent,
        suggestDesign,
        suggestImages
    };
    
    // AI 패널 토글 버튼 이벤트 리스너 등록
    const toggleAIPanelBtn = document.getElementById('toggleAIPanelBtn');
    if (toggleAIPanelBtn) {
        toggleAIPanelBtn.addEventListener('click', toggleAIPanel);
        console.log('AI 패널 토글 버튼 이벤트 등록됨');
    } else {
        console.error('toggleAIPanelBtn 요소를 찾을 수 없습니다');
    }
    
    // AI 제출 버튼 이벤트 리스너 추가
    const aiSubmitBtn = document.getElementById('ai-submit');
    if (aiSubmitBtn) {
        aiSubmitBtn.addEventListener('click', handleAIPrompt);
        console.log('AI 제출 버튼 이벤트 등록됨');
    } else {
        console.error('ai-submit 요소를 찾을 수 없습니다');
    }
    
    // 키 이벤트 리스너 (Enter 키로 제출)
    const aiPromptInput = document.getElementById('ai-prompt-input');
    if (aiPromptInput) {
        aiPromptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAIPrompt();
            }
        });
        console.log('AI 프롬프트 인풋 키 이벤트 등록됨');
    } else {
        console.error('ai-prompt-input 요소를 찾을 수 없습니다');
    }
    
    // 리본 메뉴의 AI 버튼 이벤트 리스너
    const toggleAIBtn = document.getElementById('toggleAIBtn');
    if (toggleAIBtn) {
        toggleAIBtn.addEventListener('click', toggleAIPanel);
        console.log('리본 메뉴 AI 토글 버튼 이벤트 등록됨');
    }
    
    // 초기 AI 패널 상태 설정
    initAIPanelState();
    
    // 슬라이드 업데이트 이벤트 리스너 등록
    document.addEventListener('slides-updated', () => {
        prepareAnalysis();
        console.log('slides-updated 이벤트 감지됨');
    });
    
    console.log('AI 모듈 초기화 완료');
    return true;
}

// AI 패널 토글 함수
function toggleAIPanel() {
    console.log('toggleAIPanel 함수 호출됨');
    
    const aiPanel = document.querySelector('.deep-seek-panel');
    const toggleBtn = document.getElementById('toggleAIPanelBtn');
    
    if (!aiPanel) {
        console.error('AI 패널 요소를 찾을 수 없습니다');
        return;
    }
    
    // 패널 상태 토글
    if (aiPanel.classList.contains('collapsed')) {
        // 패널 열기
        aiPanel.classList.remove('collapsed');
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        }
        console.log('AI 패널 열림');
    } else {
        // 패널 닫기
        aiPanel.classList.add('collapsed');
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        }
        console.log('AI 패널 닫힘');
    }
    
    // 전역 상태 업데이트
    AppState.isAIPanelOpen = !aiPanel.classList.contains('collapsed');
}

// AI 패널 초기 상태 설정
function initAIPanelState() {
    const aiPanel = document.querySelector('.deep-seek-panel');
    if (!aiPanel) {
        console.error('AI 패널 요소를 찾을 수 없습니다');
        return;
    }
    
    // 기본적으로 패널을 열어 둠
    aiPanel.classList.remove('collapsed');
    AppState.isAIPanelOpen = true;
    
    // 토글 버튼 아이콘 설정
    const toggleBtn = document.getElementById('toggleAIPanelBtn');
    if (toggleBtn) {
        toggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    }
    
    console.log('AI 패널 초기 상태 설정됨');
}

// AI 프롬프트 처리 함수
function handleAIPrompt() {
    console.log('handleAIPrompt 함수 호출됨');
    
    const promptInput = document.getElementById('ai-prompt-input');
    if (!promptInput) {
        console.error('ai-prompt-input 요소를 찾을 수 없습니다');
        return;
    }
    
    const userPrompt = promptInput.value.trim();
    if (!userPrompt) {
        console.log('입력된 프롬프트가 없습니다');
        return;
    }
    
    promptInput.value = '';
    
    // 사용자 메시지 추가
    addAIMessage('user', userPrompt);
    
    // AI 응답 시뮬레이션 (실제로는 서버 API 호출)
    const loadingMsgId = addAIMessage('assistant', '<div class="loading"></div>');
    
    setTimeout(() => {
        // 로딩 메시지 제거
        removeAIMessage(loadingMsgId);
        
        // 더미 응답 (실제 구현에서는 API 호출)
        const responses = [
            '프레젠테이션에 텍스트 상자를 추가하려면 왼쪽 상단의 "Insert" 탭에서 "Text Box" 버튼을 클릭하세요.',
            '슬라이드 배경을 변경하려면 "Design" 탭으로 이동한 후 "Background" 섹션에서 옵션을 선택하세요.',
            '현재 슬라이드 구성이 잘 되어 있네요. 주요 내용이 명확하게 전달되고 있습니다.',
            '이미지를 추가하려면 "Insert" 탭의 "Images" 버튼을 클릭한 후 컴퓨터에서 이미지를 선택하세요.',
            '프레젠테이션의 일관성을 위해 같은 글꼴과 색상 테마를 유지하는 것이 좋습니다.',
            '애니메이션을 추가하려면 요소를 선택한 후 "Animations" 탭에서 원하는 효과를 선택하세요.'
        ];
        
        const randomIndex = Math.floor(Math.random() * responses.length);
        addAIMessage('assistant', responses[randomIndex]);
    }, 1000);
}

// AI 대화 메시지 추가 함수
function addAIMessage(type, content) {
    const conversationContainer = document.querySelector('.ai-conversation');
    if (!conversationContainer) {
        console.error('.ai-conversation 요소를 찾을 수 없습니다');
        return null;
    }
    
    const messageId = Date.now();
    const messageElem = document.createElement('div');
    messageElem.className = `ai-message ${type}`;
    messageElem.dataset.id = messageId;
    messageElem.innerHTML = content;
    
    conversationContainer.appendChild(messageElem);
    
    // 스크롤 맨 아래로
    conversationContainer.scrollTop = conversationContainer.scrollHeight;
    
    return messageId;
}

// AI 메시지 제거 함수
function removeAIMessage(messageId) {
    const message = document.querySelector(`.ai-message[data-id="${messageId}"]`);
    if (message) {
        message.remove();
    }
}

// 현재 슬라이드 컨텐츠 가져오기
function getCurrentSlideContent() {
    if (AppState.slides.length === 0) return null;
    
    const currentSlide = AppState.slides[AppState.currentSlideIndex];
    if (!currentSlide) return null;
    
    // 텍스트 요소 추출
    const textElements = currentSlide.elements
        .filter(element => element.type === 'text')
        .map(element => element.content || '');
    
    // 슬라이드 노트 추출
    const notes = AppState.notes[currentSlide.id] || '';
    
    return {
        slideId: currentSlide.id,
        background: currentSlide.background,
        elements: currentSlide.elements,
        textContent: textElements.join('\n'),
        notes: notes,
        slideIndex: AppState.currentSlideIndex + 1,
        totalSlides: AppState.slides.length
    };
}

// AI 분석 준비
function prepareAnalysis() {
    // 현재 슬라이드 데이터를 캐시하여 분석 성능 향상
    const slideContent = getCurrentSlideContent();
    if (!slideContent) return;
    
    // 슬라이드 컨텍스트 캐시 (AI가 나중에 사용할 수 있도록)
    window.currentSlideContext = slideContent;
}

// 전체 프레젠테이션 내용 가져오기
function getPresentationContent() {
    if (AppState.slides.length === 0) return null;
    
    // 슬라이드 텍스트 내용 수집
    const slideContents = AppState.slides.map((slide, index) => {
        const textElements = slide.elements
            .filter(element => element.type === 'text')
            .map(element => element.content || '');
        
        const notes = AppState.notes[slide.id] || '';
        
        return {
            slideIndex: index + 1,
            slideId: slide.id,
            textContent: textElements.join('\n'),
            notes: notes
        };
    });
    
    return {
        slideCount: AppState.slides.length,
        theme: AppState.currentTheme,
        colorPalette: AppState.currentColorPalette,
        fontFamily: AppState.currentFontFamily,
        slides: slideContents
    };
}

// 현재 슬라이드 분석
function analyzeCurrentSlide() {
    return new Promise((resolve, reject) => {
        const slideContent = getCurrentSlideContent();
        if (!slideContent) {
            reject(new Error('분석할 슬라이드가 없습니다.'));
            return;
        }
        
        // API 요청 시뮬레이션 (실제로는 서버 API 호출)
        setTimeout(() => {
            // 슬라이드 내용 분석
            const textLength = slideContent.textContent.length;
            const wordCount = slideContent.textContent.split(/\s+/).filter(Boolean).length;
            const hasNotes = slideContent.notes.length > 0;
            const elementCount = slideContent.elements.length;
            
            // 요소 유형별 카운트
            const textElements = slideContent.elements.filter(el => el.type === 'text').length;
            const imageElements = slideContent.elements.filter(el => el.type === 'image').length;
            const shapeElements = slideContent.elements.filter(el => el.type === 'shape').length;
            const chartElements = slideContent.elements.filter(el => el.type === 'chart').length;
            
            // 레이아웃 분석
            const layoutAnalysis = analyzeLayout(slideContent.elements);
            
            // 색상 분석
            const colorAnalysis = analyzeColors(slideContent.elements);
            
            // 텍스트 가독성 분석
            const readabilityAnalysis = analyzeTextReadability(slideContent.elements);
            
            // 분석 결과
            const analysis = {
                textDensity: wordCount > 50 ? '높음' : wordCount > 20 ? '중간' : '낮음',
                textLengthScore: textLength > 500 ? 'too_high' : textLength > 200 ? 'high' : textLength < 20 ? 'too_low' : 'good',
                hasSpeakerNotes: hasNotes,
                elementCount: elementCount,
                elementBreakdown: {
                    text: textElements,
                    image: imageElements,
                    shape: shapeElements,
                    chart: chartElements
                },
                complexityScore: elementCount > 8 ? 'high' : elementCount > 4 ? 'medium' : 'low',
                estimatedReadingTime: Math.max(Math.ceil(wordCount / 20), 1), // 분 단위
                slidePosition: `${slideContent.slideIndex}/${slideContent.totalSlides}`,
                theme: AppState.currentTheme,
                colorPalette: AppState.currentColorPalette,
                layout: layoutAnalysis,
                colors: colorAnalysis,
                readability: readabilityAnalysis,
                visualBalance: analyzeVisualBalance(slideContent.elements),
                contentQuality: analyzeContentQuality(slideContent.textContent)
            };
            
            // 주요 키워드 추출 (실제로는 NLP를 사용하여 분석)
            const keywords = extractKeywords(slideContent.textContent);
            
            resolve({
                success: true,
                slideId: slideContent.slideId,
                analysis: analysis,
                keywords: keywords
            });
        }, 500);
    });
}

// 레이아웃 분석
function analyzeLayout(elements) {
    if (!elements || elements.length === 0) {
        return { score: 'unknown', description: '요소가 없습니다.' };
    }
    
    // 요소 위치 분석
    const positions = elements.map(el => ({
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        type: el.type
    }));
    
    // 요소 겹침 검사
    let overlaps = 0;
    for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
            if (elementsOverlap(positions[i], positions[j])) {
                overlaps++;
            }
        }
    }
    
    // 요소 정렬 분석
    const alignmentScore = analyzeElementAlignment(positions);
    
    // 화면 공간 사용 분석
    const spacingScore = analyzeElementSpacing(positions);
    
    let layoutScore;
    let description;
    
    if (overlaps > 3 || alignmentScore < 0.3) {
        layoutScore = 'poor';
        description = '요소들이 잘 정렬되어 있지 않고 겹침이 많습니다.';
    } else if (overlaps > 0 || alignmentScore < 0.7 || spacingScore < 0.5) {
        layoutScore = 'average';
        description = '레이아웃이 양호하지만 개선이 필요합니다.';
    } else {
        layoutScore = 'good';
        description = '요소들이 잘 정렬되어 있고 공간 활용이 좋습니다.';
    }
    
    return {
        score: layoutScore,
        description: description,
        details: {
            overlaps: overlaps,
            alignment: alignmentScore,
            spacing: spacingScore
        }
    };
}

// 요소 겹침 확인
function elementsOverlap(a, b) {
    return !(
        a.x + a.width < b.x ||
        b.x + b.width < a.x ||
        a.y + a.height < b.y ||
        b.y + b.height < a.y
    );
}

// 요소 정렬 분석
function analyzeElementAlignment(positions) {
    if (positions.length < 2) return 1.0; // 요소가 1개 이하면 정렬 완벽
    
    // x 좌표 분석
    const xCoords = positions.map(p => p.x);
    const xAlignmentScore = 1.0 - (new Set(xCoords).size / positions.length);
    
    // y 좌표 분석
    const yCoords = positions.map(p => p.y);
    const yAlignmentScore = 1.0 - (new Set(yCoords).size / positions.length);
    
    // 중앙 정렬 분석
    const centerXCoords = positions.map(p => p.x + p.width/2);
    const centerXAlignmentScore = 1.0 - (new Set(centerXCoords).size / positions.length);
    
    return Math.max(xAlignmentScore, yAlignmentScore, centerXAlignmentScore);
}

// 요소 간격 분석
function analyzeElementSpacing(positions) {
    // 화면 전체 영역
    const totalArea = 960 * 540;
    
    // 요소가 차지하는 영역
    let elementsArea = 0;
    positions.forEach(p => {
        elementsArea += p.width * p.height;
    });
    
    // 이상적인 공간 활용률은 40-60% 정도로 가정
    const utilizationRate = elementsArea / totalArea;
    
    if (utilizationRate < 0.2) {
        return 0.3; // 너무 비어있음
    } else if (utilizationRate > 0.8) {
        return 0.4; // 너무 꽉 참
    } else if (utilizationRate > 0.4 && utilizationRate < 0.6) {
        return 1.0; // 이상적
    } else {
        return 0.7; // 양호
    }
}

// 색상 분석
function analyzeColors(elements) {
    if (!elements || elements.length === 0) {
        return { score: 'unknown', description: '분석할 요소가 없습니다.' };
    }
    
    // 사용된 색상 추출
    const colors = [];
    elements.forEach(el => {
        if (el.fillColor) colors.push(el.fillColor);
        if (el.strokeColor) colors.push(el.strokeColor);
        if (el.color) colors.push(el.color);
    });
    
    // 색상 수
    const uniqueColors = [...new Set(colors)];
    const colorCount = uniqueColors.length;
    
    // 색상 조화 분석 (간단한 구현)
    let colorHarmony = 'good';
    let description = '색상 구성이 조화롭습니다.';
    
    if (colorCount > 5) {
        colorHarmony = 'poor';
        description = '색상이 너무 많아 집중력을 분산시킬 수 있습니다.';
    } else if (colorCount < 2) {
        colorHarmony = 'average';
        description = '색상 다양성이 부족합니다.';
    }
    
    return {
        score: colorHarmony,
        description: description,
        colorCount: colorCount,
        details: {
            uniqueColors: uniqueColors
        }
    };
}

// 텍스트 가독성 분석
function analyzeTextReadability(elements) {
    const textElements = elements.filter(el => el.type === 'text');
    if (textElements.length === 0) {
        return { score: 'unknown', description: '분석할 텍스트가 없습니다.' };
    }
    
    let readabilityIssues = 0;
    let smallFontCount = 0;
    let lowContrastCount = 0;
    
    textElements.forEach(el => {
        // 작은 폰트 크기 체크
        if (el.fontSize && parseInt(el.fontSize) < 18) {
            smallFontCount++;
            readabilityIssues++;
        }
        
        // 텍스트-배경 대비 체크 (간단한 구현)
        if (el.color && el.color === el.backgroundColor) {
            lowContrastCount++;
            readabilityIssues++;
        }
    });
    
    let readabilityScore;
    let description;
    
    if (readabilityIssues > textElements.length / 2) {
        readabilityScore = 'poor';
        description = '텍스트 가독성이 낮습니다. 폰트 크기와 색상 대비를 개선하세요.';
    } else if (readabilityIssues > 0) {
        readabilityScore = 'average';
        description = '텍스트 가독성이 양호하지만 개선이 필요합니다.';
    } else {
        readabilityScore = 'good';
        description = '텍스트 가독성이 좋습니다.';
    }
    
    return {
        score: readabilityScore,
        description: description,
        details: {
            smallFontCount: smallFontCount,
            lowContrastCount: lowContrastCount
        }
    };
}

// 시각적 균형 분석
function analyzeVisualBalance(elements) {
    if (!elements || elements.length < 2) {
        return { score: 'unknown', description: '분석할 요소가 충분하지 않습니다.' };
    }
    
    // 화면을 4분할하여 각 영역의 요소 수 계산
    const quadrants = [0, 0, 0, 0]; // 좌상, 우상, 좌하, 우하
    const centerX = 960 / 2;
    const centerY = 540 / 2;
    
    elements.forEach(el => {
        const elCenterX = el.x + (el.width / 2);
        const elCenterY = el.y + (el.height / 2);
        
        if (elCenterX <= centerX && elCenterY <= centerY) {
            quadrants[0]++; // 좌상
        } else if (elCenterX > centerX && elCenterY <= centerY) {
            quadrants[1]++; // 우상
        } else if (elCenterX <= centerX && elCenterY > centerY) {
            quadrants[2]++; // 좌하
        } else {
            quadrants[3]++; // 우하
        }
    });
    
    // 균형 점수 계산 (0에 가까울수록 균형)
    const maxQuadrant = Math.max(...quadrants);
    const minQuadrant = Math.min(...quadrants);
    const balanceScore = 1 - ((maxQuadrant - minQuadrant) / elements.length);
    
    let description;
    let score;
    
    if (balanceScore > 0.7) {
        score = 'good';
        description = '시각적 요소가 슬라이드에 균형있게 분포되어 있습니다.';
    } else if (balanceScore > 0.4) {
        score = 'average';
        description = '시각적 균형이 양호하지만 개선의 여지가 있습니다.';
    } else {
        score = 'poor';
        description = '시각적 요소가 한쪽으로 치우쳐 있습니다.';
    }
    
    return {
        score: score,
        description: description,
        balanceScore: balanceScore,
        details: {
            quadrants: quadrants
        }
    };
}

// 콘텐츠 품질 분석
function analyzeContentQuality(text) {
    if (!text || text.length < 10) {
        return { score: 'unknown', description: '분석할 텍스트가 충분하지 않습니다.' };
    }
    
    // 문장 수 계산
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // 단어 수 계산
    const words = text.split(/\s+/).filter(w => w.trim().length > 0);
    
    // 중복 단어 분석
    const wordFrequency = {};
    words.forEach(word => {
        const normalized = word.toLowerCase();
        wordFrequency[normalized] = (wordFrequency[normalized] || 0) + 1;
    });
    
    const repetitiveWords = Object.entries(wordFrequency)
        .filter(([word, count]) => count > 3 && word.length > 3)
        .map(([word]) => word);
    
    // 문장 길이 다양성
    const sentenceLengths = sentences.map(s => s.split(/\s+/).filter(Boolean).length);
    const avgSentenceLength = sentenceLengths.reduce((sum, len) => sum + len, 0) / sentenceLengths.length;
    
    // 내용 품질 점수 계산
    let qualityScore;
    let description;
    
    if (words.length < 10) {
        qualityScore = 'low';
        description = '내용이 너무 적습니다. 보다 풍부한 정보를 제공하세요.';
    } else if (repetitiveWords.length > 3) {
        qualityScore = 'average';
        description = '단어 반복이 많습니다. 더 다양한 어휘를 사용하세요.';
    } else if (sentences.length === 1 && words.length > 30) {
        qualityScore = 'average';
        description = '긴 문장 하나보다는 여러 개의 짧은 문장으로 나누는 것이 좋습니다.';
    } else {
        qualityScore = 'good';
        description = '콘텐츠 품질이 좋습니다.';
    }
    
    return {
        score: qualityScore,
        description: description,
        details: {
            wordCount: words.length,
            sentenceCount: sentences.length,
            avgSentenceLength: avgSentenceLength,
            repetitiveWords: repetitiveWords
        }
    };
}

// 슬라이드 개선 제안
function suggestImprovements() {
    return new Promise((resolve, reject) => {
        analyzeCurrentSlide()
            .then(analysisResults => {
                const { analysis, keywords } = analysisResults;
                const slideContent = getCurrentSlideContent();
                
                // 개선 제안 생성
                const suggestions = [];
                
                // 텍스트 밀도 관련 제안
                if (analysis.textLengthScore === 'too_high') {
                    suggestions.push({
                        type: 'text_density',
                        priority: 'high',
                        title: '텍스트 양 줄이기',
                        description: '슬라이드의 텍스트가 너무 많습니다. 핵심 요점 3-5개로 줄이는 것이 좋습니다.',
                        action: 'reduce_text',
                        actionText: '주요 요점 추출'
                    });
                } else if (analysis.textLengthScore === 'high') {
                    suggestions.push({
                        type: 'text_density',
                        priority: 'medium',
                        title: '텍스트 간결화',
                        description: '글머리 기호를 사용하여 핵심 내용만 간결하게 표시하는 것이 좋습니다.',
                        action: 'optimize_text',
                        actionText: '글머리 기호로 변환'
                    });
                } else if (analysis.textLengthScore === 'too_low' && slideContent.elements.length < 3) {
                    suggestions.push({
                        type: 'content',
                        priority: 'medium',
                        title: '콘텐츠 추가',
                        description: '슬라이드 내용이 부족합니다. 핵심 정보나 시각 요소를 추가하세요.',
                        action: 'add_content',
                        actionText: '콘텐츠 생성'
                    });
                }
                
                // 시각적 요소 관련 제안
                const imageElements = slideContent.elements.filter(el => el.type === 'image').length;
                const shapeElements = slideContent.elements.filter(el => el.type === 'shape').length;
                
                if (imageElements === 0 && analysis.textLengthScore !== 'too_low') {
                    suggestions.push({
                        type: 'visual',
                        priority: 'medium',
                        title: '이미지 추가',
                        description: '관련 이미지나 아이콘을 추가하여 시각적 효과를 높이세요.',
                        action: 'add_image',
                        keywords: keywords,
                        actionText: '이미지 추천'
                    });
                }
                
                if (shapeElements === 0 && analysis.textLengthScore === 'high') {
                    suggestions.push({
                        type: 'visual',
                        priority: 'low',
                        title: '도형 활용',
                        description: '정보를 구조화하기 위해 도형과 화살표를 활용하세요.',
                        action: 'add_shapes',
                        actionText: '도형 추가'
                    });
                }
                
                // 발표자 노트 관련 제안
                if (!analysis.hasSpeakerNotes) {
                    suggestions.push({
                        type: 'notes',
                        priority: 'medium',
                        title: '발표자 노트 추가',
                        description: '발표 시 참고할 수 있는 발표자 노트를 추가하세요.',
                        action: 'add_notes',
                        actionText: '노트 생성'
                    });
                }
                
                // 레이아웃 관련 제안
                if (analysis.complexityScore === 'high') {
                    suggestions.push({
                        type: 'layout',
                        priority: 'high',
                        title: '레이아웃 단순화',
                        description: '슬라이드에 요소가 너무 많습니다. 핵심 내용만 남기고 정리하세요.',
                        action: 'simplify_layout',
                        actionText: '레이아웃 최적화'
                    });
                }
                
                // 레이아웃 개선 제안 (새로 추가)
                if (analysis.layout && analysis.layout.score !== 'good') {
                    let layoutSuggestion = {
                        type: 'layout_improvement',
                        priority: analysis.layout.score === 'poor' ? 'high' : 'medium',
                        title: '레이아웃 개선',
                        description: analysis.layout.description,
                        action: 'improve_layout',
                        actionText: '레이아웃 최적화'
                    };
                    
                    // 추가 세부 조언
                    if (analysis.layout.details.overlaps > 0) {
                        layoutSuggestion.description += ' 겹치는 요소들을 분리하세요.';
                    }
                    if (analysis.layout.details.alignment < 0.5) {
                        layoutSuggestion.description += ' 요소들을 수직 또는 수평으로 정렬하세요.';
                    }
                    
                    suggestions.push(layoutSuggestion);
                }
                
                // 시각적 균형 개선 제안 (새로 추가)
                if (analysis.visualBalance && analysis.visualBalance.score !== 'good') {
                    suggestions.push({
                        type: 'visual_balance',
                        priority: analysis.visualBalance.score === 'poor' ? 'high' : 'medium',
                        title: '시각적 균형 개선',
                        description: analysis.visualBalance.description + ' 슬라이드의 빈 공간을 더 효율적으로 활용하세요.',
                        action: 'balance_elements',
                        actionText: '균형 최적화'
                    });
                }
                
                // 텍스트 가독성 개선 제안 (새로 추가)
                if (analysis.readability && analysis.readability.score !== 'good') {
                    let readabilitySuggestion = {
                        type: 'readability',
                        priority: analysis.readability.score === 'poor' ? 'high' : 'medium',
                        title: '텍스트 가독성 향상',
                        description: analysis.readability.description,
                        action: 'improve_readability',
                        actionText: '가독성 개선'
                    };
                    
                    if (analysis.readability.details.smallFontCount > 0) {
                        readabilitySuggestion.description += ' 더 큰 폰트 크기를 사용하세요.';
                    }
                    
                    suggestions.push(readabilitySuggestion);
                }
                
                // 색상 조화 개선 제안 (새로 추가)
                if (analysis.colors && analysis.colors.score !== 'good') {
                    suggestions.push({
                        type: 'color_harmony',
                        priority: analysis.colors.score === 'poor' ? 'high' : 'medium',
                        title: '색상 조화 개선',
                        description: analysis.colors.description + ' 일관된 색상 테마를 사용하세요.',
                        action: 'harmonize_colors',
                        actionText: '색상 최적화'
                    });
                }
                
                // 콘텐츠 품질 개선 제안 (새로 추가)
                if (analysis.contentQuality && analysis.contentQuality.score !== 'good') {
                    const contentSuggestion = {
                        type: 'content_quality',
                        priority: analysis.contentQuality.score === 'low' ? 'high' : 'medium',
                        title: '콘텐츠 품질 향상',
                        description: analysis.contentQuality.description,
                        action: 'improve_content',
                        actionText: '콘텐츠 개선'
                    };
                    
                    if (analysis.contentQuality.details.repetitiveWords.length > 0) {
                        contentSuggestion.description += ` 반복되는 단어(${analysis.contentQuality.details.repetitiveWords.slice(0, 3).join(', ')})를 동의어로 대체하세요.`;
                    }
                    
                    suggestions.push(contentSuggestion);
                }
                
                // 대시보드 제안 (새로 추가)
                if (analysis.elementBreakdown && analysis.elementCount > 3) {
                    const chartCount = analysis.elementBreakdown.chart || 0;
                    if (chartCount === 0 && slideContent.textContent.includes("데이터") || 
                        slideContent.textContent.includes("통계") || 
                        slideContent.textContent.includes("숫자")) {
                        suggestions.push({
                            type: 'data_visualization',
                            priority: 'medium',
                            title: '데이터 시각화 추가',
                            description: '텍스트로 표현된 데이터를 차트나 그래프로 변환하여 정보를 직관적으로 전달하세요.',
                            action: 'add_chart',
                            actionText: '차트 추가'
                        });
                    }
                }
                
                resolve({
                    success: true,
                    slideId: slideContent.slideId,
                    suggestions: suggestions
                });
            })
            .catch(error => {
                reject(error);
            });
    });
}

// 콘텐츠 생성
function generateContent(prompt, type = 'text') {
    return new Promise((resolve, reject) => {
        console.log(`AI Content Generation: ${prompt} (${type})`);
        
        // Content templates based on common slide types
        const templates = {
            title_slide: {
                title: "Compelling Presentation Title",
                subtitle: "Supporting information or presenter name"
            },
            agenda: {
                title: "Today's Agenda",
                items: [
                    "Introduction and Background",
                    "Key Points and Analysis",
                    "Findings and Insights",
                    "Recommendations",
                    "Next Steps and Timeline"
                ]
            },
            bullet_points: {
                title: "Key Points",
                bullets: [
                    "First important point with supporting details",
                    "Second key consideration for the audience",
                    "Third critical element to remember",
                    "Final takeaway that reinforces the message"
                ]
            },
            comparison: {
                title: "Comparison",
                columns: [
                    {
                        title: "Option A",
                        points: ["Benefit 1", "Benefit 2", "Consideration 1"]
                    },
                    {
                        title: "Option B",
                        points: ["Benefit 1", "Benefit 2", "Consideration 1"]
                    }
                ]
            },
            timeline: {
                title: "Project Timeline",
                events: [
                    { date: "January 2023", description: "Project Initiation" },
                    { date: "March 2023", description: "Research Phase" },
                    { date: "June 2023", description: "Development" },
                    { date: "September 2023", description: "Testing" },
                    { date: "December 2023", description: "Launch" }
                ]
            },
            conclusion: {
                title: "Thank You",
                content: "Questions and Discussion",
                contact: "Contact information"
            }
        };

        // Process the prompt to determine which template to use
        let result;
        if (prompt.toLowerCase().includes('title') || type === 'title') {
            result = templates.title_slide;
        } else if (prompt.toLowerCase().includes('agenda') || type === 'agenda') {
            result = templates.agenda;
        } else if (prompt.toLowerCase().includes('bullet') || type === 'bullets') {
            result = templates.bullet_points;
        } else if (prompt.toLowerCase().includes('compar') || type === 'comparison') {
            result = templates.comparison;
        } else if (prompt.toLowerCase().includes('timeline') || type === 'timeline') {
            result = templates.timeline;
        } else if (prompt.toLowerCase().includes('conclusion') || prompt.toLowerCase().includes('thank') || type === 'conclusion') {
            result = templates.conclusion;
        } else {
            // Generate custom content based on the prompt
            result = {
                title: `${prompt}`,
                content: "AI will generate content based on your prompt here."
            };
        }
        
        // Add recommended slide layout
        result.recommendedLayout = type === 'title' ? 'title' : 
                                  type === 'bullets' ? 'title-content' :
                                  type === 'comparison' ? 'two-column' : 'blank';
        
        setTimeout(() => {
            resolve({
                success: true,
                data: result
            });
        }, 300);
    });
}

// 디자인 제안
function suggestDesign() {
    return new Promise((resolve, reject) => {
        const slideContent = getCurrentSlideContent();
        if (!slideContent) {
            reject(new Error('분석할 슬라이드가 없습니다.'));
            return;
        }
        
        // API 요청 시뮬레이션 (실제로는 서버 API 호출)
        setTimeout(() => {
            // 디자인 팔레트 및 레이아웃 제안
            const designSuggestions = {
                colorSchemes: [
                    {
                        name: "전문가형",
                        primary: "#106ebe",
                        secondary: "#2b88d8",
                        accent: "#0078d4",
                        background: "#ffffff",
                        text: "#323130"
                    },
                    {
                        name: "모던 다크",
                        primary: "#0078d4",
                        secondary: "#2b88d8",
                        accent: "#c8c6c4",
                        background: "#201f1e",
                        text: "#f3f2f1"
                    },
                    {
                        name: "활기찬 테마",
                        primary: "#0078d4",
                        secondary: "#2b88d8",
                        accent: "#ffaa44",
                        background: "#ffffff",
                        text: "#323130"
                    }
                ],
                fontPairings: [
                    {
                        heading: "Segoe UI",
                        body: "Calibri"
                    },
                    {
                        heading: "Arial",
                        body: "Verdana"
                    },
                    {
                        heading: "Georgia",
                        body: "Tahoma"
                    }
                ],
                layouts: [
                    {
                        name: "중앙 집중형",
                        description: "제목을 상단 중앙에 배치하고 내용을 중앙에 집중"
                    },
                    {
                        name: "분할 화면",
                        description: "왼쪽에 텍스트, 오른쪽에 이미지 배치"
                    },
                    {
                        name: "격자형",
                        description: "2x2 또는 3x3 격자로 내용 구성"
                    }
                ]
            };
            
            resolve({
                success: true,
                slideId: slideContent.slideId,
                suggestions: designSuggestions
            });
        }, 600);
    });
}

// 이미지 제안
function suggestImages(keywords = []) {
    return new Promise((resolve, reject) => {
        if (!keywords || keywords.length === 0) {
            // 키워드가 제공되지 않은 경우 현재 슬라이드에서 추출
            const slideContent = getCurrentSlideContent();
            if (slideContent) {
                keywords = extractKeywords(slideContent.textContent);
            }
            
            if (keywords.length === 0) {
                reject(new Error('이미지 검색을 위한 키워드가 필요합니다.'));
                return;
            }
        }
        
        // API 요청 시뮬레이션 (실제로는 이미지 API 호출)
        setTimeout(() => {
            // 더미 이미지 URL 생성
            const dummyImages = [
                {
                    url: "https://source.unsplash.com/random/800x600/?business",
                    title: "비즈니스 미팅",
                    keywords: ["비즈니스", "미팅", "협업"]
                },
                {
                    url: "https://source.unsplash.com/random/800x600/?technology",
                    title: "기술 혁신",
                    keywords: ["기술", "혁신", "디지털"]
                },
                {
                    url: "https://source.unsplash.com/random/800x600/?data",
                    title: "데이터 분석",
                    keywords: ["데이터", "분석", "인사이트"]
                },
                {
                    url: "https://source.unsplash.com/random/800x600/?teamwork",
                    title: "팀워크",
                    keywords: ["팀워크", "협업", "소통"]
                }
            ];
            
            resolve({
                success: true,
                query: keywords.join(' '),
                images: dummyImages
            });
        }, 1000);
    });
}

// 키워드 추출 (실제로는 NLP 사용)
function extractKeywords(text) {
    if (!text) return [];
    
    // 간단한 키워드 추출 로직
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    const wordCount = {};
    
    // 단어 빈도 계산
    words.forEach(word => {
        // 불용어 제외
        const stopWords = ['있는', '그리고', '또한', '통해', '위한', '이러한', '하는', '있습니다'];
        if (stopWords.includes(word)) return;
        
        wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // 빈도순 정렬
    const sortedWords = Object.keys(wordCount).sort((a, b) => wordCount[b] - wordCount[a]);
    
    // 상위 5개 키워드 반환 (키워드가 없는 경우 기본 키워드 제공)
    const keywords = sortedWords.slice(0, 5);
    
    if (keywords.length === 0) {
        return ['프레젠테이션', '비즈니스', '전략', '데이터', '혁신'];
    }
    
    return keywords;
}

// 개별 요소 분석
export function analyzeElement(elementId) {
    return new Promise((resolve, reject) => {
        const currentSlideIndex = AppState.currentSlideIndex;
        if (currentSlideIndex < 0 || !AppState.slides[currentSlideIndex]) {
            reject(new Error('현재 슬라이드를 찾을 수 없습니다.'));
            return;
        }
        
        const slide = AppState.slides[currentSlideIndex];
        const element = slide.elements.find(el => el.id === elementId);
        
        if (!element) {
            reject(new Error('선택한 요소를 찾을 수 없습니다.'));
            return;
        }
        
        // 요소 유형별 분석
        setTimeout(() => {
            let analysis = {
                elementId: elementId,
                type: element.type,
                recommendations: []
            };
            
            // 공통 분석 (위치, 크기)
            analyzeElementPosition(element, analysis);
            
            // 타입별 분석
            switch (element.type) {
                case 'text':
                    analyzeTextElement(element, analysis);
                    break;
                case 'image':
                    analyzeImageElement(element, analysis);
                    break;
                case 'shape':
                    analyzeShapeElement(element, analysis);
                    break;
                case 'chart':
                    analyzeChartElement(element, analysis);
                    break;
            }
            
            // 활용성 팁 추가
            addUsageTips(element, analysis);
            
            resolve(analysis);
        }, 300);
    });
}

// 요소 위치 분석
function analyzeElementPosition(element, analysis) {
    const slideWidth = 960;
    const slideHeight = 540;
    
    // 중앙 정렬 확인
    const centerX = slideWidth / 2;
    const elementCenterX = element.x + element.width / 2;
    const isCenteredX = Math.abs(elementCenterX - centerX) < 20;
    
    // 슬라이드 가장자리 확인
    const margin = 20;
    const isTooCloseToEdge = 
        element.x < margin || 
        element.y < margin || 
        (element.x + element.width) > (slideWidth - margin) || 
        (element.y + element.height) > (slideHeight - margin);
    
    // 위치 관련 권장사항
    if (element.type === 'text' && !isCenteredX && element.width < slideWidth * 0.6) {
        analysis.recommendations.push({
            type: 'position',
            priority: 'medium',
            title: '텍스트 중앙 정렬',
            description: '텍스트 요소를 슬라이드 중앙에 배치하면 가독성이 향상됩니다.',
            action: 'center_horizontally'
        });
    }
    
    if (isTooCloseToEdge) {
        analysis.recommendations.push({
            type: 'position',
            priority: 'medium',
            title: '여백 확보',
            description: '요소가 슬라이드 가장자리에 너무 가깝습니다. 적절한 여백을 유지하세요.',
            action: 'adjust_margins'
        });
    }
    
    // 요소 크기가 너무 작은지 확인
    const minSize = 50;
    if (element.width < minSize || element.height < minSize) {
        analysis.recommendations.push({
            type: 'size',
            priority: 'high',
            title: '요소 크기 증가',
            description: '요소가 너무 작아 잘 보이지 않을 수 있습니다. 크기를 키우세요.',
            action: 'increase_size'
        });
    }
}

// 텍스트 요소 분석
function analyzeTextElement(element, analysis) {
    const text = element.content || '';
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    
    // 폰트 크기 분석
    const fontSize = parseInt(element.fontSize) || 16;
    if (fontSize < 18) {
        analysis.recommendations.push({
            type: 'text_size',
            priority: 'high',
            title: '폰트 크기 증가',
            description: '발표 시 가독성을 위해 최소 18pt 이상의 폰트 크기를 사용하세요.',
            action: 'increase_font'
        });
    }
    
    // 텍스트 길이 분석
    if (wordCount > 40) {
        analysis.recommendations.push({
            type: 'text_density',
            priority: 'high',
            title: '텍스트 양 줄이기',
            description: '텍스트가 너무 많습니다. 핵심 포인트만 간결하게 표현하세요.',
            action: 'reduce_text'
        });
    }
    
    // 제목인지 확인
    const isTitle = fontSize >= 28 || (element.fontWeight === 'bold' && fontSize >= 24);
    if (isTitle && text.length > 60) {
        analysis.recommendations.push({
            type: 'title_length',
            priority: 'medium',
            title: '제목 간결화',
            description: '제목은 짧고 명확하게 작성하세요. 8단어 이내가 이상적입니다.',
            action: 'shorten_title'
        });
    }
    
    // 대문자로만 작성된 텍스트 확인
    if (text === text.toUpperCase() && text.length > 20) {
        analysis.recommendations.push({
            type: 'text_format',
            priority: 'low',
            title: '대소문자 혼합 사용',
            description: '긴 텍스트를 모두 대문자로 작성하면 가독성이 떨어집니다.',
            action: 'use_mixed_case'
        });
    }
    
    // 글머리 기호 사용 제안
    if (wordCount > 20 && !text.includes('•') && !text.includes('-') && !text.includes('*')) {
        analysis.recommendations.push({
            type: 'text_format',
            priority: 'medium',
            title: '글머리 기호 사용',
            description: '여러 포인트를 나열할 때는 글머리 기호를 사용하면 가독성이 향상됩니다.',
            action: 'use_bullet_points'
        });
    }
}

// 이미지 요소 분석
function analyzeImageElement(element, analysis) {
    // 이미지 비율 확인
    const aspectRatio = element.width / element.height;
    const isDistorted = aspectRatio < 0.5 || aspectRatio > 2.0;
    
    if (isDistorted) {
        analysis.recommendations.push({
            type: 'image_ratio',
            priority: 'high',
            title: '이미지 비율 조정',
            description: '이미지가 왜곡되어 보입니다. 원래 비율을 유지하세요.',
            action: 'fix_aspect_ratio'
        });
    }
    
    // 이미지 크기 확인
    if (element.width < 200 && element.height < 200) {
        analysis.recommendations.push({
            type: 'image_size',
            priority: 'medium',
            title: '이미지 크기 증가',
            description: '이미지가 너무 작아 세부 내용을 보기 어렵습니다.',
            action: 'increase_image_size'
        });
    }
    
    // 이미지 설명 제안
    if (!element.alt || element.alt === '이미지') {
        analysis.recommendations.push({
            type: 'image_accessibility',
            priority: 'low',
            title: '이미지 설명 추가',
            description: '이미지에 의미 있는 설명을 추가하면 발표 시 참고하기 좋습니다.',
            action: 'add_image_description'
        });
    }
}

// 도형 요소 분석
function analyzeShapeElement(element, analysis) {
    // 도형 색상 분석
    if (element.fillColor === element.strokeColor) {
        analysis.recommendations.push({
            type: 'shape_color',
            priority: 'low',
            title: '테두리 색상 변경',
            description: '도형과 테두리의 색상이 동일하여 구분이 어렵습니다.',
            action: 'change_stroke_color'
        });
    }
    
    // 도형 비율 확인
    const aspectRatio = element.width / element.height;
    const isSquarish = Math.abs(aspectRatio - 1.0) < 0.2;
    
    if (!isSquarish && ['circle', 'square', 'pentagon', 'hexagon', 'octagon'].includes(element.shapeType)) {
        analysis.recommendations.push({
            type: 'shape_ratio',
            priority: 'medium',
            title: '도형 비율 조정',
            description: '이 도형은 가로세로 비율이 동일할 때 가장 잘 보입니다.',
            action: 'equalize_dimensions'
        });
    }
    
    // 회전/왜곡 확인
    if ((element.rotation && element.rotation % 90 !== 0) || element.skewX || element.skewY) {
        analysis.recommendations.push({
            type: 'shape_transform',
            priority: 'low',
            title: '도형 변형 단순화',
            description: '복잡한 회전이나 왜곡은 혼란스러울 수 있습니다. 필요한 경우가 아니라면 단순화하세요.',
            action: 'simplify_transform'
        });
    }
}

// 차트 요소 분석
function analyzeChartElement(element, analysis) {
    // 차트 레이블 확인
    if (!element.title) {
        analysis.recommendations.push({
            type: 'chart_label',
            priority: 'high',
            title: '차트 제목 추가',
            description: '차트에 명확한 제목을 추가하여 데이터 맥락을 설명하세요.',
            action: 'add_chart_title'
        });
    }
    
    // 차트 색상 확인
    if (element.colors && element.colors.length > 6) {
        analysis.recommendations.push({
            type: 'chart_colors',
            priority: 'medium',
            title: '차트 색상 단순화',
            description: '너무 많은 색상은 혼란스러울 수 있습니다. 5-6개 이하의 색상을 사용하세요.',
            action: 'simplify_chart_colors'
        });
    }
    
    // 차트 크기 확인
    if (element.width < 300 || element.height < 200) {
        analysis.recommendations.push({
            type: 'chart_size',
            priority: 'medium',
            title: '차트 크기 증가',
            description: '차트가 너무 작아 데이터를 식별하기 어렵습니다.',
            action: 'increase_chart_size'
        });
    }
}

// 활용성 팁 추가
function addUsageTips(element, analysis) {
    // 요소 타입별 활용 팁
    switch (element.type) {
        case 'text':
            if (element.content && element.content.length > 100) {
                analysis.recommendations.push({
                    type: 'usage_tip',
                    priority: 'low',
                    title: '요약 & 발표 팁',
                    description: '발표 시 모든 텍스트를 읽지 말고 핵심 포인트를 강조하세요. 청중이 스스로 읽을 시간을 주세요.',
                    action: 'view_presentation_tips'
                });
            }
            break;
            
        case 'image':
            analysis.recommendations.push({
                type: 'usage_tip',
                priority: 'low',
                title: '이미지 활용 팁',
                description: '발표 시 이미지의 중요한 부분을 손짓이나 포인터로 가리키면서 설명하면 효과적입니다.',
                action: 'view_image_tips'
            });
            break;
            
        case 'chart':
            analysis.recommendations.push({
                type: 'usage_tip',
                priority: 'low',
                title: '차트 설명 팁',
                description: '차트를 설명할 때는 전체적인 추세를 먼저 언급한 후 특이점을 강조하세요.',
                action: 'view_chart_tips'
            });
            break;
    }
    
    // 슬라이드 내 유일한 요소인지 확인
    const slide = AppState.slides[AppState.currentSlideIndex];
    if (slide && slide.elements.length === 1) {
        analysis.recommendations.push({
            type: 'usage_tip',
            priority: 'medium',
            title: '요소 추가 제안',
            description: '단일 요소만 있는 슬라이드는 단조로울 수 있습니다. 보조 요소를 추가하는 것이 좋습니다.',
            action: 'add_supporting_elements'
        });
    }
}

// Add a new function for full presentation analysis
export function analyzePresentationStructure() {
    return new Promise((resolve) => {
        const presentationContent = getPresentationContent();
        if (!presentationContent || presentationContent.slides.length === 0) {
            resolve({
                success: false,
                message: "No presentation content to analyze"
            });
            return;
        }
        
        // Analyze overall structure
        const slideCount = presentationContent.slides.length;
        const hasTitleSlide = presentationContent.slides[0]?.textContent?.toLowerCase().includes('title') || 
                             presentationContent.slides[0]?.textContent?.length < 50;
        
        const hasAgendaSlide = presentationContent.slides.some(slide => 
            slide.textContent.toLowerCase().includes('agenda') || 
            slide.textContent.toLowerCase().includes('contents') ||
            slide.textContent.toLowerCase().includes('overview')
        );
        
        const hasConclusionSlide = presentationContent.slides.some(slide => 
            slide.textContent.toLowerCase().includes('conclusion') || 
            slide.textContent.toLowerCase().includes('thank you') ||
            slide.textContent.toLowerCase().includes('questions')
        );
        
        // Analyze content consistency
        const textLengths = presentationContent.slides.map(slide => slide.textContent.length);
        const avgTextLength = textLengths.reduce((sum, len) => sum + len, 0) / slideCount;
        
        const isConsistentLength = textLengths.every(len => len < avgTextLength * 2 && len > avgTextLength * 0.5);
        
        // Calculate estimated presentation time (assuming 1-2 minutes per content slide)
        const estimatedTime = Math.round(slideCount * 1.5);
        
        // Find missing elements in the presentation structure
        const missingElements = [];
        if (!hasTitleSlide) missingElements.push("Title slide");
        if (!hasAgendaSlide) missingElements.push("Agenda slide");
        if (!hasConclusionSlide) missingElements.push("Conclusion slide");
        
        // Generate improvement suggestions
        const suggestions = [];
        
        if (missingElements.length > 0) {
            suggestions.push({
                type: "structure",
                title: "Complete Your Presentation Structure",
                description: `Add these missing elements: ${missingElements.join(', ')}`,
                importance: "high"
            });
        }
        
        if (!isConsistentLength) {
            suggestions.push({
                type: "content",
                title: "Balance Content Across Slides",
                description: "Some slides have significantly more content than others. Consider redistributing text for better balance.",
                importance: "medium"
            });
        }
        
        if (slideCount < 5) {
            suggestions.push({
                type: "content",
                title: "Expand Your Presentation",
                description: "Your presentation is quite short. Consider adding more slides to fully develop your message.",
                importance: "medium"
            });
        } else if (slideCount > 20) {
            suggestions.push({
                type: "content",
                title: "Consider Condensing",
                description: `Your presentation has ${slideCount} slides which may be too long for your audience's attention span.`,
                importance: "medium"
            });
        }
        
        // Check for speaker notes
        const slidesWithNotes = presentationContent.slides.filter(slide => slide.notes && slide.notes.length > 0).length;
        const percentageWithNotes = (slidesWithNotes / slideCount) * 100;
        
        if (percentageWithNotes < 50) {
            suggestions.push({
                type: "presentation",
                title: "Add Speaker Notes",
                description: "Only " + Math.round(percentageWithNotes) + "% of your slides have speaker notes. Add notes to help during delivery.",
                importance: "medium"
            });
        }
        
        resolve({
            success: true,
            analysis: {
                slideCount,
                structure: {
                    hasTitleSlide,
                    hasAgendaSlide,
                    hasConclusionSlide,
                    isBalanced: isConsistentLength,
                    missingElements
                },
                estimatedTime: {
                    minutes: estimatedTime,
                    appropriate: estimatedTime >= 5 && estimatedTime <= 30
                },
                contentBalance: {
                    balanced: isConsistentLength,
                    averageTextLength: Math.round(avgTextLength)
                },
                notes: {
                    slidesWithNotes,
                    percentageWithNotes,
                    sufficient: percentageWithNotes >= 50
                }
            },
            suggestions
        });
    });
}

// Add a function to generate complete presentation templates
export function generatePresentationTemplate(topic, style = 'business') {
    return new Promise((resolve) => {
        console.log(`Generating ${style} presentation template for: ${topic}`);
        
        // Different templates based on presentation style
        const templates = {
            business: [
                { title: topic, subtitle: "Company Name | Date", layout: "title" },
                { title: "Agenda", bullets: ["Introduction", "Current Situation", "Analysis", "Recommendations", "Next Steps"], layout: "title-content" },
                { title: "Introduction", bullets: ["Background", "Project Scope", "Objectives"], layout: "title-content" },
                { title: "Current Situation", bullets: ["Market Analysis", "Challenges", "Opportunities"], layout: "title-content" },
                { title: "Analysis", bullets: ["Key Findings", "Data Insights", "Trends"], layout: "title-content" },
                { title: "Recommendations", bullets: ["Strategic Options", "Proposed Solution", "Benefits"], layout: "title-content" },
                { title: "Implementation Plan", bullets: ["Timeline", "Resources", "Budget"], layout: "title-content" },
                { title: "Next Steps", bullets: ["Immediate Actions", "Responsibilities", "Follow-up"], layout: "title-content" },
                { title: "Thank You", subtitle: "Questions & Discussion", layout: "title" }
            ],
            educational: [
                { title: topic, subtitle: "Educational Module", layout: "title" },
                { title: "Learning Objectives", bullets: ["What we'll learn", "Why it matters", "How we'll apply it"], layout: "title-content" },
                { title: "Key Concept 1", content: "Explanation of the first key concept", layout: "title-content" },
                { title: "Key Concept 2", content: "Explanation of the second key concept", layout: "title-content" },
                { title: "Key Concept 3", content: "Explanation of the third key concept", layout: "title-content" },
                { title: "Practical Application", bullets: ["Example 1", "Example 2", "Example 3"], layout: "title-content" },
                { title: "Group Activity", bullets: ["Instructions", "Objectives", "Time allowed"], layout: "title-content" },
                { title: "Summary", bullets: ["What we learned", "Key takeaways", "Further reading"], layout: "title-content" }
            ],
            creative: [
                { title: topic, subtitle: "A Creative Presentation", layout: "title" },
                { title: "The Big Idea", content: "One powerful statement about the concept", layout: "title-content" },
                { title: "Inspiration", bullets: ["Source 1", "Source 2", "Source 3"], layout: "title-content" },
                { title: "Visual Concept", image: true, description: "Visual representation will go here", layout: "blank" },
                { title: "The Process", timeline: ["Ideation", "Exploration", "Refinement", "Final Concept"], layout: "title-content" },
                { title: "Applications", bullets: ["Application 1", "Application 2", "Application 3"], layout: "two-column" },
                { title: "Next Steps", bullets: ["Development", "Testing", "Launch"], layout: "title-content" },
                { title: "Thank You", subtitle: "Questions & Feedback", layout: "title" }
            ]
        };
        
        // Select the appropriate template
        const selectedTemplate = templates[style] || templates.business;
        
        // Process the template to include the topic
        const processedTemplate = selectedTemplate.map(slide => {
            // Create a copy to avoid modifying the original
            const processedSlide = {...slide};
            
            // Replace placeholders with the actual topic
            if (processedSlide.title && processedSlide.title.includes('topic')) {
                processedSlide.title = processedSlide.title.replace('topic', topic);
            }
            
            return processedSlide;
        });
        
        setTimeout(() => {
            resolve({
                success: true,
                template: processedTemplate,
                slideCount: processedTemplate.length,
                style: style
            });
        }, 500);
    });
}

// AI 모듈 내보내기
export default {
    initAI,
    analyzeCurrentSlide,
    suggestImprovements,
    generateContent,
    suggestDesign,
    suggestImages,
    analyzeElement
}; 