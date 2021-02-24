"use strict";

// declare variables in global scope
var map = null;
var base_layer_dict = null;
// var markers = {};
var markerFields = [];
var ignitionTimes = [];
var markerId = 0;
var polygon = null;

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

    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();

    // add lon/lat display to bottom left corner of map
    L.control.mousePosition().addTo(map);
}

// initialize Semantic elements
$('#profile-dropdown').dropdown({on: 'hover'});

const validLatitude = (lat) => {
  if(isNaN(lat) || (lat < 22)|| (lat > 51)) return false;
  return true;
}

const validLongitude = (lng) => {
  if(isNaN(lng) || lng < -128 || lng > -65) return false;
  return true;
}

function buildLatLongFields(id) {
  return $(`<div class="two fields">
        <div class="ignition-id">
          <span>${id}</span>
        </div>
        <div class="field">
          <input name="ignition_latitude${id}" id="ign-lat${id}" type="text" placeholder="Latitude ...">
          <span id="lat-warning${id}" class="not-valid-warning">The ignition latitude must be a number between 36 and 41.</span>
        </div>
        <div class="field">
          <input name="ignition_longitude${id}" id="ign-lon${id}" type="text" placeholder="Longitude ...">
          <span id="lon-warning${id}" class="not-valid-warning">The ignition longitude must be a number between -109 and -102.</span>
        </div>
        <div>
          <span class="active-field-button" id="active-marker${id}">Active</span>
        </div>
      </div>`);
}

function setActiveMarker(newFieldId) {
  $(`#active-marker${markerId}`).css("background-color", "white");
  $(`#active-marker${markerId}`).css("color", "black");
  $(`#active-marker${newFieldId}`).css("background-color", "#404040");
  $(`#active-marker${newFieldId}`).css("color", "white");
  markerId = newFieldId;
}

function calculateCentroid(latLon) {

}

function updatePolygon() {
  if (polygon != null) {
    map.removeLayer(polygon);
    polygon = null;
  }
  if ($('#ignition-type').val() == "ignition-area") {
    var latLon = [];
    for (var i = 0; i < markerFields.length; i++) {
      var lat = parseFloat($(`#ign-lat${i}`).val());
      var lon = parseFloat($(`#ign-lon${i}`).val());
      if (validLatitude(lat) && validLongitude(lon)) latLon.push([lat, lon]);
    }
    if (latLon.length > 2) {
      polygon = L.polygon(latLon, {color: 'red'});
      var centroid = polygon.getBounds().getCenter();
      latLon.sort((a, b) => {
        var thetaA = Math.atan2((a[1] - centroid.lng) , (a[0] - centroid.lat));
        var thetaB = Math.atan2((b[1] - centroid.lng) , (b[0] - centroid.lat));
        if (thetaA > thetaB) return 1;
        return -1;
      });
      map.removeLayer(polygon);
      polygon = L.polygon(latLon, {color: 'red'}).addTo(map);
    }
  }
}

function buildMapMarker(id, lat, lon) {
  if (markerFields[id].marker) map.removeLayer(markerFields[id].marker);
  const marker = L.marker([lat, lon], {title: id.toString(), draggable: true}).addTo(map);
  markerFields[id].marker = marker;
  marker.on("move", (e) => {
    let latLon = e.target._latlng;
    $(`#ign-lat${id}`).val(Math.floor(latLon.lat*10000)/10000);
    $(`#ign-lon${id}`).val(Math.floor(latLon.lng*10000)/10000);
    updatePolygon();
  });
  updatePolygon();
}


function updateMarker(newFieldId) {
  let lat = parseFloat($(`#ign-lat${newFieldId}`).val());
  let lon = parseFloat($(`#ign-lon${newFieldId}`).val());
  if (!validLatitude(lat) || !validLongitude(lon)) {
    if (markerFields[newFieldId].marker) map.removeLayer(markerFields[newFieldId].marker);
    delete markerFields[newFieldId].marker;
    return;
  }
  buildMapMarker(newFieldId, lat, lon);
}

function buildNewMarker() {
  let newFieldId = markerFields.length;
  const newMarkerField = buildLatLongFields(newFieldId);
  $('#markers').append(newMarkerField);
  setActiveMarker(newFieldId);
  $(`#active-marker${newFieldId}`).click(() => {
    if (markerFields.length > 1) setActiveMarker(newFieldId);
  });
  $(`#ign-lat${newFieldId}`).keyup(() => {
    updateMarker(newFieldId);
  });
  $(`#ign-lon${newFieldId}`).keyup(() => {
    updateMarker(newFieldId);
  });
  markerFields.push({field: newMarkerField});
  if (($('#ignition-type').val() == "multiple-ignitions" && $('#ignition-times-count').val() == "multiple")
   || ignitionTimes.length == 0) buildNewIgnitionTime();
}

function removeMarker() {
  if (markerFields.length < 2) return;
  if (markerFields.length == 3 && $('#ignition-type').val() == "ignition-area") return;
  if (markerId == markerFields.length - 1) setActiveMarker(markerId - 1);
  const lastMarker = markerFields.pop();
  lastMarker.field.remove();
  if (lastMarker.marker) map.removeLayer(lastMarker.marker);
  if ($('#ignition-type').val() == "multiple-ignitions") removeIgnitionTime();
  updatePolygon();
}

function buildNewIgnitionTime() {
  let newFieldId = ignitionTimes.length;
  const ignitionField = $(`
        <div class="two fields">
          <div id="ignition-time-id-${newFieldId}" class="ignition-id">
            <span>${newFieldId}</span>
          </div>
          <div class="field">
            <div class="ui input left icon">
              <i class="calendar icon"></i>
              <input name="ignition_time" id="ign-time${newFieldId}" type="text" placeholder="YYYY-MM-DD_HH:MM:SS">
            </div>
            <span id="ignition-time-warning${newFieldId}" class="not-valid-warning">The ignition time must be between 1/1/1979 and now in the format YYYY-MM-DD_HH:MM:SS</span>
          </div>
          <div class="field">
              <select name="fc_hours" class="ui dropdown" id="fc-hours${newFieldId}">
                  <option value="3">3</option>
                  <option value="6">6</option>
                  <option value="9">9</option>
                  <option value="12">12</option>
                  <option value="18">18</option>
                  <option value="24">24</option>
                  <option value="48">48</option>
              </select>
          </div>
        </div>
      `);

  $('#ignition-times').append(ignitionField);
  $(`#fc-hours${newFieldId}`).dropdown();
  $(`#ign-time${newFieldId}`).datetimepicker({ value: moment().utc(), formatTime: 'h:mm a', formatDate: 'm.d.Y', step:15 });
  ignitionTimes.push(ignitionField);
}

function removeIgnitionTime() {
  if (ignitionTimes.length == 1) return;
  const lastIgnitionTime = ignitionTimes.pop();
  lastIgnitionTime.remove();
}

function checkIgnitionType() {
  var ignitionType = $('#ignition-type').val();
  if(ignitionType == "ignition-area") {
    $('#ignition-perimeter-time').show();
    while (ignitionTimes.length > 1) {
      removeIgnitionTime();
    }
    $('#ignition-time-id-0').hide();
    $('#ignition-times-count-field').hide();
  } else {
    $('#ignition-perimeter-time').hide();
    $('#ignition-times-count-field').show();
    checkIgnitionTimeCount();
  }
  updatePolygon();
}

function checkIgnitionTimeCount() {
  var ignitionTimeCount = $('#ignition-times-count').val();
  if(ignitionTimeCount == "single") {
    while (ignitionTimes.length > 1) {
      removeIgnitionTime();
    }
    $('#ignition-time-id-0').hide();
  } else {
    $('#ignition-time-id-0').show();
    while (ignitionTimes.length < markerFields.length) {
      buildNewIgnitionTime();
    }
  }
}

$('#additional-marker').click(buildNewMarker);
$('#remove-marker').click(removeMarker);
$('#ignition-type').change(checkIgnitionType)
$('#ignition-times-count').change(checkIgnitionTimeCount);
buildNewMarker();
checkIgnitionType();
$('.ui.menu').on('click', '.item', function() {
  $(this).addClass('active').siblings('.item').removeClass('active');
});

// Fill in a 'unique description'
$('#experiment-description').text('Web initiated forecast at ' + moment().format());

function set_profile_text(txt) {
  $('#profile-info-text').text(txt);
}

const validateTime = (time) => {
  var ign_time = moment.utc(time, 'MMM D,YYYY h:mm a');
  if(!ign_time.isValid() || ign_time.year() <  1979) {
    return false;
  }
  return true;
}

const validateIgnitionTimes = () => {
  var valid = true;
  for (var i = 0; i < ignitionTimes.length; i++) {
    if(!validateTime($(`#ign-time${i}`).val())) {
      valid = false;
      $(`#ignition-time-warning${i}`).addClass('activate-warning');
    } else {
      $(`#ignition-time-warning${i}`).removeClass('activate-warning');
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



const validateLongitudes = () => {
  var valid = true;
  for (var i = 0; i < markerFields.length; i++) {
    var lng = parseFloat($(`#ign-lon${i}`).val());
    if (!validLongitude(lng)) {
      valid = false;
      $(`#lon-warning${i}`).addClass('activate-warning');
    } else {
      $(`#lon-warning${i}`).removeClass('activate-warning');
    }
  }
  return valid;
}



const validateLatitudes = () => {
  var valid = true;
  for (var i = 0; i < markerFields.length; i++) {
    var lat = parseFloat($(`#ign-lat${i}`).val());
    if(!validLatitude(lat)) {
      valid = false;
      $(`#lat-warning${i}`).addClass('activate-warning');
    } else {
      $(`#lat-warning${i}`).removeClass('activate-warning');
    }
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
  var validLatitudes = validateLatitudes();
  var validLongitudes = validateLongitudes();
  var validDescription = validateDescription();
  var validProfile = validateProfile();
  var validIgnitionTimes = validateIgnitionTimes();
  return validIgnitionType && validLatitude && validLongitude && validLatitude && validDescription && validProfile && validIgnitionTimes;
}

function getLatitudes() {
  var latitudes = [];
  for (var i = 0; i < markerFields.length; i++) {
    latitudes.push(parseFloat($(`#ign-lat${i}`).val()));
  }
  return JSON.stringify(latitudes);
}

function getLongitudes() {
  var longitudes = [];
  for (var i = 0; i < markerFields.length; i++) {
    longitudes.push(parseFloat($(`#ign-lon${i}`).val()));
  }
  return JSON.stringify(longitudes);
}

function getIgnitionTimesAndDurations() {
  var igns = [];
  var fcHours = [];
  igns.push($('#ign-time0').val());
  fcHours.push(parseInt($('#fc-hours0').val()));
  for (var i = 1; i < markerFields.length; i++) {
    if ($('#ignition-type').val() == "multiple-ignitions") {
      if ($('#ignition-times-count').val() == "multiple") {
        igns.push($(`#ign-time${i}`).val());
        fcHours.push(parseInt($(`#fc-hours${i}`).val()));
      } else {
        igns.push($('#ign-time0').val());
        fcHours.push(parseInt($('#fc-hours0').val()));
      }
    }
  }
  return [JSON.stringify(igns), JSON.stringify(fcHours)];
}

$('.form').submit((event) => {
  event.preventDefault();
  var valid = validateForm();
  var [ignTimes, fcHours] = getIgnitionTimesAndDurations();
  var ignitionType = $('#ignition-type').val();
  if(valid) {
    var formData = {
      "description": $('#experiment-description').val(),
      "ignition_type": $('#ignition-type').val(),
      "ignition_latitude": getLatitudes(),
      "ignition_longitude": getLongitudes(),
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
$(`#ign-time-perimeter`).datetimepicker({ value: moment().utc(), formatTime: 'h:mm a', formatDate: 'm.d.Y', step:15 });

