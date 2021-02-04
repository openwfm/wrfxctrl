  /* based on github.com/ardhi/Leaflet.MousePosition (MIT license) */

L.Control.MousePosition = L.Control.extend({
  options: {
    position: 'bottomleft',
    separator: ' : ',
    emptyString: '',
    lngFirst: false,
    numDigits: 4
  },

  onAdd: function (map) {
    this._container = L.DomUtil.create('div', 'leaflet-control-mouseposition');
    L.DomEvent.disableClickPropagation(this._container);
    map.on('mousemove', this._onMouseMove, this);
    map.on('click', this._onMouseClick, this);
    this._container.innerHTML=this.options.emptyString;
    this._freeze = false;
    return this._container;
  },

  onRemove: function (map) {
    map.off('mousemove', this._onMouseMove)
  },

  _onMouseMove: function (e) {
    var lng = L.Util.formatNum(e.latlng.lng, this.options.numDigits);
    var lat = L.Util.formatNum(e.latlng.lat, this.options.numDigits);
    var value = this.options.lngFirst ? lng + this.options.separator + lat : lat + this.options.separator + lng;
    var prefixAndValue = 'Location ' + value;
    this._container.innerHTML = prefixAndValue;
  },
  
  _onMouseClick: function(e) {
    const marker = L.marker(e.latlng).addTo(this._map);
    if(markers[markerId]) {
      this._map.removeLayer(markers[markerId]);
      markers[markerId] = marker;
    } else {
      markers[markerId] = marker;
    }
    $(`#ign-lat${markerId}`).val(L.Util.formatNum(e.latlng.lat, this.options.numDigits));
    $(`#ign-lon${markerId}`).val(L.Util.formatNum(e.latlng.lng, this.options.numDigits));
  }
});

L.Map.mergeOptions({
    positionControl: false
});

L.Map.addInitHook(function () {
    if (this.options.positionControl) {
        this.positionControl = new L.Control.MousePosition();
        this.addControl(this.positionControl);
    }
});

L.control.mousePosition = function (options) {
    return new L.Control.MousePosition(options);
};
