import { AppStateSubscriber } from '../appStateSubscriber.js';
import { uploadKmlHTML } from './uploadKmlHTML.js';

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
      const { kmlButton, fileInput } = this.uiElements;
      kmlButton.onclick = (e) => {
        e.preventDefault();

        const file = fileInput.files[0];

        // Create a FormData object to store the file.
        const formData = new FormData();
        formData.append('file', file);

        // Send the AJAX request using XMLHttpRequest.
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/upload');
        xhr.send(formData);

        // Handle the response.
        xhr.onload = () => {
          if (xhr.status === 200) {
            console.log('success!');
            // Success!
          } else {
            console.log('error!');
            // Error!
          }
        };
        console.log('hello chase!');
    }
  }
}

window.customElements.define('upload-kml', UploadKml);
