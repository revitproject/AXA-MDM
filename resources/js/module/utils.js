// 날짜 선택 버튼 활성화
export function setDateButtons(selector) {
  const buttons = document.querySelectorAll(selector);
  buttons.forEach(button => {
    button.addEventListener('click', function() {
      buttons.forEach(btn => btn.classList.remove('is-active')); // 모든 버튼 비활성화
      this.classList.add('is-active'); // 클릭된 버튼 활성화
    });
  });
}

// 툴팁 활성화 및 비활성화 관리
export function toggleTooltips(selector) {
  const tooltips = document.querySelectorAll(selector);

  // 모든 툴팁 비활성화
  const closeAllTooltips = () => {
    tooltips.forEach(tooltip => {
      const button = tooltip.querySelector('.btn-tooltip');
      const tooltipWrap = tooltip.querySelector('.tooltip-inner');
      button.classList.remove('is-active');
      tooltipWrap.classList.remove('is-active');
    });
  };

  tooltips.forEach(tooltip => {
    const button = tooltip.querySelector('.btn-tooltip');
    const tooltipWrap = tooltip.querySelector('.tooltip-inner');
    const closeButton = tooltip.querySelector('.tooltip-close');
    const handlerType = button.dataset.type;

    // 툴팁 토글 처리
    const toggleTooltip = (isVisible) => {
      const action = isVisible ? 'remove' : 'add';
      button.classList[action]('is-active');
      tooltipWrap.classList[action]('is-active');
    };

    // 클릭 이벤트 처리
    if (handlerType === 'click') {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = tooltipWrap.classList.contains('is-active');
        closeAllTooltips(); // 다른 툴팁 비활성화
        toggleTooltip(isVisible); // 현재 툴팁 토글
      });

      closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTooltip(true); // 툴팁 닫기
      });

      // 외부 클릭 시 모든 툴팁 비활성화
      document.addEventListener('click', (e) => {
        if (!tooltip.contains(e.target)) {
          closeAllTooltips();
        }
      });
    }

    // 마우스 오버/아웃 이벤트 처리
    if (handlerType === 'hover') {
      button.addEventListener('mouseenter', () => {
        closeAllTooltips();
        toggleTooltip(false); // 툴팁 활성화
      });

      button.addEventListener('mouseleave', () => {
        toggleTooltip(true); // 툴팁 비활성화
      });

      tooltipWrap.addEventListener('mouseenter', () => {
        toggleTooltip(false); // 툴팁 유지
      });

      tooltipWrap.addEventListener('mouseleave', () => {
        toggleTooltip(true); // 툴팁 비활성화
      });
    }
  });
}

// 폼 라벨 상태 업데이트
export function updateFormLabels() {
  const inputs = document.querySelectorAll('.inp-base, .inp-checkbox, .inp-radio, .inp-switch');

  // 라벨 상태 업데이트
  function updateLabelClass(input) {
    const label = input.closest('label');
    if (!label) return;

    // 체크 상태 업데이트 (기존 클래스 유지)
    if (input.checked) {
      label.classList.add('is-checked');
    } else {
      label.classList.remove('is-checked');
    }

    // 포커스 상태 업데이트 (기존 클래스 유지)
    if (input === document.activeElement) {
      label.classList.add('is-focused');
    } else {
      label.classList.remove('is-focused');
    }

    // 비활성 상태 업데이트 (기존 클래스 유지)
    if (input.disabled) {
      label.classList.add('is-disabled');
    } else {
      label.classList.remove('is-disabled');
    }

    // 읽기 전용 상태 업데이트 (기존 클래스 유지)
    if (input.readOnly) {
      label.classList.add('is-readonly');
    } else {
      label.classList.remove('is-readonly');
    }
  }

  inputs.forEach(input => {
    updateLabelClass(input); // 초기 상태 설정

    input.addEventListener('change', () => updateLabelClass(input));
    input.addEventListener('focus', () => updateLabelClass(input));
    input.addEventListener('blur', () => updateLabelClass(input));
  });
}

// 숫자 입력 컨트롤
export function setNumberControls(selector) {
  const container = document.querySelector(selector);

  if (!container) {
    console.error(`선택자에 해당하는 컨테이너가 없습니다: ${selector}`);
    return;
  }

  const input = container.querySelector('.inp-number');
  if (!input) {
    console.error('컨테이너 내에 숫자 입력 필드가 없습니다.');
    return;
  }

  // 플러스/마이너스 버튼 값 변경
  container.addEventListener('click', event => {
    const { target } = event;
    let currentValue = parseInt(input.value, 10) || 0;
    
    if (target.classList.contains('btn-plus')) {
      input.value = currentValue + 1; // 값 증가
    } else if (target.classList.contains('btn-minus')) {
      if (currentValue > 0) {
        input.value = currentValue - 1; // 값 감소, 음수 방지
      } else {
        input.value = 0;
      }
    }
  });
}

// 패스워드 폼 토글 버튼 제어
export function setPasswordForm(selector) {
  const passwordForms = document.querySelectorAll(selector);

  passwordForms.forEach(passwordForm => {
    const passwordInput = passwordForm.querySelector('.lb-inp.is-toggle .inp-base');
    const clearBtn = passwordForm.querySelector('.btn-eye');

    clearBtn.addEventListener('click', (e) => {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        e.target.classList.add('is-show');
      } else {
        passwordInput.type = 'password';
        e.target.classList.remove('is-show');
      }
    })
  })
}

// 검색 폼 클리어 버튼 제어
export function setSearchForm(selector) {
  const searchForms = document.querySelectorAll(selector);

  searchForms.forEach(searchForm => {
    const searchInput = searchForm.querySelector('.inp-search');
    const clearBtn = searchForm.querySelector('.btn-clear');

    if (!searchInput || !clearBtn) return;

    // 검색어에 따른 클리어 버튼 표시
    const toggleClearButton = () => {
      if (searchInput.value.trim() !== '') {
        clearBtn.style.display = 'block';
        searchForm.classList.add('has-value');
      } else {
        clearBtn.style.display = 'none';
        searchForm.classList.remove('has-value');
      }
    };

    // 초기 상태 설정
    toggleClearButton();

    searchInput.addEventListener('focus', () => searchForm.classList.add('is-focus'));
    searchInput.addEventListener('blur', () => searchForm.classList.remove('is-focus'));
    searchInput.addEventListener('input', toggleClearButton);

    // 클리어 버튼 클릭 시 입력 초기화
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchInput.focus();
      toggleClearButton();
    });
  });
}