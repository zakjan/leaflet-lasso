# Changelog

## 2.1.1

- improved performance for lots of complex polygons by checking the bounds first, then checking the full geometries

## 2.1.0

- switched from `terraformer` to `@terraformer/spatial` dependency -> half bundle size, thanks to @jgravois! 🎉 (60 kB -> 33 kB, 24 kB -> 14 kB minified)
- updated `leaflet` imports to not require `esModuleInterop`
- bundled TS typings with `rollup-plugin-dts`