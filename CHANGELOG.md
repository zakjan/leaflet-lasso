# Changelog

## 2.1.0

- switched from `terraform` to `@terraform/spatial` dependency -> half bundle size, thanks to @jgravois! 🎉 (60 kB -> 33 kB, 24 kB -> 14 kB minified)
- updated `leaflet` imports to not require `esModuleInterop`
- bundled TS typings with `rollup-plugin-dts`