# WA Fuel Info

A web application to visualizes Western Australia fuel prices from the [FuelWatch](https://www.fuelwatch.wa.gov.au) API. The live site is hosted at [wa-fuel-info.com](https://wa-fuel-info.com).

The app aggregates historical fuel price snapshots and presents them through dashboards, charts, maps, and tables. It tracks seven fuel types: ULP, PUP, 98R, DSL, BDL, E85, and LPG.

Importantly, it show trend information about fuel outages at service stations (i.e. where there is no fuel).

## What You See When It Runs

When you start the app, it loads fuel data from bundled JSON snapshots and opens a tabbed interface with six views:

### Dashboard (`/dashboard`)

- Summary stat cards: station count, fuel types, days of data, and brands
- Cheapest and most expensive ULP prices
- Outage summary card
- Price summary table by fuel type
- Bar chart of average prices across fuel types

### Trends (`/trends`)

- Fuel type filter pills
- Multi-line area chart showing daily average, minimum, and maximum prices over ~30 days
- Per-fuel summary cards with period-over-period change

### Map (`/map`)

- Leaflet map centered on Perth
- Color-coded station markers (green / yellow / red by price)
- Popups with today and tomorrow prices
- Fuel type filter

### Stations (`/stations`)

- Searchable, sortable, paginated table of all stations (25 per page)
- Fuel and brand filters
- Today and tomorrow price columns
- Card layout on mobile

### Outages (`/outages`)

- List of temporarily unavailable stations
- Orange map markers for affected locations
- "All clear" state when no outages are reported

### Outage Trends (`/outage-trends`)

- Line chart of daily outage counts by fuel type
- Interactive map synced to the hovered or selected date
- Summary cards

### Additional UX

- Dark and light mode toggle (persisted in local storage)
- Responsive layout with a bottom tab bar on mobile
- Prices shown in cents per litre (¢/L)
- Dates displayed in Perth / AWST timezone
- Header shows the last data update time; footer includes FuelWatch attribution and disclaimer

## Tech Stack

- **React 19** with **TypeScript**
- **Vite 8** for build and dev server
- **Tailwind CSS 4** for styling
- **React Router 7** for routing
- **Zustand** for state management
- **Recharts** for charts
- **Leaflet** / **react-leaflet** for maps
- **TanStack React Table** for the station table
- **GitHub Pages** for hosting

## Getting Started

All commands run from the `app/` directory:

```bash
cd app
npm ci
npm run dev
```

The dev server starts at [http://localhost:5173](http://localhost:5173). The repository ships with ~30 days of data in `app/public/data/`, so no API fetch is required to run locally.

Other scripts:

```bash
npm run build      # TypeScript check + production build
npm run preview    # Preview the production build locally
npm run fetch-data # Fetch fresh FuelWatch data into public/data/
```

## Data Pipeline

Fuel price data is not fetched live in the browser. Instead:

1. A GitHub Actions workflow runs four times daily and calls the FuelWatch API
2. Responses are normalized into JSON snapshots in `app/public/data/`
3. A `manifest.json` index tracks available files and content hashes
4. The browser loads the manifest, fetches data files, caches them in IndexedDB, and renders through a Zustand store.

Pushes to `master` trigger a separate workflow that builds and deploys the site to GitHub Pages.

## License and Attribution

Fuel price data is sourced from [FuelWatch](https://www.fuelwatch.wa.gov.au), Department of Energy, Mines, Industry Regulation and Safety, Government of Western Australia. Data has been adapted and reformatted from the original source and is licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).

This application is not affiliated with or endorsed by the Government of Western Australia or FuelWatch. Fuel prices shown are for informational purposes only and may not reflect current prices at the pump.
