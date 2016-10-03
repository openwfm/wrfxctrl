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

import json
from datetime import datetime
import pytz
import glob
import logging 
import os

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
    """
    Load information on job profiles available to users.

    :return: a dict keyed by profile id containing Dicts with profile info
    """
    profs = json.load(open('etc/profiles.json'))
    return {name:Dict(p) for name,p in profs.iteritems()}


def load_simulations(sims_path):
    """
    Load all simulations stored in the simulations/ directory.

    :params sims_path: path to jsons with simulation states 
    :return: a dictionary of simulations
    """

    print 'Loading simulation states from %s' % sims_path 
    files = glob.glob(sims_path + '/*.json') 
    simulations = {}
    for f in files:
        try:
            sim_info = json.load(open(f))
            if 'wrfxpy_id' not in sim_info:
                # older files do not have wrfxpy_id, redo from the visualization link
                link=sim_info['visualization_link']
                sim_info['wrfxpy_id']=link[link.find('wfc-'):]
                print('Added missing wrfpy_id %s' + sim_info['wrfxpy_id'])
            sim_id = sim_info['id']
            simulations[sim_id] = sim_info
        except ValueError:
            logging.error('LOADSIM failed to reload simulation %s' % f)
            os.rename(f, f + '.error') 
    return simulations


def to_esmf(ts):
    """
    Convert a UTC datetime into a ESMF string.

    :param ts: the datetime object
    :return: the date time in ESMF format
    """
    return '%04d-%02d-%02d_%02d:%02d:%02d' % (ts.year, ts.month, ts.day, ts.hour, ts.minute, ts.second)


def to_utc(esmf):
    """
    Parse and convert an ESMF datetime into a datetime in UTC.

    :param esmf: the ESMF string YYYY-MM-DD_hh:mm:ss
    :return: a datetime in the UTC timezone
    """
    year, mon, day = int(esmf[0:4]), int(esmf[5:7]), int(esmf[8:10])
    hour, min, sec = int(esmf[11:13]), int(esmf[14:16]), int(esmf[17:19])
    return datetime(year, mon, day, hour, min, sec, tzinfo=pytz.utc)

def rm(path):
    """
    Try to remove a file.

    :param path: file path
    :return: 'OK', otherwise error
    """
    try:
        os.remove(path)
        return 0 
    except OSError as err:
        logging.error('Cannot delete file %s' % path)
        logging.error(err.strerror)
        return err
