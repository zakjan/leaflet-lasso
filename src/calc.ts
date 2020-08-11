import * as L from 'leaflet';
import * as GeoJSON from 'geojson';
import { calculateBounds, toCircle, contains, intersects } from '@terraformer/spatial';

function geoJSONGeometryToBounds(geometry: GeoJSON.GeometryObject) {
    const bounds = calculateBounds(geometry);
    const leafletBounds = L.latLngBounds([bounds[1], bounds[0]], [bounds[3], bounds[2]]);
    return leafletBounds;
}

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

export function getLayersInPolygon(polygon: L.Polygon, layers: L.Layer[], options: { zoom?: number, crs?: L.CRS, intersect?: boolean } = {}) {
    const polygonGeometry = polygon.toGeoJSON().geometry as GeoJSON.Polygon;
    const polygonBounds = polygon.getBounds();

    const selectedLayers = layers.filter(layer => {
        // check bounds first (fast)
        let layerGeometry;
        let layerBounds;
        if (layer instanceof L.Polyline) {
            layerBounds = layer.getBounds();
        } else {
            layerGeometry = layerToGeoJSONGeometry(layer, options);
            layerBounds = geoJSONGeometryToBounds(layerGeometry);
        }

        const boundsResult = options.intersect ?
            polygonBounds.intersects(layerBounds) :
            polygonBounds.contains(layerBounds);
        if (!boundsResult) {
            return false;
        }

        // check full geometry (slow)
        if (!layerGeometry) {
            layerGeometry = layerToGeoJSONGeometry(layer, options);
        }

        const geometryResult = options.intersect ?
            polygonIntersects(polygonGeometry, layerGeometry) :
            polygonContains(polygonGeometry, layerGeometry);
        return geometryResult;
    });
    
    return selectedLayers;
}