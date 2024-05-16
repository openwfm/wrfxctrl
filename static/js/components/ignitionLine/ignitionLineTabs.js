import { appState } from '../../appState.js';
import { AppStateSubscriber } from '../appStateSubscriber.js';
import { IgnitionLine } from './ignitionLine.js';
import { PolygonTabs } from '../polygonTabs/polygonTabs.js';

export class IgnitionLineTabs extends PolygonTabs {
    constructor() {
        super();
        const {polygonTitle} = this.tabUi;
        polygonTitle.innerText = 'Ignition Line';
    }

    ignitionTypeChange() {
        let { polygonTab } = this.tabUi;
        if (appState.isLine()) {
            this.showComponent(polygonTab);
        } else {
            this.hideComponent(polygonTab);
        }
    }

    // uniqueId() {
    //   return 'ignitionLine';
    // }

    updateAppIndex(index) {
        appState.lineTabIndex = index;
    }

    shouldShow() {
      return appState.isLine();
    }

    createTabBody(index) {
		return new IgnitionLine(index);
    }
}

window.customElements.define('ignition-line-tabs', IgnitionLineTabs);
