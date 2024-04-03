import { appState } from '../../appState.js';
import { AppStateSubscriber } from '../appStateSubscriber.js';
import { IgnitionLine } from './ignitionLine.js';
import { PolygonTabs } from '../polygonTabs/PolygonTabs.js';

export class IgnitionLineTabs extends PolygonTabs {
    constructor() {
        super();
    }

    ignitionTypeChange() {
        let { polygonTab } = this.tabUi;
        if (appState.isLine()) {
            this.showComponent(polygonTab);
        } else {
            this.hideComponent(polygonTab);
        }
    }

    shouldShow() {
      return appState.isLine();
    }

    createTabBody() {
			return new IgnitionLine();
    }
}

window.customElements.define('ignition-line-tabs', IgnitionLineTabs);
