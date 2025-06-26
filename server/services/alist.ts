import axios from 'axios';
import { demoAListStorages, isDemoMode } from '../demo-data';

export interface AListStorage {
  id: number;
  name: string;
  driver: string;
  mount_path: string;
  status: string;
  modified: string;
}

export interface AListResponse {
  code: number;
  message: string;
  data: AListStorage[];
}

export class AListService {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.token = token;
  }

  async getStorages(): Promise<AListStorage[]> {
    // Check if using demo mode
    if (isDemoMode(this.token)) {
      return demoAListStorages;
    }

    try {
      const response = await axios.get<AListResponse>(`${this.baseUrl}/api/admin/storage/list`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data.code === 401) {
        throw new Error('AList 令牌无效或已过期，请检查令牌是否正确');
      }
      
      if (response.data.code !== 200) {
        throw new Error(`AList API 错误 (${response.data.code}): ${response.data.message}`);
      }

      return response.data.data || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          throw new Error('无法连接到 AList 服务器，请检查服务器地址');
        }
        if (error.response?.status === 401) {
          throw new Error('AList 令牌无效或已过期');
        }
        if (error.response?.status === 403) {
          throw new Error('AList 访问被拒绝，请检查令牌权限');
        }
      }
      throw new Error(`获取存储列表失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  async testConnection(): Promise<boolean> {
    // Demo mode always returns true
    if (isDemoMode(this.token)) {
      return true;
    }

    try {
      await this.getStorages();
      return true;
    } catch {
      return false;
    }
  }
}
