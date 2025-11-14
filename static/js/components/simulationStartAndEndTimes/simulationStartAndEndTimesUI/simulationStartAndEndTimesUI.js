import { appState } from "../../../appState.js";
import { simulationStartAndEndTimesHTML } from "./simulationStartAndEndTimesHTML.js";
import { AppStateSubscriber } from "../../appStateSubscriber.js";

export class SimulationStartAndEndTimesUI extends AppStateSubscriber {
  constructor() {
    super();
    this.innerHTML = simulationStartAndEndTimesHTML;
    this.uiElements = {
      ignitionStartUI: this.querySelector("#start-time-input"),
      ignitionEndUI: this.querySelector("#end-time-input"),
      useFMDAOption: this.querySelector("#use-fmda-option"),
    };
    this.startTimeId = "#start-time-input";
    this.endTimeId = "#end-time-input";
  }

  connectedCallback() {
    this.setUpStartEndDatePickers();
    appState.setSimulationStartAndStopTimeComponent(this);
  }

  setUpStartEndDatePickers() {
    let now = moment();
    let oneHourFromNow = moment().add(1, "h");

    $(this.startTimeId).datetimepicker({
      value: now.utc(),
      formatTime: "h:mm a",
      formatDate: "m.d.Y",
      step: 15,
    });
    $(this.endTimeId).datetimepicker({
      value: oneHourFromNow.utc(),
      formatTime: "h:mm a",
      formatDate: "m.d.Y",
      step: 15,
    });
  }

  startTimeMoment() {
    let start = this.startTime();
    return moment(start);
  }

  startTime() {
    let { ignitionStartUI } = this.uiElements;
    return ignitionStartUI.value;
  }

  endTimeMoment() {
    let end = this.endTime();
    return moment(end);
  }

  endTime() {
    let { ignitionEndUI } = this.uiElements;
    return ignitionEndUI.value;
  }

  geogridPath() {
    let startTime = this.startTimeMoment();
    let monthYear = startTime.format("YYYYMM");
    let fileEnd = startTime.format("YYYMMdd-HH");
    return `${monthYear}/fmda-CONUS-${fileEnd}.geo`;
  }

  validateForIgnition() {
    if (this.startTimeMoment() > this.endTimeMoment()) {
      return {
        header: "Start and End Time",
        messages: ["Ignition Start Time must be before End Time"],
      };
    }
    return { header: "", messages: [] };
  }

  jsonProps() {
    const { useFMDAOption } = this.uiElements;
    if (useFMDAOption.checked) {
      return {
        start_utc: this.startTime(),
        end_utc: this.endTime(),
        fmda_geogrid_path: this.geogridPath(),
      };
    }
    return {
      start_utc: this.startTime(),
      end_utc: this.endTime(),
    };
  }
}

window.customElements.define(
  "simulation-start-and-end-times",
  SimulationStartAndEndTimesUI,
);
