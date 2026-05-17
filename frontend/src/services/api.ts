import axios, { AxiosInstance } from 'axios';
import {
  AuthResponse,
  ApiError,
  RegisterData,
  LoginData,
  ApiResponse,
  Complaint,
  ComplaintStatus,
  ComplaintPriority,
  User
} from '../types';

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
    return this.api.put<ApiResponse>(`/auth/reset-password/${token}`, { password });
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

  changePassword(passwordData: { currentPassword: string; newPassword: string }) {
    return this.api.put('/users/change-password', passwordData);
  }
}

// ✅ single export
export const api = new API();


// ================= LOCAL STORAGE (COMPLAINT MOCK) =================

const STORAGE_KEY = 'civic_complaints';

const getStorage = (): Complaint[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
};

const setStorage = (data: Complaint[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const complaintApi = {
  getComplaints: async (): Promise<Complaint[]> => {
    return getStorage();
  },

  getComplaintById: async (id: string): Promise<Complaint | null> => {
    const all = getStorage();
    return all.find(c => c.id === id) || null;
  },

  submitComplaint: async (data: {
    title: string;
    description: string;
    isAnonymous: boolean;
    user?: User | null;
  }): Promise<Complaint> => {
    const newComplaint: Complaint = {
      id: `RPT-${Math.floor(1000 + Math.random() * 9000)}`,
      title: data.title,
      description: data.description,
      isAnonymous: data.isAnonymous,
      category: 'General',
      priority: ComplaintPriority.MEDIUM,
      status: ComplaintStatus.OPEN,
      submittedBy: data.isAnonymous
  ? 'Anonymous'
  : data.user?.name || 'Unknown',
userId: data.user?._id,
      dateSubmitted: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      comments: []
    };

    const all = getStorage();
    setStorage([newComplaint, ...all]);
    return newComplaint;
  },

  updateStatus: async (id: string, status: ComplaintStatus): Promise<void> => {
    const all = getStorage();
    const updated = all.map(c =>
      c.id === id
        ? {
            ...c,
            status,
            lastUpdated: new Date().toISOString(),
            comments: [
              ...c.comments,
              {
                id: Date.now().toString(),
                author: 'System',
                text: `Status changed to ${status.replace('_', ' ')}`,
                timestamp: new Date().toISOString(),
                isAdmin: true,
                isSystem: true
              }
            ]
          }
        : c
    );
    setStorage(updated);
  },

  addComment: async (id: string, text: string, isAdmin: boolean): Promise<void> => {
    const all = getStorage();
    const updated = all.map(c =>
      c.id === id
        ? {
            ...c,
            comments: [
              ...c.comments,
              {
                id: Date.now().toString(),
                author: isAdmin ? 'Admin' : 'User',
                text,
                timestamp: new Date().toISOString(),
                isAdmin
              }
            ]
          }
        : c
    );
    setStorage(updated);
  }, deleteComplaint: async (id: string): Promise<void> => {
  const all = getStorage();
  const updated = all.filter(c => c.id !== id);
  setStorage(updated);
}
};