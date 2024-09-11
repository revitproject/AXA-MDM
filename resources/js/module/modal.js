export class ModalManager {
  constructor() {
    this.dialogContainer = null;
    this.dimElement = null;  // dimmed 요소 저장
    this.modalStack = [];    // 현재 열려 있는 모달을 관리하는 스택 배열
    this.focusableElementsSelector = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'; // 포커스 가능한 요소
    this.initModal();
  }

  // 모달 초기화
  initModal() {
    document.body.addEventListener('click', (e) => {
      const openTrigger = e.target.closest('[data-modal="open"]');
      const closeTrigger = e.target.closest('[data-modal="close"]');

      if (openTrigger) {
        this.handleOpenTrigger(openTrigger);
        e.preventDefault();
      } else if (closeTrigger) {
        this.handleCloseTrigger(closeTrigger);
        e.preventDefault();
      }
    });

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        const activeModal = this.modalStack[this.modalStack.length - 1];
        if (activeModal) {
          this.closeModal(activeModal);
        }
      }
    });
  }

  // 모달 열기 트리거 처리
  handleOpenTrigger(openTrigger) {
    const modalId = openTrigger.getAttribute('data-url') || openTrigger.getAttribute('href');
    const modalElement = document.querySelector(modalId);

    if (modalElement) {
      this.openModal(modalElement);
    } else {
      console.error(`모달 ID ${modalId}를 찾을 수 없습니다.`);
    }
  }

  // 모달 닫기 트리거 처리
  handleCloseTrigger(closeTrigger) {
    const modalElement = closeTrigger.closest('.modal');

    if (modalElement) {
      this.closeModal(modalElement);
    } else {
      console.error('모달을 닫을 수 없습니다. 모달 요소를 찾을 수 없습니다.');
    }
  }

  // 모달 열기
  openModal(modal, falseFn = null, trueFn = null) {
    if (!modal) {
      console.error('열 모달이 제공되지 않았습니다.');
      return;
    }

    this.modalStack.push(modal);

    // 첫 번째 모달일 때 dimmed 요소 생성
    if (this.modalStack.length === 1) {
      this.createDimmedElement();
    }

    modal.classList.add('is-show');

    // 포커스 트랩 설정
    this.focusTrap(modal);

    // 콜백 함수가 있으면 버튼 리스너 추가
    const trueBtn = modal.querySelector('.is-true');
    const falseBtn = modal.querySelector('.is-false');

    if (trueBtn && typeof trueFn === 'function') {
      trueBtn.addEventListener('click', trueFn);
    }

    if (falseBtn && typeof falseFn === 'function') {
      falseBtn.addEventListener('click', falseFn);
    }

    // console.log('모달 스택 상태 (열림):', this.modalStack);
  }

  // 모달 닫기
  closeModal(modal) {
    if (!modal) {
      console.error('닫을 모달이 제공되지 않았습니다.');
      return;
    }

    modal.classList.remove('is-show');

    this.modalStack = this.modalStack.filter(m => m !== modal);

    if (this.modalStack.length === 0) {
      this.removeDimmedElement();
    } else {
      const previousModal = this.modalStack[this.modalStack.length - 1];
      this.focusTrap(previousModal);
    }

    // console.log('모달 스택 상태 (닫힘):', this.modalStack);
  }

  // dimmed
  createDimmedElement() {
    if (this.dimElement) return;

    const dimmed = document.createElement('div');
    dimmed.classList.add('modal-dimmed');
    document.body.appendChild(dimmed);
    this.dimElement = dimmed;
  }

  removeDimmedElement() {
    if (this.dimElement) {
      this.dimElement.remove();
      this.dimElement = null;
    }
  }

  // ID로 모달 열기
  openModalById(modalId, falseFn = null, trueFn = null) {
    const modal = document.getElementById(modalId);

    if (modal) {
      this.openModal(modal, falseFn, trueFn);
    } else {
      console.error(`ID가 ${modalId}인 모달을 찾을 수 없습니다.`);
    }
  }

  // 포커스 트랩 설정 (모달 내부에서만 포커스 순회)
  focusTrap(modal) {
    const focusableElements = modal.querySelectorAll(this.focusableElementsSelector);
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    modal.addEventListener('keydown', (e) => {
      const isTabPressed = e.key === 'Tab' || e.keyCode === 9;

      if (!isTabPressed) return;

      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus();
          e.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
          e.preventDefault();
        }
      }
    });

    // 모달이 열리면 첫 번째 포커스 가능한 요소로 포커스 이동
    firstFocusableElement?.focus();
  }

  // 다이얼로그 모달 초기화
  initDialog() {
    if (this.dialogContainer) return;

    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
      <div class="modal-inner">
        <div class="modal-header">
          <button class="modal-close" data-modal="close"><span class="hidden">닫기</span></button>
          <strong class="modal-title"></strong>
        </div>
        <div class="modal-body">
          <p class="modal-msg"></p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn is-footer is-true">확인</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    this.dialogContainer = modal;

    this.dialogTitle = this.dialogContainer.querySelector('.modal-title');
    this.dialogText = this.dialogContainer.querySelector('.modal-msg');
    this.trueBtn = this.dialogContainer.querySelector('.is-true');
  }

  // 다이얼로그 모달 표시 (alert/confirm)
  showDialog(type, title, msg, falseFn = null, trueFn, falseBtnText = '취소', trueBtnText = '확인') {
    this.initDialog();

    // 타입에 따라 클래스 추가
    this.dialogContainer.classList.remove('has-alert', 'has-confirm'); 
    if (type === 'alert') {
        this.dialogContainer.classList.add('has-alert');
    } else if (type === 'confirm') {
        this.dialogContainer.classList.add('has-confirm');
    }
    

    this.dialogTitle.textContent = title;
    this.dialogText.innerHTML = msg;
    this.trueBtn.textContent = trueBtnText;

    if (type === 'confirm') {
      this.addCancelButton(falseBtnText, falseFn);
    } else {
      this.hideCancelButton();
    }

    this.addButtonListeners(trueFn, falseFn);
    this.showDialogModal();
  }

  // 취소 버튼 추가 (confirm 전용)
  addCancelButton(falseBtnText, falseFn) {
    if (!this.falseBtn) {
      this.falseBtn = document.createElement('button');
      this.falseBtn.type = 'button';
      this.falseBtn.classList.add('btn', 'is-footer', 'is-false');
      this.dialogContainer.querySelector('.modal-footer').appendChild(this.falseBtn);
    }
    this.falseBtn.style.display = 'inline-flex';
    this.falseBtn.textContent = falseBtnText;

    // 취소 버튼 리스너 설정
    this.falseBtnClickHandler = () => {
      if (typeof falseFn === 'function') {
        falseFn();
      }
    };
    this.falseBtn.addEventListener('click', this.falseBtnClickHandler);
  }

  // 취소 버튼 숨기기 (alert 전용)
  hideCancelButton() {
    if (this.falseBtn) {
      this.falseBtn.style.display = 'none';
    }
  }

  // 버튼 이벤트 리스너 추가
  addButtonListeners(trueFn, falseFn) {
    this.trueBtn.removeEventListener('click', this.trueBtnClickHandler);
    if (this.falseBtn) {
      this.falseBtn.removeEventListener('click', this.falseBtnClickHandler);
    }

    this.trueBtnClickHandler = () => {
      if (typeof trueFn === 'function') {
        trueFn();
      }
      // this.closeCurrentModal();  // 확인 후 모달 닫기
    };

    this.trueBtn.addEventListener('click', this.trueBtnClickHandler);

    if (this.falseBtn) {
      this.falseBtnClickHandler = () => {
        if (typeof falseFn === 'function') {
          falseFn();
        }
        // this.closeCurrentModal();  // 취소 후 모달 닫기
      };

      this.falseBtn.addEventListener('click', this.falseBtnClickHandler);
    }
  }

  // alert 모달
  alert(title, msg, trueFn, trueBtnText = '확인') {
    this.showDialog('alert', title, msg, null, trueFn, trueBtnText);
  }

  // confirm 모달
  confirm(title, msg, falseFn, trueFn, falseBtnText = '취소', trueBtnText = '확인') {
    this.showDialog('confirm', title, msg, falseFn, trueFn, falseBtnText, trueBtnText);
  }

  // 다이얼로그 모달 열기
  showDialogModal() {
    if (this.dialogContainer) {
      this.dialogContainer.classList.add('is-show');

      this.modalStack.push(this.dialogContainer);
      if (this.modalStack.length === 1) {
        this.createDimmedElement();
      }

      // 포커스 트랩 설정
      this.focusTrap(this.dialogContainer);

      // 모달 스택 상태 출력
      // console.log('다이얼로그 스택 상태 (열림):', this.modalStack);
    }
  }

  // 다이얼로그 모달 닫기
  hideDialog() {
    if (this.dialogContainer) {
      this.dialogContainer.classList.remove('is-show');

      this.modalStack.pop();
      if (this.modalStack.length === 0) {
        this.removeDimmedElement();
      }

      // console.log('다이얼로그 스택 상태 (닫힘):', this.modalStack);
    }
  }

  // 현재 활성화된 모달 닫기 메서드
  closeCurrentModal() {
    const activeModal = this.modalStack[this.modalStack.length - 1];

    if (activeModal) {
      this.closeModal(activeModal);  // 가장 마지막에 열린 모달만 닫음
    } else {
      console.error('닫을 모달이 없습니다.');
    }

    // console.log('모달 스택 상태 (현재 모달 닫힘):', this.modalStack);
  }
}