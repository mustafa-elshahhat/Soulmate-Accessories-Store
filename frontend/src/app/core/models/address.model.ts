export interface Address {
  id: string;
  label: string;
  governorate_id: string;
  governorate_name: string;
  governorate_name_en: string;
  shipping_cost: number;
  city: string;
  district: string;
  street: string;
  building: string;
  floor: string;
  apartment: string | null;
  phone: string;
  lat: number;
  lng: number;
  is_default: boolean;
}

export interface CreateAddressDto {
  label: string;
  governorate_id: string;
  city: string;
  district: string;
  street: string;
  building: string;
  floor: string;
  apartment?: string;
  phone: string;
  lat?: number;
  lng?: number;
  is_default: boolean;
}
