export interface Review {
  id: string;
  user_id: string;
  user_name: string;
  product_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface ProductReviewsSummary {
  average_rating: number;
  total_reviews: number;
  reviews: Review[];
}

export interface CreateReviewRequest {
  product_id: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewRequest {
  rating: number;
  comment?: string;
}
