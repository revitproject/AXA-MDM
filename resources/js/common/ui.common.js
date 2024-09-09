import { SidebarManager } from '../module/aside.js';
import { ModalManager } from '../module/modal.js';
import { TabManager } from '../module/tab.js';
import { activeDateOptions, initTooltips } from '../module/utils.js';

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

    // functions
    activeDateOptions('.btn-options .btn');
    initTooltips('.tooltip');
  }
}

// 애플리케이션 초기화
new ApplicationInit();