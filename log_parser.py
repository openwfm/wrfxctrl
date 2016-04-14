

def get_job_state(path):
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
