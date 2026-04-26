export interface DashboardStats {
  total_orders: number;
  pending_orders: number;
  payment_review: number;
  total_revenue: number;
  total_products: number;
  total_users: number;
}

export interface AdminOrder {
  id: string;
  order_number: string;
  status: string;
  total_price: number;
  shipping_cost: number;
  customer_name: string;
  customer_email: string;
  items_count: number;
  created_at: string;
}

export interface AdminOrderDetail {
  id: string;
  order_number: string;
  status: string;
  total_price: number;
  shipping_cost: number;
  cancel_reason: string | null;
  admin_note: string | null;
  created_at: string;
  customer: { name: string; email: string; phone: string };
  address: { label: string; governorate_name: string; governorate_name_en: string; city: string; district: string; street: string; building: string; floor: string; phone: string; lat: number; lng: number } | null;
  items: {
    id: string; product_id: string | null; box_type_id: string | null;
    product_name: string | null; product_name_en: string | null; product_image_url: string | null; box_type_name: string | null; box_type_name_en: string | null;
    quantity: number; unit_price: number; custom_data_json: string;
    slot_products?: { slot_label: string; slot_label_en: string; product_name: string; product_name_en: string; product_image_url: string; product_price: number; is_customized: boolean; customization_price: number }[];
  }[];
  payments: { id: string; method: string; screenshot_url: string; status: string; admin_note: string | null; attempt_number: number; created_at: string }[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_locked: boolean;
  created_at: string;
}

export interface AnalyticsData {
  last_30_days: { revenue: number; order_count: number; avg_order_value: number };
  today_orders: number;
  pending_payments: number;
  status_breakdown: { status: string; count: number }[];
  top_products: { name: string; name_en: string; sales_count: number }[];
}

export interface AdminBoxType {
  id: string;
  name: string;
  name_en: string;
  slug: string;
  gender: string;
  base_price: number;
  image_url: string;
  is_active: boolean;
  slots_count: number;
  created_at: string;
}

export interface AdminBoxTypeDetail {
  id: string;
  name: string;
  name_en: string;
  slug: string;
  gender: string;
  base_price: number;
  image_url: string;
  is_active: boolean;
  slots: { id: string; slot_key: string; label_ar: string; label_en: string; is_required: boolean; sort_order: number; filter_gender: string | null }[];
}
