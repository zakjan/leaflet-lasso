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

### Control

```
L.control.lasso().addTo(map);
```

### Control in intersect mode

```
L.control.lasso({ intersect: true }).addTo(map);
```

### Finished event

```
map.on('lasso.finished', event => {
    console.log(event.layers);
});
```

### Handler

```
const lasso = L.lasso(map);
yourCustomButton.addEventListener('click', () => {
    lasso.enable();
});
```

## Thanks

Icon by @Falke-Design
