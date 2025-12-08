import { appState } from "../../appState.js";
import { fmdaHTML } from "./fmdaHTML.js";
import { AppStateSubscriber } from "../appStateSubscriber.js";

export class Fmda extends AppStateSubscriber {
  constructor() {
    super();
    this.innerHTML = fmdaHTML;
    this.uiElements = {
      useFMDAOption: this.querySelector("#use-fmda-option"),
    };
  }

  geogridPath() {
    let startTime = appState.simulationStartTimeMoment();
    let monthYear = startTime.format("YYYYMM");
    let fileEnd = startTime.format("YYYMMdd-HH");
    return `${monthYear}/fmda-CONUS-${fileEnd}.geo`;
  }

  jsonProps() {
    const { useFMDAOption } = this.uiElements;
    if (!useFMDAOption.checked) {
      return {};
    }
    return {
      fmda_geogrid_path: this.geogridPath(),
    };
  }
}

window.customElements.define("use-fmda", Fmda);
