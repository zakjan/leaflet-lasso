import L from 'leaflet';
import Terraformer from 'terraformer';
import circleToPolygon from 'circle-to-polygon';

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
    // Terraformer result is incorrect, see https://github.com/Esri/terraformer/issues/321
    // return new Terraformer.Circle(L.GeoJSON.latLngToCoords(latLng), radius).geometry;

    return circleToPolygon(L.GeoJSON.latLngToCoords(latLng), radius);
}

function polygonContains(polygon: GeoJSON.Polygon, layerGeometry: GeoJSON.GeometryObject) {
    const polygonTerraformerGeometry = new Terraformer.Primitive(polygon);
    return polygonTerraformerGeometry.contains(layerGeometry);
}

function polygonIntersects(polygon: GeoJSON.Polygon, layerGeometry: GeoJSON.GeometryObject) {
    const polygonTerraformerGeometry = new Terraformer.Primitive(polygon);
    return layerGeometry.type === "Point" ?
        polygonTerraformerGeometry.contains(layerGeometry) :
        polygonTerraformerGeometry.intersects(layerGeometry);
}

export function getLayersInPolygon(polygon: GeoJSON.Polygon, layers: L.Layer[], options: { zoom?: number, crs?: L.CRS, intersect?: boolean } = {}) {
    const selectedLayers = layers.filter(layer => {
        let layerGeometry: GeoJSON.GeometryObject;

        if (layer instanceof L.Circle) {
            const latLng = layer.getLatLng();
            const radius = layer.getRadius();
            layerGeometry = circleToGeoJSONGeometry(latLng, radius);
        } else if (layer instanceof L.CircleMarker) {
            if (options.zoom != undefined && options.crs != undefined) {
                const latLng = layer.getLatLng();
                const radius = getCircleMarkerRadius(layer, options.crs, options.zoom);
                layerGeometry = circleToGeoJSONGeometry(latLng, radius);
            } else {
                console.warn("Zoom and CRS is required for calculating CircleMarker polygon, falling back to center point only");
                layerGeometry = layer.toGeoJSON().geometry;
            }
        } else if (layer instanceof L.Marker || layer instanceof L.Polyline) {
            layerGeometry = layer.toGeoJSON().geometry;
        } else {
            return false;
        }

        return options.intersect ?
            polygonIntersects(polygon, layerGeometry) :
            polygonContains(polygon, layerGeometry);
    });
    
    return selectedLayers;
}