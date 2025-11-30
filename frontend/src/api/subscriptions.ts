import { apiClient } from './client';

export interface Subscription {
  id: string;
  technicianProfileId: string;
  plan: 'FREE_TRIAL' | 'BASIC' | 'PREMIUM';
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING_PAYMENT';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
  payments?: SubscriptionPayment[];
}

export interface SubscriptionPayment {
  id: string;
  subscriptionId: string;
  amount: number;
  paymentMethod: 'CARD' | 'WAFACASH' | 'BANK_TRANSFER';
  paymentStatus: 'PENDING' | 'PAID';
  receiptUrl?: string;
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
}

export interface SubscriptionStatus {
  subscription: Subscription | null;
  daysRemaining: number;
  isActive: boolean;
  canAcceptJobs: boolean;
}

export interface CreateSubscriptionData {
  plan: 'BASIC' | 'PREMIUM';
  paymentMethod: 'CARD' | 'WAFACASH' | 'BANK_TRANSFER';
  billingPeriod: 'MONTHLY' | 'YEARLY';
  receipt?: File;
}

export const subscriptionsApi = {
  getStatus: async (): Promise<SubscriptionStatus> => {
    const response = await apiClient.get('/subscriptions/status');
    return response.data;
  },

  create: async (data: CreateSubscriptionData): Promise<{ subscription: Subscription; payment: SubscriptionPayment; message: string }> => {
    const formData = new FormData();
    formData.append('plan', data.plan);
    formData.append('paymentMethod', data.paymentMethod);
    formData.append('billingPeriod', data.billingPeriod);
    if (data.receipt) {
      formData.append('receipt', data.receipt);
    }

    const response = await apiClient.post('/subscriptions/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getHistory: async (): Promise<Subscription[]> => {
    const response = await apiClient.get('/subscriptions/history');
    return response.data;
  },

  cancel: async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/subscriptions/cancel');
    return response.data;
  },
};






