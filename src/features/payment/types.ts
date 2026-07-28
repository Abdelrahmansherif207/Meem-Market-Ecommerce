export interface Address {
  city: string;
  state: string;
  country: string;
  street_address: string;
}

export interface CheckoutRequest {
  name: string;
  user_phone: string;
  user_email: string;
  address: Address;
  notes?: string;
}

export interface CheckoutResponse {
  url: string;
}

export interface CheckoutFormData {
  name: string;
  user_phone: string;
  user_email: string;
  city: string;
  state: string;
  country: string;
  street_address: string;
  notes: string;
}
