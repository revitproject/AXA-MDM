import { SidebarManager } from '../module/aside.js';
import { ModalManager } from '../module/modal.js';
import { TabManager } from '../module/tab.js';
import { activeDateOptions, initTooltips, updateFormLabelClasses } from '../module/utils.js';

class ApplicationInit {
  constructor() {
    document.addEventListener('DOMContentLoaded', () => {
      this.initComponents();
    });
  }

  initComponents() {
    window.sidebarManager = new SidebarManager();  
    window.modalManager = new ModalManager();      
    window.tabManagers = [new TabManager()];       

    // 초기화 함수 호출
    activeDateOptions('.btn-options .btn');
    initTooltips('.tooltip');
    updateFormLabelClasses();  // 라벨 클래스 업데이트 함수 호출
  }
}

// 애플리케이션 초기화
new ApplicationInit();