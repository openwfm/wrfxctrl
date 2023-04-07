import { appState } from '../../../appState.js';
import { ignitionLineHTML } from './ignitionLineHTML.js';
import { AppStateSubscriber } from '../../appStateSubscriber.js';

export class IgnitionLineUI extends AppStateSubscriber {
    constructor() {
        super();
        this.innerHTML = ignitionLineHTML;
        this.uiElements = {
            ignitionLineComponentUI: this.querySelector('#ignition-line-component'),
            ignitionLineMarkersListUI: this.querySelector('#ignition-line-markers'),
        };
    }

    connectedCallback() {
        this.setVisibilityFromAppState();
    }

    isVisible() {
        let { ignitionLineComponentUI } = this.uiElements;
        return !ignitionLineComponentUI.classList.contains('hidden');
    }

    showComponent() {
        let { ignitionLineComponentUI } = this.uiElements;
        if (!this.isVisible()) {
            ignitionLineComponentUI.classList.remove('hidden');
        }
    }

    hideComponent() {
        let { ignitionLineComponentUI } = this.uiElements;
        if (this.isVisible()) {
            ignitionLineComponentUI.classList.add('hidden');
        }
    }

    setVisibilityFromAppState() {
        if (appState.isLine()) {
            this.showComponent();
        } else {
            this.hideComponent();
        }
    }

    ignitionTypeChange() {
        this.setVisibilityFromAppState();
    }
}