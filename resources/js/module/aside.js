export class SidebarManager {
  constructor(
    asideSelector = '.base-aside',
    linkSelector = '.lnb-link',
    subLinkSelector = '.lnb-sub-link',
    headerSelector = '.base-header' // 추가된 헤더 선택자
  ) {
    this.asideSelector = asideSelector;
    this.linkSelector = linkSelector;
    this.subLinkSelector = subLinkSelector;
    this.headerSelector = headerSelector; // 헤더 선택자 추가
    this.sidebarLoaded = false;

    this.initSidebar();
    this.loadHeader(); // 헤더 로드 추가
  }

  initSidebar() {
    this.loadSidebar()
      .then(() => this.handleLinkClicks())
      .catch(error => console.error('사이드바 초기화 실패:', error));
  }

  // 사이드바 로드
  async loadSidebar() {
    const asideElement = document.querySelector(this.asideSelector);

    if (asideElement && !this.sidebarLoaded) {
      try {
        const fetchUrl = asideElement.classList.contains('guide')
          ? '../../html/common/lnb-guide.html'
          : '../../html/common/lnb.html';

        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error(`사이드바 로드 실패: ${response.statusText}`);

        const html = await response.text();
        asideElement.innerHTML = html;
        this.sidebarLoaded = true;
        this.setActiveLinks(window.location.pathname); // URL 경로 기반으로 링크 활성화
      } catch (error) {
        console.error('사이드바 로드 에러:', error);
        asideElement.innerHTML = '<p>사이드바 내용 로드 실패.</p>';
      }
    }
  }

  // 링크 클릭 핸들러
  handleLinkClicks() {
    document.body.addEventListener('click', (e) => {
      const link = e.target.closest(this.linkSelector);
      const subLink = e.target.closest(this.subLinkSelector);

      if (link || subLink) {
        this.setActiveLinks(new URL(e.target.href).pathname);
      }
    });
  }

  // 활성화된 링크 설정 (URL 경로 기반)
  setActiveLinks(currentPath) {
    const links = document.querySelectorAll(this.linkSelector);
    const subLinks = document.querySelectorAll(this.subLinkSelector);

    // 1depth 처리 (lnb-item 기준)
    links.forEach(link => {
      const linkPath = new URL(link.href).pathname;
      const parentItem = link.closest('.lnb-item');
      const subMenu = parentItem.querySelector('.lnb-sub');

      // 1depth 활성화 (lnb-item 기준)
      if (currentPath.startsWith(linkPath)) {
        parentItem.classList.add('is-active');

        // 2depth 메뉴 열림/닫힘 (is-open 클래스)
        if (subMenu) {
          if (!parentItem.classList.contains('is-open')) {
            parentItem.classList.add('is-open'); 
          }
        }
      } else {
        parentItem.classList.remove('is-active');
        parentItem.classList.remove('is-open');
      }
    });

    // 2depth 처리
    subLinks.forEach(subLink => {
      const subLinkPath = new URL(subLink.href).pathname;

      // 2depth 활성화
      if (currentPath === subLinkPath) {
        subLink.classList.add('is-active');
        const parentItem = subLink.closest('.lnb-item');
        if (parentItem) {
          parentItem.classList.add('is-active');
          parentItem.classList.add('is-open');
        }
      } else {
        subLink.classList.remove('is-active');
      }
    });
  }

  // header load
  async loadHeader() {
    const headerElement = document.querySelector(this.headerSelector);

    if (headerElement) {
      try {
        const response = await fetch('../../html/common/header.html');
        if (!response.ok) throw new Error(`헤더 로드 실패: ${response.statusText}`);

        const html = await response.text();
        headerElement.innerHTML = html;
      } catch (error) {
        console.error('헤더 로드 에러:', error);
        headerElement.innerHTML = '<p>헤더 내용 로드 실패.</p>';
      }
    }
  }
}