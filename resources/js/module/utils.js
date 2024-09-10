// functions

// datepicker option
export function activeDateOptions(selector) {
  const buttons = document.querySelectorAll(selector);
  buttons.forEach(button => {
    button.addEventListener('click', function() {
      buttons.forEach(btn => btn.classList.remove('is-active'));
      this.classList.add('is-active');
    });
  });
}

// tooltip
export function initTooltips(selector) {
  const tooltips = document.querySelectorAll(selector);

  // 모든 툴팁 비활성화 함수
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

    // 툴팁 활성화/비활성화 토글 함수
    const toggleTooltip = (isVisible) => {
      const action = isVisible ? 'remove' : 'add';
      button.classList[action]('is-active');
      tooltipWrap.classList[action]('is-active');
    };

    // Click
    if (handlerType === 'click') {
      button.addEventListener('click', (e) => {
        e.stopPropagation(); 
        const isVisible = tooltipWrap.classList.contains('is-active');
        closeAllTooltips(); 
        toggleTooltip(isVisible); 
      });

      closeButton.addEventListener('click', (e) => {
        e.stopPropagation(); 
        toggleTooltip(true); 
      });

      // 외부 영역 클릭 시 모든 툴팁 비활성화
      document.addEventListener('click', (e) => {
        if (!tooltip.contains(e.target)) {
          closeAllTooltips();
        }
      });
    }

    // Hover
    if (handlerType === 'hover') {
      button.addEventListener('mouseenter', () => {
        closeAllTooltips(); 
        toggleTooltip(false); 
      });

      button.addEventListener('mouseleave', () => {
        toggleTooltip(true); 
      });

      tooltipWrap.addEventListener('mouseenter', () => {
        toggleTooltip(false); 
      });

      tooltipWrap.addEventListener('mouseleave', () => {
        toggleTooltip(true); 
      });
    }
  });
}

// 폼 라벨 클래스 업데이트
export function updateFormLabelClasses() {
  const inputs = document.querySelectorAll('.inp-checkbox, .inp-radio, .inp-switch');

  function updateLabelClass(input) {
    const label = input.closest('label'); 
    if (!label) return; // 라벨이 없으면 함수 종료

    // 'is-checked'
    if (input.checked) {
      label.classList.add('is-checked');
    } else {
      label.classList.remove('is-checked');
    }
    // 'is-focused'
    if (input === document.activeElement) {
      label.classList.add('is-focused');
    } else {
      label.classList.remove('is-focused');
    }
    // 'is-disabled'
    if (input.disabled) {
      label.classList.add('is-disabled');
    } else {
      label.classList.remove('is-disabled');
    }
  }

  inputs.forEach(input => {
    updateLabelClass(input);

    input.addEventListener('change', function() {
      updateLabelClass(input);
    });

    input.addEventListener('focus', function() {
      updateLabelClass(input);
    });
    input.addEventListener('blur', function() {
      updateLabelClass(input);
    });
  });
}