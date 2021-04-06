"use strict";

// declare variables in global scope
var map = null;
var base_layer_dict = null;
var markerFields = [];
var bufferFields = {0: []};
var ignitionTimes = [];
var satelliteJSON = {};
var satelliteMarkers = [];
var bufferId = 0;
var bufferGroup = 0;
var markerId = 0;
var polygon = null;
var line = null;

// map initialization code
function initialize_map() {

    base_layer_dict = {
      'MapQuest': MQ.mapLayer(),
      'MQ Satellite': L.tileLayer('http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png', {
                                  attribution: 'Data and imagery by MapQuest',
                                  subdomains: ['otile1', 'otile2', 'otile3', 'otile4']}),
      'OSM': L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                         attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'})
    };

    // initialize map
    map = L.map('map', {
      center: [39, -106],
      zoom: 7,
      layers: [base_layer_dict['OSM']],
      zoomControl: true,
      minZoom: 3
    });

    L.DomUtil.addClass(map._container,'pointer-cursor-enabled');
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();

    // add lon/lat display to bottom left corner of map
    L.control.mousePosition().addTo(map);
}

// initialize Semantic elements
$('#profile-dropdown').dropdown({on: 'hover'});

function setActiveMarker(newFieldId) {
  markerFields[markerId].setInactive();
  markerFields[newFieldId].setActive();
  markerId = newFieldId;
}

function calculateCentroid(latLon) {

}

const removeDrawnFeature = (feature) => {
  if (feature != null) {
    map.removeLayer(feature);
    feature = null;
  }
}

function updatePolygon() {
  if (polygon != null) {
    map.removeLayer(polygon);
    polygon = null;
  }
  if (line != null) {
    map.removeLayer(line);
    line = null;
  }
  if ($('#ignition-type').val() != "ignition-area") return;
  var latLons = [];
  for (var i = 0; i < markerFields.length; i++) {
    var latLon = markerFields[i].getLatLon();
    if (latLon.length != 0) latLons.push(latLon);
  }
  if (latLons.length > 2) {
    polygon = L.polygon(latLons, {color: 'red'});
    var centroid = polygon.getBounds().getCenter();
    latLons.sort((a, b) => {
      var thetaA = Math.atan2((a[1] - centroid.lng) , (a[0] - centroid.lat));
      var thetaB = Math.atan2((b[1] - centroid.lng) , (b[0] - centroid.lat));
      if (thetaA > thetaB) return 1;
      return -1;
    });
    map.removeLayer(polygon);
    polygon = L.polygon(latLons, {color: 'red'}).addTo(map);
  } 
}

function updateLine() {
  if (line != null) {
    map.removeLayer(line);
    line = null;
  }
  if (polygon != null) {
    map.removeLayer(polygon);
    polygon = null;
  }
  if ($('#ignition-type').val() != "ignition-line") return;
  var latLons = markerFields.map(marker => marker.getLatLon()).filter(l => l.length > 0);
  if (latLons.length > 1) line = L.polyline(latLons, {color: 'red'}).addTo(map);
}

const updateMap = () => {
  var ignitionType = $('#ignition-type').val();
  if (ignitionType == "ignition-line") updateLine();
  if (ignitionType == "ignition-area") updatePolygon();
}

function removeMarker(id = markerFields.length - 1) {
  if (markerFields.length < 2) return;
  if (markerId == markerFields.length - 1 ) markerId = markerId - 1;
  const lastMarker = markerFields[id];
  for (var i = id + 1; i < markerFields.length; i++ ) markerFields[i].updateIndex(i - 1);
  markerFields.splice(id, 1);
  if (lastMarker.marker) map.removeLayer(lastMarker.marker);
  lastMarker.remove();
  setActiveMarker(markerId)
  var ignitionType = $('#ignition-type').val();
  if (ignitionType == "multiple-ignitions" || ignitionType == "ignition-line") removeIgnitionTime(id);
  updateMap();
}

function validateTime(ign_time_value) {
  var ign_time = moment.utc(ign_time_value, 'MMM D,YYYY h:mm a');
  if(!ign_time.isValid() || ign_time.year() <  1979) return false;
  return true;
}

function buildNewIgnitionTime() {
  let newFieldId = ignitionTimes.length;
  const ignitionField = new IgnitionTime(newFieldId);
  $('#ignition-times').append(ignitionField);
  ignitionTimes.push(ignitionField);
}

function buildNewMarker() {
  let newFieldId = markerFields.length;
  const newMarkerField = new Marker(newFieldId);
  $('#markers').append(newMarkerField);
  markerFields.push(newMarkerField);
  setActiveMarker(newFieldId);
  if (($('#ignition-type').val() == "multiple-ignitions" && $('#ignition-times-count').val() == "multiple")
   || ignitionTimes.length == 0) buildNewIgnitionTime();
}

function buildNewBufferMarker() {
  const newBufferId = bufferFields[bufferGroup].length;
  const newBufferField = new Marker(newBufferId);
  $('#buffer-markers').append(newBufferField);
  bufferFields[bufferGroup].push(newBufferField);
  bufferId = newBufferId;
}

function removeIgnitionTime(id = ignitionTimes.length - 1) {
  if (ignitionTimes.length == 1) return;
  for (var i = id + 1; i < ignitionTimes.length; i++) {
    ignitionTimes[i].updateIndex(i);
  }
  const lastIgnitionTime = ignitionTimes.splice(id, 1)[0];
  lastIgnitionTime.remove();
}

function checkIgnitionTimeCount() {
  var ignitionTimeCount = $('#ignition-times-count').val();
  if(ignitionTimeCount == "single") {
    while (ignitionTimes.length > 1) {
      removeIgnitionTime();
    }
    ignitionTimes[0].hideIndex();
  } else {
    while (ignitionTimes.length < markerFields.length) {
      buildNewIgnitionTime();
    }
    ignitionTimes[0].showIndex();
  }
}

async function getSatelliteData() {
  try {
    const response = await fetch('/submit/sat_data');
    satelliteJSON = await response.json();
  } catch (error) {
    console.error("Error fetching satellite data: " + error);
  }
  var satIcon = L.icon({iconUrl: 'static/square_icon_filled.png',
                  iconSize: [5,5]});
  satelliteJSON['coordinates'].map((coordinates) => {
    var lat = coordinates['lat'];
    var lon = coordinates['lon'];
    var popUpString = "lat: " + lat + " lon: " + lon;
    var newMarker = L.marker([lat, lon], {icon: satIcon}).bindPopup(popUpString, {closeButton: false});
    newMarker.on("mouseover", () => newMarker.openPopup());
    newMarker.on("mouseout", () => newMarker.closePopup());
    satelliteMarkers.push(newMarker);
  });
}

async function showSatData() {
  if (satelliteMarkers.length == 0) {
    await getSatelliteData();
  } 
  if ($('#show-sat-data').prop('checked')) {
    satelliteMarkers.map(marker => marker.addTo(map));
  } else {
    satelliteMarkers.map(marker => map.removeLayer(marker));
  }
}

function checkIgnitionType() {
  // L.DomUtil.removeClass(map._container,'pointer-cursor-enabled');
  var ignitionType = $('#ignition-type').val();
  if(ignitionType == "ignition-area") {
    $('#ignition-perimeter-time').show();
    while (ignitionTimes.length > 1) {
      removeIgnitionTime();
    }
    ignitionTimes[0].hideIndex();
    $('#ignition-times-count-field').hide();
  } else {
    $('#ignition-perimeter-time').hide();
    $('#ignition-times-count-field').show();
    ignitionTimes[0].showIndex();
    checkIgnitionTimeCount();
  } 
  if(ignitionType == "ignition-line") {
    while (markerFields.length > 1) removeMarker();
  }
  updateMap();
}

$('#additional-marker').click(buildNewMarker);
$('#remove-marker').click(() => removeMarker());
$('#ignition-type').change(checkIgnitionType)
$('#ignition-times-count').change(checkIgnitionTimeCount);
$('#show-sat-data').prop('checked', false);
$('#add-buffer-line').prop('checked', false);
$('#show-sat-data').click(showSatData);
buildNewMarker();
buildNewBufferMarker();
checkIgnitionType();
$('.ui.menu').on('click', '.item', function() {
  $(this).addClass('active').siblings('.item').removeClass('active');
});

// Fill in a 'unique description'
$('#experiment-description').text('Web initiated forecast at ' + moment().format());

function set_profile_text(txt) {
  $('#profile-info-text').text(txt);
}


const validateIgnitionTimes = () => {
  var valid = true;
  for (var i = 0; i < ignitionTimes.length; i++) {
    if(!ignitionTimes[i].validate()) {
      valid = false;
    }
  }
  if ($('#ignition-type').val() == "ignition-area") {
    if(!validateTime($('#ign-time-perimeter').val())) {
      valid = false;
      $(`#ignition-time-warning-perimeter`).addClass('activate-warning');
    } else {
      $(`#ignition-time-warning-perimeter`).removeClass('activate-warning');
    }
  }
  return valid;
}

const validateLatLons = () => {
  var valid = true;
  for (var i = 0; i < markerFields.length; i++) {
    if (!markerFields[i].validate()) valid = false
  }
  return valid;
}

const validateDescription = () => {
  var description = $('#experiment-description').val();
  if (description == "") {
    $('#description-warning').addClass("activate-warning");
    return false;
  }
  $('#description-warning').removeClass("activate-warning");
  return true;
}

const validateProfile = () => {
  var profile = $('#profile').val();
  if (profile == "") {
    $('#profile-warning').addClass("activate-warning");
    return false;
  }
  $('#profile-warning').removeClass("activate-warning");
  return true;
}

const validateIgnitionType = () => {
  var ignitionType = $('#ignition-type').val();
  if (ignitionType == "ignition-area") {
    if (markerFields.length < 3) {
      $('#ignition-type-warning').addClass("activate-warning");
      return false;
    }
  }
  $('#ignition-type-warning').removeClass("activate-warning");
  return true;
}

function validateForm() {
  var validIgnitionType = validateIgnitionType();
  var validLatLons = validateLatLons();
  var validDescription = validateDescription();
  var validProfile = validateProfile();
  var validIgnitionTimes = validateIgnitionTimes();
  return validIgnitionType && validLatLons && validDescription && validProfile && validIgnitionTimes;
}

function getLatLons() {
  var latitudes = [];
  var longitudes = [];
  for (var i = 0; i < markerFields.length; i++) {
    let [lat, lon] = markerFields[i].getLatLon();
    latitudes.push(lat);
    longitudes.push(lon);
  }
  return [JSON.stringify(latitudes), JSON.stringify(longitudes)];
}

function getIgnitionTimesAndDurations() {
  var igns = [];
  var fcHours = [];
  var ignTimeAndDuration = ignitionTimes[0].getIgnitionTimeAndDuration();
  igns.push(ignTimeAndDuration[0]);
  fcHours.push(ignTimeAndDuration[1]);
  for (var i = 1; i < markerFields.length; i++) {
    // If an area we dont want to post multiple ignitions
    if ($('#ignition-type').val() == "multiple-ignitions") {
      if ($('#ignition-times-count').val() == "multiple") {
        ignTimeAndDuration = ignTimes[i].getIgnitionTimeAndDuration();
      }
      igns.push(ignTimeAndDuration[0]);
      fcHours.push(ignTimeAndDuration[1]);
    }
  }
  return [JSON.stringify(igns), JSON.stringify(fcHours)];
}

$('.form').submit((event) => {
  event.preventDefault();
  var valid = validateForm();
  var [ignTimes, fcHours] = getIgnitionTimesAndDurations();
  var [lats, lons] = getLatLons();
  var ignitionType = $('#ignition-type').val();
  if(valid) {
    var formData = {
      "description": $('#experiment-description').val(),
      "ignition_type": $('#ignition-type').val(),
      "ignition_latitude": lats,
      "ignition_longitude": lons,
      "ignition_time": ignTimes,
      "fc_hours": fcHours,
      "profile": $('#profile').val()
    }
    if (ignitionType == "ignition-area") formData["perimeter_time"] = JSON.stringify($('#ign-time-perimeter').val());
    $.ajax({
        type:"post",
        dataType: 'json',
        data: formData
      });
  }
});

$('#ignition-type').dropdown();
$('#ignition-times-count').dropdown();
$('#buffer-type').dropdown();
$(`#ign-time-perimeter`).datetimepicker({ value: moment().utc(), formatTime: 'h:mm a', formatDate: 'm.d.Y', step:15 });

