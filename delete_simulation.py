from simulation import remove_simulation_files, load_simulations
import json
import sys

conf = json.load(open('etc/conf.json'))
sims_path = conf['sims_path']
simulations = load_simulations(sims_path)
# print json.dumps(simulations, indent=4, separators=(',', ': '))
for sim_id in  sys.argv[1:]:
    try:
        sim_info = simulations[sim_id]
        remove_simulation_files(sim_info,conf)
    except KeyError:
        print 'Simulation %s not found' % sim_id


        
