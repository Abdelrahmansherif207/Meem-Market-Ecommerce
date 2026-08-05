"use client";

import { useEffect, useRef, useState } from "react";
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";
import { useLocale, useTranslations } from "next-intl";
import { Search, Loader2, MapPin, Navigation } from "lucide-react";
import type { PickedAddress } from "../types";

const CAIRO_CENTER = { lat: 30.0444, lng: 31.2357 };
const mapContainerStyle = { width: "100%", height: "100%" };

interface AutocompletePrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

interface PlaceSuggestion {
  placePrediction: {
    placeId: string;
    text: { text: string };
    structuredFormat: {
      mainText: { text: string };
      secondaryText: { text: string };
    };
  };
}

interface PlaceAddressComponent {
  longText: string;
  shortText: string;
  types: string[];
}

interface MapPickerProps {
  initialValue?: PickedAddress | null;
  defaultCenter?: { lat: number; lng: number } | null;
  currentLocation?: { coords: { lat: number; lng: number }; streetAddress: string } | null;
  saving?: boolean;
  confirmDisabled?: boolean;
  confirmDisabledHint?: string;
  error?: string | null;
  onConfirm: (picked: PickedAddress) => void;
}

function extractAddressComponents(
  addressComponents: google.maps.GeocoderAddressComponent[] | undefined,
) {
  let street = "";
  let city = "";
  let country = "";
  let state = "";
  let zip = "";
  for (const comp of addressComponents ?? []) {
    if (comp.types.includes("route") && !street) street = comp.long_name;
    if (comp.types.includes("street_number")) street = `${comp.long_name} ${street}`.trim();
    if (comp.types.includes("locality")) city = comp.long_name;
    if (comp.types.includes("administrative_area_level_1")) state = comp.long_name;
    if (comp.types.includes("country")) country = comp.long_name;
    if (comp.types.includes("postal_code")) zip = comp.long_name;
    if (comp.types.includes("sublocality") && !street) street = comp.long_name;
    if (comp.types.includes("premise") && !street) street = comp.long_name;
  }
  if (!city && state) city = state;
  return { street, city, country, state, zip };
}

async function fetchPredictions(input: string, languageCode: string): Promise<AutocompletePrediction[]> {
  const response = await fetch(
    "https://places.googleapis.com/v1/places:autocomplete",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      },
      body: JSON.stringify({ input, languageCode }),
    },
  );
  if (!response.ok) return [];
  const data = await response.json();
  return (data.suggestions ?? []).map((s: PlaceSuggestion) => ({
    place_id: s.placePrediction.placeId,
    description: s.placePrediction.text.text,
    structured_formatting: {
      main_text: s.placePrediction.structuredFormat.mainText.text,
      secondary_text: s.placePrediction.structuredFormat.secondaryText.text,
    },
  }));
}

export function MapPicker({
  initialValue,
  defaultCenter,
  currentLocation,
  saving,
  confirmDisabled,
  confirmDisabledHint,
  error,
  onConfirm,
}: MapPickerProps) {
  const t = useTranslations("locationPicker");
  const locale = useLocale();

  const [searchValue, setSearchValue] = useState(() => initialValue?.formattedAddress ?? "");
  const [title, setTitle] = useState(() => initialValue?.title ?? "");
  const [predictions, setPredictions] = useState<AutocompletePrediction[]>([]);
  const [predictionsLoading, setPredictionsLoading] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>(
    () => initialValue?.coords ?? defaultCenter ?? CAIRO_CENTER,
  );
  const [city, setCity] = useState(() => initialValue?.city ?? "");
  const [streetAddress, setStreetAddress] = useState(() => initialValue?.streetAddress ?? "");
  const [country, setCountry] = useState(() => initialValue?.country ?? "");
  const [state, setState] = useState(() => initialValue?.state ?? "");
  const [zip, setZip] = useState(() => initialValue?.zip ?? "");
  const [noResults, setNoResults] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (searchValue.trim().length < 3) return;
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await fetchPredictions(searchValue.trim(), locale === "ar" ? "ar" : "en");
        setPredictions(results);
        setNoResults(results.length === 0);
      } catch {
        setPredictions([]);
        setNoResults(true);
      } finally {
        setPredictionsLoading(false);
      }
    }, 400);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchValue, locale]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setPredictions([]);
    setNoResults(false);
    setPredictionsLoading(value.trim().length >= 3);
  };

  const reverseGeocode = (lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        const place = results[0];
        const addr = extractAddressComponents(place.address_components);
        setCity(addr.city);
        setState(addr.state);
        setZip(addr.zip);
        setStreetAddress(addr.street || place.formatted_address?.split(",")[0]?.trim() || "");
        setCountry(addr.country);
        setSearchValue(place.formatted_address || "");
      }
    });
  };

  const handlePredictionSelect = async (prediction: AutocompletePrediction) => {
    setPredictions([]);
    setPredictionsLoading(false);
    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${prediction.place_id}`,
        {
          headers: {
            "X-Goog-Api-Key": process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
            "X-Goog-FieldMask": "formattedAddress,addressComponents,location",
          },
        },
      );
      if (!response.ok) return;
      const place = await response.json();
      if (place?.location) {
        const lat = place.location.latitude;
        const lng = place.location.longitude;
        setSelectedCoords({ lat, lng });
        const legacyComponents = (place.addressComponents ?? []).map((c: PlaceAddressComponent) => ({
          long_name: c.longText,
          short_name: c.shortText,
          types: c.types,
        }));
        const addr = extractAddressComponents(legacyComponents);
        setCity(addr.city);
        setState(addr.state);
        setZip(addr.zip);
        setStreetAddress(addr.street || place.formattedAddress?.split(",")[0]?.trim() || "");
        setCountry(addr.country);
        setSearchValue(place.formattedAddress || prediction.description);
      }
    } catch {
      // silently fail
    }
  };

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    reverseGeocode(e.latLng.lat(), e.latLng.lng());
  };

  const hasPicked = city.trim().length > 0 && streetAddress.trim().length > 0;

  const handleConfirm = () => {
    if (!hasPicked) return;
    if (confirmDisabled) return;
    onConfirm({
      title: title.trim(),
      coords: selectedCoords,
      formattedAddress: searchValue.trim(),
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      zip: zip.trim(),
      streetAddress: streetAddress.trim(),
    });
  };

  return (
    <div className="p-4 space-y-4">
      {currentLocation && (
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
          <p className="text-xs font-medium text-primary">{t("currentLocation")}</p>
          <p className="text-xs text-text-secondary mt-1">{currentLocation.streetAddress}</p>
          <button
            type="button"
            onClick={() => reverseGeocode(currentLocation.coords.lat, currentLocation.coords.lng)}
            className="mt-2 text-xs font-semibold text-primary underline underline-offset-2"
          >
            {t("editOnMap")}
          </button>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-xl border border-border bg-surface pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
          value={searchValue}
          onChange={handleSearchChange}
        />
        {predictionsLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-text-secondary" />
        )}
      </div>

      {predictions.length > 0 && (
        <ul className="divide-y divide-border rounded-xl border border-border bg-white overflow-hidden max-h-56 overflow-y-auto">
          {predictions.map((p) => (
            <li key={p.place_id}>
              <button
                type="button"
                className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-surface transition-colors"
                onClick={() => handlePredictionSelect(p)}
              >
                <Navigation className="h-4 w-4 shrink-0 mt-0.5 text-text-secondary" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {p.structured_formatting?.main_text || p.description.split(",")[0]}
                  </p>
                  <p className="text-xs text-text-secondary truncate">
                    {p.structured_formatting?.secondary_text ||
                      p.description.split(",").slice(1).join(",").trim()}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {noResults && searchValue.trim().length >= 3 && !predictionsLoading && (
        <p className="text-xs text-text-secondary text-center py-2">{t("noResults")}</p>
      )}

      <div className="h-[38vh] sm:h-64 lg:h-72 w-full rounded-xl overflow-hidden border border-border">
        {loadError ? (
          <div className="flex items-center justify-center h-full bg-gray-100 text-xs text-red-500 px-4 text-center">
            {t("mapsLoadFailed")}
          </div>
        ) : !isLoaded ? (
          <div className="flex items-center justify-center h-full bg-gray-100 text-xs text-text-secondary gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            {t("loading")}
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={selectedCoords}
            zoom={16}
          >
            <Marker position={selectedCoords} draggable onDragEnd={handleMarkerDragEnd} />
          </GoogleMap>
        )}
      </div>

      <div className="rounded-xl bg-surface border border-border p-3">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
          <p className="text-xs text-text-primary leading-relaxed">
            {searchValue.trim() ? searchValue : t("mapHint")}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-secondary">{t("addressTitle")}</label>
          <input
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("addressTitlePlaceholder")}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-secondary">{t("city")}</label>
          <input
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-secondary">{t("streetAddress")}</label>
          <input
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-secondary">{t("state")}</label>
            <input
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-secondary">{t("zip")}</label>
            <input
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {confirmDisabled && confirmDisabledHint && (
        <p className="text-xs text-text-secondary text-center">{confirmDisabledHint}</p>
      )}

      <button
        type="button"
        onClick={handleConfirm}
        disabled={saving || confirmDisabled || !hasPicked}
        className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {saving ? t("saving") : t("confirm")}
      </button>
    </div>
  );
}
