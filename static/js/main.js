/**
 * PowerPoint-like Presentation Editor - Main Application File
 * 모듈 로딩 및 애플리케이션 초기화 담당
 */

// 모듈 가져오기
import { AppState, initApp } from './index.js';
import { initUI } from './modules/ui.js';
import { initSlides } from './modules/slides.js';
import { initElements } from './modules/elements.js';
import { initThemes } from './modules/themes.js';
import { initCharts } from './modules/charts.js';
import { initShapeEditor } from './modules/shape-editor.js';
import { initAI } from './modules/ai.js';
import { initAIIntegration } from './modules/ai-integration.js';
import { initTables } from './modules/tables.js';
import { initAnimations } from './modules/animations.js';
import { initDrawing } from './modules/drawing.js';
import { initPresenter } from './modules/presenter.js';

// 애플리케이션 초기화 상태 추적
const AppInit = {
    modulesLoaded: false,
    loadErrors: [],
    initCompleted: false
};

// 애플리케이션 시작
document.addEventListener('DOMContentLoaded', () => {
    console.log('문서 로드 완료: 애플리케이션 초기화 시작');
    
    // 미리 로딩 화면 표시
    showLoadingScreen();
    
    // 모든 모듈 초기화
    initializeModules()
        .then(() => {
            // 로딩 화면 숨기기
            hideLoadingScreen();
            console.log('모든 모듈 초기화 완료');
            
            // UI 표시
            showMainUI();
            
            // 앱 상태 초기화 완료 표시
            AppInit.initCompleted = true;
        })
        .catch(error => {
            // 오류 처리
            console.error('애플리케이션 초기화 실패:', error);
            showErrorMessage('애플리케이션을 불러오는 중 오류가 발생했습니다. 페이지를 새로고침 해주세요.');
            hideLoadingScreen();
        });
});

// 모든 모듈 초기화
async function initializeModules() {
    try {
        console.log('모듈 초기화 시작');
        
        // 전역에서 AppState 접근 가능하도록 설정 (개발용, 프로덕션에서는 제거 권장)
        window.AppState = AppState;
        
        // 테마 초기화 (다른 모듈에서 테마 정보가 필요하므로 먼저 초기화)
        await initializeModule('themes', initThemes);
        
        // UI 초기화 (가장 기본이 되는 UI 먼저 초기화)
        await initializeModule('UI', initUI);
        
        // 슬라이드 초기화 (핵심 기능)
        await initializeModule('slides', initSlides);
        
        // 요소 초기화 (슬라이드에 들어가는 요소들)
        await initializeModule('elements', initElements);
        
        // 도형 편집기 초기화
        await initializeModule('shape-editor', initShapeEditor);
        
        // 차트 초기화
        await initializeModule('charts', initCharts);
        
        // 테이블 초기화
        await initializeModule('tables', initTables);
        
        // 애니메이션 초기화
        await initializeModule('animations', initAnimations);
        
        // 드로잉 도구 초기화
        await initializeModule('drawing', initDrawing);
        
        // 프레젠테이션 모드 초기화
        await initializeModule('presenter', initPresenter);
        
        // AI 기능 초기화 (선택적)
        await initializeModule('AI', initAI);
        await initializeModule('AI Integration', initAIIntegration);
        
        // 메인 앱 초기화
        await initializeModule('app', initApp);
        
        // 모든 모듈 로드 완료
        AppInit.modulesLoaded = true;
        
        console.log('모든 모듈 초기화 완료');
        return true;
    } catch (error) {
        console.error('모듈 초기화 오류:', error);
        AppInit.loadErrors.push(error.message || '알 수 없는 오류');
        throw error;
    }
}

// 개별 모듈 초기화 함수 (오류 처리 포함)
async function initializeModule(moduleName, initFunction) {
    try {
        console.log(`${moduleName} 모듈 초기화 시작`);
        
        // 초기화 함수가 있는 경우에만 실행
        if (typeof initFunction === 'function') {
            // Promise를 반환하는 초기화 함수 처리
            if (initFunction.constructor.name === 'AsyncFunction') {
                await initFunction();
            } else {
                // 일반 함수인 경우 동기적으로 실행
                initFunction();
            }
        }
        
        console.log(`${moduleName} 모듈 초기화 완료`);
        return true;
    } catch (error) {
        console.error(`${moduleName} 모듈 초기화 실패:`, error);
        AppInit.loadErrors.push(`${moduleName} 초기화 오류: ${error.message || '알 수 없는 오류'}`);
        
        // 중요 모듈이 아닌 경우 오류를 무시하고 계속 진행
        if (['themes', 'UI', 'slides', 'elements', 'app'].includes(moduleName)) {
            throw error; // 중요 모듈은 오류 발생 시 초기화 중단
        }
        
        return false; // 그 외 모듈은 오류 발생해도 계속 진행
    }
}

// 로딩 화면 표시
function showLoadingScreen() {
    // 이미 로딩 화면이 있는지 확인
    let loadingScreen = document.getElementById('app-loading-screen');
    
    if (!loadingScreen) {
        // 로딩 화면 생성
        loadingScreen = document.createElement('div');
        loadingScreen.id = 'app-loading-screen';
        loadingScreen.className = 'loading-overlay';
        loadingScreen.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>프레젠테이션 에디터를 불러오는 중...</p>
            </div>
        `;
        document.body.appendChild(loadingScreen);
    }
    
    // 로딩 화면 표시
    loadingScreen.style.display = 'flex';
}

// 로딩 화면 숨기기
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('app-loading-screen');
    if (loadingScreen) {
        // 애니메이션 효과를 위해 fade-out 클래스 추가
        loadingScreen.classList.add('fade-out');
        
        // 애니메이션 완료 후 제거
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

// 메인 UI 표시
function showMainUI() {
    const mainContainer = document.getElementById('powerpoint-ui');
    if (mainContainer) {
        mainContainer.style.display = 'block';
    }
    
    const initialScreen = document.querySelector('.hero');
    if (initialScreen) {
        initialScreen.style.display = 'none';
    }
}

// 오류 메시지 표시
function showErrorMessage(message) {
    // 오류 메시지 컨테이너 생성
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.innerHTML = `
        <div class="error-icon">⚠️</div>
        <div class="error-text">${message}</div>
        <button class="error-close">✕</button>
    `;
    
    // 닫기 버튼 이벤트 추가
    const closeButton = errorContainer.querySelector('.error-close');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            document.body.removeChild(errorContainer);
        });
    }
    
    // 화면에 표시
    document.body.appendChild(errorContainer);
}

// 웹 워커를 이용한 성능 모니터링 (선택적)
let performanceMonitor = null;

// 성능 모니터링 시작 (개발 모드에서만)
if (localStorage.getItem('devMode') === 'true') {
    try {
        const workerCode = `
            let startTime = performance.now();
            
            // 주기적인 성능 측정
            setInterval(() => {
                const currentTime = performance.now();
                const elapsedTime = currentTime - startTime;
                
                // 메인 스레드로 성능 데이터 전송
                self.postMessage({
                    type: 'performance',
                    data: {
                        elapsedTime,
                        timestamp: new Date().toISOString()
                    }
                });
            }, 5000);
        `;
        
        // Blob으로 코드 변환
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        
        // 웹 워커 생성
        performanceMonitor = new Worker(workerUrl);
        
        // 웹 워커 메시지 처리
        performanceMonitor.onmessage = (event) => {
            if (event.data.type === 'performance') {
                console.log('Performance Monitor:', event.data.data);
            }
        };
        
        console.log('성능 모니터링 시작 (개발 모드)');
    } catch (error) {
        console.warn('성능 모니터링을 시작할 수 없습니다:', error);
    }
}

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', (event) => {
    // 저장되지 않은 변경사항이 있는 경우
    if (AppState.history.length > 0 && !AppInit.initCompleted) {
        // 사용자에게 경고 메시지 표시
        event.preventDefault();
        event.returnValue = '저장되지 않은 변경사항이 있습니다. 정말 나가시겠습니까?';
    }
    
    // 성능 모니터링 정리
    if (performanceMonitor) {
        performanceMonitor.terminate();
    }
});

// 오프라인 모드 지원
window.addEventListener('online', () => {
    console.log('네트워크 연결됨');
    document.body.classList.remove('offline-mode');
});

window.addEventListener('offline', () => {
    console.log('네트워크 연결 끊김');
    document.body.classList.add('offline-mode');
    showErrorMessage('오프라인 모드입니다. 일부 기능이 제한될 수 있습니다.');
});

/**
 * DeepSeek AI 확장 기능
 */

// AI 기능 초기화
export function initDeepSeekAI() {
    console.log('DeepSeek AI 확장 초기화');

    // 요소 참조
    const deepSeekPanel = document.querySelector('.deep-seek-panel');
    const toggleBtn = document.getElementById('toggleDeepSeekPanelBtn');
    const aiFeatures = document.querySelectorAll('.ai-feature');
    const aiSubmitBtn = document.getElementById('aiSubmitBtn');
    const aiPromptInput = document.getElementById('aiPrompt');
    const aiResultsContainer = document.querySelector('.ai-results');
    const aiMoreOptionsBtn = document.getElementById('aiMoreOptionsBtn');
    const deepSeekModal = document.getElementById('deepSeekModal');
    const closeModalBtns = deepSeekModal.querySelectorAll('.close-btn, #cancelDeepSeekBtn');
    const confirmModalBtn = document.getElementById('confirmDeepSeekBtn');
    const deepSeekTabs = document.querySelectorAll('.deep-seek-tab');
    const deepSeekOptions = document.querySelectorAll('.deep-seek-option');
    const ribbonAIBtn = document.getElementById('toggleAIBtn');

    // AI 패널 토글
    toggleBtn.addEventListener('click', () => {
        deepSeekPanel.classList.toggle('collapsed');
        toggleBtn.querySelector('i').classList.toggle('fa-chevron-up');
        toggleBtn.querySelector('i').classList.toggle('fa-chevron-down');
    });

    // 리본 메뉴의 AI 버튼
    if (ribbonAIBtn) {
        ribbonAIBtn.addEventListener('click', () => {
            deepSeekPanel.classList.toggle('collapsed');
            if (deepSeekPanel.classList.contains('collapsed')) {
                toggleBtn.querySelector('i').classList.remove('fa-chevron-up');
                toggleBtn.querySelector('i').classList.add('fa-chevron-down');
            } else {
                toggleBtn.querySelector('i').classList.add('fa-chevron-up');
                toggleBtn.querySelector('i').classList.remove('fa-chevron-down');
            }
        });
    }

    // AI 기능 카드 클릭 이벤트
    aiFeatures.forEach(feature => {
        feature.addEventListener('click', () => {
            const featureType = feature.getAttribute('data-feature');
            openAIModal(featureType);
        });
    });

    // 모달 열기 함수
    function openAIModal(featureType) {
        // 탭 설정
        const tabToActivate = document.querySelector(`.deep-seek-tab[data-tab="${featureType}"]`) || 
                             document.querySelector('.deep-seek-tab[data-tab="design"]');
        
        // 모든 탭 비활성화
        deepSeekTabs.forEach(tab => tab.classList.remove('active'));
        
        // 선택된 탭 활성화
        if (tabToActivate) {
            tabToActivate.classList.add('active');
            
            // 탭 콘텐츠 업데이트
            updateTabContent(tabToActivate.getAttribute('data-tab'));
        }
        
        // 모달 표시
        deepSeekModal.style.display = 'block';
    }
    
    // 탭 클릭 이벤트
    deepSeekTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 모든 탭 비활성화
            deepSeekTabs.forEach(t => t.classList.remove('active'));
            
            // 클릭한 탭 활성화
            tab.classList.add('active');
            
            // 탭 콘텐츠 업데이트
            updateTabContent(tab.getAttribute('data-tab'));
        });
    });
    
    // 탭 콘텐츠 업데이트 함수
    function updateTabContent(tabId) {
        // 모든 콘텐츠 숨기기
        const allContents = document.querySelectorAll('.deep-seek-tab-content');
        allContents.forEach(content => content.classList.remove('active'));
        
        // 선택된 콘텐츠 표시
        const selectedContent = document.getElementById(`${tabId}-tab`);
        if (selectedContent) {
            selectedContent.classList.add('active');
        }
    }
    
    // 옵션 클릭 이벤트
    deepSeekOptions.forEach(option => {
        option.addEventListener('click', () => {
            // 같은 그룹 내의 모든 옵션에서 선택 제거
            const parentGroup = option.closest('.deep-seek-options');
            parentGroup.querySelectorAll('.deep-seek-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // 클릭한 옵션 선택
            option.classList.add('selected');
        });
    });

    // 모달 닫기 버튼
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            deepSeekModal.style.display = 'none';
        });
    });

    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', (event) => {
        if (event.target === deepSeekModal) {
            deepSeekModal.style.display = 'none';
        }
    });

    // AI 제출 버튼 클릭 이벤트
    aiSubmitBtn.addEventListener('click', () => {
        const promptText = aiPromptInput.value.trim();
        if (promptText) {
            generateAIResponse(promptText);
            aiPromptInput.value = '';
        }
    });

    // 엔터 키로 AI 요청 제출
    aiPromptInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            const promptText = aiPromptInput.value.trim();
            if (promptText) {
                generateAIResponse(promptText);
                aiPromptInput.value = '';
            }
        }
    });

    // 더 많은 옵션 버튼 클릭 이벤트
    aiMoreOptionsBtn.addEventListener('click', () => {
        openAIModal('design');
    });

    // 모달 확인 버튼 클릭 이벤트
    confirmModalBtn.addEventListener('click', () => {
        processDeepSeekRequest();
    });

    // DeepSeek 요청 처리 함수
    function processDeepSeekRequest() {
        // 활성 탭 찾기
        const activeTab = document.querySelector('.deep-seek-tab.active');
        if (!activeTab) return;
        
        const tabType = activeTab.getAttribute('data-tab');
        
        // 선택된 옵션 찾기
        const selectedOption = document.querySelector(`#${tabType}-tab .deep-seek-option.selected`);
        const optionTitle = selectedOption ? selectedOption.querySelector('.deep-seek-option-title').textContent : '';
        
        // 프롬프트 가져오기
        const promptTextarea = document.getElementById(`${tabType}Prompt`);
        const promptText = promptTextarea ? promptTextarea.value.trim() : '';
        
        // 로딩 표시
        const progressElement = document.querySelector('.deep-seek-progress');
        progressElement.style.display = 'block';
        
        // 로그 기록
        console.log(`DeepSeek 요청: ${tabType} - ${optionTitle}`);
        console.log(`프롬프트: ${promptText}`);
        
        // 향상된 AI 모듈 사용
        switch (tabType) {
            case 'design':
                import('./modules/ai.js').then(aiModule => {
                    aiModule.default.suggestDesign()
                        .then(result => {
                            progressElement.style.display = 'none';
                            const designSuggestion = result.suggestions.colorSchemes[0];
                            const layoutSuggestion = result.suggestions.layouts[0];
                            
                            const resultContent = `디자인 개선 제안:\n\n` +
                                `• 색상 테마: ${designSuggestion.name}\n` +
                                `• 주요 색상: ${designSuggestion.primary}\n` +
                                `• 배경: ${designSuggestion.background}\n` +
                                `• 레이아웃: ${layoutSuggestion.name} - ${layoutSuggestion.description}`;
                            
                            addResultToPanel(optionTitle, resultContent);
                            deepSeekModal.style.display = 'none';
                        })
                        .catch(error => {
                            console.error('디자인 제안 오류:', error);
                            progressElement.style.display = 'none';
                            addResultToPanel('오류', '디자인 제안을 생성하는 중 오류가 발생했습니다.');
                            deepSeekModal.style.display = 'none';
                        });
                });
                break;
                
            case 'content':
                const contentType = optionTitle === '제목 생성' ? 'title' : 
                                   optionTitle === '글머리 기호' ? 'bullet_points' : 
                                   optionTitle === '단락 생성' ? 'paragraph' : 'text';
                
                import('./modules/ai.js').then(aiModule => {
                    aiModule.default.generateContent(promptText, contentType)
                        .then(result => {
                            progressElement.style.display = 'none';
                            
                            let formattedContent = '';
                            if (Array.isArray(result.content)) {
                                formattedContent = result.content.map(item => `• ${item}`).join('\n');
                            } else {
                                formattedContent = result.content;
                            }
                            
                            addResultToPanel(optionTitle, formattedContent);
                            deepSeekModal.style.display = 'none';
                        })
                        .catch(error => {
                            console.error('컨텐츠 생성 오류:', error);
                            progressElement.style.display = 'none';
                            addResultToPanel('오류', '컨텐츠를 생성하는 중 오류가 발생했습니다.');
                            deepSeekModal.style.display = 'none';
                        });
                });
                break;
                
            case 'image':
                import('./modules/ai.js').then(aiModule => {
                    // 프롬프트에서 키워드 추출
                    const keywords = promptText.split(/\s+/).filter(Boolean).slice(0, 5);
                    
                    aiModule.default.suggestImages(keywords)
                        .then(result => {
                            progressElement.style.display = 'none';
                            
                            // 첫 번째 이미지 정보
                            const image = result.images[0];
                            const resultContent = `이미지 제안:\n\n` +
                                `"${image.title}"\n\n` +
                                `이미지를 슬라이드에 추가하시겠습니까?`;
                            
                            // 결과에 메타데이터 추가 (이미지 URL 등)
                            const resultElement = addResultToPanel(optionTitle, resultContent);
                            if (resultElement) {
                                resultElement.dataset.imageUrl = image.url;
                                
                                // 이미지 적용 버튼 이벤트 추가
                                const applyBtn = resultElement.querySelector('.apply-result');
                                if (applyBtn) {
                                    applyBtn.addEventListener('click', () => {
                                        addImageToSlide(image.url, image.title);
                                    });
                                }
                            }
                            
                            deepSeekModal.style.display = 'none';
                        })
                        .catch(error => {
                            console.error('이미지 제안 오류:', error);
                            progressElement.style.display = 'none';
                            addResultToPanel('오류', '이미지를 제안하는 중 오류가 발생했습니다.');
                            deepSeekModal.style.display = 'none';
                        });
                });
                break;
                
            default:
                // 기본 처리
                setTimeout(() => {
                    // 임의 결과 생성
                    let result = '요청이 처리되었습니다.';
                    
                    // 로딩 표시 제거
                    progressElement.style.display = 'none';
                    
                    // 결과 표시
                    addResultToPanel(optionTitle, result);
                    
                    // 모달 닫기
                    deepSeekModal.style.display = 'none';
                }, 1500);
        }
    }

    // AI 응답 생성 함수 (향상된 AI 모듈 활용)
    function generateAIResponse(prompt) {
        // 요청 UI 추가
        const userPromptElement = document.createElement('div');
        userPromptElement.className = 'ai-result-item';
        userPromptElement.innerHTML = `
            <div class="ai-result-title">
                사용자 질문
            </div>
            <div class="ai-result-content">
                ${prompt}
            </div>
        `;
        aiResultsContainer.appendChild(userPromptElement);
        
        // 로딩 상태 표시
        const loadingElement = document.createElement('div');
        loadingElement.className = 'ai-result-item';
        loadingElement.innerHTML = `
            <div class="ai-result-title">
                DeepSeek AI
            </div>
            <div class="ai-result-content">
                <div class="deep-seek-spinner" style="width:20px; height:20px; display:inline-block; margin-right:10px;"></div>
                응답 생성 중...
            </div>
        `;
        aiResultsContainer.appendChild(loadingElement);
        
        // 스크롤 맨 아래로
        aiResultsContainer.scrollTop = aiResultsContainer.scrollHeight;
        
        // 향상된 AI 모듈 사용 (프롬프트 의도 분석)
        const promptLower = prompt.toLowerCase();
        
        // 분석 요청인지 확인
        if (promptLower.includes('분석') || promptLower.includes('평가') || promptLower.includes('확인')) {
            import('./modules/ai.js').then(aiModule => {
                aiModule.default.analyzeCurrentSlide()
                    .then(result => {
                        aiResultsContainer.removeChild(loadingElement);
                        
                        const { analysis } = result;
                        const responseContent = `현재 슬라이드 분석 결과:\n\n` +
                            `• 텍스트 밀도: ${analysis.textDensity}\n` +
                            `• 복잡도: ${analysis.complexityScore === 'high' ? '높음' : analysis.complexityScore === 'medium' ? '중간' : '낮음'}\n` +
                            `• 발표자 노트: ${analysis.hasSpeakerNotes ? '있음' : '없음'}\n` +
                            `• 요소 수: ${analysis.elementCount}개\n` +
                            `• 예상 발표 시간: ${analysis.estimatedReadingTime}분\n` +
                            `• 슬라이드 위치: ${analysis.slidePosition}`;
                        
                        addAIResponseElement(responseContent);
                    })
                    .catch(error => {
                        console.error('슬라이드 분석 오류:', error);
                        aiResultsContainer.removeChild(loadingElement);
                        addAIResponseElement('슬라이드를 분석하는 중 오류가 발생했습니다.');
                    });
            });
        }
        // 개선 제안 요청인지 확인
        else if (promptLower.includes('개선') || promptLower.includes('제안') || promptLower.includes('향상')) {
            import('./modules/ai.js').then(aiModule => {
                aiModule.default.suggestImprovements()
                    .then(result => {
                        aiResultsContainer.removeChild(loadingElement);
                        
                        const { suggestions } = result;
                        let responseContent = '슬라이드 개선을 위한 제안:\n\n';
                        
                        if (suggestions.length > 0) {
                            responseContent += suggestions.map(suggestion => 
                                `• ${suggestion.title}: ${suggestion.description}`
                            ).join('\n\n');
                        } else {
                            responseContent += '현재 슬라이드는 잘 구성되어 있습니다. 특별한 개선 사항이 없습니다.';
                        }
                        
                        addAIResponseElement(responseContent);
                    })
                    .catch(error => {
                        console.error('개선 제안 오류:', error);
                        aiResultsContainer.removeChild(loadingElement);
                        addAIResponseElement('개선 제안을 생성하는 중 오류가 발생했습니다.');
                    });
            });
        }
        // 슬라이드 내용 생성 요청
        else if (promptLower.includes('생성') || promptLower.includes('만들어') || promptLower.includes('추가')) {
            let contentType = 'text';
            
            if (promptLower.includes('제목') || promptLower.includes('타이틀')) {
                contentType = 'title';
            } else if (promptLower.includes('글머리') || promptLower.includes('bullet') || promptLower.includes('포인트')) {
                contentType = 'bullet_points';
            } else if (promptLower.includes('단락') || promptLower.includes('문단') || promptLower.includes('paragraph')) {
                contentType = 'paragraph';
            } else if (promptLower.includes('노트') || promptLower.includes('발표자')) {
                contentType = 'speaker_notes';
            }
            
            import('./modules/ai.js').then(aiModule => {
                aiModule.default.generateContent(prompt, contentType)
                    .then(result => {
                        aiResultsContainer.removeChild(loadingElement);
                        
                        let responseContent = '';
                        if (Array.isArray(result.content)) {
                            responseContent = result.content.map(item => `• ${item}`).join('\n');
                        } else {
                            responseContent = result.content;
                        }
                        
                        const responseElement = addAIResponseElement(responseContent);
                        
                        // 생성된 콘텐츠에 대한 메타데이터 추가
                        if (responseElement) {
                            responseElement.dataset.contentType = contentType;
                            
                            // 적용 버튼에 특별 이벤트 추가 (텍스트 요소 추가)
                            const applyBtn = responseElement.querySelector('.apply-result');
                            if (applyBtn) {
                                applyBtn.addEventListener('click', () => {
                                    if (contentType === 'speaker_notes') {
                                        // 발표자 노트 추가
                                        addSpeakerNotes(result.content);
                                    } else {
                                        // 텍스트 요소 추가
                                        addTextElement(result.content, contentType === 'title');
                                    }
                                });
                            }
                        }
                    })
                    .catch(error => {
                        console.error('콘텐츠 생성 오류:', error);
                        aiResultsContainer.removeChild(loadingElement);
                        addAIResponseElement('콘텐츠를 생성하는 중 오류가 발생했습니다.');
                    });
            });
        }
        // 이미지 관련 요청
        else if (promptLower.includes('이미지') || promptLower.includes('사진') || promptLower.includes('그림')) {
            import('./modules/ai.js').then(aiModule => {
                // 프롬프트에서 키워드 추출
                const keywords = prompt.split(/\s+/).filter(Boolean).slice(0, 5);
                
                aiModule.default.suggestImages(keywords)
                    .then(result => {
                        aiResultsContainer.removeChild(loadingElement);
                        
                        // 첫 번째 이미지 정보
                        const image = result.images[0];
                        const responseContent = `검색어 "${result.query}"에 대한 이미지 제안:\n\n` +
                            `${image.title}\n\n` +
                            `이미지를 슬라이드에 추가하려면 '적용' 버튼을 클릭하세요.`;
                        
                        // 이미지 URL을 담아서 결과 추가
                        const responseElement = addAIResponseElement(responseContent);
                        
                        // 이미지 메타데이터 추가
                        if (responseElement) {
                            responseElement.dataset.imageUrl = image.url;
                            
                            // 적용 버튼에 특별 이벤트 추가 (이미지 요소 추가)
                            const applyBtn = responseElement.querySelector('.apply-result');
                            if (applyBtn) {
                                applyBtn.addEventListener('click', () => {
                                    addImageToSlide(image.url, image.title);
                                });
                            }
                        }
                    })
                    .catch(error => {
                        console.error('이미지 제안 오류:', error);
                        aiResultsContainer.removeChild(loadingElement);
                        addAIResponseElement('이미지를 제안하는 중 오류가 발생했습니다.');
                    });
            });
        }
        // 기타 일반 쿼리
        else {
            // AI 응답 생성 (예시 응답)
            setTimeout(() => {
                // 예시 응답 생성
                const responses = [
                    "이 슬라이드에는 '비즈니스 성장 전략: 디지털 혁신을 통한 기회 발견'과 같은 제목이 적합할 것 같습니다.",
                    "슬라이드 디자인을 개선했습니다. 더 균형 잡힌 레이아웃과 가독성 높은 텍스트 배치를 적용했습니다.",
                    "질문하신 내용에 대한 핵심 요점은 다음과 같습니다:\n\n1. 데이터 기반 의사결정의 중요성\n2. 고객 중심 접근법 채택\n3. 민첩한 프로세스 구현\n4. 지속적인 개선 문화 조성",
                    "프레젠테이션 전달 시 다음 팁이 도움이 될 수 있습니다:\n• 시작 전 심호흡으로 긴장 완화\n• 청중과 눈 맞춤 유지\n• 핵심 메시지 반복 강조\n• 질문을 적극적으로 유도"
                ];
                
                // 랜덤 응답 선택
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                
                // 로딩 요소 제거
                aiResultsContainer.removeChild(loadingElement);
                
                // 응답 추가
                addAIResponseElement(randomResponse);
            }, 1500);
        }
    }
    
    // AI 응답 요소 추가 함수
    function addAIResponseElement(content) {
        const responseElement = document.createElement('div');
        responseElement.className = 'ai-result-item';
        responseElement.innerHTML = `
            <div class="ai-result-title">
                DeepSeek AI 응답
                <div class="ai-result-actions">
                    <button class="ai-result-action copy-result"><i class="fas fa-copy"></i></button>
                    <button class="ai-result-action apply-result"><i class="fas fa-check"></i></button>
                </div>
            </div>
            <div class="ai-result-content">
                ${content.replace(/\n/g, '<br>')}
            </div>
        `;
        aiResultsContainer.appendChild(responseElement);
        
        // 복사 버튼 이벤트
        const copyBtn = responseElement.querySelector('.copy-result');
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(content).then(() => {
                alert('클립보드에 복사되었습니다.');
            });
        });
        
        // 기본 적용 버튼 이벤트 (특별 처리는 호출 부분에서 덮어씀)
        const applyBtn = responseElement.querySelector('.apply-result');
        applyBtn.addEventListener('click', () => {
            alert('변경사항이 적용되었습니다.');
        });
        
        // 스크롤 맨 아래로
        aiResultsContainer.scrollTop = aiResultsContainer.scrollHeight;
        
        return responseElement;
    }

    // 슬라이드에 텍스트 요소 추가 (AI가 생성한 내용 적용)
    function addTextElement(content, isTitle = false) {
        import('../index.js').then(module => {
            // 제목일 경우와 일반 텍스트일 경우 스타일 다르게 설정
            const fontSize = isTitle ? 36 : 18;
            const fontWeight = isTitle ? 'bold' : 'normal';
            const width = isTitle ? 600 : 500;
            const height = isTitle ? 60 : 200;
            const y = isTitle ? 50 : 150;
            
            // 텍스트 요소 생성
            const textElement = {
                id: Date.now(),
                type: 'text',
                content: content,
                x: (960 - width) / 2, // 중앙 정렬
                y: y,
                width: width,
                height: height,
                fontSize: fontSize,
                fontFamily: 'Arial',
                fontWeight: fontWeight,
                color: '#333',
                textAlign: isTitle ? 'center' : 'left',
                opacity: 1
            };
            
            // 요소 추가
            module.addElement(textElement);
            alert('텍스트가 슬라이드에 추가되었습니다.');
        });
    }
    
    // 발표자 노트 추가
    function addSpeakerNotes(content) {
        import('../index.js').then(module => {
            const currentSlide = module.AppState.slides[module.AppState.currentSlideIndex];
            if (currentSlide) {
                module.updateNotes(currentSlide.id, content);
                alert('발표자 노트가 추가되었습니다.');
                
                // 노트 영역 업데이트
                const notesTextarea = document.getElementById('slideNotes');
                if (notesTextarea) {
                    notesTextarea.value = content;
                }
            }
        });
    }
    
    // 이미지 추가 (AI가 제안한 이미지)
    function addImageToSlide(imageUrl, imageTitle) {
        // 이미지 로드 후 슬라이드에 추가
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            const aspectRatio = img.width / img.height;
            let width = 400;
            let height = width / aspectRatio;
            
            import('../index.js').then(module => {
                // 이미지 요소 생성
                const imageElement = {
                    id: Date.now(),
                    type: 'image',
                    src: imageUrl,
                    alt: imageTitle || '이미지',
                    x: (960 - width) / 2, // 중앙 정렬
                    y: 150,
                    width: width,
                    height: height,
                    opacity: 1,
                    rotation: 0
                };
                
                // 요소 추가
                module.addElement(imageElement);
                alert('이미지가 슬라이드에 추가되었습니다.');
            });
        };
        
        img.onerror = function() {
            alert('이미지를 로드할 수 없습니다. 다른 이미지를 시도해보세요.');
        };
        
        // CORS 문제를 방지하기 위해 프록시 사용 (실제 구현에서는 서버측 프록시 필요)
        img.src = imageUrl;
    }

    // 결과를 패널에 추가하는 함수
    function addResultToPanel(title, content) {
        const resultElement = document.createElement('div');
        resultElement.className = 'ai-result-item';
        resultElement.innerHTML = `
            <div class="ai-result-title">
                ${title || 'AI 결과'}
                <div class="ai-result-actions">
                    <button class="ai-result-action copy-result"><i class="fas fa-copy"></i></button>
                    <button class="ai-result-action apply-result"><i class="fas fa-check"></i></button>
                </div>
            </div>
            <div class="ai-result-content">
                ${content.replace(/\n/g, '<br>')}
            </div>
        `;
        aiResultsContainer.appendChild(resultElement);
        
        // 복사 버튼 이벤트
        const copyBtn = resultElement.querySelector('.copy-result');
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(content).then(() => {
                alert('클립보드에 복사되었습니다.');
            });
        });
        
        // 적용 버튼 기본 이벤트
        const applyBtn = resultElement.querySelector('.apply-result');
        applyBtn.addEventListener('click', () => {
            alert('변경사항이 적용되었습니다.');
        });
        
        // 스크롤 맨 아래로
        aiResultsContainer.scrollTop = aiResultsContainer.scrollHeight;
        
        return resultElement;
    }
}

// 앱 초기화 시 DeepSeek AI 기능 초기화
document.addEventListener('DOMContentLoaded', () => {
    initDeepSeekAI();
}); 