"use strict";

// declare variables in global scope
var map = null;
var base_layer_dict = null;
var markers = {};

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


var markerId = 0;
function buildTwoFields(id) {
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
  if (!valid_latitude(lat) || !valid_longitude(lon)) return;
  if (markers[newFieldId]) map.removeLayer(markers[newFieldId]);
  const marker = L.marker([lat, lon]).addTo(map);
  markers[newFieldId] = marker;
}

var additionalMarkers = [];
$('#additional-marker').click(() => {
  let newFieldId = additionalMarkers.length;
  const additionalMarker = buildTwoFields(newFieldId);
  $('#markers').append(additionalMarker);
  setActiveMarker(newFieldId);
  $(`#active-marker${newFieldId}`).click(() => {
    if (additionalMarkers.length > 1) setActiveMarker(newFieldId);
  });
  $(`#ign-lat${newFieldId}`).change(() => {
    updateMarker(newFieldId);
  });
  $(`#ign-lon${newFieldId}`).change((newLon) => {
    updateMarker(newFieldId);
  });
  additionalMarkers.push(additionalMarker);
});

$('#remove-marker').click(() => {
  if (additionalMarkers.length < 2) return;
  if (markerId == additionalMarkers.length - 1) setActiveMarker(markerId - 1);
  if (markers[additionalMarkers.length - 1]) {
    map.removeLayer(markers[additionalMarkers.length - 1]);
    delete markers[additionalMarkers.length - 1];
  }
  const lastMarker = additionalMarkers.pop();
  lastMarker.remove();
});

$('#additional-marker').click();

$('.ui.menu')
    .on('click', '.item', function() {
        $(this)
          .addClass('active')
          .siblings('.item')
            .removeClass('active');
    });

// Fill in a 'unique description'
$('#experiment-description').text('Web initiated forecast at ' + moment().format());


function set_profile_text(txt) {
  $('#profile-info-text').text(txt);
}


const validateIgnitionTime = () => {
  var ign_time = moment.utc($('#ign-time').val(), 'MMM D,YYYY h:mm a');
  var now = moment().utc();
  if(!ign_time.isValid() || ign_time.year() <  1979) {
    $('#ignition-time-warning').addClass('activate-warning');
    return false;
  }
  $('#ignition-time-warning').removeClass('activate-warning');
  return true;
}

const validateLongitude = () => {
  var valid = true;
  for (var i = 0; i < additionalMarkers.length; i++) {
    var lng = parseFloat($(`#ign-lon${i}`).val());
    if(isNaN(lng) || lng < -128 || lng > -65){
      valid = false;
      $(`#lon-warning${i}`).addClass('activate-warning');
    } else {
      $(`#lon-warning${i}`).removeClass('activate-warning');
    }
  }
  return valid;
}

const validateLatitude = () => {
  var valid = true;
  for (var i = 0; i < additionalMarkers.length; i++) {
    var lat = $(`#ign-lat${i}`).val()
    if(isNaN(lat) || (lat < 22)|| (lat > 51)) {
      valid = false;
      $(`#lat-warning${i}`).addClass('activate-warning');
    } else {
      $(`#lat-warning${i}`).removeClass('activate-warning');
    }
  }
  return valid;
}

const validateIgnitionType = () => {
  var ignitionType = $('#ignition-type').val();
  if(ignitionType == "ignition-area" && additionalMarkers.length < 3) {
    $('#ignition-type-warning').addClass('activate-warning');
    return false;
  }
  $('#ignition-type-warning').removeClass('activate-warning');
  return true;
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
  var validLatitude = validateLatitude();
  var validLongitude = validateLongitude();
  var validIgnitionType = validateIgnitionType();
  var validDescription = validateDescription();
  var validProfile = validateProfile();
  var validIgnitionTime = validateIgnitionTime();
  return validLatitude && validLongitude && validLatitude && validIgnitionType && validDescription && validProfile && validIgnitionTime;
}

function getLatitudes() {
  var latitudes = [];
  for (var i = 0; i < additionalMarkers.length; i++) {
    latitudes.push(parseFloat($(`#ign-lat${i}`).val()));
  }
  return JSON.stringify(latitudes);
}

function getLongitudes() {
  var longitudes = [];
  for (var i = 0; i < additionalMarkers.length; i++) {
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
$('#fc-hours').dropdown();
$('#ignition-type').dropdown();

