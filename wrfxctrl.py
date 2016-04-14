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


from cluster import Cluster
from simulation import create_simulation, get_simulation_state
from utils import Dict, to_esmf, to_utc, load_profiles
from flask import Flask, render_template, request, redirect
import json
from datetime import datetime, timedelta
import pytz
import os
import stat
import os.path as osp
from subprocess import Popen


# global objects tracking state
wrfxpy = None
cluster = None
simulations = {}
profiles = None

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
        sim_cfg = request.form.copy()
        sim_cfg['profile'] = profiles[sim_cfg['profile']]
        sim_info = create_simulation(sim_cfg, wrfxpy['wrfxpy_path'], cluster)
        sim_id = sim_info['id']
        simulations[sim_id] = sim_info
        return redirect("/monitor/%s" % sim_id)


@app.route("/monitor/<sim_id>")
def monitor(sim_id=None):
    return render_template('monitor.html', sim = simulations.get(sim_id, None))


@app.route("/overview")
def overview():
    return render_template('overview.html', simulations = simulations)


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
    return json.dumps(sim_info)


@app.route("/get_state/<sim_id>")
def get_state(sim_id=None):
    sim_info = simulations.get(sim_id, None)
    if sim_info is None:
        return "{}"
    else:
        sim_state = get_simulation_state(sim_info['log_file'])
        sim_info['state'] = sim_state
        return json.dumps(sim_state)


@app.route("/all_sims")
def get_all_sims():
    return json.dumps(simulations)


if __name__ == '__main__':
    profiles = load_profiles()
    cluster = Cluster(json.load(open('etc/cluster.json')))
    wrfxpy = json.load(open('etc/wrfxpy.json'))
    app.run(debug=True)

