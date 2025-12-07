import { apiClient } from './client';

export interface Booking {
  id: string;
  clientId: string;
  technicianId?: string;
  categoryId: string;
  description: string;
  photos: string[];
  city: string;
  address: string;
  scheduledDateTime?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'ON_THE_WAY' | 'IN_PROGRESS' | 'COMPLETED' | 'AWAITING_PAYMENT' | 'CANCELLED';
  estimatedPrice?: number;
  finalPrice?: number;
  paymentMethod?: 'CASH' | 'CARD' | 'WAFACASH' | 'BANK_TRANSFER';
  paymentStatus: 'UNPAID' | 'PENDING' | 'PAID';
  receiptUrl?: string;
  transactionId?: string;
  createdAt: string;
  client?: any;
  technician?: any;
  technicianProfile?: any;
  category?: any;
  reviews?: any[];
}

export interface CreateBookingData {
  technicianId: string;
  categoryId: string;
  description: string;
  city: string;
  address: string;
  scheduledDateTime?: string;
  estimatedPrice?: number;
  photos?: File[];
  isUrgent?: boolean;
}

export const bookingsApi = {
  create: async (data: CreateBookingData): Promise<Booking> => {
    const formData = new FormData();
    formData.append('technicianId', data.technicianId);
    formData.append('categoryId', data.categoryId);
    formData.append('description', data.description);
    formData.append('city', data.city);
    formData.append('address', data.address);
    if (data.scheduledDateTime) {
      formData.append('scheduledDateTime', data.scheduledDateTime);
    }
    if (data.estimatedPrice) {
      formData.append('estimatedPrice', data.estimatedPrice.toString());
    }
    if (data.isUrgent) {
      formData.append('isUrgent', 'true');
    }
    if (data.photos) {
      data.photos.forEach((photo) => {
        formData.append('photos', photo);
      });
    }

    const response = await apiClient.post('/bookings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getAll: async (technicianId?: string, technicianProfileId?: string): Promise<Booking[]> => {
    const params = new URLSearchParams();
    if (technicianId) params.append('technicianId', technicianId);
    if (technicianProfileId) params.append('technicianProfileId', technicianProfileId);
    const url = params.toString() ? `/bookings?${params.toString()}` : '/bookings';
    const response = await apiClient.get(url);
    return response.data;
  },

  getMyBookings: async (): Promise<Booking[]> => {
    try {
      console.log('Fetching my bookings from API...');
      const response = await apiClient.get('/bookings/my-bookings');
      console.log('API response status:', response.status);
      console.log('API response data type:', typeof response.data);
      console.log('API response data is array:', Array.isArray(response.data));
      console.log('API response data length:', Array.isArray(response.data) ? response.data.length : 'N/A');
      
      // Ensure we return an array
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        console.warn('API returned non-array data, converting to array');
        return [response.data];
      } else {
        console.warn('API returned unexpected data format, returning empty array');
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching my bookings:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  getById: async (id: string): Promise<Booking> => {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data;
  },

  cancel: async (id: string): Promise<Booking> => {
    const response = await apiClient.patch(`/bookings/${id}/cancel`);
    return response.data;
  },

  accept: async (id: string): Promise<Booking> => {
    const response = await apiClient.patch(`/bookings/${id}/accept`);
    return response.data;
  },

  decline: async (id: string): Promise<Booking> => {
    const response = await apiClient.patch(`/bookings/${id}/decline`);
    return response.data;
  },

  updateStatus: async (id: string, data: { status: string; finalPrice?: number }): Promise<Booking> => {
    const response = await apiClient.patch(`/bookings/${id}/status`, data);
    return response.data;
  },

  processPayment: async (id: string, paymentMethod: 'CASH' | 'CARD' | 'WAFACASH' | 'BANK_TRANSFER', receipt?: File, transactionId?: string): Promise<Booking> => {
    const formData = new FormData();
    formData.append('paymentMethod', paymentMethod);
    if (transactionId) {
      formData.append('transactionId', transactionId);
    }
    if (receipt) {
      formData.append('receipt', receipt);
    }

    const response = await apiClient.patch(`/bookings/${id}/payment`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  confirmPayment: async (id: string): Promise<Booking> => {
    const response = await apiClient.patch(`/bookings/${id}/confirm-payment`);
    return response.data;
  },
};

