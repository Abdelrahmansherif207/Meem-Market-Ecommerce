export interface WorkingHour {
  day: string;
  open: string;
  close: string;
}

export interface PickupLocation {
  id: number;
  store_name: string;
  address: string;
  phone: string;
  email: string;
  latitude: string;
  longitude: string;
  working_hours: WorkingHour[];
  status: boolean;
  display_order: number;
}
