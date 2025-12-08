/**
 * Connection Manager
 * Handles backend connection health checks, retries, and automatic recovery
 */

import { apiClient } from '../api/client';

export interface ConnectionStatus {
  isConnected: boolean;
  lastCheck: Date | null;
  retryCount: number;
  isChecking: boolean;
}

class ConnectionManager {
  private status: ConnectionStatus = {
    isConnected: false,
    lastCheck: null,
    retryCount: 0,
    isChecking: false,
  };

  private listeners: Set<(status: ConnectionStatus) => void> = new Set();
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000; // 2 seconds
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

  /**
   * Check if backend is reachable
   */
  async checkConnection(): Promise<boolean> {
    if (this.status.isChecking) {
      return this.status.isConnected;
    }

    this.status.isChecking = true;
    this.notifyListeners();

    try {
      // Try a lightweight health check endpoint
      const response = await Promise.race([
        apiClient.get('/health', { timeout: 5000 }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 5000)
        ),
      ]) as any;

      if (response?.status === 200 || response?.data) {
        this.status.isConnected = true;
        this.status.retryCount = 0;
        this.status.lastCheck = new Date();
        this.status.isChecking = false;
        this.notifyListeners();
        return true;
      }
    } catch (error: any) {
      // Try alternative endpoint if /health doesn't exist
      try {
        const altResponse = await Promise.race([
          apiClient.get('/auth/me', { timeout: 5000 }).catch(() => null),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 5000)
          ),
        ]) as any;

        // If we get any response (even 401), server is up
        if (altResponse !== null) {
          this.status.isConnected = true;
          this.status.retryCount = 0;
          this.status.lastCheck = new Date();
          this.status.isChecking = false;
          this.notifyListeners();
          return true;
        }
      } catch (altError) {
        // Both endpoints failed
      }
    }

    this.status.isConnected = false;
    this.status.isChecking = false;
    this.status.lastCheck = new Date();
    this.notifyListeners();
    return false;
  }

  /**
   * Retry a failed request with exponential backoff
   */
  async retryRequest<T>(
    requestFn: () => Promise<T>,
    retries = this.MAX_RETRIES
  ): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        // Check connection first
        const isConnected = await this.checkConnection();
        if (!isConnected && i < retries - 1) {
          // Wait before retrying
          await this.delay(this.RETRY_DELAY * (i + 1));
          continue;
        }

        return await requestFn();
      } catch (error: any) {
        const isLastAttempt = i === retries - 1;
        const isConnectionError =
          error.code === 'ECONNREFUSED' ||
          error.code === 'ETIMEDOUT' ||
          error.message?.includes('Network Error') ||
          error.message?.includes('ERR_NETWORK') ||
          error.message?.includes('timeout');

        if (isConnectionError && !isLastAttempt) {
          // Wait before retrying
          await this.delay(this.RETRY_DELAY * (i + 1));
          continue;
        }

        // If it's the last attempt or not a connection error, throw
        throw error;
      }
    }

    throw new Error('Max retries exceeded');
  }

  /**
   * Start periodic health checks
   */
  startHealthChecks() {
    if (this.checkInterval) {
      return; // Already started
    }

    // Initial check
    this.checkConnection();

    // Periodic checks
    this.checkInterval = setInterval(() => {
      this.checkConnection();
    }, this.HEALTH_CHECK_INTERVAL);
  }

  /**
   * Stop periodic health checks
   */
  stopHealthChecks() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Subscribe to connection status changes
   */
  subscribe(listener: (status: ConnectionStatus) => void) {
    this.listeners.add(listener);
    // Immediately notify with current status
    listener(this.status);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus {
    return { ...this.status };
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener({ ...this.status });
      } catch (error) {
        console.error('Error in connection status listener:', error);
      }
    });
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const connectionManager = new ConnectionManager();

// Start health checks when module loads
if (typeof window !== 'undefined') {
  connectionManager.startHealthChecks();
}

