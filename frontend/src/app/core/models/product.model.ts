export interface Product {
  id: string;
  name: string;
  name_en: string;
  slug: string;
  description: string;
  description_en: string;
  price: number;
  image_url: string;
  gallery_json: string | null;
  category: string;
  gender: string;
  is_active: boolean;
  is_standalone: boolean;
  is_builder_item: boolean;
  is_customizable: boolean;
  stock_quantity: number;
  original_price: number | null;
  final_price: number | null;
  discount_percentage: number | null;
  customization_price: number;
  average_rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}
