"use strict";

var sim_id = $('#sim-id').text();
var sim_info = null;
var start_time = null;

$.getJSON("/sim_info/" + sim_id, function(data) {
  sim_info = data;
  console.log(sim_info['started_at']);
  start_time = moment(sim_info['started_at'], "YYYY-MM-DD_HH:mm:ss");
  console.log(start_time);
  window.setTimeout(update_time_since_start, 1000);
  window.setTimeout(parse_log, 5000); 
});

function update_time_since_start()
{
  $('#run-time').text(start_time.from(moment()));
  window.setTimeout(update_time_since_start, 1000);
}

function parse_log()
{
  console.log("/retrieve_log/" + sim_id);
  $.get("/retrieve_log/" + sim_id, function(txt) {
    if(txt.indexOf('SHUTTLE operations completed') > -1) {
      //window.location.replace('demo.openwfm.org/fdds');
    } else if(txt.indexOf('Detected rsl.error.0000') > -1) {
      $('#phase').text('WRF-SFIRE is running');
    } else if(txt.indexOf('submitting WRF job') > -1) {
      $('#phase').text('Parallel job is being submitted');
    } else if(txt.indexOf('running REAL') > -1) {
      $('#phase').text('Preprocessing: real');
    } else if(txt.indexOf('running METGRID') > -1) {
      $('#phase').text('Preprocessing: metgrid');
    } else {
      var geogrid_state = '';
      if(txt.indexOf('GEOGRID complete') == -1) {
        geogrid_state = ' geogrid ';
      }
      
      var ungrib_state = 'GRIB2 downloading';
      if(txt.indexOf('UNGRIB complete') == -1) {
        ungrib_state = '';
      } else if(txt.indexOf('running UNGRIB') == -1) {
        ungrib_state = 'ungrib'
      }
      
      $('#phase').text('Preprocessing:' + geogrid_state + ungrib_state);
    }
  });
  window.setTimeout(parse_log, 10000); 
}
