# Changelog

## 2.2.13

- update dependencies

## 2.2.12

- update dependencies, @terraformer/spatial 2.1.2 fixes #51

## 2.2.11

- revert changes in 2.2.9 - 2.2.10
- handle unknown layers gracefully

## 2.2.10

- call getBounds for all layers where available

## 2.2.9

- call getBounds for all layers where available

## 2.2.8

- stop mouse event propagation

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