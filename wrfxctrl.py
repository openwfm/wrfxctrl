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
# SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


from __future__ import absolute_import
from __future__ import print_function
from cluster import Cluster
from simulation import create_simulation, get_simulation_state, cancel_simulation, delete_simulation, load_simulations
from utils import Dict, to_esmf, to_utc, load_profiles, load_sys_cfg, parse_kml
from flask import Flask, render_template, request, redirect, make_response, url_for
import json
from datetime import datetime, timedelta
import random
import string
import os.path as osp
from functools import wraps, update_wrapper
import sys
from cleanup import cleanup_delete, cleanup_cancel

# global objects tracking state
cluster = None
simulations = {}
profiles = None

# conf params and state
conf = load_sys_cfg()
sims_path = conf['sims_path']
simulations = load_simulations(sims_path)

if 'root' in conf:
    root = osp.join('/',conf['root'])
else:
    root = osp.join('/',''.join(random.choice(string.ascii_lowercase) for i in range(5)))
host = conf['host']
debug = conf['debug'] in ['T', 'True', 't', 'true']
port = conf['port']
urls = {
    'submit': osp.join(root, 'submit'), 
    'welcome': osp.join(root, 'start'), 
    'overview': osp.join(root, 'overview'),
}
print('Welcome page is http://%s:%s%s' % (host, port, urls['welcome']) )

app = Flask(__name__)


# lifted from: http://arusahni.net/blog/2014/03/flask-nocache.html
def nocache(view):
    @wraps(view)
    def no_cache(*args, **kwargs):
        response = make_response(view(*args, **kwargs))
        response.headers['Last-Modified'] = datetime.now()
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '-1'
        return response
        
    return update_wrapper(no_cache, view)

# @app.route(root)
@app.route(urls['welcome'])
@nocache
def welcome():
    return render_template('welcome.html', cluster=cluster, urls=urls)


@app.route(urls['submit'], methods=['GET', 'POST'])
def build():
    if request.method == 'GET':
        # it's a get so let's build a fire simulation
        return render_template('build.html', profiles=list(profiles.values()), urls=urls)
    elif request.method == 'POST':
        # it's a POST so initiate a simulation
        # dictionary values set in the html  <select name="KEY" class="ui dropdown" id="KEY">
        sim_cfg = request.form.copy()
        print('values returned by build page:')
        print(json.dumps(sim_cfg, indent=4, separators=(',', ': ')))
        sim_cfg['profile'] = profiles[sim_cfg['profile']]
        sim_info = create_simulation(sim_cfg, conf, cluster)
        sim_id = sim_info['id']
        simulations[sim_id] = sim_info
        print('sim_info:')
        print(json.dumps(sim_info, indent=4, separators=(',', ': ')))
        f = osp.join(sims_path, sim_id + '.json')
        json.dump(sim_info, open(f, 'w'), indent=4, separators=(',', ': '))
        return redirect("/monitor/%s" % sim_id)

@app.route(osp.join(urls['submit'],'sat_data'), methods=['GET'])
def getSatData():
    if request.method == 'GET':
        with open('./sat_data/filteredSatData.json', 'r') as read_file:
        # with open('./sat_data/filtered_hotspots_2021-03-03_1838.json', 'r') as read_file:
            sat_data = json.load(read_file)
        return sat_data


@app.route("/monitor/<sim_id>")
@nocache
def monitor(sim_id=None):
    print('monitor {}'.format(sim_id))
    return render_template('monitor.html', sim=simulations.get(sim_id, None), urls=urls)


@app.route(urls['overview'], methods=['GET', 'POST'])
@nocache
def overview():
    if request.method == 'GET':
        # reload, cleanup might delete jsons while webserver is running 
        simulations = load_simulations(sims_path)
        deadline = to_esmf(datetime.now() - timedelta(seconds=5))
        # only update stale & running simulations in overview
        kk = list(simulations.keys())   
        for sim_id in kk:
            sim = simulations[sim_id]
            if sim['state']['wrf'] != 'complete':
                last_upd = sim.get('last_updated', '2000-01-01_00:00:00')
                if last_upd < deadline:
                    sim['state'] = get_simulation_state(sim['log_file'])
                    sim['last_updated'] = to_esmf(datetime.now())
                    f = osp.join(sims_path, sim_id + '.json')
                    if osp.isfile(f):
                        json.dump(sim, open(f,'w'), indent=4, separators=(',', ': '))
                        simulations[sim_id] = sim
                    else:
                        print('File %s no longer exists, deleting simulation' % f)
                        del simulations[sim_id]
        return render_template('overview.html', simulations=simulations, urls=urls)
    elif request.method == 'POST':
        print('Values returned by overview page:')
        sims_checked = request.form.getlist('sim_chk')
        print(sims_checked)
        for sim_id in sims_checked:  # Only the simulation(s) checked in checkbox.
            if 'RemoveB' in request.form:
                print('Remove Sim: box checked= %s' % (sim_id)) 
                cleanup_delete(sim_id)
            else:
                if 'CancelB' in request.form:
                    print('Cancel Sim: box checked= %s' % (sim_id))
                    cleanup_cancel(sim_id)
                else:
                    print('Error-No button push detected: box checked= %s' % (sim_id))
        simulations = load_simulations(sims_path)
        return render_template('overview.html', simulations = simulations, urls=urls)


# JSON access to state
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
    return json.dumps(sim_info, indent=4, separators=(',', ': '))


@app.route("/get_state/<sim_id>")
def get_state(sim_id=None):
    sim_info = simulations.get(sim_id, None)
    if sim_info is None:
        return "{}"
    else:
        sim_state = None
        # always update during get_state()
        if sim_info['state']['wrf'] != 'completed':
            sim_state = get_simulation_state(sim_info['log_file'])
            sim_info['state'] = sim_state
            sim_info['last_updated'] = to_esmf(datetime.now())
            f = osp.join('simulations', sim_id + '.json')
            json.dump(sim_info, open(f, 'w'), indent=4, separators=(',', ': '))
        return json.dumps(sim_state)


@app.route("/remove_sim/<sim_id>")
def remove_sim(sim_id=None):
    if sim_id is not None:
        delete_simulation(simulations(sim_id, conf))
        del simulations[sim_id]


@app.route("/cancel_sim/<sim_id>")
def cancel_sim(sim_id=None):
    if sim_id is not None:
        cancel_simulation(simulations(sim_id, conf))


@app.route("/all_sims")
def get_all_sims():
    print(json.dumps(simulations, indent=4, separators=(',', ': ')))
    return json.dumps(simulations, indent=4, separators=(',', ': '))

@app.route("/upload_perimeter", methods=['POST'])
def upload_perimeter_file():
    kml_content = request.files['file'].read()
    data = parse_kml(kml_content, 'Polygon')
    result = { 'data': data }
    return json.dumps(result, indent=4, separators=(',', ':'))

@app.route("/upload_line", methods=['POST'])
def upload_line_file():
    kml_content = request.files['file'].read()
    data = parse_kml(kml_content, 'LineString')
    result = { 'data': data }
    return json.dumps(result, indent=4, separators=(',', ':'))

if __name__ == '__main__':
    profiles = load_profiles()
    cluster = Cluster(json.load(open('etc/cluster.json')))
    sys.stdout.flush()
    app.run(host=host, port=port, debug=debug)
    