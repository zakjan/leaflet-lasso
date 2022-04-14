# Changelog

## 2.2.7

- pass originalEvent to finished event

## 2.2.6

- add title option

## 2.2.5

- add invalid bounds checking

## 2.2.4

- ignore Leaflet simulated events

## 2.2.3

- change button href from # to javascript:void(0), to prevent changing window location

## 2.2.2

- prioritize check for MarkerCluster

## 2.2.0

- added support for touch events

## 2.1.3

- reverted change 2.1.2, it's controversial

## 2.1.2

- improved performance for lots of complex polygons by checking `contains` first, then checking `intersects`

## 2.1.1

- improved performance for lots of complex polygons by checking the bounds first, then checking the full geometries

## 2.1.0

- switched from `terraformer` to `@terraformer/spatial` dependency -> half bundle size, thanks to @jgravois! 🎉 (60 kB -> 33 kB, 24 kB -> 14 kB minified)
- updated `leaflet` imports to not require `esModuleInterop`
- bundled TS typings with `rollup-plugin-dts`