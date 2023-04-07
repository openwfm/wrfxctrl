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
}

window.customElements.define('ignition-perimeter', IgnitionPerimeter);