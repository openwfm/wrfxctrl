import { appState } from '../../appState.js';
import { IgnitionMarker } from '../ignitionMarker.js';
import { buildMap } from '../../buildMap.js';
import { IgnitionLineUI } from './ignitionLineUI/ignitionLineUI.js';
import { IgnitionTime } from '../../../ignitionTime.js';
import { validateIgnitionTimes, validateIgnitionMarkers, jsonLatLons, jsonIgnitionTimesAndDurations} from '../validationUtils.js';

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

    ignitionPointsAdded() {
        return this.lineMarkers.length > 1 || this.lastLineMarker().isSet();
    }

    jsonProps() {
        if (!this.ignitionPointsAdded()) {
            return {
                "ignition_line_lats": "[]",
                "ignition_line_lons": "[]",
                "ignition_line_ignition_times": "[]",
                "ignition_line_fc_hours": "[]",
            };
        }
        let [lats, lons] = jsonLatLons(this.lineMarkers);
        let [ignitionTimes, fcHours] = jsonIgnitionTimesAndDurations(this.ignitionTimes);
        return {
            "ignition_line_lats": lats,
            "ignition_line_lons": lons,
            "ignition_line_ignition_times": ignitionTimes,
            "ignition_line_fc_hours": fcHours,
        };
    }

    validateForIgnition() {
        let errorMessages = [];
        if (!this.ignitionPointsAdded()) {
            return {header: "Ignition Line", messages: errorMessages};
        }

        let ignitionMarkerErrorMessage = validateIgnitionMarkers(this.lineMarkers);
        if (ignitionMarkerErrorMessage) {
            errorMessages.push(ignitionMarkerErrorMessage);
        }

        let ignitionTimeErrorMessage = validateIgnitionTimes(this.ignitionTimes);
        if (ignitionTimeErrorMessage) {
            errorMessages.push(ignitionTimeErrorMessage);
        }

        return {header: "Ignition Line", messages: errorMessages};
    }
}

window.customElements.define('ignition-line', IgnitionLine);