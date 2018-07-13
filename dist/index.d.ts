declare module 'leaflet' {
    interface LassoOptions {
        polygon?: PolylineOptions;
        cursor?: string;
    }
    interface LassoFinishedEvent extends LeafletEvent {
        latLngs: LatLng[];
        layers: Layer[];
    }
    class Lasso extends Handler {
        constructor(map: Map, options?: LassoOptions);
    }
    const lasso: (map: Map, options?: LassoOptions) => Lasso;
}
export {};
