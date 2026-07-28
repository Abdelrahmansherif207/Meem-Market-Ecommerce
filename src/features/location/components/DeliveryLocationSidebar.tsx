"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";
import { useLocale } from "next-intl";
import { X, Search, ChevronLeft, Loader2, MapPin, Navigation } from "lucide-react";
import { useLocationStore } from "../store/useLocationStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { addressService } from "@/features/profile/services/addressService";
import { cn } from "@/shared/utils/cn";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const mapContainerStyle = { width: "100%", height: "100%" };

type ViewState = "search" | "map";

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

interface AutocompletePrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
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
  return (data.suggestions ?? []).map((s: any) => ({
    place_id: s.placePrediction.placeId,
    description: s.placePrediction.text.text,
    structured_formatting: {
      main_text: s.placePrediction.structuredFormat.mainText.text,
      secondary_text: s.placePrediction.structuredFormat.secondaryText.text,
    },
  }));
}

export function DeliveryLocationSidebar({ isOpen, onClose }: Props) {
  const locale = useLocale();
  const isRtl = locale === "ar";

  const userId = useAuthStore((s) => s.userId);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const deliveryCoords = useLocationStore((s) => s.deliveryCoords);
  const deliveryStreetAddress = useLocationStore((s) => s.deliveryStreetAddress);
  const browserCoords = useLocationStore((s) => s.coords);
  const setDeliveryLocation = useLocationStore((s) => s.setDeliveryLocation);

  const [view, setView] = useState<ViewState>("search");
  const [searchValue, setSearchValue] = useState("");
  const [predictions, setPredictions] = useState<AutocompletePrediction[]>([]);
  const [predictionsLoading, setPredictionsLoading] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [city, setCity] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noResults, setNoResults] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const resetForm = useCallback(() => {
    setView("search");
    setSearchValue("");
    setPredictions([]);
    setPredictionsLoading(false);
    setSelectedCoords(null);
    setCity("");
    setStreetAddress("");
    setCountry("");
    setState("");
    setZip("");
    setError(null);
    setSaving(false);
    setNoResults(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (deliveryCoords && deliveryStreetAddress) {
      setSelectedCoords(deliveryCoords);
      setStreetAddress(deliveryStreetAddress);
      setView("map");
      setError(null);
    } else {
      resetForm();
    }
  }, [isOpen, deliveryCoords, deliveryStreetAddress, resetForm]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (view !== "search" || searchValue.trim().length < 3) {
      setPredictions([]);
      setPredictionsLoading(false);
      setNoResults(false);
      return;
    }
    setPredictionsLoading(true);
    setNoResults(false);
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
  }, [searchValue, view, locale]);

  const handlePredictionSelect = useCallback(
    async (prediction: AutocompletePrediction) => {
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
          const legacyComponents = (place.addressComponents ?? []).map((c: any) => ({
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
          setView("map");
        }
      } catch {
        // silently fail
      }
    },
    [],
  );

  const handleMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
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
  }, []);

  const handleConfirm = async () => {
    if (!selectedCoords || !city.trim() || !streetAddress.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await addressService.create({
        title: "My Location",
        type: "billing",
        customer_id: userId ?? undefined,
        default: "0",
        address: {
          zip: zip.trim() || " ",
          city: city.trim(),
          state: state.trim() || " ",
          country: country.trim() || "",
          street_address: streetAddress.trim(),
        },
        location: {
          latitude: selectedCoords.lat,
          longitude: selectedCoords.lng,
        },
      });
      setDeliveryLocation(selectedCoords, streetAddress.trim(), saved.id);
      onClose();
    } catch {
      setError("Failed to save location. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const mapCenter = selectedCoords || deliveryCoords || browserCoords || { lat: 30.0444, lng: 31.2357 };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex" dir={isRtl ? "ltr" : "rtl"}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className={cn(
          "relative h-full w-full sm:w-[450px] max-w-[90vw] bg-white shadow-xl overflow-y-auto",
          "animate-in duration-300",
          isRtl ? "slide-in-from-right" : "slide-in-from-left",
        )}
        style={{ direction: isRtl ? "rtl" : "ltr" }}
      >
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-white px-4 py-3.5">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold">Add Delivery Location</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {view === "search" ? (
          <div className="p-4 space-y-4">
            <p className="text-xs text-text-secondary">
              {isRtl ? "ابحث عن منطقة أو شارع أو مبنى" : "Search for an area, street or building"}
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={isRtl ? "ابحث..." : "Search..."}
                className="w-full rounded-xl border border-border bg-surface pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              {predictionsLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-text-secondary" />
              )}
            </div>

            {predictions.length > 0 && (
              <ul className="divide-y divide-border rounded-xl border border-border bg-white overflow-hidden">
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
              <p className="text-xs text-text-secondary text-center py-4">
                {isRtl ? "لا توجد نتائج" : "No results found. Try a different search."}
              </p>
            )}

            {!isLoaded && (
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading Google Maps...
              </div>
            )}
            {loadError && (
              <p className="text-xs text-red-500">Failed to load Google Maps. Check your API key.</p>
            )}

            {deliveryCoords && (
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
                <p className="text-xs font-medium text-primary">Current Location</p>
                <p className="text-xs text-text-secondary mt-1">{deliveryStreetAddress}</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCoords(deliveryCoords);
                    setStreetAddress(deliveryStreetAddress || "");
                    setView("map");
                  }}
                  className="mt-2 text-xs font-semibold text-primary underline underline-offset-2"
                >
                  Edit on map
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <button
              type="button"
              onClick={() => setView("search")}
              className="flex items-center gap-1 text-xs font-semibold text-primary"
            >
              <ChevronLeft className={cn("h-3.5 w-3.5", isRtl && "rotate-180")} />
              {isRtl ? "العودة للبحث" : "Back to search"}
            </button>

            <div className="h-56 w-full rounded-xl overflow-hidden border border-border">
              {loadError ? (
                <div className="flex items-center justify-center h-full bg-gray-100 text-xs text-red-500 px-4 text-center">
                  Failed to load Google Maps
                </div>
              ) : !isLoaded ? (
                <div className="flex items-center justify-center h-full bg-gray-100 text-xs text-text-secondary gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading map...
                </div>
              ) : (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={mapCenter}
                  zoom={16}
                  onLoad={(map) => { mapRef.current = map; }}
                >
                  {selectedCoords && (
                    <Marker
                      position={selectedCoords}
                      draggable
                      onDragEnd={handleMarkerDragEnd}
                    />
                  )}
                </GoogleMap>
              )}
            </div>

            {selectedCoords && (
              <>
                <div className="rounded-xl bg-surface border border-border p-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                    <p className="text-xs text-text-primary leading-relaxed">{searchValue}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-text-secondary">
                      {isRtl ? "المدينة" : "City"}
                    </label>
                    <input
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-text-secondary">
                      {isRtl ? "العنوان" : "Street Address"}
                    </label>
                    <input
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-text-secondary">
                        {isRtl ? "الولاية / المحافظة" : "State"}
                      </label>
                      <input
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-text-secondary">
                        {isRtl ? "الرمز البريدي" : "Zip Code"}
                      </label>
                      <input
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {error && <p className="text-xs text-red-500">{error}</p>}

            {!isAuthenticated && (
              <p className="text-xs text-text-secondary text-center">
                {isRtl ? "يرجى تسجيل الدخول لحفظ الموقع" : "Please log in to save your location"}
              </p>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              disabled={saving || !selectedCoords || !city.trim() || !streetAddress.trim() || !isAuthenticated}
              className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving
                ? (isRtl ? "جاري الحفظ..." : "Saving...")
                : (isRtl ? "تأكيد الموقع" : "Confirm Location")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
