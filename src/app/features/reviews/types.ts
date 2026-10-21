export interface Review {
  id: number;
  productId: number;
  productName: string | null;
  customerName: string;
  variantLabel: string | null;
  rating: number;
  comment: string;
  createdAt: string;
  verified: boolean;
}

export interface ProductReviewsData {
  average: number;
  count: number;
  reviews: Review[];
}

export type CanReviewReason = 'not_purchased' | 'already_reviewed' | null;

export interface CanReviewResult {
  canReview: boolean;
  reason: CanReviewReason;
  status?: 'pending' | 'approved' | 'rejected';
}
