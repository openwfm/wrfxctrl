import { appState } from "../../appState.js";
import { ignitionTypeSelectorHTML } from "./ignitionTypeSelectorHTML.js";
import { AppStateSubscriber } from "../appStateSubscriber.js";

export class IgnitionTypeSelector extends AppStateSubscriber {
  constructor() {
    super();
    this.innerHTML = ignitionTypeSelectorHTML;
    this.uiElements = {
      ignitionTypeDropdown: this.querySelector("#ignition-type-dropdown"),
    };
  }

  connectedCallback() {
    this.connectIgnitionTypeSelector();
  }

  connectIgnitionTypeSelector() {
    let { ignitionTypeDropdown } = this.uiElements;
    ignitionTypeDropdown.onchange = () => {
      appState.changeIgnitionType(ignitionTypeDropdown.value);
    };
  }

  jsonProps() {
    const { ignitionTypeDropdown } = this.uiElements;
    let use_realtime = ignitionTypeDropdown.value == "4";
    return { use_realtime: use_realtime };
  }
}

window.customElements.define("ignition-type-selector", IgnitionTypeSelector);
