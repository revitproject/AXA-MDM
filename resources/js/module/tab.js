export class TabManager {
  constructor(container = document) {
    this.container = container; // 특정 컨테이너에서만 탭 관리
    this.tabManagers = []; 
    this.initTab();
  }

  // 초기 탭 설정
  initTab() {
    this.container.addEventListener('click', (e) => {
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

  // 활성화된 탭/콘텐츠 설정
  activateTab(target, tabList) {
    tabList.querySelectorAll(".tab-item").forEach(item => {
      item.classList.remove("is-active");
    });
    target.closest(".tab-item").classList.add("is-active");
  }

  // 선택된 탭에 해당하는 콘텐츠 활성화
  activateTabContent(tabContentId, tabList) {
    tabList.querySelectorAll(".tab-content").forEach(content => {
      content.classList.remove("is-active");
      if (content.getAttribute("data-tab-content") === tabContentId) {
        content.classList.add("is-active");
      }
    });
  }

  // 중첩된 탭이 있을 경우 추가적으로 tabManagers 초기화
  initNestedTabs(tabContentId, tabList) {
    const tabContent = tabList.querySelector(`.tab-content[data-tab-content="${tabContentId}"]`);
    if (tabContent) {
      const nestedTabs = tabContent.querySelectorAll('.ui-tab');
      nestedTabs.forEach(nestedTab => {
        if (!nestedTab.tabManager) {  // 중복 생성 방지
          const tabManager = new TabManager(nestedTab); // 중첩 탭의 컨테이너 전달
          nestedTab.tabManager = tabManager; // 중복 방지용 참조
          this.tabManagers.push(tabManager); // tabManager 목록에 추가
        }
      });
    }
  }
}