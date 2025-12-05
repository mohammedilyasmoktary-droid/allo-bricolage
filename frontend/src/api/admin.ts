import { apiClient } from './client';
import { Booking } from './bookings';

export interface Technician {
  id: string;
  userId: string;
  skills: string[];
  yearsOfExperience: number;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  user: {
    name: string;
    email: string;
    phone: string;
    city: string;
  };
}

export interface AdminStats {
  totalUsers: number;
  totalTechnicians: number;
  pendingTechnicians: number;
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
}

export const adminApi = {
  getTechnicians: async (): Promise<Technician[]> => {
    const response = await apiClient.get('/admin/technicians');
    return response.data;
  },

  updateVerificationStatus: async (
    id: string,
    status: 'APPROVED' | 'REJECTED'
  ): Promise<Technician> => {
    const response = await apiClient.patch(`/admin/technicians/${id}/verify`, {
      verificationStatus: status,
    });
    return response.data;
  },

  deleteTechnician: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/technicians/${id}`);
  },

  getBookings: async (params?: any): Promise<Booking[]> => {
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const url = queryParams ? `/admin/bookings?${queryParams}` : '/admin/bookings';
    const response = await apiClient.get(url);
    return response.data;
  },

  updatePaymentStatus: async (
    id: string,
    status: 'UNPAID' | 'PENDING' | 'PAID',
    reason: string
  ): Promise<Booking> => {
    const response = await apiClient.patch(`/admin/bookings/${id}/payment`, {
      paymentStatus: status,
      reason,
    });
    return response.data;
  },

  getStats: async (): Promise<AdminStats> => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },
};

