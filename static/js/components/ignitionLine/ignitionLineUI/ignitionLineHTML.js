export const ignitionLineHTML = `
    <div id="ignition-line-component">
        <h3>Ignition Line</h3>
        <div id="start-dates" class="field">
            <div class="ui input left icon">
                <i class="calendar icon"></i>
                <input name="ignition_start" id="start-time-input" type="text" placeholder="YYYY-MM-DD_HH:MM:SS">
            </div>
            <span id="ignition-time-warning" class="not-valid-warning">The ignition time must be between 1/1/1979 and now in the format YYYY-MM-DD_HH:MM:SS</span>
        </div>
        <div id="end-dates" class="field">
            <div class="ui input left icon">
                <i class="calendar icon"></i>
                <input name="ignition_end" id="end-time-input" type="text" placeholder="YYYY-MM-DD_HH:MM:SS">
            </div>
            <span id="ignition-time-warning" class="not-valid-warning">The ignition time must be between 1/1/1979 and now in the format YYYY-MM-DD_HH:MM:SS</span>
        </div>
        <div id="ignition-line-markers"></div> 
    </div>
`;