# leaflet-lasso

True lasso selection plugin for Leaflet. [Demo](http://zakjan.github.io/leaflet-lasso/docs/index.html)

![screenshot](http://zakjan.github.io/leaflet-lasso/docs/screenshot.png)

## Install

```
npm install leaflet-lasso
import "leaflet-lasso"
```

or

```
<script src="https://unpkg.com/leaflet-lasso@latest/dist/leaflet-lasso.min.js"></script>
```

## Usage

```
const lasso = L.lasso(map);
lasso.enable();
map.on('lasso.finished', (event) => {
    console.log(event.layers);
});
```

Or to use it as Leaflet-Control
```
const lasso = L.control.lasso().addTo(map);
map.on('lasso.finished', (event) => {
    console.log(event.layers);
});
```

## Methods

- `enable()`
- `disable()`

## Events

- `lasso.finished`
- `lasso.enabled`
- `lasso.disabled`
