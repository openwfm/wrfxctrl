from cluster import Cluster
from log_parser import get_job_state
from flask import Flask, render_template, request, redirect
import json
from datetime import datetime, timedelta
import pytz
import os
import stat
import os.path as osp
from subprocess import Popen

wrfxpy = None
cluster = None
profiles = None
simulations = {}

class Dict(dict):
    """
    A dictionary that allows member access to its keys.
    """

    def __init__(self, d):
        """
        Updates itself with d.
        """
        self.update(d)

    def __getattr__(self, item):
        return self[item]

    def __setattr__(self, item, value):
        self[item] = value


def load_profiles():
    profs = json.load(open('etc/profiles.json'))
    return {name:Dict(p) for name,p in profs.iteritems()}

def to_esmf(ts):
    return '%04d-%02d-%02d_%02d:%02d:%02d' % (ts.year, ts.month, ts.day, ts.hour, ts.minute, ts.second)

def to_utc(esmf):
    # ESMF date: YYYY-MM-DD_hh:mm:ss
    year, mon, day = int(esmf[0:4]), int(esmf[5:7]), int(esmf[8:10])
    hour, min, sec = int(esmf[11:13]), int(esmf[14:16]), int(esmf[17:19])
    return datetime(year, mon, day, hour, min, sec, tzinfo=pytz.utc)


def create_simulation(info):
    now = datetime.utcnow()
    sim_id = 'from-web-%04d-%02d-%02d_%02d-%02d-%02d' % (now.year, now.month, now.day, now.hour, now.minute, now.second)

    # get paths, profiles
    log_path = 'logs/%s.log' % sim_id
    json_path = 'jobs/%s.json' % sim_id
    wrfxpy_path = wrfxpy['wrfxpy_path']
    profile = profiles[info['profile']]

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
    simulations[sim_id] = sim_info

    # build a new job template
    cfg = json.load(open(profile['template']))
    cfg['grid_code'] = sim_id
    cfg['qsys'] = cluster.qsys
    cfg['nodes'] = 6
    cfg['ppn'] = cluster.ppn
    ign_time = to_utc(ign_time_esmf)
    sim_start = (ign_time - timedelta(minutes=30)).replace(minute=0, second=0)
    sim_end = sim_start + timedelta(hours=3)
    cfg['start_utc'] = to_esmf(sim_start)
    cfg['end_utc'] = to_esmf(sim_end)
    cfg['domains']['1']['truelats'] = [ign_lat, ign_lat]
    cfg['domains']['1']['stand_lon'] = ign_lon
    cfg['domains']['1']['center_latlon'] = [ign_lat, ign_lon]

    # All templates have exactly one ignition
    domain = cfg['ignitions'].keys()[0]
    cfg['ignitions'][domain][0]['time_utc'] = ign_time_esmf
    # example:  "latlon" : [39.894264, -103.903222]
    cfg['ignitions'][domain][0]['latlon'] = [ign_lat, ign_lon]

    cfg['postproc']['description'] = sim_descr

    json.dump(cfg, open(json_path, 'w'))

    # drop a shell script that will run the file
    run_script = sim_id + '.sh'
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

    return sim_id


app = Flask(__name__)


@app.route("/")
@app.route("/welcome")
def welcome():
    return render_template('welcome.html', cluster=cluster)


@app.route("/submit", methods=['GET', 'POST'])
def build():
    if request.method == 'GET':
        # it's a get so let's build a fire simulation
        return render_template('build.html', profiles=profiles.values())
    elif request.method == 'POST':
        # it's a POST so initiate a simulation
        sim_id = create_simulation(request.form)
        return redirect("/monitor/%s" % sim_id)


@app.route("/monitor/<sim_id>")
def monitor(sim_id=None):
    return render_template('monitor.html', sim = simulations.get(sim_id, None))


@app.route("/retrieve_log/<sim_id>")
def retrieve_log(sim_id=None):
    sim_info = simulations.get(sim_id, None)
    if sim_info is None:
        return ""
    else:
        return open(sim_info['log_file']).read()


@app.route("/sim_info/<sim_id>")
def retrieve_sim_info(sim_id=None):
    sim_info = simulations.get(sim_id, {}).copy()
    # remove log file location, this is sensitive
    del sim_info['log_file']
    return json.dumps(sim_info)

@app.route("/get_state/<sim_id>")
def get_state(sim_id=None):
    sim_info = simulations.get(sim_id, None)
    if sim_info is None:
        return "{}"
    else:
        return json.dumps(get_job_state(sim_info['log_file']))

if __name__ == '__main__':
    cluster = Cluster(json.load(open('etc/cluster.json')))
    wrfxpy = json.load(open('etc/wrfxpy.json'))
    profiles = load_profiles()
    app.run()
