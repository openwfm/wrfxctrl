import { AppStateSubscriber } from '../appStateSubscriber.js';
import { uploadKmlHTML } from './uploadKmlHTML.js';
import { fetchKMLData } from '../../services/services.js';
import { appState } from '../../appState.js';

export class UploadKml extends AppStateSubscriber {
    constructor() {
        super();
        this.innerHTML = uploadKmlHTML;
        this.uiElements = {
            kmlButton: this.querySelector('#upload-kml-button'),
            fileInput: this.querySelector('#file-input'),
        }
    }

    connectedCallback() {
        super.connectedCallback();
      this.setupButton();
    }

    setupButton() {
      const { kmlButton } = this.uiElements;
      kmlButton.onclick = (e) => {
        e.preventDefault();
        this.uploadKML();
      }
    }

    async uploadKML() {
      const { fileInput } = this.uiElements;
      const file = fileInput.files[0];

      // Create a FormData object to store the file.
      const formData = new FormData();
      formData.append('file', file);
      let kmlBoundaryPoints = await fetchKMLData(formData);
      appState.processKml(kmlBoundaryPoints);
      // console.log("kmlPoints: ", kmlBoundaryPoints);
    }
}

window.customElements.define('upload-kml', UploadKml);
