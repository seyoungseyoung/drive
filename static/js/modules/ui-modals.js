/**
 * UI Modals module to handle modal dialogs and popups
 */

import { AppState } from '../index.js';
import { addShapeElement, addImageElement } from './elements.js';

// Initialize modals
export function initModals() {
    console.log('모달 시스템 초기화 중...');
    
    setupModalEvents();
    
    console.log('모달 시스템 초기화 완료');
}

// Setup modal events
export function setupModalEvents() {
    // 모달 닫기 버튼
    document.querySelectorAll('.modal .close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) {
                closeModal(modal);
            }
        });
    });
    
    // 모달 외부 클릭 시 닫기
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal.show');
            if (openModals.length > 0) {
                closeModal(openModals[openModals.length - 1]);
            }
        }
    });
    
    // 도형 모달 이벤트
    setupShapeModalEvents();
    
    // 이미지 모달 이벤트
    setupImageModalEvents();
    
    // 내보내기 모달 이벤트
    setupExportModalEvents();
}

// 모달 열기 함수
export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // 모달 표시
    modal.style.display = 'block';
    
    // 강제 리플로우
    modal.offsetHeight;
    
    // 모달 컨텐츠 요소
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        // 화면 중앙에 위치하도록 설정
        modalContent.style.margin = '5% auto'; // 상단에서 5% 위치
        
        // 모바일 대응: 작은 화면에서는 더 높은 비율 차지
        if (window.innerWidth < 768) {
            modalContent.style.width = '95%';
            modalContent.style.margin = '3% auto';
        }
    }
    
    // show 클래스 추가 (트랜지션을 위해)
    modal.classList.add('show');
    
    // 스크롤 방지
    document.body.style.overflow = 'hidden';
    
    return modal;
}

// 모달 닫기 함수
export function closeModal(modal) {
    if (!modal) return;
    
    // show 클래스 제거
    modal.classList.remove('show');
    
    // 애니메이션 후 display 속성 변경
    setTimeout(() => {
        modal.style.display = 'none';
        
        // 스크롤 복원 (다른 모달이 열려있지 않은 경우)
        if (!document.querySelector('.modal.show')) {
            document.body.style.overflow = '';
        }
    }, 300);
}

// 동적 모달 표시 함수
export function showModal(title, content, onClose) {
    // 이미 있는 모달 확인
    let modalElement = document.getElementById('dynamic-modal');
    
    if (!modalElement) {
        // 모달 요소 생성
        modalElement = document.createElement('div');
        modalElement.id = 'dynamic-modal';
        modalElement.className = 'modal';
        modalElement.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modal-title"></h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body" id="modal-body"></div>
            </div>
        `;
        
        document.body.appendChild(modalElement);
    }
    
    // 모달 내용 설정
    const modalTitle = modalElement.querySelector('#modal-title');
    const modalBody = modalElement.querySelector('#modal-body');
    
    if (modalTitle) modalTitle.textContent = title;
    if (modalBody) modalBody.innerHTML = content;
    
    // 닫기 버튼 이벤트
    const closeBtn = modalElement.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modalElement.style.display = 'none';
            if (typeof onClose === 'function') {
                onClose();
            }
        });
    }
    
    // 모달 외부 클릭 시 닫기
    modalElement.addEventListener('click', (event) => {
        if (event.target === modalElement) {
            modalElement.style.display = 'none';
            if (typeof onClose === 'function') {
                onClose();
            }
        }
    });
    
    // 모달 표시
    modalElement.style.display = 'block';
    
    return modalElement;
}

// Shape selection modal events
function setupShapeModalEvents() {
    const shapeItems = document.querySelectorAll('.shape-item');
    
    shapeItems.forEach(item => {
        item.addEventListener('click', () => {
            const shape = item.getAttribute('data-shape');
            console.log(`도형 선택: ${shape}`);
            addShapeElement(shape);
            closeModal(document.getElementById('shapeModal'));
        });
    });
}

// Image upload modal events
function setupImageModalEvents() {
    const imageModal = document.getElementById('imageModal');
    if (!imageModal) return;
    
    const uploadInput = document.getElementById('imageUploadInput');
    const uploadBtn = document.getElementById('uploadImageBtn');
    const cancelBtn = document.getElementById('cancelImageBtn');
    const addToSlideBtn = document.getElementById('addImageToSlideBtn');
    const imagePreview = document.getElementById('imagePreview');
    const uploadArea = imageModal.querySelector('.upload-area');
    
    // 드래그 앤 드롭 기능
    if (uploadArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('highlight');
            });
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('highlight');
            });
        });
        
        uploadArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
        });
    }
    
    // 파일 선택 버튼
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            uploadInput.click();
        });
    }
    
    // 파일 선택 처리
    if (uploadInput) {
        uploadInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
            }
        });
    }
    
    // 파일 처리 함수
    function handleFileSelect(file) {
        if (!file.type.match('image.*')) {
            alert('이미지 파일만 선택할 수 있습니다.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            addToSlideBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }
    
    // 취소 버튼
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            closeModal(imageModal);
        });
    }
    
    // 슬라이드에 추가 버튼
    if (addToSlideBtn) {
        addToSlideBtn.addEventListener('click', () => {
            if (imagePreview.src) {
                addImageElement(imagePreview.src);
                closeModal(imageModal);
                
                // 초기화
                setTimeout(() => {
                    imagePreview.src = '';
                    imagePreview.style.display = 'none';
                    if (uploadInput) uploadInput.value = '';
                    addToSlideBtn.disabled = true;
                }, 300);
            }
        });
    }
}

// Export modal events
function setupExportModalEvents() {
    const exportModal = document.getElementById('exportModal');
    if (!exportModal) return;
    
    const confirmBtn = document.getElementById('confirmExportBtn');
    const cancelBtn = document.getElementById('cancelExportBtn');
    
    // 확인 버튼
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            const format = document.getElementById('exportFormat')?.value || 'pptx';
            const quality = document.getElementById('exportQuality')?.value || 'high';
            
            // 내보내기 설정 업데이트
            AppState.exportConfig = {
                format,
                quality
            };
            
            // 내보내기 진행 중 UI 표시
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 내보내는 중...';
            
            // 내보내기 실행
            import('../index.js').then(module => {
                module.exportPresentation()
                    .then(() => {
                        confirmBtn.disabled = false;
                        confirmBtn.innerHTML = '내보내기';
                        closeModal(exportModal);
                    })
                    .catch(error => {
                        confirmBtn.disabled = false;
                        confirmBtn.innerHTML = '내보내기';
                        alert(`내보내기 중 오류가 발생했습니다: ${error.message}`);
                    });
            });
        });
    }
    
    // 취소 버튼
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            closeModal(exportModal);
        });
    }
}

// 모달 열기 함수들
export function openShapeModal() {
    openModal('shapeModal');
}

export function openImageModal() {
    openModal('imageModal');
}

export function openChartModal() {
    // 현재 차트 기능은 구현 중
    alert('차트 기능은 현재 개발 중입니다.');
}

export function openExportModal() {
    openModal('exportModal');
} 