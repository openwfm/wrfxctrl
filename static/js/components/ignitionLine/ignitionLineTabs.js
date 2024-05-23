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

    shouldShow() {
      return appState.isLine();
    }

    createTabBody(index) {
      return new IgnitionLine(index, this);
    }
}

window.customElements.define('ignition-line-tabs', IgnitionLineTabs);
