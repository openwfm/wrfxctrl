# Copyright (C) 2013-2016 Martin Vejmelka, UC Denver
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
# of the Software, and to permit persons to whom the Software is furnished to do
# so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
# INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR
# A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
# HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
#

from utils import to_esmf, to_utc
from datetime import datetime, timedelta
import pytz
import json
import os
import os.path as osp
import stat
from subprocess import Popen

def create_simulation(info, wrfxpy_path, cluster):
    """
    Build a simulation JSON configuration based on profiles and execute
    the simulation using wrfxpy.
    
    :param info: the simulation info gathered from the build page
    :param profiles: the job profiles available to the user
    :param cluster: a cluster object that conveys information about the computing environment
    :return: the simulation info object
    """
    now = datetime.utcnow()
    sim_id = 'from-web-%04d-%02d-%02d_%02d-%02d-%02d' % (now.year, now.month, now.day, now.hour, now.minute, now.second)

    # get paths, profiles
    log_path = 'logs/%s.log' % sim_id
    json_path = 'jobs/%s.json' % sim_id
    profile = info['profile']

    # store simulation configuration
    ign_lat, ign_lon = float(info['ignition_latitude']), float(info['ignition_longitude'])
    ign_time_esmf = info['ignition_time']
    sim_descr = info['description']
    sim_info = {
      'id' : sim_id,
      'started_at' : to_esmf(datetime.now()),
      'description' : sim_descr,
      'ign_latitude' : ign_lat,
      'ign_longitude' : ign_lon,
      'ign_time_esmf' : ign_time_esmf,
      'profile' : info['profile'],
      'log_file' : log_path
    }

    # build a new job template
    cfg = json.load(open(profile['template']))
    cfg['grid_code'] = sim_id
    cfg['qsys'] = cluster.qsys
    cfg['nodes'] = 6
    cfg['ppn'] = cluster.ppn
    ign_time = to_utc(ign_time_esmf)
    sim_start = (ign_time - timedelta(minutes=30)).replace(minute=0, second=0)
    sim_end = sim_start + timedelta(hours=3)
    sim_info['start_utc'] = to_esmf(sim_start)
    sim_info['end_utc'] = to_esmf(sim_end)
    cfg['start_utc'] = to_esmf(sim_start)
    cfg['end_utc'] = to_esmf(sim_end)

    # place top-level domain
    cfg['domains']['1']['truelats'] = [ign_lat, ign_lat]
    cfg['domains']['1']['stand_lon'] = ign_lon
    cfg['domains']['1']['center_latlon'] = [ign_lat, ign_lon]

    # all templates have exactly one ignition
    domain = cfg['ignitions'].keys()[0]
    cfg['ignitions'][domain][0]['time_utc'] = ign_time_esmf
    # example:  "latlon" : [39.894264, -103.903222]
    cfg['ignitions'][domain][0]['latlon'] = [ign_lat, ign_lon]

    # switch on sending results to visualization server
    cfg['postproc']['shuttle'] = 'incremental'
    cfg['postproc']['description'] = sim_descr

    json.dump(cfg, open(json_path, 'w'))

    # drop a shell script that will run the file
    run_script = 'jobs/' + sim_id + '.sh'
    with open(run_script, 'w') as f:
        f.write('#!/usr/bin/env bash\n')
        f.write('export PYTHONPATH=src\n')
        f.write('cd ' + wrfxpy_path + '\n')
        f.write('LOG=' + osp.abspath(log_path) + '\n')
        f.write('./forecast.sh ' + osp.abspath(json_path) + ' &> $LOG \n')

    # make it executable
    st = os.stat(run_script)
    os.chmod(run_script, st.st_mode | stat.S_IEXEC)

    # execute the fire forecast and reroute into the log file provided
    proc = Popen('./' + run_script, shell=True, stdin=None, stdout=None, stderr=None, close_fds=True)

    return sim_info


def parse_error(line, state):
    """
    Find the tool that created the error in line and update state.

    :param line: the line that created the error
    :param state: the state dictionary containing state of each tool
    """
    tools = ['geogrid', 'ungrib', 'metgrid', 'real', 'wrf']
    for t in tools:
        if t in line:
            state[t] = 'failed'
            return


def parse_time(line):
    """
    All logging lines begin with a timestamp, parse it and return the datetime it represents.

    Example: 2016-04-14 14:50:33,325
    :param line: the log line containing time
    :return: native datetime
    """
    return datetime.strptime(line[:19], '%y-%m-%d %h:%M:%S')


def get_simulation_state(path):
    """
    Identify the state of the computation for each subcomponent
    from the output log.

    :param path: the path to the log file
    """
    state = { 'geogrid' : 'waiting',
              'ingest' : 'waiting',
              'ungrib' : 'waiting',
              'metgrid' : 'waiting',
              'real' : 'waiting',
              'wrf' : 'waiting',
              'output': 'waiting' }

    with open(path) as f:
        for line in f:
            if 'subprocess.CalledProcessError' in line:
                parse_error(state, line)
            if 'running GEOGRID' in line:
                state['geogrid'] = 'running'
            elif 'GEOGRID complete' in line:
                state['geogrid'] = 'complete'
            elif 'retrieving GRIB files' in line:
                state['ingest'] = 'running'
            elif 'running UNGRIB' in line:
                state['ingest'] = 'complete'
                state['ungrib'] = 'running'
            elif 'UNGRIB complete' in line:
                state['ungrib'] = 'complete'
            elif 'running METGRID' in line:
                state['metgrid'] = 'running'
            elif 'METGRID complete' in line:
                state['metgrid'] = 'complete'
            elif 'running REAL' in line:
                state['metgrid'] = 'complete'
                state['real'] = 'running'
            elif 'submitting WRF' in line:
                state['real'] = 'complete'
                state['wrf'] = 'submit'
            elif 'Detected rsl.error.0000' in line:
                state['wrf'] = 'running'
            elif 'SHUTTLE operations completed' in line:
                state['output'] = 'available'
    return state

