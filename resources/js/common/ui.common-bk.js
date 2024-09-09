// Modal
class ModalManager {
  constructor() {
    this.initModals();
  }

  initModals() {
    document.body.addEventListener('click', (e) => {
      const openTrigger = e.target.closest('[data-modal="open"]');
      const closeTrigger = e.target.closest('[data-modal="close"]');

      if (openTrigger) {
        const modalId = openTrigger.getAttribute('data-url') || openTrigger.getAttribute('href');
        this.openModal(document.querySelector(modalId));
        e.preventDefault();
      } else if (closeTrigger) {
        this.closeModal(closeTrigger.closest('.modal'));
        e.preventDefault();
      }
    });
  }

  openModal(modal) {
    if (modal) {
      document.querySelectorAll('.modal.is-show').forEach(activeModal => {
        if (activeModal !== modal) {
          activeModal.classList.remove('is-show');
        }
      });
      modal.classList.add('is-show');
    }
  }

  closeModal(modal) {
    if (modal) {
      modal.classList.remove('is-show');
    }
  }

  openModalById(modalId) {
    const modal = document.getElementById(modalId);
    this.openModal(modal);
  }

  // Alert 모달 초기화
  initAlert() {
    if (this.alertContainer) return;

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
          <button type="button" class="btn is-footer is-false" style="display: none;">취소</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    this.alertContainer = modal;

    this.alertTitle = this.alertContainer.querySelector('.modal-title');
    this.alertText = this.alertContainer.querySelector('.modal-msg');
    this.trueBtn = this.alertContainer.querySelector('.is-true');
    this.falseBtn = this.alertContainer.querySelector('.is-false');

    this.trueBtn.onclick = () => this.hideAlert();
  }

  alert(title, msg, trueFn, trueBtnText = '확인') {
    this.initAlert();

    this.alertTitle.textContent = title;
    this.alertText.innerHTML = msg;
    this.trueBtn.textContent = trueBtnText;
    this.falseBtn.style.display = 'none';

    this.alertContainer.classList.add('has-alert');
    this.alertContainer.classList.remove('has-confirm');

    // 확인 버튼 클릭 시 실행 함수
    this.trueBtn.onclick = () => {
      if (typeof trueFn === 'function') {
        trueFn();  
      }
      this.hideAlert(); 
    };

    this.showAlert();
  }

  confirm(title, msg, trueFn, falseFn, trueBtnText = '확인', falseBtnText = '취소') {
    this.initAlert();

    this.alertTitle.textContent = title;
    this.alertText.innerHTML = msg;
    this.trueBtn.textContent = trueBtnText;
    this.falseBtn.textContent = falseBtnText;
    this.falseBtn.style.display = 'inline-flex';

    this.alertContainer.classList.add('has-confirm');
    this.alertContainer.classList.remove('has-alert');

    // 확인 버튼 클릭 시 실행 함수
    this.trueBtn.onclick = () => {
      if (typeof trueFn === 'function') {
        trueFn();  
      }
      this.hideAlert(); 
    };

    // 취소 버튼 클릭 시 실행 함수
    this.falseBtn.onclick = () => {
      if (typeof falseFn === 'function') {
        falseFn();
      }
      this.hideAlert();
    };

    this.showAlert();
  }

  showAlert() {
    if (this.alertContainer) {
      this.alertContainer.classList.add('is-show');
    }
  }

  hideAlert() {
    if (this.alertContainer) {
      this.alertContainer.classList.remove('is-show');
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

// load
document.addEventListener('DOMContentLoaded', function () {
  const asideSelector = '.base-aside';
  const linkSelector = '.lnb-link';
  let sidebarLoaded = false;

  function loadSidebar() {
    const asideElement = document.querySelector(asideSelector);
    if (asideElement && !sidebarLoaded) {
      const isComponent = asideElement.classList.contains('guide');
      const fetchUrl = isComponent ? '/html/common/lnb-guide.html' : '/html/common/lnb.html';
      fetch(fetchUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`사이드바 로드 실패: ${response.statusText}`);
          }
          return response.text();
        })
        .then(html => {
          asideElement.innerHTML = html;
          sidebarLoaded = true;
          setActiveLinks(document.querySelectorAll(linkSelector), window.location.pathname);
        })
        .catch(error => {
          console.error('사이드바 로드 에러:', error);
          asideElement.innerHTML = '<p>사이드바 내용 로드 실패.</p>';
        });
    }
  }

  document.body.addEventListener('click', function(event) {
    const link = event.target.closest(linkSelector);
    if (link) {
      setActiveLinks(document.querySelectorAll(linkSelector), link.getAttribute('href'));
    }
  });

  function setActiveLinks(links, currentPath) {
    links.forEach(link => {
      const path = new URL(link.href).pathname;
      if (path === currentPath || currentPath.startsWith(path)) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });
  }

  loadSidebar();
});

// init
class ApplicationInit {
  constructor() {
    document.addEventListener('DOMContentLoaded', () => {
      this.initComponents();
    });
  }

  initComponents() {
    this.modalManager = new ModalManager();
    this.tabManagers = [new TabManager()];

    activeDateOptions('.btn-options .btn');
  }
}

new ApplicationInit();