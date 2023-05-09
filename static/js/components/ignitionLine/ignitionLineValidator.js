import { IgnitionLine } from './ignitionLine.js';

export class IgnitionLineValidator extends IgnitionLine {
    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
    }

    validateForIgnition() {
        console.log("in validator");
    }
}

window.customElements.define('ignition-line', IgnitionLineValidator);