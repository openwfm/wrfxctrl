from simulation import delete_simulation, load_simulations
import json
import sys
import logging

if len(sys.argv) < 2:
    print('usage: %s [list|delete <name>' % sys.argv[0])
    sys.exit(1)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logging.info('WRFXCTRL %s' % sys.argv[0])
conf = json.load(open('etc/conf.json'))
sims_path = conf['sims_path']
simulations = load_simulations(sims_path)
if sys.argv[1] == 'delete':
    sim_id = sys.argv[2]
    try:
        logging.info('Deleting simulation %s' % sim_id)
        sim_info = simulations[sim_id]
        delete_simulation(sim_info,conf)
    except KeyError:
        logging.error('Simulation %s not found.' % sim_id)
elif sys.argv[1] == 'list':
    print('%-30s desc' % 'id') 
    print('-' * 40)
    for k in sorted(simulations):
        print('%-30s %s' % (k, simulations[k]['description']))
else:
    logging.error('command line not understood %s' % sys.argv)
