// Modal
class ModalManager {
  constructor() {
    this.dialogContainer = null;
    this.dimElement = null;  // Dimmed 요소 저장
    this.modalStack = [];    // 모달 스택을 저장
    this.focusableElementsSelector = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'; // 포커스 가능한 요소
    this.initModal();
  }

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

  handleOpenTrigger(openTrigger) {
    const modalId = openTrigger.getAttribute('data-url') || openTrigger.getAttribute('href');
    const modalElement = document.querySelector(modalId);

    if (modalElement) {
      this.openModal(modalElement);
    } else {
      console.error(`모달 ID ${modalId}를 찾을 수 없습니다.`);
    }
  }

  handleCloseTrigger(closeTrigger) {
    const modalElement = closeTrigger.closest('.modal');

    if (modalElement) {
      this.closeModal(modalElement);
    } else {
      console.error('모달을 닫을 수 없습니다. 모달 요소를 찾을 수 없습니다.');
    }
  }

  openModal(modal) {
    if (!modal) {
      console.error('열 모달이 제공되지 않았습니다.');
      return;
    }

    // 모달 스택에 추가
    this.modalStack.push(modal);

    // 첫 번째 모달일 때 dimmed 요소 생성
    if (this.modalStack.length === 1) {
      this.createDimmedElement();
    }

    modal.classList.add('is-show');

    // 포커스 트랩 설정
    this.focusTrap(modal);
  }

  closeModal(modal) {
    if (!modal) {
      console.error('닫을 모달이 제공되지 않았습니다.');
      return;
    }

    modal.classList.remove('is-show');

    // 모달 스택에서 해당 모달 제거
    this.modalStack = this.modalStack.filter((m) => m !== modal);

    // 모달 스택이 비었을 때만 dimmed 요소 제거
    if (this.modalStack.length === 0) {
      this.removeDimmedElement();
    }
  }

  createDimmedElement() {
    if (this.dimElement) return; // 이미 dimmed가 있으면 다시 생성하지 않음

    const dimmed = document.createElement('div');
    dimmed.classList.add('modal-dimmed');
    document.querySelector('.modal').appendChild(dimmed);
    this.dimElement = dimmed;

    // dimmed 클릭 시 가장 최근에 열린 모달 닫기
    dimmed.addEventListener('click', () => {
      const activeModal = this.modalStack[this.modalStack.length - 1];
      if (activeModal) {
        this.closeModal(activeModal);
      }
    });
  }

  removeDimmedElement() {
    if (this.dimElement) {
      this.dimElement.remove();
      this.dimElement = null;
    }
  }

  openModalById(modalId) {
    const modal = document.getElementById(modalId);

    if (modal) {
      this.openModal(modal);
    } else {
      console.error(`ID가 ${modalId}인 모달을 찾을 수 없습니다.`);
    }
  }

  // 포커스 트랩 설정 (모달 내부에서만 포커스가 순회되도록)
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

  // Dialog(Alert/Confirm) 초기화 (동적 요소 생성)
  initDialog() {
    if (this.dialogContainer) return;

    console.log('Initializing dialog modal');

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

    // 참조 저장
    this.dialogTitle = this.dialogContainer.querySelector('.modal-title');
    this.dialogText = this.dialogContainer.querySelector('.modal-msg');
    this.trueBtn = this.dialogContainer.querySelector('.is-true');
  }

  // 공통 alert/confirm 표시
  showDialog(type, title, msg, trueFn, falseFn = null, trueBtnText = '확인', falseBtnText = '취소') {
    this.initDialog();

    this.dialogTitle.textContent = title;
    this.dialogText.innerHTML = msg;
    this.trueBtn.textContent = trueBtnText;

    // Confirm일 경우 취소 버튼 활성화
    if (type === 'confirm') {
      this.addCancelButton(falseBtnText, falseFn);  // 취소 버튼 추가
    } else {
      this.removeCancelButton();  // Alert 모달에서는 취소 버튼 제거
    }

    // 기존 이벤트 리스너 제거 후 추가
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

  // 취소 버튼 제거 (alert 전용)
  removeCancelButton() {
    if (this.falseBtn) {
      this.falseBtn.style.display = 'none';
      this.falseBtn.removeEventListener('click', this.falseBtnClickHandler);
    }
  }

  addButtonListeners(trueFn, falseFn) {
    // 기존 리스너 제거 후 다시 추가
    this.trueBtn.removeEventListener('click', this.trueBtnClickHandler);

    // 새로운 리스너 정의
    this.trueBtnClickHandler = () => {
      if (typeof trueFn === 'function') {
        trueFn();
      }
    };

    this.trueBtn.addEventListener('click', this.trueBtnClickHandler);
  }

  // alert 함수
  alert(title, msg, trueFn, trueBtnText = '확인') {
    this.showDialog('alert', title, msg, trueFn, null, trueBtnText);
  }

  // confirm 함수
  confirm(title, msg, trueFn, falseFn, trueBtnText = '확인', falseBtnText = '취소') {
    this.showDialog('confirm', title, msg, trueFn, falseFn, trueBtnText, falseBtnText);
  }

  showDialogModal() {
    if (this.dialogContainer) {
      this.dialogContainer.classList.add('is-show');

      // 모달 스택에 추가 및 dimmed 처리
      this.modalStack.push(this.dialogContainer);
      if (this.modalStack.length === 1) {
        this.createDimmedElement();
      }

      // 포커스 트랩 설정
      this.focusTrap(this.dialogContainer);
    }
  }

  hideDialog() {
    if (this.dialogContainer) {
      this.dialogContainer.classList.remove('is-show');

      // 모달 스택에서 제거 및 dimmed 처리
      this.modalStack.pop();
      if (this.modalStack.length === 0) {
        this.removeDimmedElement();
      }
    }
  }
}

// Tab
class TabManager {
  constructor() {
    this.tabManagers = []; 
    this.initTabs();
  }

  // 초기 탭 설정
  initTabs() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest(".tab-link");
      if (target && target.getAttribute("href") === "#") {
        e.preventDefault();
        this.handleTabClick(target);
      }
    });
  }

  // 탭 클릭 처리
  handleTabClick(target) {
    const tabContentId = target.dataset.tab;
    const tabList = target.closest(".ui-tab");

    this.activateTab(target, tabList);
    this.activateTabContent(tabContentId, tabList);

    this.initNestedTabs(tabContentId, tabList);
  }

  // 활성화 탭/콘텐츠 설정
  activateTab(target, tabList) {
    tabList.querySelectorAll(".tab-item").forEach(item => {
      item.classList.remove("is-active");
    });
    target.closest(".tab-item").classList.add("is-active");
  }

  // 선택된 탭에 해당하는 콘텐츠 활성화
  activateTabContent(tabContentId, tabList) {
    document.querySelectorAll(".tab-content").forEach(content => {
      if (content.closest(".ui-tab") === tabList) {
        content.classList.remove("is-active");
        if (content.getAttribute("data-tab-content") === tabContentId) {
          content.classList.add("is-active");
        }
      }
    });
  }

  // 중첩된 탭이 있을 경우 추가적으로 탭 관리자 초기화
  initNestedTabs(tabContentId, tabList) {
    const tabContent = tabList.querySelector(`.tab-content[data-tab-content="${tabContentId}"]`);
    if (tabContent) {
      const nestedTabs = tabContent.querySelectorAll('.ui-tab');
      nestedTabs.forEach(nestedTab => {
        const tabManager = new TabManager();
        this.tabManagers.push(tabManager); 
      });
    }
  }
}

// Dropdown
class DropdownManager {
  constructor(element) {
    this.dropdown = element;
    this.trigger = this.dropdown.querySelector('.dropdown-trigger');
    this.menu = this.dropdown.querySelector('.dropdown-menu');
    this.init();
  }

  init() {
    this.trigger.addEventListener('click', () => {
      this.dropdown.classList.toggle('open');
    });

    this.menu.addEventListener('click', event => {
      if (event.target.classList.contains('dropdown-item')) {
        this.selectItem(event.target);
      }
    });
  }

  selectItem(item) {
    this.menu.querySelectorAll('.dropdown-item').forEach(dropdownItem => {
      dropdownItem.classList.remove('selected');
    });
    item.classList.add('selected');
    this.trigger.textContent = item.textContent;
    this.dropdown.classList.remove('open');
  }
}

// function
function activeDateOptions(selector) {
  const buttons = document.querySelectorAll(selector);
  buttons.forEach(button => {
    button.addEventListener('click', function() {
      buttons.forEach(btn => btn.classList.remove('is-active'));
      this.classList.add('is-active');
    });
  });
}

// Dynamic Content Loader
class DynamicContentLoader {
	constructor() {
		this.activeScriptElements = [];
		this.setupPopStateListener();
		this.setActiveLinkOnLoad();
		this.init(); }

	init() {
		// 이벤트 리스너가 중복으로 추가되지 않도록 `init` 함수는 처음 한 번만 호출
		this.bindLinkEvents();
	}

	bindLinkEvents() {
		const navLinks = document.querySelectorAll('.lnb-link, .btn[data-content]');

		navLinks.forEach(link => {
			link.removeEventListener('click', this.handleLinkClick.bind(this)); // 기존 이벤트 제거
			link.addEventListener('click', this.handleLinkClick.bind(this)); // 이벤트 리스너 추가
		});
	}

	handleLinkClick(e) {
		e.preventDefault();
		const link = e.currentTarget;
		const contentId = link.dataset.content;
		const path = link.dataset.path;

		if (!path) {
			console.error('Path not specified for content loading.');
			return;
		}

		this.updateActiveLink(link);  // 클릭한 링크에 활성 상태 표시
		this.loadAndReplaceContent(contentId, path);  // 콘텐츠 로드 및 스크립트 관리

		// URL을 올바르게 설정하여 히스토리 상태 추가
		const state = { contentId, path };
		const title = document.title;
		const baseUrl = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
		const url = `${baseUrl}/${contentId}.html`;

		history.pushState(state, title, url);
	}

	loadAndReplaceContent(contentId, path) {
		const url = `${path}/${contentId}.html`;

		fetch(url)
			.then(response => {
				if (!response.ok) {
					throw new Error(`Failed to load content: ${response.status}`);
				}
				return response.text();
			})
			.then(html => {
				const parser = new DOMParser();
				const doc = parser.parseFromString(html, 'text/html');

				const newContent = doc.querySelector('.base-view');
				if (newContent) {
					document.getElementById('main-content').innerHTML = newContent.innerHTML;

					// 기존 스크립트 제거 후, 새 스크립트 실행
					this.resetScripts(); 
					this.executeScripts(doc);  

					// 새로 로드된 콘텐츠에서 추가적인 초기화 작업 필요 시 여기에 추가
					this.bindLinkEvents();  // 새로 로드된 콘텐츠에서도 링크 이벤트 바인딩
				} else {
					document.getElementById('main-content').innerHTML = '<p>No content found.</p>';
				}
			})
			.catch(error => {
				console.error('Error loading the content:', error);
				document.getElementById('main-content').innerHTML = '<p>Error loading content. Please try again later.</p>';
			});
	}

	executeScripts(doc) {
		const scripts = doc.querySelectorAll('script');
		scripts.forEach(script => {
			const newScript = document.createElement('script');
			if (script.src) {
				newScript.src = script.src;
			} else {
				newScript.textContent = script.textContent;
			}
			document.body.appendChild(newScript);
			this.activeScriptElements.push(newScript);  // 새 스크립트 요소를 추적
		});
	}

	resetScripts() {
		// 기존에 추가된 동적 스크립트를 제거
		this.activeScriptElements.forEach(script => {
			document.body.removeChild(script);
		});
		this.activeScriptElements = [];
	}

	updateActiveLink(activeLink) {
		const navLinks = document.querySelectorAll('.lnb-link, .btn[data-content]');
		navLinks.forEach(link => link.classList.remove('is-active'));
		activeLink.classList.add('is-active');  // 클릭한 링크에 활성 상태 표시
	}

	// 페이지 로드 시 현재 URL을 기반으로 활성화된 링크 설정
	setActiveLinkOnLoad() {
		const currentPath = window.location.pathname;
		const navLinks = document.querySelectorAll('.lnb-link, .btn[data-content]');

		navLinks.forEach(link => {
			const linkPath = `${link.dataset.path}/${link.dataset.content}.html`;
			if (currentPath.endsWith(linkPath)) {
				link.classList.add('is-active');
			}
		});
	}

	// 뒤로가기 및 앞으로가기를 처리하는 popstate 이벤트 리스너 설정
	setupPopStateListener() {
		window.addEventListener('popstate', (event) => {
			const state = event.state;
			if (state) {
				this.loadAndReplaceContent(state.contentId, state.path);
			}
		});
	}
}

// 초기화 및 동적 로드된 콘텐츠 처리
document.addEventListener('DOMContentLoaded', function () {
	const contentLoader = new DynamicContentLoader();

	// Initialize modal and other components in dynamically loaded content
	document.addEventListener('contentLoaded', function () {
		new ModalManager();
		new TabManager();

		activeDateOptions('.btn-options .btn');
	});
});