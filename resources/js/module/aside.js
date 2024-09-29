export class SidebarManager {
  constructor(
    headerSelector = '.base-header', 
    asideSelector = '.base-aside'
  ) {
    this.headerSelector = headerSelector; 
    this.asideSelector = asideSelector;
    this.sidebarLoaded = false;

    this.loadHeader(); 
    this.initSidebar(); 
  }

  // 헤더 로드
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

  // 사이드바 초기화
  initSidebar() {
    return this.loadSidebar()
      .then(() => {
        this.sidebarLoaded = true;
        console.log('사이드바 로드 성공');
        // 필요에 따라 둘 중 하나의 활성화 방식을 선택
        this.lnbActiveByBodyRoute();  // data-route 기반 활성화
      })
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
        this.lnbActiveByBodyRoute();  // URL 경로 기반 활성화 (기본적으로 data-route 활성화 사용)
      } catch (error) {
        console.error('사이드바 로드 에러:', error);
        asideElement.innerHTML = '<p>사이드바 내용 로드 실패.</p>';
      }
    }
  }

  /**
   * body의 data-route 값을 기반으로 LNB 메뉴 활성화
   */
  lnbActiveByBodyRoute() {
    const bodyRoute = document.body.getAttribute('data-route');
    const lnbItems = document.querySelectorAll('.lnb-item');

    if (!bodyRoute) {
      console.warn('data-route 값이 body에 설정되지 않았습니다.');
      return;
    }

    lnbItems.forEach(item => {
      const route = item.getAttribute('data-route');

      // 1depth 메뉴가 직접 일치할 경우 활성화
      if (route === bodyRoute) {
        item.classList.add('is-active');
      }

      // 2depth 메뉴가 있는 경우
      const subItems = item.querySelectorAll('.lnb-subitem');
      subItems.forEach(subItem => {
        const subRoute = subItem.getAttribute('data-route');

        if (subRoute === bodyRoute) {
          // 2depth 활성화
          subItem.classList.add('is-active');
          // 상위 1depth 확장 및 활성화
          item.classList.add('is-active', 'is-open');
        }
      });
    });
  }

  /**
   * 인덱스 기반의 LNB 활성화 메서드
   * @param {number} item1 - 1depth 메뉴의 인덱스
   * @param {number|null} item2 - 2depth 메뉴의 인덱스 (없을 경우 null)
   */
  lnbActive(item1, item2 = null) {
    let lnbItem = document.querySelectorAll('.lnb-item')[item1],
        subItem = item2 !== null ? document.querySelectorAll('.lnb-subitem')[item2] : null;

    // 1depth 메뉴 활성화
    if (lnbItem) {
      lnbItem.classList.add('is-active');
    } else {
      console.warn(`LNB 항목을 찾을 수 없습니다: 인덱스 ${item1}`);
    }

    // 2depth 메뉴 활성화
    if (subItem) {
      subItem.closest('.lnb-item').classList.add('is-extend'); // 1depth 확장
      subItem.classList.add('is-active'); // 2depth 활성화
    } else if (item2 !== null) {
      console.warn(`LNB 하위 항목을 찾을 수 없습니다: 인덱스 ${item2}`);
    }
  }
}