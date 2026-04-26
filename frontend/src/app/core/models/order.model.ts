export interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  total_price: number;
  shipping_cost: number;
  coupon_code: string | null;
  discount_amount: number;
  cancel_reason: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  shipping_address: OrderAddress | null;
  payment: OrderPayment | null;
}

export interface OrderItem {
  id: string;
  product_id: string | null;
  box_type_id: string | null;
  quantity: number;
  unit_price: number;
  custom_data_json: string;
  product_name: string | null;
  product_name_en: string | null;
}

export interface OrderAddress {
  label: string;
  governorate_name: string;
  governorate_name_en: string;
  city: string;
  district: string;
  street: string;
  building: string;
  floor: string;
  apartment: string | null;
  phone: string;
  lat: number;
  lng: number;
}

export interface OrderPayment {
  status: string;
  method: string;
  screenshot_url: string | null;
}

export type OrderStatus =
  | 'pending'
  | 'payment_review'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';
