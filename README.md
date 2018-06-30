# leaflet-lasso

True lasso selection plugin for Leaflet. [Demo](http://zakjan.github.io/leaflet-lasso/docs/index.html)

![screenshot](http://zakjan.github.io/leaflet-lasso/docs/screenshot.png)

## Install

- `npm install leaflet-lasso`
- `import "leaflet-lasso"`

or

- `<script src="http://unpkg.com/leaflet-lasso@latest/dist/leaflet-lasso.min.js"></script>`

## Usage

```
const lasso = L.lasso(map);
lasso.enable();
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

## TODO

- support markers hidden by L.MarkerClusterGroup
- support also other layer types, not just markers (with @turf/intersect)
- add L.Control