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
  window.setTimeout(get_job_state, 5000);
});

function update_time_since_start()
{
  $('#run-time').text(start_time.from(moment()));
  window.setTimeout(update_time_since_start, 1000);
}

function get_job_state()
{
  $.getJSON("/get_state/" + sim_id, function(state) {
    $('#geogrid').text(state['geogrid']);
    $('#ingest').text(state['ingest']);
    $('#ungrib').text(state['ungrib']);
    $('#metgrid').text(state['metgrid']);
    $('#real').text(state['real']);
    $('#wrf').text(state['wrf']);
    $('#output').text(state['output']);
  });
  window.setTimeout(get_job_state, 5000);
}


function retrieve_log()
{
  //$.get("/retrieve_log/" + sim_id, function(txt) {});
  //window.setTimeout(parse_log, 10000);
}
