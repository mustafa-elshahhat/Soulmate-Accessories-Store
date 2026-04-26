export interface BoxReview {
  id: string;
  user_id: string;
  user_name: string;
  box_type_id: string;
  order_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface BoxReviewsSummary {
  average_rating: number;
  total_reviews: number;
  reviews: BoxReview[];
}

export interface BoxReviewAdmin {
  id: string;
  user_name: string;
  box_type_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}
