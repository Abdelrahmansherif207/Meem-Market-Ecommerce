# Location Access Feature

Asks the user for browser location permission, reverse-geocodes the coordinates to a city/region name via OpenStreetMap, and displays it next to the logo in the header.

## Architecture

```
src/features/location/
  index.ts                          # Public exports
  store/useLocationStore.ts         # Zustand store (persisted to localStorage)
  services/geolocationService.ts    # Geolocation API + reverse geocoding
  components/LocationDisplay.tsx    # UI component shown next to logo
```

## Flow

1. **On mount** — `LocationDisplay` checks the store for existing `coords`.
2. **If not stored** — calls `navigator.geolocation.getCurrentPosition()`.
3. **If permission granted** — sends lat/lng to Nominatim reverse geocoding API (free, no key).
4. **Store result** — `{ coords, city, region }` saved to zustand + localStorage.
5. **Display** — Shows `📍 Maadi-Cairo` beside the logo.
6. **If denied / error** — sets `permissionDenied = true`, renders nothing.

## Store (`useLocationStore`)

| Field | Type | Persisted | Description |
|-------|------|-----------|-------------|
| `coords` | `{ lat, lng } \| null` | Yes | Raw coordinates |
| `city` | `string \| null` | Yes | City/town/village name |
| `region` | `string \| null` | Yes | Region/state name |
| `loading` | `boolean` | No | Whether geolocation is in progress |
| `permissionDenied` | `boolean` | No | Whether user denied permission |

Actions: `setLocation()`, `setLoading()`, `setPermissionDenied()`, `clearLocation()`

Persisted via zustand `persist` middleware under the `location-store` key in localStorage.

## Integration

- `LocationDisplay` is imported and rendered in `src/features/navigation/components/header/MainNav.tsx` directly after the `<Logo />` component.
- Translations live under `header.location` in `messages/en.json` / `messages/ar.json`.

## Usage

```tsx
import { LocationDisplay } from "@/features/location";

<LocationDisplay />
```

To access the stored location elsewhere:

```tsx
const city = useLocationStore((s) => s.city);
const region = useLocationStore((s) => s.region);
const coords = useLocationStore((s) => s.coords);
```
