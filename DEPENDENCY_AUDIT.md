# Dependency and bundle audit

## Web app

- Removed the unused `@hugeicons/react` and `@hugeicons/core-free-icons` packages. Replaced their only use (the dialog close glyph) with Lucide's `X`, already used throughout the app.
- The authenticated Dashboard is the heaviest route: it imports habit management, profile upload, statistics, and Supabase-backed data. It now loads via `React.lazy` when the protected route is rendered, with a `Suspense` loading state.
- `npm audit` reported 0 vulnerabilities after the dependency removal (797 dependency nodes including optional and development dependencies).

## Production build sizes

Values are Vite's minified output sizes. Initial JS excludes the lazy Dashboard chunk, which is requested when the authenticated route loads.

| Build | Initial JavaScript | Initial JS gzip | CSS | CSS gzip |
| --- | ---: | ---: | ---: | ---: |
| Before route split and dependency removal | 613.80 kB | 184.70 kB | 54.57 kB | 10.12 kB |
| After route split and dependency removal | 533.27 kB | 159.41 kB | 56.45 kB | 10.50 kB |

The Dashboard is now a deferred 80.35 kB chunk (26.52 kB gzip). That reduces the initial JavaScript by 80.53 kB minified (25.29 kB gzip), about 13%. The aggregate JavaScript across the entry and Dashboard chunks is 613.62 kB minified, so the route split changes when the Dashboard bytes are fetched rather than removing the full route from the total build. The Lucide substitution also removes the two Hugeicons packages from the dependency tree.

## Mobile app

- Expo SDK 57, NativeWind 4.2.7, Expo Router, Supabase JS, and AsyncStorage.
- `npm audit` in `mobile/` reported 0 vulnerabilities (636 dependency nodes including peer and optional dependencies) after Expo Router and Worklets setup.
- The list uses React Native `FlatList`; no DOM nodes or web globals are used by the native share callback.
