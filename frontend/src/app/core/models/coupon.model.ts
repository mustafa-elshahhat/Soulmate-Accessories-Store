export type DiscountType = 'percentage' | 'fixed';

export interface CouponValidationResult {
  valid: boolean;
  error_code: string | null;
  error_message: string | null;
  discount_amount: number;
  code: string;
  discount_type: DiscountType | null;
  value: number | null;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  value: number;
  max_uses: number;
  used_count: number;
  expiration_date: string;
  is_active: boolean;
  min_order_amount: number | null;
  created_at: string;
}

export interface Promotion {
  id: string;
  name: string;
  name_en: string;
  discount_type: DiscountType;
  value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  product_id: string | null;
  product_name: string | null;
  category: string | null;
  created_at: string;
}
