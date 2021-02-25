class Marker extends HTMLElement {
	constructor(index, setActiveMarker, removeMarker, updatePolygon) {
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
		this.setActiveMarker = setActiveMarker;
		this.removeMarker = removeMarker;
		this.updatePolygon = updatePolygon;
		this.latLon = [];
	}

	connectedCallback() {
		this.querySelector('#marker-id').innerText = this.index;
		this.querySelector('#active-marker').onclick = () => {
			if (!this.active) this.setActiveMarker(this.index);
		};
		this.querySelector('#ign-lat').keyup = () => {
			var lat = parseFloat(this.querySelector(`#ign-lat`).value);
			var lon = parseFloat(this.querySelector(`#ign-lon`).value);
			this.buildMapMarker(lat, lon);
		}
	}

	validLatitude(lat) {
	  if(isNaN(lat) || (lat < 22)|| (lat > 51)) return false;
	  return true;
	}

	validLongitude(lng) {
	  if(isNaN(lng) || lng < -128 || lng > -65) return false;
	  return true;
	}

	buildMapMarker(lat, lon) {
		if (this.marker) map.removeLayer(this.marker);
		if (!this.validLatitude(lat) || !this.validLongitude(lon)) {
			this.latLon = [];
			return;
		}
		this.latLon = [lat, lon];
		this.querySelector('#ign-lat').value = lat;
		this.querySelector('#ign-lon').value = lon;
		// const marker = L.marker([lat, lon], {title: this.index.toString(), draggable: true}).addTo(map);
		const marker = L.marker([lat, lon], {draggable: true}).bindPopup(this.index.toString(), {closeButton: false}).addTo(map);
		this.marker = marker;
		marker.on("mouseover", () => {
			marker.openPopup();
		});
		marker.on("mouseout", () => {
			marker.closePopup();
		})
		marker.on("click", () => {
			this.setActiveMarker(this.index);
		});
		marker.on("dblclick", () => {
			this.removeMarker(this.index);
		});
		marker.on("move", (e) => {
			let latLon = e.target._latlng;
			if (!this.validLatitude(latLon.lat) || !this.validLongitude(latLon.lng)) {
				map.removeLayer(this.marker);
				this.latLon = [];
				return;
			}
			this.latLon = latLon;
			this.querySelector('#ign-lat').value = Math.floor(latLon.lat*10000)/10000;
			this.querySelector('#ign-lon').value = Math.floor(latLon.lng*10000)/10000;
			this.updatePolygon();
		});
		this.updatePolygon();
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