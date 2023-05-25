import { appState } from '../../appState.js';
import { AppStateSubscriber } from '../appStateSubscriber.js';
import { domainCenterHTML } from './domainCenterHTML.js';
import { IgnitionMarker } from '../ignitionMarker.js';

export class DomainCenter extends AppStateSubscriber {
    constructor() {
        super();
        this.innerHTML = domainCenterHTML;
        this.uiElements = {
            domainCenterComponentUI: this.querySelector('#domain-center'),
            domainCenterListUI: this.querySelector('#domain-center-marker'),
        };
        this.fieldId = 0;
        this.mapMarker = null;
    }

    connectedCallback() {
        this.setVisibilityFromAppState();
        this.createLineMarker();
    }

    createLineMarker() {
        let { domainCenterListUI } = this.uiElements;
        this.mapMarker = new IgnitionMarker(null, this, null);
        domainCenterListUI.append(this.mapMarker)
    }

    createAndAddMarker(lat, lon) {
        if (!appState.isDomain()) { 
            return 
        }
        this.mapMarker.addMarkerToMapAtLatLon(lat, lon);
    }

    markerUpdate() {
    }

    setVisibilityFromAppState() {
        let { domainCenterComponentUI } = this.uiElements;
        if (appState.isDomain()) {
            this.showComponent(domainCenterComponentUI);
        } else {
            this.hideComponent(domainCenterComponentUI);
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

    isVisible(component) {
        return !component.classList.contains('hidden');
    }

    ignitionTypeChange() {
        this.setVisibilityFromAppState();
    }
}

window.customElements.define('domain-center', DomainCenter);