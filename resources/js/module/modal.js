export class ModalManager {
  constructor() {
    this.dialogContainer = null;
    this.modalStack = [];
    this.focusableElementsSelector = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
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

  // 모달 열기 트리거
  handleOpenTrigger(openTrigger) {
    const modalId = openTrigger.getAttribute('data-url') || openTrigger.getAttribute('href');
    const modalElement = document.querySelector(modalId);

    if (modalElement) {
      this.openModal(modalElement);
    } else {
      console.error(`모달 ID ${modalId}를 찾을 수 없습니다.`);
    }
  }

  // 모달 닫기 트리거
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

    // 딤드 요소 생성 및 모달 앞에 추가
    const dimmed = this.createDimmedElement(modal);
    modal._dimmedElement = dimmed; // 모달에 딤드 요소 참조 저장

    this.modalStack.push(modal);

    modal.classList.add('is-show');

    // z-index 설정
    const baseZIndex = 1000;
    const modalZIndex = baseZIndex + this.modalStack.length * 10;
    dimmed.style.zIndex = modalZIndex - 1; // 딤드 요소의 z-index 설정
    modal.style.zIndex = modalZIndex;

    // 포커스 트랩 설정
    this.focusTrap(modal);

    this.removeButtonListeners(modal);

    // 콜백 함수가 있으면 버튼 리스너 추가
    const trueBtn = modal.querySelector('.is-true');
    const falseBtn = modal.querySelector('.is-false');

    if (trueBtn && typeof trueFn === 'function') {
      trueBtn.addEventListener('click', trueFn);
      trueBtn._listener = trueFn; 
    }

    if (falseBtn && typeof falseFn === 'function') {
      falseBtn.addEventListener('click', falseFn);
      falseBtn._listener = falseFn; 
    }
  }

  // 모달 닫기
  closeModal(modal) {
    if (!modal) {
      console.error('닫을 모달이 제공되지 않았습니다.');
      return;
    }

    modal.classList.remove('is-show');

    // 딤드 요소 제거
    if (modal._dimmedElement) {
      modal._dimmedElement.remove();
      delete modal._dimmedElement;
    }

    this.removeButtonListeners(modal);
    this.removeFocusTrap(modal);

    this.modalStack = this.modalStack.filter((m) => m !== modal);
  }

  // 딤드 요소 생성
  createDimmedElement(modal) {
    const dimmed = document.createElement('div');
    dimmed.classList.add('modal-dimmed');
    modal.parentNode.appendChild(dimmed);
    return dimmed;
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

  // 포커스 트랩 설정
  focusTrap(modal) {
    const focusableElements = modal.querySelectorAll(this.focusableElementsSelector);
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    this.currentFocusTrap = (e) => {
      const isTabPressed = e.key === 'Tab' || e.keyCode === 9;

      if (!isTabPressed) return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
          e.preventDefault();
        }
      }
    };

    modal.addEventListener('keydown', this.currentFocusTrap);

    // 모달이 열리면 첫 번째 포커스 가능한 요소로 포커스 이동
    firstFocusableElement?.focus();
  }

  // 포커스 트랩 제거
  removeFocusTrap(modal) {
    if (this.currentFocusTrap) {
      modal.removeEventListener('keydown', this.currentFocusTrap);
      this.currentFocusTrap = null;
    }
  }

  // 버튼 이벤트 리스너 제거
  removeButtonListeners(modal) {
    const trueBtn = modal.querySelector('.is-true');
    const falseBtn = modal.querySelector('.is-false');

    if (trueBtn && trueBtn._listener) {
      trueBtn.removeEventListener('click', trueBtn._listener);
      delete trueBtn._listener;
    }

    if (falseBtn && falseBtn._listener) {
      falseBtn.removeEventListener('click', falseBtn._listener);
      delete falseBtn._listener;
    }
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

  // 다이얼로그 모달 표시
  showDialog(type, title, msg, falseFn = null, trueFn, falseBtnText = '취소', trueBtnText = '확인') {
    this.initDialog();

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
      this.addCancelButton(falseBtnText);
    } else {
      this.hideCancelButton();
    }

    this.addDialogButtonListeners(trueFn, falseFn);
    this.showDialogModal();
  }

  // 취소 버튼 추가
  addCancelButton(falseBtnText) {
    if (!this.falseBtn) {
      this.falseBtn = document.createElement('button');
      this.falseBtn.type = 'button';
      this.falseBtn.classList.add('btn', 'is-footer', 'is-false');
  
      const modalFooter = this.dialogContainer.querySelector('.modal-footer');
      modalFooter.insertBefore(this.falseBtn, this.trueBtn); 
    }
    this.falseBtn.style.display = 'inline-flex';
    this.falseBtn.textContent = falseBtnText;
  }   

  // 취소 버튼 숨기기
  hideCancelButton() {
    if (this.falseBtn) {
      this.falseBtn.style.display = 'none';
    }
  }

  // 다이얼로그 버튼 이벤트 리스너 추가
  addDialogButtonListeners(trueFn, falseFn) {
    // 기존 리스너 제거
    if (this.trueBtn && this.trueBtn._listener) {
      this.trueBtn.removeEventListener('click', this.trueBtn._listener);
      delete this.trueBtn._listener;
    }

    if (this.falseBtn && this.falseBtn._listener) {
      this.falseBtn.removeEventListener('click', this.falseBtn._listener);
      delete this.falseBtn._listener;
    }

    // 새로운 리스너 추가
    if (this.trueBtn && typeof trueFn === 'function') {
      this.trueBtn.addEventListener('click', trueFn);
      this.trueBtn._listener = trueFn;
    }

    if (this.falseBtn && typeof falseFn === 'function') {
      this.falseBtn.addEventListener('click', falseFn);
      this.falseBtn._listener = falseFn;
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
      // 딤드 요소 생성 및 모달 앞에 추가
      const dimmed = this.createDimmedElement(this.dialogContainer);
      this.dialogContainer._dimmedElement = dimmed; // 모달에 딤드 요소 참조 저장

      this.modalStack.push(this.dialogContainer);

      this.dialogContainer.classList.add('is-show');

      // z-index 설정
      const baseZIndex = 1000;
      const modalZIndex = baseZIndex + this.modalStack.length * 10;
      dimmed.style.zIndex = modalZIndex - 1; // 딤드 요소의 z-index 설정
      this.dialogContainer.style.zIndex = modalZIndex;

      // 포커스 트랩 설정
      this.focusTrap(this.dialogContainer);
    }
  }

  // 다이얼로그 모달 닫기
  hideDialog() {
    if (this.dialogContainer) {
      this.dialogContainer.classList.remove('is-show');

      // 딤드 요소 제거
      if (this.dialogContainer._dimmedElement) {
        this.dialogContainer._dimmedElement.remove();
        delete this.dialogContainer._dimmedElement;
      }

      this.removeFocusTrap(this.dialogContainer);
      this.modalStack.pop();
    }
  }

  // 현재 활성화된 모달 닫기
  closeCurrentModal() {
    const activeModal = this.modalStack[this.modalStack.length - 1];

    if (activeModal) {
      this.closeModal(activeModal);
    } else {
      console.error('닫을 모달이 없습니다.');
    }
  }
}