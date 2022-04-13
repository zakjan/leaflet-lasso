import * as L from 'leaflet';
import { LassoPolygon } from './lasso-polygon';
import { getLayersInPolygon } from './calc';
import './lasso-handler.css';

export interface LassoHandlerOptions {
    polygon?: L.PolylineOptions,
    intersect?: boolean;
}

interface LassoHandlerFinishedEventData {
    originalEvent: MouseEvent;
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

    private polygon?: LassoPolygon;

    private onMapMouseDownBound = this.onMapMouseDown.bind(this);
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
        this.map.getContainer().addEventListener('mousedown', this.onMapMouseDownBound);
        this.map.getContainer().addEventListener('touchstart', this.onMapMouseDownBound);
        
        const mapContainer = this.map.getContainer();
        mapContainer.classList.add(ACTIVE_CLASS);

        this.map.dragging.disable();
        this.map.fire(ENABLED_EVENT);
    }

    removeHooks() {
        if (this.polygon) {
            this.map.removeLayer(this.polygon);
            this.polygon = undefined;
        }

        this.map.getContainer().removeEventListener('mousedown', this.onMapMouseDownBound);
        this.map.getContainer().removeEventListener('touchstart', this.onMapMouseDownBound);
        document.removeEventListener('mousemove', this.onDocumentMouseMoveBound);
        document.removeEventListener('touchmove', this.onDocumentMouseMoveBound);
        document.removeEventListener('mouseup', this.onDocumentMouseUpBound);
        document.removeEventListener('touchend', this.onDocumentMouseUpBound);

        this.map.getContainer().classList.remove(ACTIVE_CLASS);
        document.body.classList.remove(ACTIVE_CLASS);

        this.map.dragging.enable();
        this.map.fire(DISABLED_EVENT);
    }

    private onMapMouseDown(event: Event) {
        let event2 = this.eventToMouseEvent('down', event);
        if (!event2) {
            return;
        }

        // activate lasso only for left mouse button click
        if (event instanceof MouseEvent && !(event as any)._simulated && event.buttons !== 1) {
            this.disable();
            return;
        }

        // skip clicks on controls
        if ((event.target as HTMLElement).closest('.leaflet-control-container')) {
            return;
        }

        const latLng = this.map.mouseEventToLatLng(event2);
        this.polygon = new LassoPolygon([latLng], this.options.polygon).addTo(this.map);

        document.body.classList.add(ACTIVE_CLASS);

        document.addEventListener('mousemove', this.onDocumentMouseMoveBound);
        document.addEventListener('touchmove', this.onDocumentMouseMoveBound);
        document.addEventListener('mouseup', this.onDocumentMouseUpBound);
        document.addEventListener('touchend', this.onDocumentMouseUpBound);

        event.preventDefault();
    }

    private onDocumentMouseMove(event: Event) {
        let event2 = this.eventToMouseEvent('move', event);
        if (!event2) {
            return;
        }

        if (!this.polygon) {
            return;
        }

        // keep lasso active only if left mouse button is hold
        if (event instanceof MouseEvent && !(event as any)._simulated && event.buttons !== 1) {
            console.warn('mouseup event was missed');
            this.finish(event);
            return;
        }

        const latLng = this.map.mouseEventToLatLng(event2);
        this.polygon.addLatLng(latLng);

        event.preventDefault();
    }

    private onDocumentMouseUp(event: MouseEvent | TouchEvent) {
        this.finish(event);

        event.preventDefault();
    }

    private eventToMouseEvent(type: string, event: Event) {
        if (event instanceof MouseEvent) {
            return event;
        }
        if (event instanceof TouchEvent && event.touches.length === 1) {
            return new MouseEvent(type, {
                screenX: event.touches[0].screenX,
                screenY: event.touches[0].screenY,
                clientX: event.touches[0].clientX,
                clientY: event.touches[0].clientY,
                buttons: 1,
            });
        }
    }

    private finish(event: MouseEvent | TouchEvent) {
        if (!this.polygon) {
            return;
        }

        const layers: L.Layer[] = [];
        this.map.eachLayer(layer => {
            if (layer === this.polygon || layer === this.polygon!.polyline || layer === this.polygon!.polygon) {
                return;
            }

            if (L.MarkerCluster && layer instanceof L.MarkerCluster) {
                layers.push(...layer.getAllChildMarkers());
            } else if (layer instanceof L.Marker || layer instanceof L.Path) {
                layers.push(layer);
            }
        });

        const selectedFeatures = getLayersInPolygon(this.polygon.polygon, layers, {
            zoom: this.map.getZoom(),
            crs: this.map.options.crs,
            intersect: this.options.intersect,
        });

        this.map.fire(FINISHED_EVENT, {
            originalEvent: event,
            latLngs: this.polygon.getLatLngs(),
            layers: selectedFeatures,
        } as LassoHandlerFinishedEventData);

        this.disable();
    }
}
