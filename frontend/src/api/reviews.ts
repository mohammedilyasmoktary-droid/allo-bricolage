import { apiClient } from './client';

export interface Review {
  id: string;
  bookingId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface CreateReviewData {
  bookingId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
}

export const reviewsApi = {
  create: async (data: CreateReviewData): Promise<Review> => {
    const response = await apiClient.post('/reviews', data);
    return response.data;
  },

  getByUserId: async (userId: string): Promise<Review[]> => {
    const response = await apiClient.get(`/reviews/user/${userId}`);
    return response.data;
  },

  getByBookingId: async (bookingId: string): Promise<Review[]> => {
    const response = await apiClient.get(`/reviews/booking/${bookingId}`);
    return response.data;
  },

  getAll: async (): Promise<Review[]> => {
    const response = await apiClient.get('/reviews');
    return response.data;
  },
};

