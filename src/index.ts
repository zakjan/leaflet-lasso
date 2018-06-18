import * as L from 'leaflet';
import { LeafletEvent, LeafletMouseEvent } from 'leaflet';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

declare module 'leaflet' {
    export interface LassoOptions {
        polygon?: PolylineOptions,
        cursor?: string;
    }

    export interface LassoSelectedEvent extends LeafletEvent {
        polygon: LatLng[];
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
        document.addEventListener('mouseup', this.onMouseUpBound);
        
        this.map.getContainer().style.cursor = this.options.cursor || '';
        this.map.dragging.disable();
        this.map.fire('lasso.enabled');
    },

    removeHooks() {
        this.map.off('mousedown', this.onMouseDown, this);
        this.map.off('mousemove', this.onMouseMove, this);
        this.map.off('mouseup', this.onMouseUp, this);
        document.removeEventListener('mouseup', this.onMouseUpBound);

        this.map.getContainer().style.cursor = '';
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

        const selectedFeatures = this.getSelectedFeatures(this.polygon);
        this.map.fire('lasso.finished', {
            latLngs: this.polygon.getLatLngs(),
            layers: selectedFeatures,
        });
        this.map.removeLayer(this.polygon);
        this.polygon = undefined;

        this.disable();
    },
    
    getSelectedFeatures(polygon: L.Polygon) {
        const selectedLayers: L.Layer[] = [];

        const lassoPolygonGeometry = polygon.toGeoJSON().geometry;
    
        this.map.eachLayer((layer: L.Layer) => {
            if (layer === this.polygon) {
                return;
            }
            
            let contains = false;
            if (layer instanceof L.Marker) {
                const layerGeometry = layer.toGeoJSON().geometry;
                contains = booleanPointInPolygon(layerGeometry, lassoPolygonGeometry);
            }

            if (contains) {
                selectedLayers.push(layer);
            }
        });
        
        return selectedLayers;
    },
});

(L as any).Lasso = Lasso;
(L as any).lasso = (map: L.Map, options: L.LassoOptions) => {
    return new Lasso(map, options);
};
