/** Contents
 1. Initialization block
 2. UI Interaction block
 3. Validation block
*/

class IgnitionMarker extends HTMLElement {
	/** ===== Initialization block ===== */
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
		this.mapMarker = null;
		this.ignitionMapMarker = null;
		this.popup = null;
		this.isActive = false;
	}

	connectedCallback() {
		this.querySelector('#marker-id').innerText = this.index;
		this.querySelector('#active-marker').onclick = () => {
			if (!this.isActive) {
				setActiveIgnitionMarker(this.index);
			}
		};
		const inputLatLon = () => {
			let lat = parseFloat(this.querySelector(`#ign-lat`).value);
			let lon = parseFloat(this.querySelector(`#ign-lon`).value);
			this.addMarkerToMapAtLatLon(lat, lon);
		}
		this.querySelector('#ign-lat').oninput = inputLatLon;
		this.querySelector('#ign-lon').oninput = inputLatLon;
	}


	getLatLon() {
		var latLon = []
		var lat = parseFloat(this.querySelector('#ign-lat').value);
		var lon = parseFloat(this.querySelector('#ign-lon').value);
		if (this.isValidLatitude(lat) && this.isValidLongitude(lon)) latLon = [lat, lon];
		return latLon;
	}

	/* ===== UI Interaction block ===== */

	addMarkerToMapAtLatLon(lat, lon) {
		let satIcon = L.icon({iconUrl: 'static/square_icon_orange.png', iconSize: [5,5]});
		if (this.mapMarker != null) {
			map.removeLayer(this.mapMarker);
		}
		if (!this.isValidLatitude(lat) || !this.isValidLongitude(lon)) {
			updateIgnitionDataOnMap();
			return;
		}
		this.querySelector('#ign-lat').value = lat;
		this.querySelector('#ign-lon').value = lon;
		let mapMarker = L.marker([lat, lon], {icon: satIcon, draggable: true, autoPan: false}).addTo(map);
		this.ignitionMapMarker = new IgnitionMapMarker(lat, lon, this.index);
        this.popup = L.popup({lat: lat, lng: lon},{closeOnClick: false, autoClose: false, autoPan: false});
        this.popup.setContent(this.ignitionMapMarker);
        mapMarker.bindPopup(this.popup);
		this.mapMarker = mapMarker;
		mapMarker.on("click", () => {
			mapMarker.openPopup();
			setActiveIgnitionMarker(this.index)
		});

		mapMarker.on("move", (e) => {
			let latLon = e.target._latlng;
			this.querySelector('#ign-lat').value = Math.floor(latLon.lat*10000)/10000;
			this.querySelector('#ign-lon').value = Math.floor(latLon.lng*10000)/10000;
			this.ignitionMapMarker.updateLatLon(latLon.lat, latLon.lng);
			updateIgnitionDataOnMap();
		});
		updateIgnitionDataOnMap();
	}

	setInactive() {
		const activeMarker = this.querySelector('#active-marker');
		activeMarker.style.backgroundColor = "white";
		activeMarker.style.color = "black";
		this.isActive = false;
	}

	setActive() {
		const activeMarker = this.querySelector('#active-marker');
		activeMarker.style.backgroundColor = "#404040";
		activeMarker.style.color = "white";
		this.isActive = true;
	}

	updateIndex(newIndex) {
		this.index = newIndex;
		this.querySelector('#marker-id').innerText = newIndex;
		this.ignitionMapMarker.updateIndex(newIndex);
	}


	/** ===== Validation block ===== */

	isValid() {
		let valid = true;
		let lat = parseFloat(this.querySelector('#ign-lat').value);
		this.querySelector('#lat-warning').className = "not-valid-warning";
		if (!this.isValidLatitude(lat)) {
			this.querySelector('#lat-warning').className = "not-valid-warning activate-warning";
			valid = false;
		}
		let lon = parseFloat(this.querySelector('#ign-lon').value);
		this.querySelector(`#lon-warning`).className = 'not-valid-warning';
		if (!this.isValidLongitude(lon)) {
			this.querySelector(`#lon-warning`).className = 'not-valid-warning activate-warning';
			valid = false;
		}
		return valid;
	}

	isValidLatitude(lat) {
	  if(isNaN(lat) || (lat < 22)|| (lat > 51)) {
	  	return false;
	  }
	  return true;
	}

	isValidLongitude(lng) {
	  if(isNaN(lng) || lng < -128 || lng > -65) {
	  	return false;
	  }
	  return true;
	}
}	

class IgnitionMapMarker extends HTMLElement {
	constructor(lat, lon, index) {
        const roundLatLon = (num) => Math.round(num*100)/100; 	
		super();
		this.innerHTML = `
			<div id='ignitionMapMarker'>
                <span id='removeMarker' class='interactive-button'>remove marker</span>
                <div>
                    <span id='markerIndex' style='margin: 1px; margin-right: 10px'>index: ${index}</span>
                </div>
                <div>
                    <span id='markerLatLon' style='margin: 1px; margin-right: 10px'>lat: ${roundLatLon(lat)} lon: ${roundLatLon(lon)}</span>
                </div>
            </div>	
		`;
		this.lat = lat;
		this.lon = lon;
		this.index = index;
	}

	connectedCallback() {
		const removeMarker = this.querySelector('#removeMarker');
		removeMarker.onpointerdown = () => {
			removeIgnitionMarker(this.index);
		}
	}

    updateIndex(index) {
    	this.index = index;
    	const markerIndex = this.querySelector('#markerIndex');
    	markerIndex.innerText = index;
    }

    updateLatLon(lat, lon) {
        const roundLatLon = (num) => Math.round(num*100)/100; 	
    	this.lat = lat;
    	this.lon = lon;
    	const markerLatLon = this.querySelector('#markerLatLon');
    	markerLatLon.innerText = `lat: ${roundLatLon(lat)} lon: ${roundLatLon(lon)}`;
    }
}

window.customElements.define('ignition-marker', IgnitionMarker);
window.customElements.define('ignition-map-marker', IgnitionMapMarker);