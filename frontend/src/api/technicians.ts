import { apiClient } from './client';

export interface Technician {
  id: string;
  userId: string;
  skills: string[];
  yearsOfExperience: number;
  hourlyRate?: number;
  basePrice?: number;
  bio?: string;
  profilePictureUrl?: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  averageRating: number;
  isOnline: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
  };
  documents?: any[];
  subscriptions?: Array<{
    id: string;
    plan: 'FREE_TRIAL' | 'BASIC' | 'PREMIUM';
    status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING_PAYMENT';
    endDate: string;
  }>;
}

export interface TechnicianProfileData {
  skills: string[];
  yearsOfExperience: number;
  hourlyRate?: number;
  basePrice?: number;
  bio?: string;
  documents?: File[];
}

export const techniciansApi = {
  getAvailable: async (city?: string, category?: string, skills?: string): Promise<Technician[]> => {
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (category) params.append('category', category);
    if (skills) params.append('skills', skills);
    const response = await apiClient.get(`/technicians/available?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string): Promise<Technician> => {
    const response = await apiClient.get(`/technicians/${id}`);
    return response.data;
  },

  getMyProfile: async (): Promise<Technician> => {
    const response = await apiClient.get('/technicians/profile/me');
    return response.data;
  },

  updateProfile: async (data: TechnicianProfileData | FormData): Promise<Technician> => {
    // If FormData is already provided, use it directly
    const formData = data instanceof FormData ? data : new FormData();
    
    if (!(data instanceof FormData)) {
      formData.append('skills', JSON.stringify(data.skills));
      formData.append('yearsOfExperience', data.yearsOfExperience.toString());
      if (data.hourlyRate) formData.append('hourlyRate', data.hourlyRate.toString());
      if (data.basePrice) formData.append('basePrice', data.basePrice.toString());
      if (data.bio) formData.append('bio', data.bio);
      if (data.documents) {
        data.documents.forEach((doc, index) => {
          formData.append('documents', doc);
          formData.append(`documentType_${index}`, 'OTHER');
        });
      }
    }

    const response = await apiClient.post('/technicians/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  toggleOnline: async (isOnline: boolean): Promise<Technician> => {
    const response = await apiClient.patch('/technicians/profile/online', { isOnline });
    return response.data;
  },
};
