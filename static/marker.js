class Marker extends HTMLElement {
	constructor(index) {
		super();
		this.innerHTML = `
			<div class="two fields" style="margin-bottom: 15px">
			    <div class="ignition-id">
			      <span id="marker-id"></span>
			    </div>
			    <div class="field">
			      <input name="ignition_latitude" id="ign-lat" type="text" placeholder="Latitude ...">
			      <span id="lat-warning" class="not-valid-warning">The ignition latitude must be a number between 36 and 41.</span>
			    </div>
			    <div class="field">
			      <input name="ignition_longitude" id="ign-lon" type="text" placeholder="Longitude ...">
			      <span id="lon-warning" class="not-valid-warning">The ignition longitude must be a number between -109 and -102.</span>
			    </div>
			    <div>
			      <span class="active-field-button" id="active-marker">Active</span>
			    </div>
			</div>
		`;
		this.index = index;
		this.marker = null;
		this.active = false;
	}

	connectedCallback() {
		this.querySelector('#marker-id').innerText = this.index;
		this.querySelector('#active-marker').onclick = () => {
			if (!this.active) setActiveMarker(this.index);
		};
		const inputLatLon = () => {
			var lat = parseFloat(this.querySelector(`#ign-lat`).value);
			var lon = parseFloat(this.querySelector(`#ign-lon`).value);
			console.log('here');
			this.buildMapMarker(lat, lon);
		}
		this.querySelector('#ign-lat').oninput = inputLatLon;
		this.querySelector('#ign-lon').oninput = inputLatLon;
	}

	validLatitude(lat) {
	  if(isNaN(lat) || (lat < 22)|| (lat > 51)) return false;
	  return true;
	}

	validLongitude(lng) {
	  if(isNaN(lng) || lng < -128 || lng > -65) return false;
	  return true;
	}

	getLatLon() {
		var latLon = []
		var lat = parseFloat(this.querySelector('#ign-lat').value);
		var lon = parseFloat(this.querySelector('#ign-lon').value);
		if (this.validLatitude(lat) && this.validLongitude(lon)) latLon = [lat, lon];
		return latLon;
	}

	validate() {
		var valid = true;
		var lat = parseFloat(this.querySelector('#ign-lat').value);
		this.querySelector('#lat-warning').className = "not-valid-warning";
		if (!this.validLatitude(lat)) {
			this.querySelector('#lat-warning').className = "not-valid-warning activate-warning";
			valid = false;
		}
		var lon = parseFloat(this.querySelector('#ign-lon').value);
		this.querySelector(`#lon-warning`).className = 'not-valid-warning';
		if (!this.validLongitude(lon)) {
			this.querySelector(`#lon-warning`).className = 'not-valid-warning activate-warning';
			valid = false;
		}
		return valid;
	}

	buildMapMarker(lat, lon) {

		var satIcon = L.icon({iconUrl: 'static/square_icon_filled.png', iconSize: [5,5]});
		if (this.marker) map.removeLayer(this.marker);
		if (!this.validLatitude(lat) || !this.validLongitude(lon)) {
			updateMap();
			return;
		}
		this.querySelector('#ign-lat').value = lat;
		this.querySelector('#ign-lon').value = lon;
		var marker;
		marker = L.marker([lat, lon], {icon: satIcon, draggable: true, autoPan: false}).bindPopup(this.index.toString(), {closeButton: false, autoPan: false}).addTo(map);
		this.marker = marker;
		marker.on("mouseover", () => marker.openPopup());
		marker.on("mouseout", () => marker.closePopup());
		marker.on("click", () => setActiveMarker(this.index));
		marker.on("dblclick", () => removeMarker(this.index));
		marker.on("move", (e) => {
			let latLon = e.target._latlng;
			this.querySelector('#ign-lat').value = Math.floor(latLon.lat*10000)/10000;
			this.querySelector('#ign-lon').value = Math.floor(latLon.lng*10000)/10000;
			updateMap();
		});
		updateMap();
	}

	setInactive() {
		const activeMarker = this.querySelector('#active-marker');
		activeMarker.style.backgroundColor = "white";
		activeMarker.style.color = "black";
		this.active = false;
	}

	setActive() {
		const activeMarker = this.querySelector('#active-marker');
		activeMarker.style.backgroundColor = "#404040";
		activeMarker.style.color = "white";
		this.active = true;
	}

	updateIndex(newIndex) {
		this.index = newIndex;
		this.querySelector('#marker-id').innerText = newIndex;
		if (this.marker) {
			this.marker._popup.setContent(newIndex.toString());
		}
	}
}

window.customElements.define('ignition-marker', Marker);