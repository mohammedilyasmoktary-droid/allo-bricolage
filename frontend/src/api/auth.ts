import { apiClient } from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  role?: 'CLIENT' | 'TECHNICIAN';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  role: 'CLIENT' | 'TECHNICIAN' | 'ADMIN';
  profilePictureUrl?: string;
  createdAt: string;
  technicianProfile?: any;
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    try {
      console.log('Sending login request to:', `${apiClient.defaults.baseURL}/auth/login`);
      const response = await apiClient.post('/auth/login', credentials);
      console.log('Login response received:', { 
        hasToken: !!response.data.accessToken, 
        hasUser: !!response.data.user 
      });
      
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        console.log('Access token saved to localStorage');
      }
      if (!response.data.user) {
        throw new Error('Login failed: No user data received');
      }
      return response.data;
    } catch (error: any) {
      console.error('Login API error:', error);
      console.error('API Base URL:', apiClient.defaults.baseURL);
      
      // Re-throw with better error message
      if (error.response) {
        // Server responded with error
        console.error('Server error response:', error.response.data);
        const errorMessage = error.response.data?.error || error.response.data?.message || 'Erreur lors de la connexion';
        throw new Error(errorMessage);
      } else if (error.request) {
        // Request made but no response
        console.error('No response received from server');
        const apiUrl = apiClient.defaults.baseURL || 'non configuré';
        const isProduction = import.meta.env.PROD;
        let errorMessage = `Impossible de se connecter au serveur backend (${apiUrl}).`;
        
        if (isProduction && apiUrl.includes('localhost')) {
          errorMessage += '\n\n⚠️ La variable d\'environnement VITE_API_URL n\'est pas configurée sur Vercel.';
          errorMessage += '\n\nPour corriger :';
          errorMessage += '\n1. Allez sur Vercel Dashboard → Settings → Environment Variables';
          errorMessage += '\n2. Ajoutez VITE_API_URL avec la valeur : https://allo-bricolage-backend.onrender.com/api';
          errorMessage += '\n3. Redéployez l\'application';
        } else {
          errorMessage += '\n\nVérifiez que :';
          errorMessage += '\n- Le serveur backend est démarré';
          errorMessage += '\n- L\'URL est correctement configurée';
          errorMessage += '\n- CORS est configuré pour accepter les requêtes depuis ce domaine';
        }
        
        throw new Error(errorMessage);
      } else {
        // Something else happened
        console.error('Request setup error:', error.message);
        throw new Error('Erreur lors de la connexion. Veuillez réessayer.');
      }
    }
  },

  register: async (data: RegisterData | FormData) => {
    try {
      // Check if data is FormData (for technician registration with file)
      const isFormData = data instanceof FormData;
      const config = isFormData
        ? {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        : {};

      console.log('Sending register request to:', `${apiClient.defaults.baseURL}/auth/register`);
      const response = await apiClient.post('/auth/register', data, config);
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
      }
      return response.data;
    } catch (error: any) {
      console.error('Register API error:', error);
      console.error('API Base URL:', apiClient.defaults.baseURL);
      
      // Re-throw with better error message
      if (error.response) {
        // Server responded with error
        console.error('Server error response:', error.response.data);
        const errorMessage = error.response.data?.error || error.response.data?.message || 'Erreur lors de l\'inscription';
        throw new Error(errorMessage);
      } else if (error.request) {
        // Request made but no response
        console.error('No response received from server');
        const apiUrl = apiClient.defaults.baseURL || 'non configuré';
        const isProduction = import.meta.env.PROD;
        let errorMessage = `Impossible de se connecter au serveur backend (${apiUrl}).`;
        
        if (isProduction && apiUrl.includes('localhost')) {
          errorMessage += '\n\n⚠️ La variable d\'environnement VITE_API_URL n\'est pas configurée sur Vercel.';
          errorMessage += '\n\nPour corriger :';
          errorMessage += '\n1. Allez sur Vercel Dashboard → Settings → Environment Variables';
          errorMessage += '\n2. Ajoutez VITE_API_URL avec la valeur : https://allo-bricolage-backend.onrender.com/api';
          errorMessage += '\n3. Redéployez l\'application';
        } else {
          errorMessage += '\n\nVérifiez que :';
          errorMessage += '\n- Le serveur backend est démarré';
          errorMessage += '\n- L\'URL est correctement configurée';
          errorMessage += '\n- CORS est configuré pour accepter les requêtes depuis ce domaine';
        }
        
        throw new Error(errorMessage);
      } else {
        // Something else happened
        console.error('Request setup error:', error.message);
        throw new Error('Erreur lors de l\'inscription. Veuillez réessayer.');
      }
    }
  },

  logout: async () => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('accessToken');
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error: any) {
      // If 401, token is invalid
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        throw error;
      }
      throw error;
    }
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await apiClient.post('/auth/reset-password', { token, password });
    return response.data;
  },
};

