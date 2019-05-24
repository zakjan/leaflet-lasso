import L from 'leaflet';
import { getLayersInPolygon } from './calc';
import './lasso-handler.css';

export interface LassoHandlerOptions {
    polygon?: L.PolylineOptions,
    intersect?: boolean;
}

interface LassoHandlerFinishedEventData {
    latLngs: L.LatLng[];
    layers: L.Layer[];
}

export type LassoHandlerFinishedEvent = L.LeafletEvent & LassoHandlerFinishedEventData;

export const ENABLED_EVENT = 'lasso.enabled';
export const DISABLED_EVENT = 'lasso.disabled';
export const FINISHED_EVENT = 'lasso.finished';

export const ACTIVE_CLASS = 'leaflet-lasso-active';

export class LassoHandler extends L.Handler {
    options: LassoHandlerOptions = {
        polygon: {
            color: '#00C3FF',
            weight: 2,
        },
        intersect: false,
    };

    private map: L.Map;

    private polyline?: L.Polyline;
    private polygon?: L.Polygon;

    private onDocumentMouseMoveBound = this.onDocumentMouseMove.bind(this);
    private onDocumentMouseUpBound = this.onDocumentMouseUp.bind(this);

    constructor(map: L.Map, options: LassoHandlerOptions = {}) {
        super(map);
        
        this.map = map;
        L.Util.setOptions(this, options);
    }

    setOptions(options: LassoHandlerOptions) {
        this.options = { ...this.options, ...options };
    }

    toggle() {
        if (this.enabled()) {
            this.disable();
        } else {
            this.enable();
        }
    }
    
    addHooks() {
        this.map.getPane('mapPane');
        this.map.on('mousedown', this.onMapMouseDown, this);
        
        const mapContainer = this.map.getContainer();
        mapContainer.classList.add(ACTIVE_CLASS);

        this.map.dragging.disable();
        this.map.fire(ENABLED_EVENT);
    }

    removeHooks() {
        this.map.off('mousedown', this.onMapMouseDown, this);
        document.removeEventListener('mousemove', this.onDocumentMouseMoveBound);
        document.removeEventListener('mouseup', this.onDocumentMouseUpBound);

        this.map.getContainer().classList.remove(ACTIVE_CLASS);
        document.body.classList.remove(ACTIVE_CLASS);

        this.map.dragging.enable();
        this.map.fire(DISABLED_EVENT);
    }

    private onMapMouseDown(event: L.LeafletEvent) {
        const event2 = event as L.LeafletMouseEvent;

        // skip clicks on controls
        if ((event2.originalEvent.target as HTMLElement).closest('.leaflet-control-container')) {
            return;
        }

        // separate polyline and polygon, so that it is rendered unclosed
        this.polyline = L.polyline([event2.latlng], this.options.polygon).addTo(this.map);
        this.polygon = L.polygon([event2.latlng], { ...this.options.polygon, weight: 0 }).addTo(this.map);

        document.body.classList.add(ACTIVE_CLASS);

        document.addEventListener('mousemove', this.onDocumentMouseMoveBound);
        document.addEventListener('mouseup', this.onDocumentMouseUpBound);
    }

    private onDocumentMouseMove(event: Event) {
        if (!this.polyline || !this.polygon) {
            return;
        }

        const event2 = event as MouseEvent;
        this.polyline.addLatLng(this.map.mouseEventToLatLng(event2));
        this.polygon.addLatLng(this.map.mouseEventToLatLng(event2));

        if (event2.buttons === 0) {
            console.warn('mouseup event was missed');
            this.finish();
        }
    }

    private onDocumentMouseUp() {
        this.finish();
    }

    private finish() {
        if (!this.polyline || !this.polygon) {
            return;
        }

        const polygon = this.polygon.toGeoJSON().geometry as GeoJSON.Polygon;
        const layers: L.Layer[] = [];
        this.map.eachLayer(layer => {
            if (layer === this.polyline || layer === this.polygon) {
                return;
            }
    
            if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                layers.push(layer);
            } else if (L.MarkerCluster && layer instanceof L.MarkerCluster) {
                layers.push(...layer.getAllChildMarkers());
            }
        });

        const selectedFeatures = getLayersInPolygon(polygon, layers, {
            zoom: this.map.getZoom(),
            crs: this.map.options.crs,
            intersect: this.options.intersect,
        });

        this.map.fire(FINISHED_EVENT, {
            latLngs: this.polygon.getLatLngs()[0],
            layers: selectedFeatures,
        } as LassoHandlerFinishedEventData);

        this.map.removeLayer(this.polyline);
        this.map.removeLayer(this.polygon);
        this.polyline = undefined;
        this.polygon = undefined;

        this.disable();
    }
}
