export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ================= AUTH =================

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  data: User; // ✅ use "data" consistently (matches your backend)
  message?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface ApiError {
  success: boolean;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// ================= COMPLAINT =================

export enum ComplaintStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum ComplaintPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  isAdmin: boolean;
  isSystem?: boolean;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  isAnonymous: boolean;
  submittedBy: string;
  userId?: string;
  dateSubmitted: string;
  lastUpdated: string;
  comments: Comment[];
  aiSummary?: string;
  suggestedResolution?: string;
  researchData?: {
    report: string;
    sources: GroundingSource[];
  };
}

export interface UserStats {
  total: number;
  open: number;
  resolved: number;
}