import * as L from 'leaflet';
import { LeafletEvent, LeafletMouseEvent } from 'leaflet';
import boolean_within from '@turf/boolean-within';

declare module 'leaflet' {
    export interface LassoOptions {
        polygon?: PolylineOptions,
        cursor?: string;
    }

    export interface LassoFinishedEvent extends LeafletEvent {
        latLngs: LatLng[];
        layers: Layer[];
    }

    export class Lasso extends Handler {
        constructor(map: Map, options?: LassoOptions);
    }

    export const lasso: (map: Map, options?: LassoOptions) => Lasso;
}




const Lasso = L.Handler.extend({
    options: {
        polygon: {
            color: '#00C3FF', 
            weight: 2,
        },
        cursor: 'crosshair',
    } as L.LassoOptions,

    map: undefined as L.Map | undefined,
    polygon: undefined as L.Polygon | undefined,

    initialize(map: L.Map, options?: L.LassoOptions) {
        this.map = map;
        this.onMouseUpBound = this.onMouseUp.bind(this);
        L.Util.setOptions(this, options);
    },
    
    addHooks() {
        this.map.on('mousedown', this.onMouseDown, this);
        this.map.on('mouseup', this.onMouseUp, this);
        document.addEventListener('mouseup', this.onMouseUpBound, true);
        
        const mapContainer = this.map.getContainer();
        mapContainer.style.cursor = this.options.cursor || '';
        mapContainer.style.userSelect = 'none';
        mapContainer.style.msUserSelect = 'none';
        (mapContainer.style as any).mozUserSelect = 'none'; // missing typings
        mapContainer.style.webkitUserSelect = 'none';

        this.map.dragging.disable();
        this.map.fire('lasso.enabled');
    },

    removeHooks() {
        this.map.off('mousedown', this.onMouseDown, this);
        this.map.off('mousemove', this.onMouseMove, this);
        this.map.off('mouseup', this.onMouseUp, this);
        document.removeEventListener('mouseup', this.onMouseUpBound);

        const mapContainer = this.map.getContainer();
        mapContainer.style.cursor = '';
        mapContainer.style.userSelect = '';
        mapContainer.style.msUserSelect = '';
        (mapContainer.style as any).mozUserSelect = ''; // missing typings
        mapContainer.style.webkitUserSelect = '';

        this.map.dragging.enable();
        this.map.fire('lasso.disabled');
    },

    onMouseDown(event: LeafletEvent) {
        const event2 = event as LeafletMouseEvent;
        this.polygon = L.polygon([event2.latlng], this.options.polygon).addTo(this.map);

        this.map.on('mousemove', this.onMouseMove, this);
    },
    
    onMouseMove(event: LeafletEvent) {
        if (!this.polygon) {
            return;
        }

        const event2 = event as LeafletMouseEvent;
        this.polygon.addLatLng(event2.latlng);
    },

    onMouseUp() {
        if (!this.polygon) {
            return;
        }

        const selectedFeatures = this.getSelectedLayers(this.polygon);
        this.map.fire('lasso.finished', {
            latLngs: this.polygon.getLatLngs()[0],
            layers: selectedFeatures,
        });
        this.map.removeLayer(this.polygon);
        this.polygon = undefined;

        this.disable();
    },
    
    getSelectedLayers(polygon: L.Polygon) {
        const lassoPolygonGeometry = polygon.toGeoJSON().geometry;
    
        const layers: L.Layer[] = [];
        this.map.eachLayer((layer: L.Layer) => {
            if (layer === this.polygon) {
                return;
            }

            if (L.MarkerCluster && layer instanceof L.MarkerCluster) {
                layers.push(...layer.getAllChildMarkers());
            } else {
                layers.push(layer);
            }
        });

        const selectedLayers = layers.filter(layer => {
            if (layer instanceof L.Marker || layer instanceof L.Polygon || layer instanceof L.Polyline || layer instanceof L.Circle || layer instanceof L.Rectangle) {
                const layerGeometry = layer.toGeoJSON().geometry;
                return boolean_within(layerGeometry, lassoPolygonGeometry);
            }
            return false;
        });
        
        return selectedLayers;
    },
});

(L as any).Lasso = Lasso;
(L as any).lasso = (map: L.Map, options: L.LassoOptions) => {
    return new Lasso(map, options);
};


(L as any).Control.Lasso = L.Control.extend({
    options: {
        polygon: {
            color: '#00C3FF',
            weight: 2,
        },
        cursor: 'crosshair',
        position: 'topright'
    } as L.LassoOptions,

    initialize: function(options?: L.LassoOptions) {
        L.Util.setOptions(this, options);
    },
    onAdd: function(map: L.Map) {
        const lasso = L.lasso(map, this.options);
        this.lasso = lasso;

        var div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        var link = L.DomUtil.create('a', 'icon-lasso',div);
        link.id = "lasso-control"; //Needed to check if clicked on control or map

        this._createCSS();

        L.DomEvent.addListener(div, L.Browser.touch ? 'click' : 'focus', this._lassoToggle, this);

        return div;
    },

  /*  onRemove: function(map: L.Map) {
        // Nothing to do here
    }, */
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

(L as any).control.lasso = function(options: L.LassoOptions) {
    return new (L as any).Control.Lasso(options);
};

