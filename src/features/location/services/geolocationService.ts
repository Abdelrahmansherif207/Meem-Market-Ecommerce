type NominatimResult = {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
};

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000,
    });
  });
}

async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<{ city: string; region: string }> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`,
    {
      headers: { "User-Agent": "MeemMarket/1.0" },
    },
  );

  if (!res.ok) throw new Error("Reverse geocoding failed");

  const data: NominatimResult = await res.json();
  const addr = data.address ?? {};
  const city = addr.city ?? addr.town ?? addr.village ?? "Unknown";
  const region = addr.state ?? "";

  return { city, region };
}

export async function requestLocation(): Promise<{
  coords: { lat: number; lng: number };
  city: string;
  region: string;
}> {
  const position = await getCurrentPosition();
  const { latitude: lat, longitude: lng } = position.coords;
  const { city, region } = await reverseGeocode(lat, lng);
  return { coords: { lat, lng }, city, region };
}
