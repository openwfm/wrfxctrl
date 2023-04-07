import { appState } from '../../appState.js';
import { ignitionTypeSelectorHTML } from './ignitionTypeSelectorHTML.js';

export class IgnitionTypeSelector extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = ignitionTypeSelectorHTML;
        this.uiElements = {
            ignitionTypeDropdown: this.querySelector('#ignition-type-dropdown')
        };
    }

    connectedCallback() {
        this.connectIgnitionTypeSelector();
    }

    connectIgnitionTypeSelector() {
        let { ignitionTypeDropdown } = this.uiElements;
        ignitionTypeDropdown.onchange = () => {
            appState.changeIgnitionType(ignitionTypeDropdown.value)
        }
    }
}

window.customElements.define('ignition-type-selector', IgnitionTypeSelector);