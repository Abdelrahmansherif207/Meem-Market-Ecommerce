export interface PickedAddress {
  title: string;
  coords: { lat: number; lng: number };
  formattedAddress: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  streetAddress: string;
}
