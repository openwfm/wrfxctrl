import { appState } from '../../appState.js';
import { AppStateSubscriber } from '../appStateSubscriber.js';

export class PolygonTabs extends AppStateSubscriber {
    constructor() {
        super();
        this.innerHTML = `
          <div class="polygon-tab">
            <div class="tab-header">
              <ul class="tab-list">
                <li id="add-new-tab">+</li>
              </ul>
            </div>
            <div class="tab-body">
            </div>
          </div>
        `;

        this.tabUi = {
            polygonTab: this.querySelector('.polygon-tab'),
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
			let newTabBody = this.createTabBody();
      newTabHeader.onClick = () => {
        this.hideComponent(this.currentTab);
        this.showComponent(tabBody);
        this.currentTab = tabBody;
      }
      let newTab = {
        "header": newTabHeader,
        "body": newTabBody,
      }
      tabList.appendChild(newTabHeader);
      tabBody.appendChild(newTabBody);
      this.tabs.push(newTab);
      this.hideComponent(this.currentTab);
      this.showComponent(newTabBody);
      this.currentTab = newTabBody;
    }

    createTabBody() {
			return document.createElement('div');
    }

    createTabHeader(index) {
			let header = document.createElement('li');
      header.textContent = `${index}`;
      return header;
    }
}
