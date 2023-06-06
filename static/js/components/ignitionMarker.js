import { buildMap } from "../buildMap.js";
export class IgnitionMarker extends HTMLElement {
	/** ===== Initialization block ===== */
	constructor(index, context, iconColor) {
		super();
		this.innerHTML = `
			<div class="two fields ignition-marker" style="margin-bottom: 15px">
			    <div id='ignition-id-container' class="ignition-id">
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
			</div>
		`;
		let markerMap = {
			"orange":'static/square_icon_orange.png',
			"red": 'static/square_icon_filled.png'
		}
		this.iconUrl = iconColor == null ? null : markerMap[iconColor];
		this.index = index;
		this.context = context;
		this.mapMarker = null;
		this.ignitionMapMarker = null;
		this.popup = null;
	}

	connectedCallback() {
		this.indexVisibility();
		const inputLatLon = () => {
			let lat = parseFloat(this.querySelector(`#ign-lat`).value);
			let lon = parseFloat(this.querySelector(`#ign-lon`).value);
			this.addMarkerToMapAtLatLon(lat, lon);
		}
		this.querySelector('#ign-lat').oninput = inputLatLon;
		this.querySelector('#ign-lon').oninput = inputLatLon;
	}

	indexVisibility() {
		if (this.index == null) {
			const indexContainer = this.querySelector('#ignition-id-container');
			this.hideComponent(indexContainer);
			return;
		}

		this.querySelector('#marker-id').innerText = this.index;
	}

	hideComponent(component) {
        if (this.isVisible(component)) {
            component.classList.add('hidden');
        }
    }

    isVisible(component) {
        return !component.classList.contains('hidden');
    }

	getLatLon() {
		var latLon = []
		var lat = parseFloat(this.querySelector('#ign-lat').value);
		var lon = parseFloat(this.querySelector('#ign-lon').value);
		if (this.isValidLatitude(lat) && this.isValidLongitude(lon)) latLon = [lat, lon];
		return latLon;
	}

	latLon() {
		let lat = parseFloat(this.querySelector('#ign-lat').value);
		let lon = parseFloat(this.querySelector('#ign-lon').value);
		return [lat, lon];
	}

	isSet() {
		let lat = parseFloat(this.querySelector('#ign-lat').value);
		let lon = parseFloat(this.querySelector('#ign-lon').value);
		return !isNaN(lat) && !isNaN(lon);
	}

	/* ===== UI Interaction block ===== */

	addMarkerToMapAtLatLon(lat, lon) {
		if (this.mapMarker != null) {
			buildMap.map.removeLayer(this.mapMarker);
		}
		// if (!this.isValidLatitude(lat) || !this.isValidLongitude(lon)) {
		// 	updateIgnitionDataOnMap();
		// 	return;
		// }
		this.querySelector('#ign-lat').value = lat;
		this.querySelector('#ign-lon').value = lon;
		const mapMarker = this.newMapMarker(lat, lon);
		this.ignitionMapMarker = new IgnitionMapMarker(lat, lon, this.index, this.context);
        this.popup = L.popup({lat: lat, lng: lon},{closeOnClick: false, autoClose: false, autoPan: false});
        this.popup.setContent(this.ignitionMapMarker);
        mapMarker.bindPopup(this.popup);
		this.mapMarker = mapMarker;
		mapMarker.on("click", () => {
			mapMarker.openPopup();
		});

		mapMarker.on("move", (e) => {
			let latLon = e.target._latlng;
			this.querySelector('#ign-lat').value = Math.floor(latLon.lat*10000)/10000;
			this.querySelector('#ign-lon').value = Math.floor(latLon.lng*10000)/10000;
			this.ignitionMapMarker.updateLatLon(latLon.lat, latLon.lng);
			this.context.markerUpdate();
		});
		this.context.markerUpdate();
	}

	newMapMarker(lat, lon) {
		let markerOptions = {draggable: true, autoPan: false};
		if (this.iconUrl != null) {
			let satIcon = L.icon({iconUrl: this.iconUrl, iconSize: [5,5]});
			markerOptions["icon"] = satIcon;
		}
		
		return L.marker([lat, lon], markerOptions).addTo(buildMap.map);
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
		// this.querySelector('#lat-warning').className = "not-valid-warning";
		if (!this.isValidLatitude(lat)) {
			// this.querySelector('#lat-warning').className = "not-valid-warning activate-warning";
			valid = false;
		}
		let lon = parseFloat(this.querySelector('#ign-lon').value);
		// this.querySelector(`#lon-warning`).className = 'not-valid-warning';
		if (!this.isValidLongitude(lon)) {
			// this.querySelector(`#lon-warning`).className = 'not-valid-warning activate-warning';
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
	constructor(lat, lon, index, context) {
        const roundLatLon = (num) => Math.round(num*100)/100; 	
		super();
		this.innerHTML = `
			<div id='ignitionMapMarker'>
                <span id='removeMarker' class='interactive-button'>remove marker</span>
                <div id='markerIndexContainer'>
                    <span id='markerIndex' style='margin: 1px; margin-right: 10px'>index: ${index}</span>
                </div>
                <div>
                    <span id='markerLatLon' style='margin: 1px; margin-right: 10px'>lat: ${roundLatLon(lat)} lon: ${roundLatLon(lon)}</span>
                </div>
            </div>	
		`;
		this.context = context;
		this.lat = lat;
		this.lon = lon;
		this.index = index;
	}

	connectedCallback() {
		const removeMarker = this.querySelector('#removeMarker');
		removeMarker.onpointerdown = () => {
			this.context.removeMarker(this.index);
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