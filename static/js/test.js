/**
 * test.js
 * 프레젠테이션 에디터 모듈 테스트
 */

// 모듈 임포트
import { AppState, initApp, addNewSlide, duplicateCurrentSlide, deleteSelectedElement } from './index.js';
import { changeSlideBackground, getCurrentColorPalette } from './modules/themes.js';
import { createChart, getChartData } from './modules/charts.js';
import { createShape, resizeShape, rotateShape } from './modules/shape-editor.js';

// 모듈 테스트
document.addEventListener('DOMContentLoaded', () => {
    console.log('테스트 스크립트 실행');
    
    // 앱 초기화
    initApp();
    
    // 상태 테스트
    console.log('AppState 확인:', AppState);
    
    // 주요 기능 테스트
    testSlideCreation();
    testThemes();
    testElements();
    testCharts();
    testShapeEditor();
    
    console.log('모든 테스트 완료');
});

// 슬라이드 생성 테스트
function testSlideCreation() {
    console.log('슬라이드 생성 테스트 시작');
    
    setTimeout(() => {
        // 새 슬라이드 생성
        addNewSlide();
        console.log('슬라이드 개수:', AppState.slides.length);
        
        // 슬라이드 복제
        setTimeout(() => {
            duplicateCurrentSlide();
            console.log('슬라이드 복제 후 개수:', AppState.slides.length);
            
            // 현재 슬라이드 확인
            console.log('현재 슬라이드 인덱스:', AppState.currentSlideIndex);
            
            console.log('슬라이드 생성 테스트 완료');
        }, 500);
    }, 1000);
}

// 테마 테스트
function testThemes() {
    console.log('테마 테스트 시작');
    
    setTimeout(() => {
        // 배경색 변경
        changeSlideBackground('#f0f0f0');
        
        // 색상 팔레트 확인
        const colors = getCurrentColorPalette();
        console.log('현재 색상 팔레트:', colors);
        
        // 테마 버튼 클릭 시뮬레이션
        const themeButtons = document.querySelectorAll('.theme-btn');
        if (themeButtons.length > 0) {
            themeButtons[1].click(); // 두 번째 테마 선택
            setTimeout(() => {
                console.log('테마 변경 후 상태:', AppState.currentTheme);
                console.log('테마 테스트 완료');
            }, 500);
        } else {
            console.log('테마 버튼을 찾을 수 없음');
        }
    }, 2000);
}

// 요소 테스트
function testElements() {
    console.log('요소 테스트 시작');
    
    setTimeout(() => {
        // 텍스트 요소 추가 버튼 클릭 시뮬레이션
        const addTextBtn = document.getElementById('addTextBtn');
        if (addTextBtn) {
            addTextBtn.click();
            console.log('텍스트 요소 추가 버튼 클릭됨');
            
            // 요소 선택/삭제 테스트
            setTimeout(() => {
                // 요소가 추가되었는지 확인
                const currentSlide = AppState.slides[AppState.currentSlideIndex];
                console.log('현재 슬라이드 요소 개수:', currentSlide.elements.length);
                
                // 슬라이드 캔버스에서 요소 클릭 시뮬레이션
                const slideElements = document.querySelectorAll('.slide-element');
                if (slideElements.length > 0) {
                    slideElements[0].click();
                    console.log('요소 선택됨:', AppState.selectedElement);
                    
                    // 요소 삭제
                    setTimeout(() => {
                        deleteSelectedElement();
                        console.log('요소 삭제 후 개수:', AppState.slides[AppState.currentSlideIndex].elements.length);
                    }, 500);
                }
                
                console.log('요소 테스트 완료');
            }, 1000);
        } else {
            console.log('텍스트 추가 버튼을 찾을 수 없음');
        }
    }, 3000);
}

// 차트 테스트
function testCharts() {
    console.log('차트 테스트 시작');
    
    setTimeout(() => {
        try {
            // 테스트 차트 데이터
            const chartData = {
                type: 'bar',
                data: {
                    labels: ['1월', '2월', '3월', '4월', '5월'],
                    datasets: [{
                        label: '판매량',
                        data: [12, 19, 3, 5, 2],
                        backgroundColor: 'rgba(54, 162, 235, 0.6)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            };
            
            // 차트 생성
            const chartObj = createChart(chartData.type, chartData.data, chartData.options);
            console.log('차트 객체 생성됨:', chartObj ? true : false);
            
            // 차트 데이터 가져오기
            const retrievedData = getChartData();
            console.log('차트 데이터 가져오기:', retrievedData ? true : false);
            
            console.log('차트 테스트 완료');
        } catch (e) {
            console.error('차트 테스트 오류:', e);
        }
    }, 4000);
}

// 도형 편집기 테스트
function testShapeEditor() {
    console.log('도형 편집기 테스트 시작');
    
    setTimeout(() => {
        try {
            // 도형 생성
            const shapeOptions = {
                type: 'rectangle',
                x: 100,
                y: 100,
                width: 200,
                height: 150,
                backgroundColor: '#3498db',
                borderColor: '#2980b9',
                borderWidth: 2,
                opacity: 0.8
            };
            
            const shapeId = createShape(shapeOptions);
            console.log('도형 생성됨:', shapeId ? true : false);
            
            // 도형 크기 조정
            if (shapeId) {
                setTimeout(() => {
                    resizeShape(shapeId, 250, 200);
                    console.log('도형 크기 조정됨');
                    
                    // 도형 회전
                    setTimeout(() => {
                        rotateShape(shapeId, 45);
                        console.log('도형 회전됨');
                        
                        console.log('도형 편집기 테스트 완료');
                    }, 500);
                }, 500);
            }
        } catch (e) {
            console.error('도형 편집기 테스트 오류:', e);
        }
    }, 5000);
} 