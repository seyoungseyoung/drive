/**
 * themes.js
 * 프레젠테이션 테마 및 스타일 관리를 위한 모듈
 */

// 앱 상태 가져오기
import { AppState } from '../index.js';

// 테마 정의
const themes = {
    // 모던 테마
    modern: {
        name: '모던',
        fontFamily: 'Pretendard, sans-serif',
        headingFontFamily: 'Pretendard, sans-serif',
        fontSize: '16px',
        headingSize: '32px',
        subheadingSize: '24px',
        backgroundColor: '#f8f9fa',
        textColor: '#343a40',
        accentColor: '#3498db',
        slideBackground: '#ffffff',
        padding: '30px',
        borderRadius: '8px',
        shadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        colorPalettes: {
            blue: ['#3498db', '#2980b9', '#1f618d', '#154360', '#5dade2'],
            green: ['#2ecc71', '#27ae60', '#1e8449', '#145a32', '#58d68d'],
            purple: ['#9b59b6', '#8e44ad', '#6c3483', '#4a235a', '#bb8fce'],
            red: ['#e74c3c', '#c0392b', '#922b21', '#641e16', '#ec7063'],
            orange: ['#e67e22', '#d35400', '#a04000', '#6e2c00', '#f39c12']
        }
    },
    
    // 미니멀 테마
    minimal: {
        name: '미니멀',
        fontFamily: 'Pretendard, sans-serif',
        headingFontFamily: 'Pretendard, sans-serif',
        fontSize: '16px',
        headingSize: '32px',
        subheadingSize: '24px',
        backgroundColor: '#ffffff',
        textColor: '#333333',
        accentColor: '#aaaaaa',
        slideBackground: '#ffffff',
        padding: '40px',
        borderRadius: '0',
        shadow: 'none',
        colorPalettes: {
            blue: ['#3498db', '#2980b9', '#1f618d', '#154360', '#5dade2'],
            green: ['#2ecc71', '#27ae60', '#1e8449', '#145a32', '#58d68d'],
            purple: ['#9b59b6', '#8e44ad', '#6c3483', '#4a235a', '#bb8fce'],
            red: ['#e74c3c', '#c0392b', '#922b21', '#641e16', '#ec7063'],
            orange: ['#e67e22', '#d35400', '#a04000', '#6e2c00', '#f39c12']
        }
    },
    
    // 클래식 테마
    classic: {
        name: '클래식',
        fontFamily: 'Times New Roman, serif',
        headingFontFamily: 'Times New Roman, serif',
        fontSize: '16px',
        headingSize: '32px',
        subheadingSize: '24px',
        backgroundColor: '#f0ebe0',
        textColor: '#333333',
        accentColor: '#8b4513',
        slideBackground: '#fff9f0',
        padding: '30px',
        borderRadius: '0',
        shadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        colorPalettes: {
            blue: ['#3a506b', '#5c728f', '#7d9db3', '#9fb8d7', '#c1d8fb'],
            green: ['#556b2f', '#6b8e23', '#8fbc8f', '#9acd32', '#adff2f'],
            purple: ['#4b0082', '#663399', '#8a2be2', '#9370db', '#ab82ff'],
            red: ['#8b0000', '#a52a2a', '#b22222', '#cd5c5c', '#e9967a'],
            orange: ['#8b4513', '#a0522d', '#b5651d', '#cd853f', '#deb887']
        }
    },
    
    // 기업형 테마
    corporate: {
        name: '기업형',
        fontFamily: 'Arial, sans-serif',
        headingFontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        headingSize: '32px',
        subheadingSize: '24px',
        backgroundColor: '#e9ecef',
        textColor: '#212529',
        accentColor: '#0056b3',
        slideBackground: '#ffffff',
        padding: '30px',
        borderRadius: '0',
        shadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
        colorPalettes: {
            blue: ['#0056b3', '#0069d9', '#007bff', '#3395ff', '#66b0ff'],
            green: ['#005f23', '#007c2e', '#28a745', '#48c96c', '#7dde97'],
            purple: ['#4b0082', '#6610f2', '#6f42c1', '#8c68d6', '#a98eda'],
            red: ['#7a0000', '#a60000', '#dc3545', '#e35d6a', '#eb8c95'],
            orange: ['#803d00', '#b45600', '#fd7e14', '#fd9a47', '#feb475']
        }
    }
};

// 테마 모듈 초기화
export function initThemes() {
    console.log('테마 모듈 초기화');
    
    // 테마 이벤트 리스너 등록
    setupThemeListeners();
    
    // 초기 테마 적용
    applyCurrentTheme();
}

// 테마 이벤트 리스너 설정
function setupThemeListeners() {
    // 테마 버튼 리스너
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const themeName = btn.getAttribute('data-theme');
            if (themeName && themes[themeName]) {
                AppState.currentTheme = themeName;
                applyCurrentTheme();
                
                // 테마 변경 이벤트 발생
                document.dispatchEvent(new CustomEvent('theme-changed', {
                    detail: { theme: themeName }
                }));
            }
        });
    });
    
    // 색상 팔레트 버튼 리스너
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const palette = btn.getAttribute('data-palette');
            if (palette) {
                AppState.currentColorPalette = palette;
                applyCurrentTheme();
                
                // 색상 팔레트 변경 이벤트 발생
                document.dispatchEvent(new CustomEvent('palette-changed', {
                    detail: { palette }
                }));
            }
        });
    });
    
    // 글꼴 선택 변경 리스너
    document.getElementById('fontFamilySelect')?.addEventListener('change', (e) => {
        AppState.currentFontFamily = e.target.value;
        applyCurrentTheme();
        
        // 글꼴 변경 이벤트 발생
        document.dispatchEvent(new CustomEvent('font-changed', {
            detail: { fontFamily: e.target.value }
        }));
    });
}

// 현재 테마 적용
export function applyCurrentTheme() {
    const themeName = AppState.currentTheme || 'modern';
    const colorPalette = AppState.currentColorPalette || 'blue';
    const fontFamily = AppState.currentFontFamily || 'Pretendard';
    
    // 테마 객체 가져오기
    const theme = themes[themeName] || themes.modern;
    
    // 색상 팔레트 가져오기
    const colors = theme.colorPalettes[colorPalette] || theme.colorPalettes.blue;
    
    // 기본 스타일 적용
    document.documentElement.style.setProperty('--primary-color', colors[0]);
    document.documentElement.style.setProperty('--secondary-color', colors[1]);
    document.documentElement.style.setProperty('--accent-color', colors[2]);
    document.documentElement.style.setProperty('--light-color', colors[3]);
    document.documentElement.style.setProperty('--highlight-color', colors[4]);
    
    document.documentElement.style.setProperty('--font-family', fontFamily + ', ' + theme.fontFamily);
    document.documentElement.style.setProperty('--heading-font-family', theme.headingFontFamily);
    document.documentElement.style.setProperty('--font-size', theme.fontSize);
    document.documentElement.style.setProperty('--heading-size', theme.headingSize);
    document.documentElement.style.setProperty('--subheading-size', theme.subheadingSize);
    
    document.documentElement.style.setProperty('--bg-color', theme.backgroundColor);
    document.documentElement.style.setProperty('--text-color', theme.textColor);
    document.documentElement.style.setProperty('--slide-bg', theme.slideBackground);
    document.documentElement.style.setProperty('--padding', theme.padding);
    document.documentElement.style.setProperty('--border-radius', theme.borderRadius);
    document.documentElement.style.setProperty('--shadow', theme.shadow);
    
    // 현재 슬라이드에 테마 적용
    applyThemeToCurrentSlide();
    
    console.log(`테마 적용: ${themeName}, 색상: ${colorPalette}, 글꼴: ${fontFamily}`);
}

// 현재 슬라이드에 테마 적용
function applyThemeToCurrentSlide() {
    // 앱 상태에서 현재 슬라이드 가져오기
    if (AppState.slides && AppState.slides.length > 0) {
        const currentSlide = AppState.slides[AppState.currentSlideIndex];
        
        // 현재 테마 적용
        currentSlide.theme = AppState.currentTheme;
        currentSlide.colorPalette = AppState.currentColorPalette;
        currentSlide.fontFamily = AppState.currentFontFamily;
        
        // 슬라이드 업데이트 이벤트 발생
        document.dispatchEvent(new CustomEvent('slides-updated'));
    }
}

// 슬라이드 배경 색상 변경
export function changeSlideBackground(color) {
    if (AppState.slides && AppState.slides.length > 0) {
        const currentSlide = AppState.slides[AppState.currentSlideIndex];
        currentSlide.background = color;
        
        // 슬라이드 캔버스 업데이트
        const slideCanvas = document.getElementById('currentSlide');
        if (slideCanvas) {
            slideCanvas.style.backgroundColor = color;
        }
        
        // 슬라이드 업데이트 이벤트 발생
        document.dispatchEvent(new CustomEvent('slides-updated'));
    }
}

// 테마 이름으로 테마 객체 가져오기
export function getThemeByName(themeName) {
    return themes[themeName] || themes.modern;
}

// 현재 테마의 색상 팔레트 가져오기
export function getCurrentColorPalette() {
    const themeName = AppState.currentTheme || 'modern';
    const colorPalette = AppState.currentColorPalette || 'blue';
    const theme = themes[themeName] || themes.modern;
    
    return theme.colorPalettes[colorPalette] || theme.colorPalettes.blue;
}

// 모든 테마 목록 가져오기
export function getAllThemes() {
    return Object.keys(themes).map(key => ({
        id: key,
        name: themes[key].name
    }));
}

// 지정된 테마의 모든 색상 팔레트 가져오기
export function getColorPalettes(themeName) {
    const theme = themes[themeName] || themes.modern;
    return Object.keys(theme.colorPalettes);
} 