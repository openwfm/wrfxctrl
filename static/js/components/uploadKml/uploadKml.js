import { AppStateSubscriber } from '../appStateSubscriber.js';
import { uploadKmlHTML } from './uploadKmlHTML.js';
import { fetchPerimeterKML, fetchLineKML } from '../../services/services.js';
import { appState } from '../../appState.js';

export class UploadKml extends HTMLElement {
    constructor(context) {
      super();
        this.context = context;
        this.innerHTML = uploadKmlHTML;
        this.uiElements = {
            kmlButton: this.querySelector('#upload-kml-button'),
            fileInput: this.querySelector('#file-input'),
        }
    }

    connectedCallback() {
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
      document.body.classList.add('wait');
      // Create a FormData object to store the file.
      const formData = new FormData();
      formData.append('file', file);
      let kmlPoints = [];
      if ( appState.isPerimeter() ) {
        kmlPoints = await fetchPerimeterKML(formData);
      } else if ( appState.isLine() ) {
        kmlPoints = await fetchLineKML(formData);
      }
      this.context.addKmlPoints(kmlPoints);
      document.body.classList.remove('wait');
    }
}

window.customElements.define('upload-kml', UploadKml);
