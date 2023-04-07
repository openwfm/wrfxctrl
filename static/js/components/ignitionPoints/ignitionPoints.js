import { appState } from '../../appState.js';
import { IgnitionMarker } from '../ignitionMarker.js';
import { buildMap } from '../../buildMap.js';
import { IgnitionPointsUI } from './ignitionPointsUI/ignitionPointsUI.js';

export class IgnitionPoints extends IgnitionPointsUI {
    constructor() {
        super();
        this.pointMarkers = [];
    }

    connectedCallback() {
        super.connectedCallback();
        this.createPointsMarker();
    }

    createPointsMarker() {
        let { ignitionPointsMarkersListUI } = this.uiElements;
        let newFieldId = this.pointMarkers.length;
        const newMarkerField = new IgnitionMarker(newFieldId, this, "red");
        ignitionPointsMarkersListUI.append(newMarkerField)
        this.pointMarkers.push(newMarkerField);
    }

    createAndAddMarker(lat, lon) {
        if (!appState.isPoints()) { 
            return 
        } else if (this.lastPointsMarker().getLatLon().length == 2) {
            this.createPointsMarker();
        }
        this.lastPointsMarker().addMarkerToMapAtLatLon(lat, lon);
    }

    lastPointsMarker() {
        return this.pointMarkers.slice(-1)[0];
    }

    markerUpdate() {
    }
}

window.customElements.define('ignition-points', IgnitionPoints);