"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var L = require("leaflet");
var boolean_within= require("@turf/boolean-within");
var Lasso = L.Handler.extend({
    options: {
        polygon: {
            color: '#00C3FF',
            weight: 2,
        },
        cursor: 'crosshair',
    },
    map: undefined,
    mapid : 'map',
    polygon: undefined,
    initialize: function (map, options) {
        this.map = map;
        this.mapid = map._container.id;
        this.onMouseUpBound = this.onMouseUp.bind(this);
        L.Util.setOptions(this, options);
    },
    addHooks: function () {
        this.map.on('mousedown', this.onMouseDown, this);
        this.map.on('mouseup', this.onMouseUp, this);
        document.addEventListener('mouseup', this.onMouseUpBound, true);
        var mapContainer = this.map.getContainer();
        mapContainer.style.cursor = this.options.cursor || '';
        mapContainer.style.userSelect = 'none';
        mapContainer.style.msUserSelect = 'none';
        mapContainer.style.mozUserSelect = 'none'; // missing typings
        mapContainer.style.webkitUserSelect = 'none';
        this.map.dragging.disable();
        this.map.fire('lasso.enabled');
    },
    removeHooks: function () {
        this.map.off('mousedown', this.onMouseDown, this);
        this.map.off('mousemove', this.onMouseMove, this);
        this.map.off('mouseup', this.onMouseUp, this);
        document.removeEventListener('mouseup', this.onMouseUpBound);
        var mapContainer = this.map.getContainer();
        mapContainer.style.cursor = '';
        mapContainer.style.userSelect = '';
        mapContainer.style.msUserSelect = '';
        mapContainer.style.mozUserSelect = ''; // missing typings
        mapContainer.style.webkitUserSelect = '';
        this.map.dragging.enable();
        this.map.fire('lasso.disabled');
    },
    onMouseDown: function (event) {
        var event2 = event;
        //Allow only if clicked on map
        if (event.originalEvent.target.id === this.mapid) {
            this.polygon = L.polygon([event2.latlng], this.options.polygon).addTo(this.map);
            this.map.on('mousemove', this.onMouseMove, this);
        }
    },
    onMouseMove: function (event) {
        if (!this.polygon) {
            return;
        }
        var event2 = event;
        this.polygon.addLatLng(event2.latlng);
    },
    onMouseUp: function () {
        if (!this.polygon) {
            return;
        }
        var selectedFeatures = this.getSelectedLayers(this.polygon);
        this.map.fire('lasso.finished', {
            latLngs: this.polygon.getLatLngs()[0],
            layers: selectedFeatures,
        });
        this.map.removeLayer(this.polygon);
        this.polygon = undefined;
        this.disable();
    },
    getSelectedLayers: function(polygon) {
        var _this = this;
        var lassoPolygonGeometry = polygon.toGeoJSON().geometry;
        var layers = [];
        this.map.eachLayer(function (layer) {
            if (layer === _this.polygon) {
                return;
            }
            if (L.MarkerCluster && layer instanceof L.MarkerCluster) {
                layers.push.apply(layers, layer.getAllChildMarkers());
            }
            else {
                layers.push(layer);
            }
        });

        var selectedLayers = layers.filter(function (layer) {
            if (layer instanceof L.Marker || layer instanceof L.Polygon || layer instanceof L.Polyline || layer instanceof L.Circle || layer instanceof L.Rectangle) {
                var layerGeometry = layer.toGeoJSON().geometry;
                return boolean_within.default(layerGeometry, lassoPolygonGeometry);
            }
            return false;
        });
        return selectedLayers;
    },
});
L.Lasso = Lasso;
L.lasso = function (map, options) {
    return new Lasso(map, options);
};

L.Control.Lasso = L.Control.extend({
    options: {
        polygon: {
            color: '#00C3FF',
            weight: 2,
        },
        cursor: 'crosshair',
        position: 'topright'
    },
    initialize: function(options) {
        L.Util.setOptions(this, options);
    },
    onAdd: function(map) {
        const lasso = L.lasso(map, this.options);
        this.lasso = lasso;

        var div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        var link = L.DomUtil.create('a', 'icon-lasso',div);

        this._createCSS();

        L.DomEvent.addListener(div, L.Browser.touch ? 'click' : 'focus', this._lassoToggle, this);

        return div;
    },

    onRemove: function(map) {
        // Nothing to do here
    },
    _createCSS : function(){
        var css = document.createElement("style");
        css.type = "text/css";
        //Image with no copyright created by @Falke-Design
        css.innerHTML = ".icon-lasso{background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsSAAALEgHS3X78AAAD6UlEQVR4nO1b7XHbMAwFfP0fdYKqE8QbRJ0gGUEjaAR3A4/gbuBOUHWCKhs4E1SegD06jzmYpWhJpiRKNu58Tix+AA8gCQIQK6Xolml109LfAbgDcAfg5gH4NPQEzJwSkf4kRLR2NKmJqNLfSqlqaH7+4y/0McjML0SUQdinHkO8ApCSiPZKqToogxYFAQBC50T03NDkN74raFzSGtahreSLo+9PALG7mlEXaQD6fMD0BgIp8TkQ0ZaINChpl7ExZoZxK2vcGr8nfXl2ztm5g1twI/Q6KHPvVlFg/DMgJgEAWpWCay3lIYX2zJ1bQFQhAO+i9b2l8VEEd/BSWEooBgUAm5REPvg67AGCrZDdIABgQ6qF1oOu8QBAbK4FwTd4bq23SbXeks/OIPg0f7V5TQRCpz3BNdhamH30wgu+CwFC66VqD5IIByRas/eAYDbGqi8AW+FszEp4ocC6y1KQneW6z+YmvJDDLIVDVwBKdNzPVXghi/FbLjprp4AIM2fi6loMcusal8zN8eXirOp885jNrn/BAlKxnL17GWPj+As8viqlDguwAG3V+hR7JKJvSqmyqd1KmMnrUoQHGaEzX6OVaLAfg6sRyUSeUt+UKxGobDSTmZKR5yIAj/h79IhsDPSRFxg6+ho9AAukpI1IgydGxiY4dSRON+/SXgwAyE1sHbkF79JmeEuaPs91H4DWf+Ffk1nSgDwQ0RH5iUbZqgXcAI0MG/FbKn7f+i5DZo14PabISR/lb0qpjWETXq252LmSsidaCYfh8s0pbnKZuFHuEzNvmNl5MiR9YmmRLYHaxb8VJ3SG+UzD3ZyvwyI/UEPozMoZFE2xTjOADId1yuhGBMLO0raSUSE74HsGgDoPiZULsIISPkFqtUlEuOx0YsiHadeIakTC57bGPW0zAVRiP+yVXJhY+M6JHLFcCtfDvUAoahCseoXW0Wz0Oy1310O5WUQLgmX2ZddEzkffhoc2CJMUQ3h4kzt+v7S4ke/CRKWYaBtBYURmF2tcMda7bC0absWEk5TG4ISyS3Suury1BqAB+XIMIDCv7eAEsUTvHtDQoak8bhPSexSlcXadYBlqHu8p0BMIZRVIti9QeD/Hc/S1hVawgKDuufQDriqVZeYcAjeVyL4BGBc1lcaSKY8dolaYmTXgf0ykKFStcCIKpM33Q8vuR1EcXeEuMkhoDnyWCKB81wGUQV+aEhFaJ/mSlgPwYvyHZ8QN9SlS38RbY3hnYQ/NHyH8KVq0+DdGdCgMS+sRe1ImX8xYvAUw8wGb7Q9c88/2l1sAIEPBlPM0ur85GgEPk9IdgAh4mJTuAETAw3RERP8Ab2Uzgrad13wAAAAASUVORK5CYII=');-webkit-background-size: 22px;background-size: 22px;}";
        document.body.appendChild(css);
    },
    _lassoToggle : function(){
        if(this.lasso.enabled()){
            this.lasso.disable();
        }else{
            this.lasso.enable();
        }
    },
    enable : function(){
        this.lasso.enable();
    },
    disable : function(){
        this.lasso.disable();
    },
    enabled : function(){
        return this.lasso.enabled();
    }
});

L.control.lasso = function(opts) {
    return new L.Control.Lasso(opts);
};
