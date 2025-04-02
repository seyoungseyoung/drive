/**
 * UI Shortcuts module to handle keyboard shortcuts
 */

import { AppState } from '../index.js';
import { showPresentationAnalyzer } from './ui-analyzer.js';

// Initialize keyboard shortcuts
export function initShortcuts() {
    console.log('키보드 단축키 초기화 중...');
    
    setupKeyboardShortcuts();
    
    console.log('키보드 단축키 초기화 완료');
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    console.log('키보드 단축키 설정 중...');
    
    const shortcuts = [
        { key: 's', ctrl: true, action: 'savePresentation', description: '저장' },
        { key: 'z', ctrl: true, action: 'undo', description: '실행 취소' },
        { key: 'y', ctrl: true, action: 'redo', description: '다시 실행' },
        { key: 'n', ctrl: true, shift: true, action: 'addNewSlide', description: '새 슬라이드' },
        { key: 'd', ctrl: true, action: 'duplicateCurrentSlide', description: '슬라이드 복제' },
        { key: 'Delete', action: 'deleteSelectedElement', description: '선택한 요소 삭제' },
        { key: 'F5', action: 'startSlideshow', description: '슬라이드쇼 시작' },
        { key: 'b', ctrl: true, action: 'toggleBold', description: '굵게' },
        { key: 'i', ctrl: true, action: 'toggleItalic', description: '기울임꼴' },
        { key: 'u', ctrl: true, action: 'toggleUnderline', description: '밑줄' },
        { key: 'a', ctrl: true, action: 'analyzePresentation', description: 'AI 분석' },
        { key: 'F1', action: 'showShortcutsHelp', description: '단축키 도움말' }
    ];
    
    // Add event listener for keyboard shortcuts
    document.addEventListener('keydown', e => {
        // Skip if editing text
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || 
            document.activeElement.contentEditable === 'true') {
            return;
        }
        
        // Check for shortcut match
        for (const shortcut of shortcuts) {
            if (e.key === shortcut.key && 
                (!shortcut.ctrl || e.ctrlKey) && 
                (!shortcut.shift || e.shiftKey)) {
                
                e.preventDefault();
                
                // Execute action
                if (shortcut.action === 'toggleBold') {
                    document.getElementById('textBoldBtn')?.click();
                } else if (shortcut.action === 'toggleItalic') {
                    document.getElementById('textItalicBtn')?.click();
                } else if (shortcut.action === 'toggleUnderline') {
                    document.getElementById('textUnderlineBtn')?.click();
                } else if (shortcut.action === 'analyzePresentation') {
                    showPresentationAnalyzer();
                } else if (shortcut.action === 'showShortcutsHelp') {
                    showKeyboardShortcutsHelp(shortcuts);
                } else {
                    // Try to call the function from different sources
                    if (typeof window[shortcut.action] === 'function') {
                        window[shortcut.action]();
                    } else if (typeof window.AppState[shortcut.action] === 'function') {
                        window.AppState[shortcut.action]();
                    } else {
                        // Try to import from index.js
                        import('../index.js').then(module => {
                            if (typeof module[shortcut.action] === 'function') {
                                module[shortcut.action]();
                            }
                        });
                    }
                }
                
                break;
            }
        }
    });
    
    console.log('키보드 단축키 설정 완료');
}

// Show keyboard shortcuts help
export function showKeyboardShortcutsHelp(shortcuts) {
    // Create shortcuts help modal content
    const modalContent = `
        <div class="shortcuts-help-header">
            <h3>키보드 단축키</h3>
            <p>프레젠테이션 편집기에서 사용할 수 있는 단축키 목록입니다.</p>
        </div>
        
        <div class="shortcuts-category">
            <h4>일반</h4>
            <div class="shortcuts-group">
                ${renderShortcutItems(shortcuts.filter(s => 
                    ['savePresentation', 'undo', 'redo', 'showShortcutsHelp'].includes(s.action)))}
            </div>
        </div>
        
        <div class="shortcuts-category">
            <h4>슬라이드</h4>
            <div class="shortcuts-group">
                ${renderShortcutItems(shortcuts.filter(s => 
                    ['addNewSlide', 'duplicateCurrentSlide', 'deleteSelectedElement', 'startSlideshow'].includes(s.action)))}
            </div>
        </div>
        
        <div class="shortcuts-category">
            <h4>서식</h4>
            <div class="shortcuts-group">
                ${renderShortcutItems(shortcuts.filter(s => 
                    ['toggleBold', 'toggleItalic', 'toggleUnderline'].includes(s.action)))}
            </div>
        </div>
        
        <div class="shortcuts-category">
            <h4>AI 기능</h4>
            <div class="shortcuts-group">
                ${renderShortcutItems(shortcuts.filter(s => 
                    ['analyzePresentation'].includes(s.action)))}
            </div>
        </div>
        
        <div class="shortcuts-footer">
            <button id="closeShortcutsBtn" class="btn-primary">닫기</button>
        </div>
    `;
    
    // Show the modal
    import('./ui-modals.js').then(modalsModule => {
        const modal = modalsModule.showModal('키보드 단축키', modalContent);
        
        // Add event listener to close button
        const closeBtn = modal.querySelector('#closeShortcutsBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modalsModule.closeModal(modal);
            });
        }
    });
}

// Helper function to render shortcut items
function renderShortcutItems(shortcuts) {
    return shortcuts.map(shortcut => {
        // Create key combination text
        let keyCombo = '';
        if (shortcut.ctrl) keyCombo += 'Ctrl+';
        if (shortcut.shift) keyCombo += 'Shift+';
        keyCombo += shortcut.key;
        
        return `
            <div class="shortcut-item">
                <div class="shortcut-keys">${keyCombo}</div>
                <div class="shortcut-desc">${shortcut.description}</div>
            </div>
        `;
    }).join('');
} 