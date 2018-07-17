import * as L from 'leaflet';
import { LeafletEvent, LeafletMouseEvent } from 'leaflet';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

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
        
        this.map.getContainer().style.cursor = this.options.cursor || '';
        document.body.style.userSelect = 'none';
        document.body.style.msUserSelect = 'none';
        (document.body.style as any).mozUserSelect = 'none'; // missing typings
        document.body.style.webkitUserSelect = 'none';

        this.map.dragging.disable();
        this.map.fire('lasso.enabled');
    },

    removeHooks() {
        this.map.off('mousedown', this.onMouseDown, this);
        this.map.off('mousemove', this.onMouseMove, this);
        this.map.off('mouseup', this.onMouseUp, this);
        document.removeEventListener('mouseup', this.onMouseUpBound);

        this.map.getContainer().style.cursor = '';
        document.body.style.userSelect = '';
        document.body.style.msUserSelect = '';
        (document.body.style as any).mozUserSelect = ''; // missing typings
        document.body.style.webkitUserSelect = '';

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
            if (layer instanceof L.Marker) {
                const layerGeometry = layer.toGeoJSON().geometry;
                return booleanPointInPolygon(layerGeometry, lassoPolygonGeometry);
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
