import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  AuthResponse,
  ApiError,
  RegisterData,
  LoginData,
  ApiResponse,
  User,
  Complaint,
  Comment
} from '../types';

// ================= HELPERS =================

// Transform MongoDB complaint data to match frontend types
const normalizeComplaint = (data: any): Complaint => {
  const id = data._id || data.id;
  return {
    id,
    title: data.title,
    description: data.description,
    category: data.category || 'General',
    status: data.status,
    priority: data.priority,
    isAnonymous: data.isAnonymous,
    submittedBy: data.submittedBy,
    userId: data.user?._id || data.userId,
    dateSubmitted: data.createdAt || data.dateSubmitted,
    lastUpdated: data.updatedAt || data.lastUpdated,
    comments: (data.comments || []).map((c: any) => ({
      id: c._id || c.id,
      author: c.author,
      text: c.text,
      timestamp: c.createdAt || c.timestamp,
      isAdmin: c.isAdmin,
      isSystem: c.isSystem,
    })),
    aiSummary: data.aiSummary,
    suggestedResolution: data.suggestedResolution,
    researchData: data.researchData,
  };
};

// ================= AXIOS INSTANCE =================

class API {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Global error handler
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          return Promise.reject(error.response.data as ApiError);
        } else if (error.request) {
          return Promise.reject({
            success: false,
            message: 'Network error. Please check your connection.',
          } as ApiError);
        } else {
          return Promise.reject({
            success: false,
            message: error.message || 'Unexpected error',
          } as ApiError);
        }
      }
    );
  }

  // ================= GENERIC METHODS =================

  get<T = unknown>(url: string): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url);
  }

  post<T = unknown, D = unknown>(
    url: string,
    data?: D
  ): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data);
  }

  put<T = unknown, D = unknown>(
    url: string,
    data?: D
  ): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data);
  }

  delete<T = unknown>(url: string): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url);
  }

  // ================= AUTH =================

  register(userData: RegisterData) {
    return this.api.post<AuthResponse>('/auth/register', userData);
  }

  login(userData: LoginData) {
    return this.api.post<AuthResponse>('/auth/login', userData);
  }

  logout() {
    return this.api.post<ApiResponse>('/auth/logout');
  }

  getMe() {
    return this.api.get<AuthResponse>('/auth/me');
  }

  verifyEmail(token: string) {
    return this.api.get<ApiResponse>(`/auth/verify-email/${token}`);
  }

  forgotPassword(email: string) {
    return this.api.post<ApiResponse>('/auth/forgot-password', { email });
  }

  resetPassword(token: string, password: string) {
    return this.api.put<ApiResponse>(
      `/auth/reset-password/${token}`,
      { password }
    );
  }

  refreshToken() {
    return this.api.post<AuthResponse>('/auth/refresh-token');
  }

  resendVerification() {
    return this.api.post<ApiResponse>('/auth/resend-verification');
  }

  // ================= USERS =================

  getUsers() {
    return this.api.get('/users');
  }

  getUser(id: string) {
    return this.api.get(`/users/${id}`);
  }

  updateUser(id: string, userData: Partial<User>) {
    return this.api.put(`/users/${id}`, userData);
  }

  deleteUser(id: string) {
    return this.api.delete(`/users/${id}`);
  }

  updateProfile(userData: Partial<User>) {
    return this.api.put('/users/profile', userData);
  }

  changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }) {
    return this.api.put('/users/change-password', passwordData);
  }
}

// ================= MAIN API EXPORT =================

export const api = new API();

// ================= COMPLAINT API =================

export const complaintApi = {
  getComplaints() {
    return api.get<{ data: any[] }>('/complaints').then(res => ({
      ...res,
      data: {
        data: (Array.isArray(res.data.data) ? res.data.data : []).map(normalizeComplaint)
      }
    }));
  },

  getComplaint(id: string) {
    return api.get<{ data: any }>(`/complaints/${id}`).then(res => ({
      ...res,
      data: {
        data: normalizeComplaint(res.data.data)
      }
    }));
  },

  getComplaintById(id: string) {
    return complaintApi.getComplaint(id);
  },

  submitComplaint(data: {
    title: string;
    description: string;
    isAnonymous: boolean;
  }) {
    return api.post<{ data: any }>('/complaints', data).then(res => ({
      ...res,
      data: {
        data: normalizeComplaint(res.data.data)
      }
    }));
  },

  updateStatus(id: string, status: string) {
    return api.put<{ data: any }>(`/complaints/${id}/status`, { status }).then(res => ({
      ...res,
      data: {
        data: normalizeComplaint(res.data.data)
      }
    }));
  },

  addComment(id: string, text: string) {
    return api.post<{ data: any }>(`/complaints/${id}/comment`, { text }).then(res => ({
      ...res,
      data: {
        data: normalizeComplaint(res.data.data)
      }
    }));
  },

  deleteComplaint(id: string) {
    return api.delete(`/complaints/${id}`);
  }
};