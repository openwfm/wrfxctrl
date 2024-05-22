import { appState } from '../../appState.js';
import { IgnitionMarker } from '../ignitionMarker.js';
import { buildMap } from '../../buildMap.js';
import { IgnitionLineUI } from './ignitionLineUI/ignitionLineUI.js';
import { IgnitionTime } from '../../../ignitionTime.js';
import { validateIgnitionTimes, validateIgnitionMarkers, jsonLatLons, jsonIgnitionTimesAndDurations} from '../validationUtils.js';
import { UploadKml } from '../uploadKml/uploadKml.js';

export class IgnitionLine extends IgnitionLineUI {
    constructor(index) {
        super();
        this.lineMarkers = [];
        this.ignitionTimes = [];
        this.currentMarker = null;
        this.lastMarker = null;
        this.index = index;
    }

    connectedCallback() {
        super.connectedCallback();

        const { kmlButtonContainer } = this.uiElements;
        const kmlButton = new UploadKml(this);
        kmlButtonContainer.appendChild(kmlButton);

        this.createLineMarker();
    }

    activePolygonColor() {
      console.log('Line activePolygonColor', this.index);
    }

    passivePolygonColor() {
      console.log('Line passivePolygonColor', this.index);
    }

    removeLastMarker() {
        let index = this.lineMarkers.indexOf(this.currentMarker);
        this.removeMarker(index);
    }
  
    addKmlPoints(kmlPoints) {
        if ( !appState.isLine() ) {
          return;
        }
        this.removeAllMarkers();
        if ( kmlPoints.length == 0 ) {
          return;
        } 
        for (let kmlPoint of kmlPoints) {
          let { lat, lon } = kmlPoint;
          this.addMarker(lat, lon, true);
        }
        this.updateMapLayer();
        let centroid = this.line.getBounds().getCenter();
        buildMap.map.setView(new L.LatLng(centroid.lat, centroid.lng), 12);
    }

    createLineMarker() {
        let { ignitionLineMarkersListUI } = this.uiElements;
        let newFieldId = 0;
        if (this.currentMarker) {
          newFieldId = this.lineMarkers.indexOf(this.currentMarker) + 1;
        }

        const newMarkerField = new IgnitionMarker(newFieldId, this, "red");
        this.currentMarker = newMarkerField;
        this.lineMarkers.splice(this.currentMarker.index, 0, newMarkerField);
        this.createIgnitionTime();
    }

    createIgnitionTime() {
        let newFieldId = 0;
        if (this.currentMarker) {
          newFieldId = this.lineMarkers.indexOf(this.currentMarker);
        }

        let ignitionField = new IgnitionTime(newFieldId, "ignitionLine");
        

        this.ignitionTimes.splice(this.currentMarker.index, 0, ignitionField);
    }

    updateIndices() {
      const { ignitionLineMarkersListUI } = this.uiElements;
      this.clearMarkerList();
      let i = 0;
      for (let marker of this.lineMarkers) {
        let ignitionTime = this.ignitionTimes[i];
        marker.updateIndex(i);
        ignitionTime.updateIndex(i);
        i++;
        let markerDiv = document.createElement('div');
        markerDiv.classList.add('markerDiv');
        markerDiv.append(marker);
        markerDiv.append(ignitionTime);
        ignitionLineMarkersListUI.append(markerDiv);
      }

      if (this.evenSplitCheck()) {
          this.evenlySplitDateTimes();
      }
    }

    clearMarkerList() {
      const { ignitionLineMarkersListUI } = this.uiElements;
      while (ignitionLineMarkersListUI.firstChild) {
        ignitionLineMarkersListUI.removeChild(ignitionLineMarkersListUI.firstChild);
      }
    }

    clearLastMarker() {
      const lastMarker = this.lastPointsMarker();
      if (lastMarker.mapMarker) {
            buildMap.map.removeLayer(lastMarker.mapMarker);
        }
      lastMarker.clearLatLon();
    }

    lastPointsMarker() {
        return this.lineMarkers.slice(-1)[0];
    }


    addMarker(lat, lon, kml=false) {
        if (this.currentMarker.getLatLon().length == 2) {
            this.lastMarker = this.currentMarker;
            this.lastMarker.setMarkerOriginalColor();
            this.createLineMarker();
        }
        this.currentMarker.addMarkerToMapAtLatLon(lat, lon);
        this.currentMarker.setMarkerBlack();
        this.updateIndices();
        if ( !kml ) {
          this.updateMapLayer();
        }
    }

    clickMarker(marker) {
        if (this.currentMarker != marker) {
          this.currentMarker.setMarkerOriginalColor();
          this.lastMarker = this.currentMarker;
          this.currentMarker = marker;
          marker.setMarkerBlack();
        }
    }  

    lastLineMarker() {
        return this.lineMarkers.slice(-1)[0];
    }

    updateMapLayer() {
      let latLons = this.lineMarkers.map(marker => 
          marker.getLatLon()).filter(l => l.length > 0);
      if (this.line) {
        buildMap.map.removeLayer(this.line);
      }
      this.line = buildMap.drawLine(latLons);
    }
    
    markerUpdate() {
      this.updateMapLayer();
    }

    removeMarker(index) {
        if (this.lineMarkers.length == 0) {
          return;
        }
        if (this.lineMarkers.length == 1) {
            this.clearLastMarker();
            return;
        }
        for (let i = index + 1; i < this.lineMarkers.length; i++ ) {
            this.lineMarkers[i].updateIndex(i - 1);
        }
        const markerToRemove = this.lineMarkers.splice(index, 1)[0];
        if (markerToRemove.mapMarker) {
            buildMap.map.removeLayer(markerToRemove.mapMarker);
        }
        if (index == 0) {
          this.currentMarker = this.lineMarkers[this.perimeterMarkers.length - 1];
        } else {
          this.currentMarker = this.lineMarkers[index - 1];
        }

        this.currentMarker.setMarkerBlack();
        markerToRemove.remove();
        this.markerUpdate();

        this.removeIgnitionTime(index);
        if (this.evenSplitCheck()) {
            this.evenlySplitDateTimes();
        }
    }

    removeAllMarkers() {
      while (this.lineMarkers.length > 1) {
        this.removeMarker(0);
      }
      this.removeMarker(0);
    }


    removeIgnitionTime(index) {
        if (this.ignitionTimes.length == 0) {
          return;
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
