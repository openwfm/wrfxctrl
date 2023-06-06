import { ignitionButtonHTML } from "./ignitionButtonHTML.js";
import { errorState } from "../../errorState.js";

export class IgnitionButton extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = ignitionButtonHTML;
        this.uiElements = {
        };
    }

    connectedCallback() {
        $('.form').submit((event) => {
            event.preventDefault();
            let formIsValid = errorState.igniteSimulation();
            // let formIsValid = isFormValid();
            // let [ignTimes, fcHours] = getTimesOfIgnitionAndDurations();
            // let [lats, lons] = getLatLons();
            // // let ignitionType = $('#ignition-type').val();
            // if(formIsValid) {
            //   let formData = {
            //     "description": $('#experiment-description').val(),
            //     "ignition_type": $('#ignition-type').val(),
            //     "ignition_latitude": lats,
            //     "ignition_longitude": lons,
            //     "ignition_time": ignTimes,
            //     "fc_hours": fcHours,
            //     "profile": $('#profile').val()
            //   }
            //   // if (ignitionType == IGNITION_TYPE_AREA) formData["perimeter_time"] = JSON.stringify($('#ign-time-perimeter').val());
            //   $.ajax({
            //       type:"post",
            //       dataType: 'json',
            //       data: formData
            //     });
            // }
          });
    }
}

window.customElements.define('ignition-button', IgnitionButton);