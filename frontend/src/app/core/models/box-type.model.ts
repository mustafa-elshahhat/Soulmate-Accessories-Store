export interface BoxType {
  id: string;
  name: string;
  name_en: string;
  slug: string;
  gender: string;
  base_price: number;
  image_url: string;
}

export interface BoxSlot {
  id: string;
  slot_key: string;
  label_ar: string;
  label_en: string;
  is_required: boolean;
  sort_order: number;
  filter_gender: string | null;
}

export interface SlotProduct {
  id: string;
  name: string;
  name_en: string;
  price: number;
  image_url: string;
  category: string;
  gender: string;
  is_customizable: boolean;
  customization_price: number;
}

export interface PreviewResponse {
  box_type: { id: string; name: string; name_en: string; base_price: number };
  selected_products: { slot_id: string; slot_key: string; label_ar: string; label_en: string; name: string; name_en: string; price: number }[];
  customization: Customization | null;
  customized_products: { slot_id: string; name: string; name_en: string; category: string; customization_price: number }[];
  customization_total: number;
  total_price: number;
}

export interface Customization {
  name1: string;
  name2: string;
  date: string;
  message: string;
}
