import { appState } from '../../appState.js';
import { IgnitionPerimeterUI } from './ignitionPerimiterUI/ignitionPerimeterUI.js';
import { IgnitionMarker } from '../ignitionMarker.js';
import { buildMap } from '../../buildMap.js';

export class IgnitionPerimeter extends IgnitionPerimeterUI {
    constructor() {
        super();
        this.perimeterMarkers = [];
    }

    connectedCallback() {
        super.connectedCallback();
        this.createPerimeterMarker();
    }

    createPerimeterMarker() {
        let { perimeterMarkersListUI } = this.uiElements;
        let newFieldId = this.perimeterMarkers.length;
        const newMarkerField = new IgnitionMarker(newFieldId, this, "orange");
        perimeterMarkersListUI.append(newMarkerField)
        this.perimeterMarkers.push(newMarkerField);
    }

    createAndAddMarker(lat, lon) {
        if (!appState.isPerimeter()) { 
            return 
        } else if (this.lastPerimeterMarker().getLatLon().length == 2) {
            this.createPerimeterMarker();
        }
        this.lastPerimeterMarker().addMarkerToMapAtLatLon(lat, lon);
    }

    lastPerimeterMarker() {
        return this.perimeterMarkers.slice(-1)[0];
    }

    markerUpdate() {
        let latLons = [];
        for (let perimeterMarker of this.perimeterMarkers) {
          let latLon = perimeterMarker.getLatLon();
          if (latLon.length != 0) {
            latLons.push(latLon);
          }
        }
        buildMap.drawArea(latLons);
    }

    removeMarker(index) {
        if (this.perimeterMarkers.length < 2) {
            return;
        }
        const markerToRemove = this.perimeterMarkers[index];
        for (let i = index + 1; i < this.perimeterMarkers.length; i++ ) {
            this.perimeterMarkers[i].updateIndex(i - 1);
        }
        this.perimeterMarkers.splice(index, 1);
        if (markerToRemove.mapMarker) {
            buildMap.map.removeLayer(markerToRemove.mapMarker);
        }
        markerToRemove.remove();
        this.markerUpdate();
    }
}

window.customElements.define('ignition-perimeter', IgnitionPerimeter);