import { AppStateSubscriber } from '../appStateSubscriber.js';
import { simulationDescriptionHTML } from './simulationDescriptionHTML.js';

export class SimulationDescription extends AppStateSubscriber {
    constructor() {
        super();
        this.innerHTML = simulationDescriptionHTML;
        this.uiElements = {
            descriptionInput: this.querySelector('#experiment-description'),
        }
    }

    connectedCallback() {
        super.connectedCallback();
    }

    validateForIgnition() {
        let errorMessage = 'Please enter a description.';
        if (this.descriptionText() == "") {
            return {header: "Simulation Description", message: errorMessage};
        }
        return null;
    }

    descriptionText() {
        const { descriptionInput } = this.uiElements;

        return descriptionInput.value;
    }
}

window.customElements.define('simulation-description', SimulationDescription);