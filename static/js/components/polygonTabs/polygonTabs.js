import { appState } from '../../appState.js';
import { AppStateSubscriber } from '../appStateSubscriber.js';

export class PolygonTabs extends AppStateSubscriber {
    constructor() {
        super();
        this.innerHTML = `
          <div class="polygon-tab">
            <h3 class="polygon-title"></h3>
            <div class="tab-header">
              <ul class="tab-list">
                <li id="add-new-tab" class="tab-header-list-item">+</li>
              </ul>
            </div>
            <div class="tab-body">
            </div>
          </div>
        `;

        this.tabUi = {
            polygonTab: this.querySelector('.polygon-tab'),
            polygonTitle: this.querySelector('.polygon-title'),
            tabHeader: this.querySelector('.tab-header'),
            tabList: this.querySelector('.tab-list'),
            addNewTab: this.querySelector('#add-new-tab'),
            tabBody: this.querySelector('.tab-body'),
        };
        this.tabs = [];
        this.currentTab = null;
    }

    connectedCallback() {
      const { addNewTab } = this.tabUi;
      addNewTab.onclick = () => {
        this.createNewTab();
      }
      this.createNewTab();
      this.ignitionTypeChange();
    }

    ignitionTypeChange() {
        let { polygonTab } = this.tabUi;
        if (this.shouldShow()) {
            this.showComponent(polygonTab);
        } else {
            this.hideComponent(polygonTab);
        }
    }

    shouldShow() {
      return true;
    }

    showComponent(component) {
      if (!this.isVisible(component)) {
        component.classList.remove('hidden');
      }
    }

    hideComponent(component) {
      if (component == null) {
        return;
      }
      if (this.isVisible(component)) {
        component.classList.add('hidden');
      }
    }

    isVisible(component) {
      return !component.classList.contains('hidden');
    }

    createNewTab() {
      const { tabList, tabBody } = this.tabUi;

      let index = this.tabs.length;
			let newTabHeader = this.createTabHeader(index);
			let newTabBody = this.createTabBody(index);
      let newTab = {
        header: newTabHeader,
        body: newTabBody,
        index: index,
      }
      newTabHeader.addEventListener('click', () => {
        this.updateCurrentTab(newTab);
      });
      
      tabList.appendChild(newTabHeader);
      tabBody.appendChild(newTabBody);
      this.updateCurrentTab(newTab);
      this.tabs.push(newTab);
    }

  updateCurrentTab(newTab) {
    let { header, body, index } = newTab;
    this.updateAppIndex(index);
    if (this.currentTab) {
      this.hideComponent(this.currentTab.body);
      this.currentTab.header.classList.remove("active");
    }
    this.showComponent(body);
    header.classList.add("active");
    this.currentTab = newTab;
  }

    createTabBody(index) {
			return document.createElement('div');
    }

    createTabHeader(index) {
			let header = document.createElement('li');
      header.classList.add('tab-header-list-item');
      header.textContent = `${index}`;
      return header;
    }
}