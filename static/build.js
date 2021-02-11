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
        </div>

        <div class="field">
          <input name="ignition_longitude${id}" id="ign-lon${id}" type="text" placeholder="Longitude ...">
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


const validateIgnitionTime = (str) => {
 var ign_time = moment.utc(str, 'MMM D,YYYY h:mm a');
  var now = moment().utc();
  if(!ign_time.isValid())
    return false;
//  if(ign_time > now) {
//    return false;
//  }
  if(ign_time.year() < 1979) {
    return false;
  }
  return true;
}

const validateLongitude = (longitude) => {
  var lng = parseFloat(longitude);
  if(isNaN(lng) || lng < -128 || lng > -65) return false;
  return true;
}

const validateLatitude = (latitude) => {
  var lat = parseFloat(latitude);
  if(isNaN(lat) || (lat < 22)|| (lat > 51)) return false;
  return true;
}

const validateIgnitionType = (ignitionType) => {
  if(ignitionType == "ignition-area") {
    return additionalMarkers.length >= 3;
  }
  return true;
}

function validateForm() {
  return true;
}

$.fn.form.settings.rules.valid_ignition_time = validateIgnitionTime
$.fn.form.settings.rules.valid_longitude = validateLongitude; 
$.fn.form.settings.rules.valid_latitude = validateLatitude;
$.fn.form.settings.rules.valid_markers = validateIgnitionType;

$('.ui.form')
  .form({
    fields: {
      ignition_latitude : {
        rules: [ {
          type: 'valid_latitude',
          prompt: 'The ignition latitude must be a number between 36 and 41.'} ]
      },
      ignition_longitude : {
        rules: [ { 
          type: 'valid_longitude',
          prompt: 'The ignition longitude must be a number between -109 and -102.'} ]
      },
      ignition_type : {
        rules: [ {
          type: 'valid_markers',
          prompt: 'When selecting an ignition area, must have at least 3 markers'} ]
      },
      ignition_time : {
        rules: [
          {
            type: 'valid_ignition_time',
            prompt: 'The ignition time must be between 1/1/1979 and now in the format YYYY-MM-DD_HH:MM:SS.'
          }
        ]
      },
      profile : {
        rules: [ {type: 'empty', 'prompt' : 'Please select a job profile.'} ]
      },
      description : {
        rules: [ {type: 'empty', 'prompt' : 'Please enter a description'}]
      }
    },
    inline: true
  });


$('.form').submit((event) => {
  var valid = validateForm();
  if(valid) {
      $.ajax({
          type:"post",
          dataType: 'json',
          data: $('.form').serialize()
        })
  }
});

$('#ign-time').datetimepicker({ value: moment().utc(), formatTime: 'h:mm a', formatDate: 'm.d.Y', step:15 });
$('#fc-hours').dropdown();
$('#ignition-type').dropdown();

