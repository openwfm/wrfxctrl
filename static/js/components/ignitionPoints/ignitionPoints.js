import { appState } from '../../appState.js';
import { IgnitionMarker } from '../ignitionMarker.js';
import { buildMap } from '../../buildMap.js';
import { IgnitionPointsUI } from './ignitionPointsUI/ignitionPointsUI.js';
import { IgnitionTime } from '../../../ignitionTime.js';
import { validateIgnitionMarkers, validateIgnitionTimes } from '../validationUtils.js';

export class IgnitionPoints extends IgnitionPointsUI {
    constructor() {
        super();
        this.pointMarkers = [];
        this.ignitionTimes = [];
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
        this.createIgnitionTime();
    }

    createIgnitionTime() {
        let { ignitionPointsMarkersListUI } = this.uiElements;
        let newFieldId = this.ignitionTimes.length;
        let ignitionField = new IgnitionTime(newFieldId, "ignitionPoints");
        this.ignitionTimes.push(ignitionField);
        ignitionPointsMarkersListUI.append(ignitionField);
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

    removeMarker(index) {
        if (this.pointMarkers.length < 2) {
            return;
        }
        for (let i = index + 1; i < this.pointMarkers.length; i++ ) {
            this.pointMarkers[i].updateIndex(i - 1);
        }
        const markerToRemove = this.pointMarkers.splice(index, 1)[0];
        if (markerToRemove.mapMarker) {
            buildMap.map.removeLayer(markerToRemove.mapMarker);
        }
        markerToRemove.remove();
        this.markerUpdate();

        this.removeIgnitionTime(index);
    }

    removeIgnitionTime(index) {
        if (this.ignitionTimes.length < 2) {
            return
        }
        const ignitionTimeToRemove = this.ignitionTimes.splice(index, 1)[0];
        ignitionTimeToRemove.remove();
    }

    validateForIgnition() {
        let errorMessages = [];
        let ignitionPointsAdded = this.pointMarkers.length > 1 || this.lastPointsMarker().isSet();
        if (!ignitionPointsAdded) {
            return {header: "Multiple Ignitions", messages: errorMessages};
        }
        let ignitionMarkerErrorMessage = validateIgnitionMarkers(this.pointMarkers);
        if (ignitionMarkerErrorMessage) {
            errorMessages.push(ignitionMarkerErrorMessage);
        }
        let ignitionTimeErrorMessage = validateIgnitionTimes(this.ignitionTimes);
        if (ignitionTimeErrorMessage) {
            errorMessages.push(ignitionTimeErrorMessage);
        }

        return {header: "Multiple Ignitions", messages: errorMessages};
    }
}

window.customElements.define('ignition-points', IgnitionPoints);