import { appState } from '../../../appState.js';
import { ignitionLineHTML } from './ignitionLineHTML.js';
import { AppStateSubscriber } from '../../appStateSubscriber.js';

export class IgnitionLineUI extends AppStateSubscriber {
    constructor() {
        super();
        this.innerHTML = ignitionLineHTML;
        this.uiElements = {
            ignitionStartUI: this.querySelector('#start-time-input'),
            ignitionEndUI: this.querySelector('#end-time-input'),
            ignitionLineComponentUI: this.querySelector('#ignition-line-component'),
            ignitionLineMarkersListUI: this.querySelector('#ignition-line-markers'),
        };
    }

    connectedCallback() {
        this.setVisibilityFromAppState();
        $('#start-time-input').datetimepicker({ value: moment().utc(), formatTime: 'h:mm a', formatDate: 'm.d.Y', step:15 });
        $('#end-time-input').datetimepicker({ value: moment().utc(), formatTime: 'h:mm a', formatDate: 'm.d.Y', step:15 });
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

    disableStartAndEndTimes() {
        let { ignitionStartUI, ignitionEndUI } = this.uiElements;
        ignitionStartUI.disabled = true;
        ignitionEndUI.disabled = true;
    }

    enableStartAndEndTimes() {
        let { ignitionStartUI, ignitionEndUI } = this.uiElements;
        ignitionStartUI.disabled = false;
        ignitionEndUI.disabled = false;
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