/**
 * UI Analyzer module to handle presentation analysis UI
 */

import { AppState } from '../index.js';
import { showModal } from './ui-modals.js';

// Initialize analyzer
export function initAnalyzer() {
    console.log('분석기 초기화 중...');
    
    // Add any required initialization code here
    
    console.log('분석기 초기화 완료');
}

// Show presentation analyzer
export function showPresentationAnalyzer() {
    console.log('프레젠테이션 분석기 실행 중...');
    
    // Show loading modal
    const loadingContent = `
        <div class="analyzer-loading">
            <div class="deep-seek-spinner"></div>
            <p>프레젠테이션 분석 중...</p>
            <div class="analyzer-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <div class="progress-text">0%</div>
            </div>
        </div>
    `;
    
    showModal('프레젠테이션 품질 분석', loadingContent);
    
    // Analyze the presentation
    analyzePresentationQuality()
        .then(results => {
            // Update modal with results
            updatePresentationAnalyzerModal(results);
        })
        .catch(error => {
            console.error('프레젠테이션 분석 오류:', error);
            const modalBody = document.querySelector('.modal-body');
            if (modalBody) {
                modalBody.innerHTML = `
                    <div class="analysis-error">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>프레젠테이션을 분석하는 중 오류가 발생했습니다: ${error.message}</p>
                    </div>
                `;
            }
        });
}

// Analyze the entire presentation quality
function analyzePresentationQuality() {
    return new Promise(async (resolve, reject) => {
        try {
            // Get all slides
            const slides = AppState.slides;
            if (!slides || slides.length === 0) {
                reject(new Error('분석할 슬라이드가 없습니다.'));
                return;
            }
            
            // Results object
            const results = {
                overallScore: 0,
                slideScores: [],
                categories: {
                    content: { score: 0, issues: [], recommendations: [] },
                    design: { score: 0, issues: [], recommendations: [] },
                    structure: { score: 0, issues: [], recommendations: [] },
                    consistency: { score: 0, issues: [], recommendations: [] },
                    accessibility: { score: 0, issues: [], recommendations: [] }
                },
                slidesWithIssues: [],
                topRecommendations: []
            };
            
            // Import AI module
            const aiModule = await import('./ai.js');
            
            // Analyze each slide
            let totalScore = 0;
            let processedSlides = 0;
            const modal = document.querySelector('#dynamic-modal');
            const progressFill = modal?.querySelector('.progress-fill');
            const progressText = modal?.querySelector('.progress-text');
            
            for (let i = 0; i < slides.length; i++) {
                // Save current slide index
                const currentIndex = AppState.currentSlideIndex;
                
                // Set slide index to analyze
                AppState.currentSlideIndex = i;
                
                // Update progress
                const progress = Math.round(((i + 1) / slides.length) * 100);
                if (progressFill) progressFill.style.width = `${progress}%`;
                if (progressText) progressText.textContent = `${progress}%`;
                
                // Wait a bit to allow UI to update
                await new Promise(r => setTimeout(r, 100));
                
                // Analyze current slide
                try {
                    const analysis = await aiModule.analyzeCurrentSlide();
                    
                    // Store slide score
                    let slideScore = calculateSlideScore(analysis.analysis);
                    totalScore += slideScore.total;
                    
                    results.slideScores.push({
                        slideIndex: i,
                        score: slideScore.total,
                        issues: slideScore.issues,
                        analysis: analysis.analysis
                    });
                    
                    // Add issues to categories
                    addIssuesToCategories(results.categories, slideScore.issues, i);
                    
                    processedSlides++;
                } catch (error) {
                    console.error(`슬라이드 ${i + 1} 분석 오류:`, error);
                }
                
                // Restore current slide index
                AppState.currentSlideIndex = currentIndex;
            }
            
            // Calculate overall score (0-100)
            results.overallScore = Math.round((totalScore / processedSlides) * 20);
            
            // Calculate category scores
            calculateCategoryScores(results.categories);
            
            // Find slides with most issues
            results.slidesWithIssues = findSlidesWithMostIssues(results.slideScores);
            
            // Generate top recommendations
            results.topRecommendations = generateTopRecommendations(results.categories);
            
            resolve(results);
        } catch (error) {
            reject(error);
        }
    });
}

// Calculate score for a single slide based on analysis
function calculateSlideScore(analysis) {
    const issues = [];
    let score = 5; // Start with perfect score and subtract for issues
    
    // Content density issues
    if (analysis.textLengthScore === 'too_high') {
        score -= 1;
        issues.push({
            category: 'content',
            type: 'text_density',
            severity: 'high',
            message: '텍스트가 너무 많아 집중도가 떨어집니다.',
            slideIndex: AppState.currentSlideIndex
        });
    } else if (analysis.textLengthScore === 'high') {
        score -= 0.5;
        issues.push({
            category: 'content',
            type: 'text_density',
            severity: 'medium',
            message: '텍스트 양이 많습니다. 핵심 내용으로 축소하세요.',
            slideIndex: AppState.currentSlideIndex
        });
    }
    
    // Complexity issues
    if (analysis.complexityScore === 'high') {
        score -= 0.5;
        issues.push({
            category: 'design',
            type: 'complexity',
            severity: 'medium',
            message: '슬라이드가 복잡합니다. 요소를 줄이거나 여러 슬라이드로 나누세요.',
            slideIndex: AppState.currentSlideIndex
        });
    }
    
    // Speaker notes issues
    if (!analysis.hasSpeakerNotes) {
        score -= 0.2;
        issues.push({
            category: 'content',
            type: 'speaker_notes',
            severity: 'low',
            message: '발표자 노트가 없습니다. 발표 시 참고할 노트를 추가하세요.',
            slideIndex: AppState.currentSlideIndex
        });
    }
    
    // Visual element issues - check for images or visuals
    if (analysis.elementBreakdown && analysis.elementBreakdown.text > 0 && 
        analysis.elementBreakdown.image === 0 && 
        analysis.elementBreakdown.chart === 0) {
        score -= 0.3;
        issues.push({
            category: 'design',
            type: 'visuals',
            severity: 'medium',
            message: '시각적 요소가 부족합니다. 이미지나 차트를 추가하세요.',
            slideIndex: AppState.currentSlideIndex
        });
    }
    
    // Layout issues
    if (analysis.layout && analysis.layout.score === 'poor') {
        score -= 0.8;
        issues.push({
            category: 'design',
            type: 'layout',
            severity: 'high',
            message: '레이아웃 균형이 좋지 않습니다. 요소 배치를 개선하세요.',
            slideIndex: AppState.currentSlideIndex
        });
    } else if (analysis.layout && analysis.layout.score === 'average') {
        score -= 0.3;
        issues.push({
            category: 'design',
            type: 'layout',
            severity: 'medium',
            message: '레이아웃이 개선될 여지가 있습니다.',
            slideIndex: AppState.currentSlideIndex
        });
    }
    
    // Color issues
    if (analysis.colors && analysis.colors.score === 'poor') {
        score -= 0.5;
        issues.push({
            category: 'design',
            type: 'colors',
            severity: 'medium',
            message: '색상 조화가 좋지 않습니다. 일관된 색상 테마를 사용하세요.',
            slideIndex: AppState.currentSlideIndex
        });
    }
    
    // Readability issues
    if (analysis.readability && analysis.readability.score === 'poor') {
        score -= 0.8;
        issues.push({
            category: 'accessibility',
            type: 'readability',
            severity: 'high',
            message: '텍스트 가독성이 떨어집니다. 폰트 크기와 대비를 개선하세요.',
            slideIndex: AppState.currentSlideIndex
        });
    } else if (analysis.readability && analysis.readability.score === 'average') {
        score -= 0.3;
        issues.push({
            category: 'accessibility',
            type: 'readability',
            severity: 'medium',
            message: '텍스트 가독성 개선이 필요합니다.',
            slideIndex: AppState.currentSlideIndex
        });
    }
    
    // Visual balance issues
    if (analysis.visualBalance && analysis.visualBalance.score === 'poor') {
        score -= 0.5;
        issues.push({
            category: 'design',
            type: 'balance',
            severity: 'medium',
            message: '시각적 균형이 좋지 않습니다. 요소 배치를 균형있게 조정하세요.',
            slideIndex: AppState.currentSlideIndex
        });
    }
    
    // Content quality issues
    if (analysis.contentQuality && analysis.contentQuality.score === 'low') {
        score -= 0.7;
        issues.push({
            category: 'content',
            type: 'quality',
            severity: 'high',
            message: '내용의 질이 떨어집니다. 더 명확하고 구체적인 내용을 추가하세요.',
            slideIndex: AppState.currentSlideIndex
        });
    } else if (analysis.contentQuality && analysis.contentQuality.score === 'average') {
        score -= 0.3;
        issues.push({
            category: 'content',
            type: 'quality',
            severity: 'medium',
            message: '내용을 더 개선할 여지가 있습니다.',
            slideIndex: AppState.currentSlideIndex
        });
    }
    
    // Ensure score is between 0 and 5
    score = Math.max(0, Math.min(5, score));
    
    return {
        total: score,
        issues: issues
    };
}

// Add slide issues to categories
function addIssuesToCategories(categories, issues, slideIndex) {
    issues.forEach(issue => {
        // Add issue to the appropriate category
        if (categories[issue.category]) {
            categories[issue.category].issues.push(issue);
        }
    });
}

// Calculate scores for each category
function calculateCategoryScores(categories) {
    for (const category in categories) {
        // Count issues by severity
        const highIssues = categories[category].issues.filter(i => i.severity === 'high').length;
        const mediumIssues = categories[category].issues.filter(i => i.severity === 'medium').length;
        const lowIssues = categories[category].issues.filter(i => i.severity === 'low').length;
        
        // Calculate score (0-100)
        // High issues have the most impact, low issues have the least
        const totalIssueWeight = highIssues * 3 + mediumIssues * 1.5 + lowIssues * 0.5;
        
        // Higher score is better, start from 100 and subtract based on issues
        let score = 100 - (totalIssueWeight * 5);
        
        // Ensure score is between 0 and 100
        score = Math.max(0, Math.min(100, score));
        
        categories[category].score = Math.round(score);
        
        // Generate category-specific recommendations
        categories[category].recommendations = generateCategoryRecommendations(category, categories[category].issues);
    }
}

// Find slides with most issues
function findSlidesWithMostIssues(slideScores) {
    // Sort by number of issues
    return slideScores
        .map((score, index) => ({
            slideIndex: score.slideIndex,
            issues: score.issues,
            score: score.score
        }))
        .filter(slide => slide.issues.length > 0)
        .sort((a, b) => b.issues.length - a.issues.length)
        .slice(0, 3); // Get top 3 slides with issues
}

// Generate recommendations for a category
function generateCategoryRecommendations(category, issues) {
    const recommendations = [];
    const issueTypes = {};
    
    // Group issues by type
    issues.forEach(issue => {
        if (!issueTypes[issue.type]) {
            issueTypes[issue.type] = [];
        }
        issueTypes[issue.type].push(issue);
    });
    
    // Generate recommendations based on issue types
    switch (category) {
        case 'content':
            if (issueTypes.text_density) {
                recommendations.push({
                    title: '텍스트 양 최적화',
                    description: '텍스트가 많은 슬라이드를 여러 개로 나누거나, 글머리 기호를 사용하여 핵심 내용만 간결하게 표시하세요.',
                    priority: 'high',
                    affectedSlides: issueTypes.text_density.map(i => i.slideIndex)
                });
            }
            
            if (issueTypes.quality) {
                recommendations.push({
                    title: '내용 품질 향상',
                    description: '명확하고 구체적인 내용을 제공하고, 중복되는 내용을 제거하세요.',
                    priority: 'high',
                    affectedSlides: issueTypes.quality.map(i => i.slideIndex)
                });
            }
            
            if (issueTypes.speaker_notes) {
                recommendations.push({
                    title: '발표자 노트 추가',
                    description: '각 슬라이드에 발표 시 참고할 노트를 추가하여 발표의 일관성을 유지하세요.',
                    priority: 'medium',
                    affectedSlides: issueTypes.speaker_notes.map(i => i.slideIndex)
                });
            }
            break;
            
        case 'design':
            if (issueTypes.layout) {
                recommendations.push({
                    title: '레이아웃 개선',
                    description: '요소 간 충분한 여백을 두고, 중요한 정보는 슬라이드 상단에 배치하세요.',
                    priority: 'high',
                    affectedSlides: issueTypes.layout.map(i => i.slideIndex)
                });
            }
            
            if (issueTypes.colors) {
                recommendations.push({
                    title: '색상 일관성 유지',
                    description: '프레젠테이션 전체에 일관된 색상 테마를 적용하고, 가독성을 높이기 위해 대비가 높은 색상을 사용하세요.',
                    priority: 'medium',
                    affectedSlides: issueTypes.colors.map(i => i.slideIndex)
                });
            }
            
            if (issueTypes.visuals) {
                recommendations.push({
                    title: '시각적 요소 추가',
                    description: '정보 전달력을 높이기 위해 관련 이미지, 아이콘, 차트 등을 추가하세요.',
                    priority: 'medium',
                    affectedSlides: issueTypes.visuals.map(i => i.slideIndex)
                });
            }
            
            if (issueTypes.complexity) {
                recommendations.push({
                    title: '슬라이드 단순화',
                    description: '한 슬라이드에 너무 많은 정보를 담지 말고, 필요하다면 여러 슬라이드로 나누세요.',
                    priority: 'high',
                    affectedSlides: issueTypes.complexity.map(i => i.slideIndex)
                });
            }
            break;
            
        case 'structure':
            // Structure specific recommendations
            recommendations.push({
                title: '슬라이드 구조화',
                description: '명확한 제목 슬라이드, 목차, 섹션 구분, 요약 슬라이드를 포함하여 발표의 흐름을 개선하세요.',
                priority: issues.length > 2 ? 'high' : 'medium',
                affectedSlides: []
            });
            break;
            
        case 'consistency':
            // Consistency specific recommendations
            recommendations.push({
                title: '디자인 일관성 유지',
                description: '모든 슬라이드에 일관된 폰트, 색상, 레이아웃을 적용하여 전문성을 높이세요.',
                priority: issues.length > 2 ? 'high' : 'medium',
                affectedSlides: []
            });
            break;
            
        case 'accessibility':
            if (issueTypes.readability) {
                recommendations.push({
                    title: '가독성 향상',
                    description: '최소 18pt 이상의 폰트 크기를 사용하고, 배경과 텍스트 간 대비를 높이세요.',
                    priority: 'high',
                    affectedSlides: issueTypes.readability.map(i => i.slideIndex)
                });
            }
            break;
    }
    
    return recommendations;
}

// Generate top overall recommendations
function generateTopRecommendations(categories) {
    // Collect all recommendations
    const allRecommendations = [];
    for (const category in categories) {
        allRecommendations.push(...categories[category].recommendations);
    }
    
    // Sort by priority
    const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
    allRecommendations.sort((a, b) => {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    // Return top 5 recommendations
    return allRecommendations.slice(0, 5);
}

// Update the presentation analyzer modal with results
function updatePresentationAnalyzerModal(results) {
    const modalBody = document.querySelector('.modal-body');
    if (!modalBody) return;
    
    // Generate overall score indicator
    const scoreClass = results.overallScore >= 80 ? 'excellent' : 
                      results.overallScore >= 60 ? 'good' : 
                      results.overallScore >= 40 ? 'average' : 'poor';
    
    const scoreLabel = results.overallScore >= 80 ? '우수' : 
                      results.overallScore >= 60 ? '양호' : 
                      results.overallScore >= 40 ? '보통' : '개선 필요';
    
    let modalContent = `
        <div class="analyzer-results">
            <div class="overall-score ${scoreClass}">
                <div class="score-value">${results.overallScore}</div>
                <div class="score-label">${scoreLabel}</div>
            </div>
            
            <div class="score-categories">
                <div class="category-scores">
                    ${generateCategoryScoreHTML(results.categories)}
                </div>
            </div>
            
            <div class="analyzer-tabs">
                <div class="tab-buttons">
                    <button class="tab-btn active" data-tab="summary">요약</button>
                    <button class="tab-btn" data-tab="recommendations">추천사항</button>
                    <button class="tab-btn" data-tab="slides">슬라이드별</button>
                </div>
                
                <div class="tab-content">
                    <div class="tab-pane active" id="summary-tab">
                        ${generateSummaryTabHTML(results)}
                    </div>
                    <div class="tab-pane" id="recommendations-tab">
                        ${generateRecommendationsTabHTML(results)}
                    </div>
                    <div class="tab-pane" id="slides-tab">
                        ${generateSlidesTabHTML(results)}
                    </div>
                </div>
            </div>
            
            <div class="analyzer-actions">
                <button id="closeAnalyzerBtn" class="btn-primary">닫기</button>
                <button id="exportAnalysisBtn" class="btn-secondary">분석 결과 저장</button>
            </div>
        </div>
    `;
    
    // Update modal content
    modalBody.innerHTML = modalContent;
    
    // Setup tab switching
    const tabButtons = modalBody.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all tabs and buttons
            modalBody.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            modalBody.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button and corresponding tab
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Add close button event
    const closeBtn = document.getElementById('closeAnalyzerBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const modal = document.querySelector('#dynamic-modal');
            if (modal) {
                // Import ui-modals.js and use closeModal
                import('./ui-modals.js').then(modalsModule => {
                    modalsModule.closeModal(modal);
                });
            }
        });
    }
    
    // Add export button event
    const exportBtn = document.getElementById('exportAnalysisBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            exportAnalysisResults(results);
        });
    }
    
    // Add slide navigation events
    const slideLinks = modalBody.querySelectorAll('.slide-link');
    slideLinks.forEach(link => {
        link.addEventListener('click', () => {
            const slideIndex = parseInt(link.getAttribute('data-slide-index'));
            if (!isNaN(slideIndex)) {
                // Navigate to the slide
                AppState.currentSlideIndex = slideIndex;
                
                // Import slides module to update UI
                import('./slides.js').then(slidesModule => {
                    if (typeof slidesModule.updateCurrentSlide === 'function') {
                        slidesModule.updateCurrentSlide();
                    }
                    if (typeof slidesModule.updateSlideList === 'function') {
                        slidesModule.updateSlideList();
                    }
                });
                
                // Close the modal
                const modal = document.querySelector('#dynamic-modal');
                if (modal) {
                    import('./ui-modals.js').then(modalsModule => {
                        modalsModule.closeModal(modal);
                    });
                }
            }
        });
    });
}

// Generate HTML for category scores
function generateCategoryScoreHTML(categories) {
    let html = '';
    
    for (const category in categories) {
        const score = categories[category].score;
        const scoreClass = score >= 80 ? 'excellent' : 
                          score >= 60 ? 'good' : 
                          score >= 40 ? 'average' : 'poor';
        
        const categoryNames = {
            'content': '내용',
            'design': '디자인',
            'structure': '구조',
            'consistency': '일관성',
            'accessibility': '접근성'
        };
        
        html += `
            <div class="category-score">
                <div class="category-name">${categoryNames[category]}</div>
                <div class="score-bar">
                    <div class="score-fill ${scoreClass}" style="width: ${score}%"></div>
                </div>
                <div class="score-value">${score}</div>
            </div>
        `;
    }
    
    return html;
}

// Generate HTML for summary tab
function generateSummaryTabHTML(results) {
    let html = `
        <div class="summary-section">
            <h3>프레젠테이션 요약</h3>
            <p>이 프레젠테이션은 ${results.slideScores.length}개의 슬라이드로 구성되어 있으며, 전체적인 품질 점수는 ${results.overallScore}점입니다.</p>
            
            <div class="strength-weakness">
                <div class="strengths">
                    <h4>강점</h4>
                    <ul>
    `;
    
    // Find top strengths (categories with highest scores)
    const strengths = Object.entries(results.categories)
        .sort((a, b) => b[1].score - a[1].score)
        .slice(0, 2);
    
    // Add strengths
    if (strengths.length > 0) {
        strengths.forEach(([category, data]) => {
            const categoryNames = {
                'content': '내용',
                'design': '디자인',
                'structure': '구조',
                'consistency': '일관성',
                'accessibility': '접근성'
            };
            
            const strengthDesc = {
                'content': '명확하고 잘 구성된 내용',
                'design': '시각적으로 매력적인 디자인',
                'structure': '논리적인 프레젠테이션 구조',
                'consistency': '일관된 디자인 요소',
                'accessibility': '높은 가독성과 접근성'
            };
            
            html += `<li><strong>${categoryNames[category]}:</strong> ${strengthDesc[category]}</li>`;
        });
    } else {
        html += `<li>특별한 강점이 분석되지 않았습니다.</li>`;
    }
    
    html += `
                    </ul>
                </div>
                <div class="weaknesses">
                    <h4>개선 영역</h4>
                    <ul>
    `;
    
    // Find top weaknesses (categories with lowest scores)
    const weaknesses = Object.entries(results.categories)
        .sort((a, b) => a[1].score - b[1].score)
        .slice(0, 2);
    
    // Add weaknesses
    if (weaknesses.length > 0) {
        weaknesses.forEach(([category, data]) => {
            const categoryNames = {
                'content': '내용',
                'design': '디자인',
                'structure': '구조',
                'consistency': '일관성',
                'accessibility': '접근성'
            };
            
            if (data.issues.length > 0) {
                html += `<li><strong>${categoryNames[category]}:</strong> ${data.issues.length}개의 문제점 발견</li>`;
            }
        });
    } else {
        html += `<li>주요 개선 영역이 분석되지 않았습니다.</li>`;
    }
    
    html += `
                    </ul>
                </div>
            </div>
            
            <div class="top-recommendations">
                <h4>주요 개선 제안</h4>
                <ul>
    `;
    
    // Add top recommendations
    if (results.topRecommendations.length > 0) {
        results.topRecommendations.forEach(rec => {
            html += `<li><strong>${rec.title}:</strong> ${rec.description}</li>`;
        });
    } else {
        html += `<li>특별한 제안 사항이 없습니다.</li>`;
    }
    
    html += `
                </ul>
            </div>
            
            <div class="slide-focus">
                <h4>집중 개선이 필요한 슬라이드</h4>
    `;
    
    // Add slides with most issues
    if (results.slidesWithIssues.length > 0) {
        html += `<div class="focus-slides">`;
        
        results.slidesWithIssues.forEach(slide => {
            html += `
                <div class="focus-slide">
                    <div class="slide-number">슬라이드 ${slide.slideIndex + 1}</div>
                    <div class="slide-issues">${slide.issues.length}개 문제</div>
                    <button class="slide-link" data-slide-index="${slide.slideIndex}">이동</button>
                </div>
            `;
        });
        
        html += `</div>`;
    } else {
        html += `<p>집중 개선이 필요한 슬라이드가 없습니다.</p>`;
    }
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

// Generate HTML for recommendations tab
function generateRecommendationsTabHTML(results) {
    let html = `
        <div class="recommendations-section">
            <h3>개선 제안 사항</h3>
            
            <div class="recommendation-categories">
    `;
    
    // Add recommendations by category
    for (const category in results.categories) {
        const categoryNames = {
            'content': '내용',
            'design': '디자인',
            'structure': '구조',
            'consistency': '일관성',
            'accessibility': '접근성'
        };
        
        const recommendations = results.categories[category].recommendations;
        
        if (recommendations.length > 0) {
            html += `
                <div class="recommendation-category">
                    <h4>${categoryNames[category]} 개선 사항</h4>
                    <div class="recommendations-list">
            `;
            
            recommendations.forEach(rec => {
                const priorityClass = rec.priority === 'high' ? 'high-priority' : 
                                     rec.priority === 'medium' ? 'medium-priority' : 'low-priority';
                
                html += `
                    <div class="recommendation-item ${priorityClass}">
                        <div class="recommendation-header">
                            <i class="recommendation-icon fas ${getCategoryIcon(category)}"></i>
                            <div class="recommendation-title">${rec.title}</div>
                            <div class="recommendation-priority">${getPriorityLabel(rec.priority)}</div>
                        </div>
                        <div class="recommendation-body">
                            <p>${rec.description}</p>
                `;
                
                // Add affected slides if available
                if (rec.affectedSlides && rec.affectedSlides.length > 0) {
                    html += `<div class="affected-slides">영향 슬라이드: `;
                    
                    rec.affectedSlides.slice(0, 3).forEach((slideIndex, i) => {
                        html += `<button class="slide-link" data-slide-index="${slideIndex}">슬라이드 ${slideIndex + 1}</button>`;
                        if (i < Math.min(rec.affectedSlides.length, 3) - 1) {
                            html += `, `;
                        }
                    });
                    
                    if (rec.affectedSlides.length > 3) {
                        html += ` 외 ${rec.affectedSlides.length - 3}개`;
                    }
                    
                    html += `</div>`;
                }
                
                html += `
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        }
    }
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

// Generate HTML for slides tab
function generateSlidesTabHTML(results) {
    let html = `
        <div class="slides-section">
            <h3>슬라이드별 분석</h3>
            
            <div class="slides-list">
    `;
    
    // Add scores for each slide
    results.slideScores.forEach(slide => {
        const slideIndex = slide.slideIndex;
        const slideScore = Math.round(slide.score * 20); // Convert to 0-100 scale
        const scoreClass = slideScore >= 80 ? 'excellent' : 
                          slideScore >= 60 ? 'good' : 
                          slideScore >= 40 ? 'average' : 'poor';
        
        html += `
            <div class="slide-item">
                <div class="slide-header">
                    <div class="slide-number">슬라이드 ${slideIndex + 1}</div>
                    <div class="slide-score ${scoreClass}">${slideScore}</div>
                    <button class="slide-link" data-slide-index="${slideIndex}">이동</button>
                </div>
        `;
        
        // Add issues if available
        if (slide.issues.length > 0) {
            html += `
                <div class="slide-issues-list">
                    <h5>발견된 문제점</h5>
                    <ul>
            `;
            
            slide.issues.forEach(issue => {
                const severityClass = issue.severity === 'high' ? 'high-severity' : 
                                     issue.severity === 'medium' ? 'medium-severity' : 'low-severity';
                
                html += `
                    <li class="${severityClass}">
                        <i class="issue-icon fas ${getIssueTypeIcon(issue.type)}"></i>
                        ${issue.message}
                    </li>
                `;
            });
            
            html += `
                    </ul>
                </div>
            `;
        } else {
            html += `
                <div class="slide-no-issues">
                    <i class="fas fa-check-circle"></i>
                    <p>문제점이 발견되지 않았습니다.</p>
                </div>
            `;
        }
        
        html += `
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

// Get icon for category
function getCategoryIcon(category) {
    const icons = {
        'content': 'fa-file-alt',
        'design': 'fa-paint-brush',
        'structure': 'fa-sitemap',
        'consistency': 'fa-clone',
        'accessibility': 'fa-universal-access'
    };
    
    return icons[category] || 'fa-check';
}

// Get icon for issue type
function getIssueTypeIcon(type) {
    const icons = {
        'text_density': 'fa-font',
        'complexity': 'fa-layer-group',
        'speaker_notes': 'fa-sticky-note',
        'visuals': 'fa-image',
        'layout': 'fa-object-group',
        'colors': 'fa-palette',
        'readability': 'fa-glasses',
        'balance': 'fa-balance-scale',
        'quality': 'fa-star-half-alt'
    };
    
    return icons[type] || 'fa-exclamation-circle';
}

// Get label for priority
function getPriorityLabel(priority) {
    switch (priority) {
        case 'high':
            return '높은 우선순위';
        case 'medium':
            return '중간 우선순위';
        case 'low':
            return '낮은 우선순위';
        default:
            return '';
    }
}

// Export analysis results
function exportAnalysisResults(results) {
    // Create a text representation of the analysis
    let reportText = `프레젠테이션 분석 보고서\n`;
    reportText += `생성일: ${new Date().toLocaleString()}\n\n`;
    reportText += `전체 점수: ${results.overallScore}/100\n\n`;
    
    // Add category scores
    reportText += `카테고리별 점수:\n`;
    for (const category in results.categories) {
        const categoryNames = {
            'content': '내용',
            'design': '디자인',
            'structure': '구조',
            'consistency': '일관성',
            'accessibility': '접근성'
        };
        
        reportText += `- ${categoryNames[category]}: ${results.categories[category].score}/100\n`;
    }
    
    reportText += `\n주요 개선 제안:\n`;
    results.topRecommendations.forEach((rec, index) => {
        reportText += `${index + 1}. ${rec.title}: ${rec.description}\n`;
    });
    
    reportText += `\n집중 개선이 필요한 슬라이드:\n`;
    results.slidesWithIssues.forEach(slide => {
        reportText += `- 슬라이드 ${slide.slideIndex + 1}: ${slide.issues.length}개 문제\n`;
    });
    
    // Convert to downloadable file
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create temporary link and click it
    const a = document.createElement('a');
    a.href = url;
    a.download = `presentation_analysis_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
} 