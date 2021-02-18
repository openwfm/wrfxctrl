"use strict";

// declare variables in global scope
var map = null;
var base_layer_dict = null;
// var markers = {};
var markerFields = [];
var ignitionTimes = [];
var markerId = 0;

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


function buildLatLongFields(id) {
  return $(`<div class="two fields">
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

function updateMarker(newFieldId) {
  let lat = parseFloat($(`#ign-lat${newFieldId}`).val());
  let lon = parseFloat($(`#ign-lon${newFieldId}`).val());
  if (!validLatitude(lat) || !validLongitude(lon)) return;
  if (markerFields[newFieldId].marker) map.removeLayer(markerFields[newFieldId].marker);
  const marker = L.marker([lat, lon]).addTo(map);
  markerFields[newFieldId].marker = marker;
}

function buildNewMarker() {
  let newFieldId = markerFields.length;
  const newMarkerField = buildLatLongFields(newFieldId);
  $('#markers').append(newMarkerField);
  setActiveMarker(newFieldId);
  $(`#active-marker${newFieldId}`).click(() => {
    if (markerFields.length > 1) setActiveMarker(newFieldId);
  });
  $(`#ign-lat${newFieldId}`).change(() => {
    updateMarker(newFieldId);
  });
  $(`#ign-lon${newFieldId}`).change(() => {
    updateMarker(newFieldId);
  });
  markerFields.push({field: newMarkerField});
  if ($('#ignition-type').val() == "multiple-ignitions" || ignitionTimes.length == 0) buildNewIgnitionTime();
}

function removeMarker() {
  if (markerFields.length < 2) return;
  if (markerFields.length == 3 && $('#ignition-type').val() == "ignition-area") return;
  if (markerId == markerFields.length - 1) setActiveMarker(markerId - 1);
  const lastMarker = markerFields.pop();
  lastMarker.field.remove();
  if (lastMarker.marker) map.removeLayer(lastMarker.marker);
  if ($('#ignition-type').val() == "multiple-ignitions") removeIgnitionTime();
}

function buildNewIgnitionTime() {
  let newFieldId = ignitionTimes.length;
  const ignitionField = $(`
        <div class="ui two column grid">
          <div class="column">
              <div class="field">
                <label>Ignition time [UTC]</label>
                <div class="ui input left icon">
                  <i class="calendar icon"></i>
                  <input name="ignition_time" id="ign-time${newFieldId}" type="text" placeholder="YYYY-MM-DD_HH:MM:SS">
                </div>
                <span id="ignition-time-warning${newFieldId}" class="not-valid-warning">The ignition time must be between 1/1/1979 and now in the format YYYY-MM-DD_HH:MM:SS</span>
              </div>
          </div>
          <div class="column">
              <div class="field">
                  <label>Forecast length [hours]</label>
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
        </div>
      `);

  $('#ignition-times').append(ignitionField);
  $(`#fc-hours${newFieldId}`).dropdown();
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
    while (markerFields.length < 3) {
      buildNewMarker();
    }
    while (ignitionTimes.length > 1) {
      removeIgnitionTime();
    }
  } else {
    while (ignitionTimes.length < markerFields.length) {
      buildNewIgnitionTime();
    }
  }
}

$('#additional-marker').click(buildNewMarker);
$('#remove-marker').click(removeMarker);
$('#ignition-type').change(checkIgnitionType)
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


const validateIgnitionTimes = () => {
  var valid = true;
  for (var i = 0; i < ignitionTimes.length; i++) {
    var ign_time = moment.utc($(`#ign-time${i}`).val(), 'MMM D,YYYY h:mm a');
    var now = moment().utc();
    if(!ign_time.isValid() || ign_time.year() <  1979) {
      valid = false;
      $(`#ignition-time-warning${i}`).addClass('activate-warning');
    } else {
      $(`#ignition-time-warning${i}`).removeClass('activate-warning');
    }
  }
  return valid;
}

const validLongitude = (lng) => {
  if(isNaN(lng) || lng < -128 || lng > -65) return false;
  return true;
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

const validLatitude = (lat) => {
  if(isNaN(lat) || (lat < 22)|| (lat > 51)) return false;
  return true;
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

function validateForm() {
  var validLatitudes = validateLatitudes();
  var validLongitudes = validateLongitudes();
  var validDescription = validateDescription();
  var validProfile = validateProfile();
  var validIgnitionTimes = validateIgnitionTimes();
  return validLatitude && validLongitude && validLatitude && validDescription && validProfile && validIgnitionTime;
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
  return JSON.stringify(longitudes)
}

$('.form').submit((event) => {
  event.preventDefault();
  var valid = validateForm();
  if(valid) {
    var formData = {
      "description": $('#experiment-description').val(),
      "ignition_type": $('#ignition-type').val(),
      "ignition_latitude": getLatitudes(),
      "ignition_longitude": getLongitudes(),
      "ignition_time": $('#ign-time').val(),
      "fc_hours": $('#fc-hours').val(),
      "profile": $('#profile').val()
    }
    $.ajax({
        type:"post",
        dataType: 'json',
        data: formData
      });
  }
});

$('#ign-time').datetimepicker({ value: moment().utc(), formatTime: 'h:mm a', formatDate: 'm.d.Y', step:15 });
$('#ignition-type').dropdown();

