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
            startEndCheckboxUI: this.querySelector('#start-end-checkbox'),
        };
    }

    connectedCallback() {
        this.setVisibilityFromAppState();
        this.setUpStartEndCheckbox();
    }

    evenSplitCheck() { 
        const { startEndCheckboxUI } = this.uiElements;
        return startEndCheckboxUI.checked;
    }

    setVisibilityFromAppState() {
        let { ignitionLineComponentUI } = this.uiElements;
        if (appState.isLine()) {
            this.showComponent(ignitionLineComponentUI);
        } else {
            this.hideComponent(ignitionLineComponentUI);
        }
    }

    setUpStartEndCheckbox() {
        let { startEndCheckboxUI } = this.uiElements;
        startEndCheckboxUI.checked = false;
        startEndCheckboxUI.onclick = () => {
            if (this.evenSplitCheck()) {
                this.evenlySplitDateTimes();
            }
        }
    }

    showComponent(component) {
        if (!this.isVisible(component)) {
            component.classList.remove('hidden');
        }
    }

    hideComponent(component) {
        if (this.isVisible(component)) {
            component.classList.add('hidden');
        }
    }

    evenlySplitDateTimes() {}

    isVisible(component) {
        return !component.classList.contains('hidden');
    }

    ignitionTypeChange() {
        this.setVisibilityFromAppState();
    }
}