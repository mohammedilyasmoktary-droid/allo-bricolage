import { apiClient } from './client';

export interface UpdateUserProfileData {
  name?: string;
  phone?: string;
  city?: string;
  profilePicture?: File;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  role: 'CLIENT' | 'TECHNICIAN' | 'ADMIN';
  profilePictureUrl?: string;
}

export const usersApi = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateUserProfileData): Promise<UserProfile> => {
    const formData = new FormData();
    if (data.name !== undefined) formData.append('name', data.name);
    if (data.phone !== undefined) formData.append('phone', data.phone);
    if (data.city !== undefined) formData.append('city', data.city);
    if (data.profilePicture) {
      formData.append('profilePicture', data.profilePicture);
    }

    const response = await apiClient.put('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
