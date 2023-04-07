import { appState } from '../appState.js';
import { buildMap } from '../buildMap.js';

export class AppStateSubscriber extends HTMLElement {
    constructor() {
        super();
        appState.subscribeComponent(this);
        buildMap.subscribeComponent(this);
    }

    connectedCallback() {
    }

    ignitionTypeChange() {
    }
}