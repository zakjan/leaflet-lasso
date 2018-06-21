"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var L = require("leaflet");
var boolean_point_in_polygon_1 = require("@turf/boolean-point-in-polygon");
var Lasso = L.Handler.extend({
    options: {
        polygon: {
            color: '#00C3FF',
            weight: 2,
        },
        cursor: 'crosshair',
    },
    map: undefined,
    polygon: undefined,
    initialize: function (map, options) {
        this.map = map;
        this.onMouseUpBound = this.onMouseUp.bind(this);
        L.Util.setOptions(this, options);
    },
    addHooks: function () {
        this.map.on('mousedown', this.onMouseDown, this);
        this.map.on('mouseup', this.onMouseUp, this);
        document.addEventListener('mouseup', this.onMouseUpBound);
        this.map.getContainer().style.cursor = this.options.cursor || '';
        this.map.dragging.disable();
        this.map.fire('lasso.enabled');
    },
    removeHooks: function () {
        this.map.off('mousedown', this.onMouseDown, this);
        this.map.off('mousemove', this.onMouseMove, this);
        this.map.off('mouseup', this.onMouseUp, this);
        document.removeEventListener('mouseup', this.onMouseUpBound);
        this.map.getContainer().style.cursor = '';
        this.map.dragging.enable();
        this.map.fire('lasso.disabled');
    },
    onMouseDown: function (event) {
        var event2 = event;
        this.polygon = L.polygon([event2.latlng], this.options.polygon).addTo(this.map);
        this.map.on('mousemove', this.onMouseMove, this);
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
        var selectedFeatures = this.getSelectedFeatures(this.polygon);
        this.map.fire('lasso.finished', {
            latLngs: this.polygon.getLatLngs()[0],
            layers: selectedFeatures,
        });
        this.map.removeLayer(this.polygon);
        this.polygon = undefined;
        this.disable();
    },
    getSelectedFeatures: function (polygon) {
        var _this = this;
        var selectedLayers = [];
        var lassoPolygonGeometry = polygon.toGeoJSON().geometry;
        this.map.eachLayer(function (layer) {
            if (layer === _this.polygon) {
                return;
            }
            var contains = false;
            if (layer instanceof L.Marker) {
                var layerGeometry = layer.toGeoJSON().geometry;
                contains = boolean_point_in_polygon_1.default(layerGeometry, lassoPolygonGeometry);
            }
            if (contains) {
                selectedLayers.push(layer);
            }
        });
        return selectedLayers;
    },
});
L.Lasso = Lasso;
L.lasso = function (map, options) {
    return new Lasso(map, options);
};
