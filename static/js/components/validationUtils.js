import { appState } from "../appState.js";

export function validateIgnitionTimes(ignitionTimes) {
    let simulationStartTime = appState.simulationStartTimeMoment();
    let simulationEndTime = appState.simulationEndTimeMoment();
    let invalidIndices = [];

    for (let ignitionTime of ignitionTimes) {
        if (!isValidIgnitionTime(ignitionTime)) {
            invalidIndices.push(ignitionTime.index)
        }
    }

    if (invalidIndices.length == 0) {
        return '';
    }

    return `Ignition Time at id(s) [${invalidIndices}] must be between ${simulationStartTime} and ${simulationEndTime}.`;
}

export function isValidIgnitionTime(ignitionTime) {
    let simulationStartTime = appState.simulationStartTimeMoment();
    let simulationEndTime = appState.simulationEndTimeMoment();
    let ignTimeMoment = ignitionTime.ignitionTimeMoment();

    return ignTimeMoment <= simulationEndTime && ignTimeMoment >= simulationStartTime;
}

export function validateIgnitionMarkers(ignitionMarkers) {
    let invalidMarkers = [];
    for (let ignitionMarker of ignitionMarkers) {
        if (!isValidIgnitionMarker(ignitionMarker)) {
            invalidMarkers.push(ignitionMarker.index);
        }
    }
    if (invalidMarkers.length == 0) {
        return '';
    }
    return `Invalid Latitude/Longitude at id(s) [${invalidMarkers}]. The ignition latitudes must be a number between 22 and 51. The ignition longitudes must be a number between -128 and -65.`;
}

export function isValidIgnitionMarker(ignitionMarker) {
    let lat, lon = ignitionMarker.getLatLon();
    return isValidLatitude(lat) && isValidLongitude(lon);
}

export function isValidLatitude(lat) {
    return !isNaN(lat) && lat >= 22 && lat <= 51;
}

export function isValidLongitude(lng) {
    return !isNaN(lng) && lng >= -128 && lng <= -65;
}