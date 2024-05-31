export function debounceInIntervals(callback, delay) {
      let timeout; 
      return function(args=null) {
              if (timeout) {
                        return;
                      }
              callback(args);
              const callbackInIntervals = () => {
                        timeout = null;
                      };
              timeout = setTimeout(callbackInIntervals, delay);
            }
}

export function debounce(callback, delay=250) {
    let timeout; 
    return function(args=null) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
        return;
      }
      const debouncedCallback = () => {
        callback(args);
      };
      timeout = setTimeout(debouncedCallback, delay);
    }
}
