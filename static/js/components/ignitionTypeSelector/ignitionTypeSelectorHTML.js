export const ignitionTypeSelectorHTML = `
    <div class="marker-buttons">
        <div id="ignition-type-field" class="field">
            <label>Marker Type</label>
            <select name="ignition_type" id="ignition-type-dropdown">
                <option value="0">Domain Center</option>
                <option value="1">Multiple Ignitions</option>
                <option value="2">Ignition Line</option>
                <option value="3">Burn Plot Boundary</option>
            </select>
        </div>
        <!-- <div class="field" style="display: inline-block;">
            <label>Show GIS Hotspots</label>
            <input type="checkbox" id="show-sat-data" value="sat-data">
        </div> -->
    </div>
`;