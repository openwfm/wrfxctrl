import { appState } from '../../appState.js';
import { IgnitionMarker } from '../ignitionMarker.js';
import { buildMap } from '../../buildMap.js';
import { IgnitionLineUI } from './ignitionLineUI/ignitionLineUI.js';

export class IgnitionLine extends IgnitionLineUI {
    constructor() {
        super();
        this.lineMarkers = [];
    }

    connectedCallback() {
        super.connectedCallback();
        this.createLineMarker();
    }

    createLineMarker() {
        let { ignitionLineMarkersListUI } = this.uiElements;
        let newFieldId = this.lineMarkers.length;
        const newMarkerField = new IgnitionMarker(newFieldId, this, "red");
        ignitionLineMarkersListUI.append(newMarkerField)
        this.lineMarkers.push(newMarkerField);
    }

    createAndAddMarker(lat, lon) {
        if (!appState.isLine()) { 
            return 
        } else if (this.lastLineMarker().getLatLon().length == 2) {
            this.createLineMarker();
        }
        this.lastLineMarker().addMarkerToMapAtLatLon(lat, lon);
    }

    lastLineMarker() {
        return this.lineMarkers.slice(-1)[0];
    }

    markerUpdate() {
        let latLons = this.lineMarkers.map(marker => 
            marker.getLatLon()).filter(l => l.length > 0);
        buildMap.drawLine(latLons);
    }
}

window.customElements.define('ignition-line', IgnitionLine);