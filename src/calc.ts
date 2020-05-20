import L from 'leaflet';
import * as GeoJSON from 'geojson';
import { toCircle, contains, intersects } from '@terraformer/spatial';

function getCircleMarkerRadius(circleMarker: L.CircleMarker, crs: L.CRS, zoom: number) {
    const latLng = circleMarker.getLatLng();
    const point = crs.latLngToPoint(latLng, zoom);
    const delta = circleMarker.getRadius() / Math.SQRT2;
    const topLeftPoint = L.point([point.x - delta, point.y - delta]);
    const topLeftLatLng = crs.pointToLatLng(topLeftPoint, zoom);
    const radius = crs.distance(latLng, topLeftLatLng);
    return radius;
}

function circleToGeoJSONGeometry(latLng: L.LatLng, radius: number) {
    return toCircle(L.GeoJSON.latLngToCoords(latLng), radius).geometry;
}

function layerToGeoJSONGeometry(layer: L.Layer, options: { zoom?: number, crs?: L.CRS } = {}) {
    if (layer instanceof L.Circle) {
        const latLng = layer.getLatLng();
        const radius = layer.getRadius();
        return circleToGeoJSONGeometry(latLng, radius);
    } else if (layer instanceof L.CircleMarker) {
        if (options.zoom != undefined && options.crs != undefined) {
            const latLng = layer.getLatLng();
            const radius = getCircleMarkerRadius(layer, options.crs, options.zoom);
            return circleToGeoJSONGeometry(latLng, radius);
        } else {
            console.warn("Zoom and CRS is required for calculating CircleMarker polygon, falling back to center point only");
            return layer.toGeoJSON().geometry;
        }
    } else if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        return layer.toGeoJSON().geometry;
    }
}

function polygonContains(polygon: GeoJSON.Polygon, layerGeometry: GeoJSON.GeometryObject) {
    return contains(polygon, layerGeometry);
}

function polygonIntersects(polygon: GeoJSON.Polygon, layerGeometry: GeoJSON.GeometryObject) {
    return layerGeometry.type === "Point" ?
        contains(polygon, layerGeometry) :
        intersects(polygon, layerGeometry);
}

export function getLayersInPolygon(polygon: GeoJSON.Polygon, layers: L.Layer[], options: { zoom?: number, crs?: L.CRS, intersect?: boolean } = {}) {
    const selectedLayers = layers.filter(layer => {
        const layerGeometry = layerToGeoJSONGeometry(layer, options);
        if (!layerGeometry) {
            return false;
        }

        return options.intersect ?
            polygonIntersects(polygon, layerGeometry) :
            polygonContains(polygon, layerGeometry);
    });
    
    return selectedLayers;
}