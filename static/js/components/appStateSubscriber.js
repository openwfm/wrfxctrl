import { appState } from '../appState.js';
import { buildMap } from '../buildMap.js';
import { errorState } from '../errorState.js';

export class AppStateSubscriber extends HTMLElement {
    constructor() {
        super();
        appState.subscribeComponent(this);
        buildMap.subscribeComponent(this);
        errorState.subscribeComponent(this);
    }

    connectedCallback() {
    }

    ignitionTypeChange() {
    }
}