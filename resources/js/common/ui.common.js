import { SidebarManager } from '../module/aside.js';
import { ModalManager } from '../module/modal.js';
import { TabManager } from '../module/tab.js';

/**
 * DOM 로드 완료 후 주요 UI 컴포넌트와 유틸리티를 초기화하는 클래스
 */
class ApplicationInit {
  // DOMContentLoaded 이벤트 발생 시 컴포넌트 초기화
  constructor() {
    document.addEventListener('DOMContentLoaded', () => {
      this.initComponents();
    });
  }

  /**
   * 사이드바, 모달, 탭 등의 UI 컴포넌트를 생성하고
   * 필요한 유틸리티 함수들을 조건부로 로드
   */
  async initComponents() {
    window.sidebarManager = new SidebarManager();  // 사이드바 초기화
    window.modalManager = new ModalManager();      // 모달 초기화
    window.tabManagers = [new TabManager()];       // 탭 초기화
  
    const loadModule = async (selector, funcName) => {
      if (selector && document.querySelector(selector)) {
        const module = await import('../module/utils.js');
        module[funcName](selector);
      }
    };
  
    // 필요한 함수만 로드
    await loadModule('.btn-options .btn', 'setDateButtons');    // 날짜 옵션 버튼 설정
    await loadModule('.tooltip', 'toggleTooltips');             // 툴팁 활성화
    await loadModule('.ui-counter', 'setNumberControls');       // 숫자 입력 컨트롤 설정
    await loadModule('.form-search', 'setSearchForm');          // 검색 폼 기능 설정
  
    // 항상 실행해야 하는 함수는 별도로 호출
    const { updateFormLabels } = await import('../module/utils.js');
    updateFormLabels();  // 폼 라벨 상태 업데이트
  }
}

// 애플리케이션 초기화 클래스 인스턴스 생성
new ApplicationInit();