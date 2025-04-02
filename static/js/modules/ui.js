/**
 * UI module - Main coordinator for all UI components
 * This module imports and initializes all UI sub-modules
 */

import { initCoreUI, showPowerPointUI, updateUIState } from './ui-core.js';
import { initLayout } from './ui-layout.js';
import { initModals } from './ui-modals.js';
import { initShortcuts } from './ui-shortcuts.js';
import { initAnalyzer } from './ui-analyzer.js';
import { initPresenter } from './ui-presenter.js';
import { initElementHandlers } from './elements.js';

// Initialize UI components
export function initUI() {
    console.log('PowerPoint 스타일 UI 초기화');
    
    // Initialize all UI modules in the proper order
    initCoreUI();       // Core UI components
    initLayout();       // Workspace and layout controls
    initModals();       // Modal dialogs
    initShortcuts();    // Keyboard shortcuts
    initAnalyzer();     // Presentation analyzer
    initPresenter();    // Presenter mode and notes
    initElementHandlers(); // Element manipulation
    
    // 초기 상태 설정
    document.addEventListener('DOMContentLoaded', () => {
        // UI 상태 업데이트
        updateUIState();
        
        // UI 표시
        showPowerPointUI();
    });
    
    console.log('UI 초기화 완료');
}

// Export methods from sub-modules for convenience
export { 
    showPowerPointUI, 
    updateUIState 
} from './ui-core.js';

export {
    openShapeModal,
    openImageModal,
    openChartModal,
    openExportModal,
    showModal
} from './ui-modals.js';

export {
    showPresentationAnalyzer
} from './ui-analyzer.js';

export {
    updatePresenterView,
    initPresenterMode,
    togglePresenterTimer,
    resetPresenterTimer,
    stopPresenterTimer
} from './ui-presenter.js';