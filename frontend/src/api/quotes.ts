import { apiClient } from './client';

export interface Quote {
  id: string;
  bookingId: string;
  conditions: string;
  equipment: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  booking?: any;
}

export interface CreateQuoteData {
  bookingId: string;
  conditions: string;
  equipment: string;
  price: number;
}

export const quotesApi = {
  create: async (data: CreateQuoteData): Promise<Quote> => {
    const response = await apiClient.post('/quotes', data);
    return response.data;
  },

  getByBooking: async (bookingId: string): Promise<Quote> => {
    const response = await apiClient.get(`/quotes/booking/${bookingId}`);
    return response.data;
  },
};

