from simulation import delete_simulation, load_simulations
import json
import sys
import logging

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logging.info('WRFXCTRL %s' % sys.argv[0])
to_delete = sys.argv[1:]
logging.info("Deleting " + ",".join(to_delete))
conf = json.load(open('etc/conf.json'))
sims_path = conf['sims_path']
simulations = load_simulations(sims_path)
# print json.dumps(simulations, indent=4, separators=(',', ': '))
print to_delete
for sim_id in  sys.argv[1:]:
    try:
        logging.debug('Looking for simulation %s' % sim_id)
        sim_info = simulations[sim_id]
        logging.info('Deleting simulation %s' % sim_id)
        delete_simulation(sim_info,conf)
    except KeyError:
        logging.error('Simulation %s not found.' % sim_id)


        
