# leaflet-lasso

True lasso selection plugin for Leaflet. [Demo](http://zakjan.github.io/leaflet-lasso/)

<img src="docs/screenshot@2x.jpg" alt="Screenshot" width="640" height="320">

Supports all Leaflet vector layers:

- Marker
- CircleMarker
- Circle
- Polyline
- Polyline with multiple segments
- Rectangle
- Polygon
- Polygon with hole
- Polygon with multiple segments
- Polygon with multiple segments and holes

Selection modes:

- contain - entire shape must be in lasso polygon (default)
- intersect - any part of shape can be in lasso polygon

## Install

```
npm install leaflet-lasso
import "leaflet-lasso"
```

or

```
<script src="https://unpkg.com/leaflet-lasso@2.0.4/dist/leaflet-lasso.umd.min.js"></script>
```

## Usage

For detailed API, please see exported TypeScript typings.

### Handler

Use for custom activation.

```
interface LassoHandlerOptions {
    polygon?: L.PolylineOptions,
    intersect?: boolean;
}
```

```
const lasso = L.lasso(map, options);
yourCustomButton.addEventListener('click', () => {
    lasso.enable();
});
```

### Control

Use for default control.

```
type LassoControlOptions = LassoHandlerOptions & L.ControlOptions;
```

```
L.control.lasso(options).addTo(map);
```


Display a message with:
```
lassoControl.showMsg('Your msg');
```

On mobile devices the message "**Click the Button to finish**" shows, because they have to click the control to finish the lasso.
if the option mobileMsg is "", nothing is showing. Or you can replace it with your custom text.
```
L.control.lasso({mobileMsg: 'Your mobile text'}).addTo(map);
```


### Available options:
* **position**: ['topleft','topright','bottomleft','bottomright']
* **title**: 'Your Hover title'
* **polygon**: Leaflet polygon style options [www.leaflet.js](https://leafletjs.com/reference-1.5.0.html#polygon)
* **intersect**: Boolean
* **mobileMsg**: 'Your mobile decive button message' // "" > Empty string disables the message


### Finished event

Listen for this event to receive matching Leaflet layers.

```
interface LassoHandlerFinishedEventData {
    latLngs: L.LatLng[];
    layers: L.Layer[];
}
```

```
map.on('lasso.finished', (event: LassoHandlerFinishedEventData) => {
    console.log(event.layers);
});
```

### Other events

```
map.on('lasso.enabled',function);
```
```
map.on('lasso.disabled',function);
```


## Thanks

Icon by @Falke-Design
