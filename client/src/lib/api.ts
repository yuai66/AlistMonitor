import { apiRequest } from './queryClient';
import type { Configuration, Storage, Notification } from '@shared/schema';

export const api = {
  // Configuration
  getConfig: () => fetch('/api/config').then(res => res.json()) as Promise<Configuration | null>,
  saveConfig: (config: Partial<Configuration>) => apiRequest('POST', '/api/config', config),
  testAList: (alistUrl: string, alistToken: string) => 
    apiRequest('POST', '/api/test-alist', { alistUrl, alistToken }),
  testWeChat: (webhookUrl: string) => 
    apiRequest('POST', '/api/test-wechat', { webhookUrl }),

  // Monitoring
  startMonitoring: () => apiRequest('POST', '/api/monitor/start'),
  stopMonitoring: () => apiRequest('POST', '/api/monitor/stop'),
  getMonitorStatus: () => fetch('/api/monitor/status').then(res => res.json()),
  manualCheck: () => apiRequest('POST', '/api/monitor/check'),

  // Data
  getStorages: () => fetch('/api/storages').then(res => res.json()) as Promise<Storage[]>,
  getNotifications: () => fetch('/api/notifications').then(res => res.json()) as Promise<Notification[]>,
};
