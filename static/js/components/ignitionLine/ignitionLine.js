import { appState } from '../../appState.js';
import { IgnitionMarker } from '../ignitionMarker.js';
import { buildMap } from '../../buildMap.js';
import { IgnitionLineUI } from './ignitionLineUI/ignitionLineUI.js';
import { IgnitionTime } from '../../../ignitionTime.js';

export class IgnitionLine extends IgnitionLineUI {
    constructor() {
        super();
        this.lineMarkers = [];
        this.ignitionTimes = [];
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
        this.createIgnitionTime();
        if (this.evenSplitCheck()) {
            this.evenlySplitDateTimes();
        }
    }

    createAndAddMarker(lat, lon) {
        if (!appState.isLine()) { 
            return 
        } else if (this.lastLineMarker().getLatLon().length == 2) {
            this.createLineMarker();
        }
        this.lastLineMarker().addMarkerToMapAtLatLon(lat, lon);
    }

    createIgnitionTime() {
        let { ignitionLineMarkersListUI } = this.uiElements;
        let newFieldId = this.ignitionTimes.length;
        let ignitionField = new IgnitionTime(newFieldId, "ignitionLine");
        this.ignitionTimes.push(ignitionField);
        ignitionLineMarkersListUI.append(ignitionField);
    }

    lastLineMarker() {
        return this.lineMarkers.slice(-1)[0];
    }

    markerUpdate() {
        let latLons = this.lineMarkers.map(marker => 
            marker.getLatLon()).filter(l => l.length > 0);
        buildMap.drawLine(latLons);
    }

    removeMarker(index) {
        if (this.lineMarkers.length < 2) {
            return;
        }
        for (let i = index + 1; i < this.lineMarkers.length; i++ ) {
            this.lineMarkers[i].updateIndex(i - 1);
        }
        const markerToRemove = this.lineMarkers.splice(index, 1)[0];
        if (markerToRemove.mapMarker) {
            buildMap.map.removeLayer(markerToRemove.mapMarker);
        }
        markerToRemove.remove();
        this.markerUpdate();

        this.removeIgnitionTime(index);
        if (this.evenSplitCheck()) {
            this.evenlySplitDateTimes();
        }
    }

    removeIgnitionTime(index) {
        if (this.ignitionTimes.length < 2) {
            return
        }
        const ignitionTimeToRemove = this.ignitionTimes.splice(index, 1)[0];
        ignitionTimeToRemove.remove();
    }

    evenlySplitDateTimes() {
        if (!this.evenSplitCheck() || !this.validIgnitionTimes()) {
            return;
        }
        let currentMoment = this.startTimeMoment();
        let endTimeMoment = this.endTimeMoment();
        let difference = (endTimeMoment - currentMoment) / (this.ignitionTimes.length - 1);
        for (let ignitionTime of this.ignitionTimes) {
            ignitionTime.setDateTimePicker(currentMoment);
            currentMoment = currentMoment.add(difference, 'ms');
        }
    }

    validIgnitionTimes() {
        return this.ignitionTimes.length > 1;
    }

    validateForIgnition() {
        let ignitionPointsAdded = this.lineMarkers.length > 1 || this.lastLineMarker().getLatLon().length == 2;
        if (!ignitionPointsAdded) {
            return null;
        }
        let ignitionMarkerErrorMessage = this.validateIgnitionMarkers();
        let ignitionTimeErrorMessage = this.validateIgnitionTimes();
        let errorMessage = `${ignitionMarkerErrorMessage} ${ignitionTimeErrorMessage}`;
        if (errorMessage != '') {
            return {header: "Ignition Line", message: errorMessage};
        }
        return null;
    }

    validateIgnitionMarkers() {
        let errorMessage = 'The ignition latitudes must be a number between 36 and 41. The ignition longitudes must be a number between -109 and -102.';
        for (let ignitionMarker of this.lineMarkers) {
            if (!ignitionMarker.isValid()) {
                return errorMessage;
            }
        }
        return '';
    }

    validateIgnitionTimes() {
        let simulationStartTime = appState.simulationStartTimeMoment();
        let simulationEndTime = appState.simulationEndTimeMoment();
        let errorMessage = `All Ignition Times must be between ${simulationStartTime} and ${simulationEndTime} in the format YYYY-MM-DD_HH:MM:SS`;
        for (let ignitionTime of this.ignitionTimes) {
            if (!ignitionTime.isValid()) {
                return errorMessage;
            }
        }
        return '';
    }
}

window.customElements.define('ignition-line', IgnitionLine);