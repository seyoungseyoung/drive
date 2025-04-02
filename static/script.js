// ... existing code ...

// AI 편집 요청
aiSubmitBtn.addEventListener('click', function() {
    const prompt = aiPromptInput.value.trim();
    if (!prompt) {
        alert('편집 지시사항을 입력해주세요.');
        return;
    }
    
    const currentSlideIndex = currentSlide;
    if (currentSlideIndex === null) {
        alert('선택된 슬라이드가 없습니다.');
        return;
    }
    
    // 로딩 표시
    aiSubmitBtn.disabled = true;
    aiSubmitBtn.innerHTML = '<span class="loading"></span> 처리 중...';
    
    // 타임아웃 설정
    const timeoutId = setTimeout(() => {
        aiSubmitBtn.disabled = false;
        aiSubmitBtn.textContent = 'AI에게 요청하기';
        alert('요청 시간이 초과되었습니다. 다시 시도해주세요.');
    }, 30000); // 30초 타임아웃
    
    // AI 편집 요청 보내기
    fetch('/edit_slide_ai', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            index: currentSlideIndex,
            prompt: prompt
        })
    })
    .then(response => {
        clearTimeout(timeoutId); // 타임아웃 취소
        if (!response.ok) {
            throw new Error(`서버 오류: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // 성공적으로 요소가 추가됨
            console.log('AI가 생성한 요소:', data.elements);
            
            // 현재 슬라이드의 요소 업데이트
            slides[currentSlideIndex].elements = data.elements;
            
            // 캔버스 다시 렌더링
            clearCanvas();
            renderCanvasElements();
            
            // 모달 닫기
            aiEditModal.style.display = 'none';
            
            // 알림
            alert('AI가 슬라이드 요소를 생성했습니다!');
        } else {
            // 오류 처리
            alert('오류 발생: ' + (data.error || '알 수 없는 오류'));
        }
    })
    .catch(error => {
        console.error('AI 편집 요청 오류:', error);
        alert('AI 편집 요청 중 오류가 발생했습니다: ' + error.message);
    })
    .finally(() => {
        clearTimeout(timeoutId); // 타임아웃 취소 (중복 호출은 안전함)
        // 버튼 상태 복원
        aiSubmitBtn.disabled = false;
        aiSubmitBtn.textContent = 'AI에게 요청하기';
    });
});

// ... existing code ...