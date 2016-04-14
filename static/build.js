"use strict";

// initialize Semantic elements
$('#profile-dropdown').dropdown({on: 'hover'});

// Fill in a 'unique description'
$('#experiment-description').text('Web initiated forecast at ' + moment().format());

//  initialize base layers
var base_layer_dict = {
  'MapQuest': L.tileLayer('http://{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
                          attribution: 'Data and imagery by MapQuest',
                          subdomains: ['otile1', 'otile2', 'otile3', 'otile4']}),
  'MQ Satellite': L.tileLayer('http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png', {
                              attribution: 'Data and imagery by MapQuest',
                              subdomains: ['otile1', 'otile2', 'otile3', 'otile4']}),
  'OSM': L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                     attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'})
};

// initialize map
var map = L.map('map', {
  center: [39, -106],
  zoom: 7,
  layers: [base_layer_dict['MapQuest']],
  zoomControl: false
});

L.control.mousePosition().addTo(map);

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function set_ignition_now() {
    var now = moment().utc();
    var date = now.year() + '-' + pad(now.month(),2) + '-' + pad(now.day(),2);
    var time = pad(now.hour(),2) + ':' + pad(now.minute(),2) + ':' + pad(now.second(),2);
    $('#ign-time').val(date + '_' + time);
}

function set_profile_text(txt) {
  $('#profile-info-text').text(txt);
}

$.fn.form.settings.rules.valid_ignition_time = function(str) {
  var ign_time = moment(str, "YYYY-MM-DD_HH:mm:ss");
  var now = moment().utc();
  if(!ign_time.isValid())
    return false;
  if(ign_time > now) {
    return false;
  }
  if(ign_time.year < 1979) {
    return false;
  }
  return true;
}

$.fn.form.settings.rules.valid_longitude = function(e) {
  var lng = parseFloat(e);
  if(isNaN(lng) || lng < -109 || lng > -102) return false;
  return true;
}

$.fn.form.settings.rules.valid_latitude = function(e) {
  var lat = parseFloat(e);
  console.log(lat);
  if(isNaN(lat) || (lat < 36)|| (lat > 40)) return false;
  return true;
}

$('.ui.form')
  .form({
    fields: {
      ignition_latitude   : {
        rules: [ {
          type: 'valid_latitude',
          prompt: 'The ignition latitude must be a number between 36 and 40.'} ]
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
  })
;