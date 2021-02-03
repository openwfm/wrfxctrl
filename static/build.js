"use strict";

// declare variables in global scope
var map = null;
var base_layer_dict = null;

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
      layers: [base_layer_dict['MapQuest']],
      zoomControl: false
    });

    // add lon/lat display to bottom left corner of map
    L.control.mousePosition().addTo(map);
}

// initialize Semantic elements
$('#profile-dropdown').dropdown({on: 'hover'});

var markerId = 0;
function buildTwoFields(id) {
  return $(`<div class="two fields">
        <div class="field">
          <input name="ignition_latitude" id="ign-lat${id}" type="text" placeholder="Latitude ...">
        </div>

        <div class="field">
          <input name="ignition_longitude" id="ign-lon${id}" type="text" placeholder="Longitude ...">
        </div>
        <div>
          <span class="active-field-button" id="active-marker${id}">Active</span>
        </div>
      </div>`);
}

var additionalMarkers = [];
$('#additional-marker').click(() => {
  let newFieldId = additionalMarkers.length;
  const additionalMarker = buildTwoFields(newFieldId);
  markerId = newFieldId;
  $('#markers').append(additionalMarker);
  $(`#active-marker${newFieldId}`).click(() => {
    markerId = newFieldId;
  });
  additionalMarkers.push(additionalMarker);
});

$('#remove-marker').click(() => {
  if (additionalMarkers.length < 1) return;
  markerId = markerId - 1;
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

$.fn.form.settings.rules.valid_ignition_time = function(str) {
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

$.fn.form.settings.rules.valid_longitude = function(e) {
  var lng = parseFloat(e);
  if(isNaN(lng) || lng < -128 || lng > -65) return false;
  return true;
}

$.fn.form.settings.rules.valid_latitude = function(e) {
  var lat = parseFloat(e);
  console.log(lat);
  if(isNaN(lat) || (lat < 22)|| (lat > 51)) return false;
  return true;
}

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


$('#ign-time').datetimepicker({ value: moment().utc(), formatTime: 'h:mm a', formatDate: 'm.d.Y', step:15 });
$('#fc-hours').dropdown();

