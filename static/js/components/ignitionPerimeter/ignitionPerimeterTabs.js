import { appState } from '../../appState.js';
import { IgnitionPerimeter } from './ignitionPerimeter.js';
import { PolygonTabs } from '../polygonTabs/polygonTabs.js';

export class IgnitionPerimeterTabs extends PolygonTabs {
    constructor() {
        super();
        const {polygonTitle} = this.tabUi;
        polygonTitle.innerText = 'Ignition Perimeter';
    }

    shouldShow() {
      return appState.isPerimeter();
    }

    createTabBody(index) {
      return new IgnitionPerimeter(index);
    }
}

window.customElements.define('ignition-perimeter-tabs', IgnitionPerimeterTabs);
