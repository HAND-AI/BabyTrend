import apiService from './api';
import { setToken, setUser, removeToken, User } from '../utils/token';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface UploadRecord {
  id: number;
  user_id: number;
  filename: string;
  upload_time: string;
  status: 'success' | 'pending' | 'approved' | 'rejected';
  items: any[];
  review_comment?: string;
  reviewed_by?: number;
  reviewed_at?: string;
}

export interface UploadResponse {
  message: string;
  upload_id: number;
  status: string;
  summary: any;
}

export interface UploadListResponse {
  uploads: UploadRecord[];
  pagination: {
    page: number;
    pages: number;
    per_page: number;
    total: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface PriceListResponse {
  prices: Array<{
    id: number;
    item_code: string;
    description: string;
    price: number;
    currency: string;
    updated_at: string;
  }>;
  pagination: {
    page: number;
    pages: number;
    per_page: number;
    total: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface DutyRateResponse {
  rates: Array<{
    id: number;
    hs_code: string;
    description: string;
    rate: number;
    updated_at: string;
  }>;
  pagination: {
    page: number;
    pages: number;
    per_page: number;
    total: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login', credentials);
      
      // Store token and user data
      setToken(response.token);
      setUser(response.user);
      
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/register', userData);
      
      // Store token and user data
      setToken(response.token);
      setUser(response.user);
      
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  }

  logout(): void {
    removeToken();
    window.location.href = '/login';
  }

  // User operations
  async uploadPackingList(file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> {
    try {
      return await apiService.uploadFile<UploadResponse>('/user/upload/packing-list', file, onProgress);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Upload failed');
    }
  }

  async getUserUploads(page: number = 1, status?: string): Promise<UploadListResponse> {
    try {
      const params: any = { page };
      if (status) params.status = status;
      
      return await apiService.get<UploadListResponse>('/user/uploads', params);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch uploads');
    }
  }

  async getUploadDetails(uploadId: number): Promise<UploadRecord> {
    try {
      return await apiService.get<UploadRecord>(`/user/upload/${uploadId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch upload details');
    }
  }

  // Admin operations
  async uploadPriceList(file: File, onProgress?: (progress: number) => void): Promise<any> {
    try {
      return await apiService.uploadFile('/admin/upload/price-list', file, onProgress);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Price list upload failed');
    }
  }

  async uploadDutyRate(file: File, onProgress?: (progress: number) => void): Promise<any> {
    try {
      return await apiService.uploadFile('/admin/upload/duty-rate', file, onProgress);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Duty rate upload failed');
    }
  }

  async getAllUploads(page: number = 1, status?: string): Promise<UploadListResponse> {
    try {
      const params: any = { page };
      if (status) params.status = status;
      
      return await apiService.get<UploadListResponse>('/admin/uploads', params);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch uploads');
    }
  }

  async reviewUpload(uploadId: number, action: 'approve' | 'reject', comment?: string): Promise<any> {
    try {
      const data: any = { action };
      if (comment) data.comment = comment;
      
      return await apiService.post(`/admin/review/${uploadId}`, data);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Review failed');
    }
  }

  async getAdminStats(): Promise<any> {
    try {
      return await apiService.get('/admin/stats');
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch stats');
    }
  }

  async getPriceList(page: number = 1, search?: string): Promise<PriceListResponse> {
    try {
      const params: any = { page };
      if (search) params.search = search;
      
      return await apiService.get<PriceListResponse>('/admin/price-list', params);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch price list');
    }
  }

  async getDutyRates(page: number = 1, search?: string): Promise<DutyRateResponse> {
    try {
      const params: any = { page };
      if (search) params.search = search;
      
      return await apiService.get<DutyRateResponse>('/admin/duty-rates', params);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch duty rates');
    }
  }
}

export const authService = new AuthService();
export default authService; 