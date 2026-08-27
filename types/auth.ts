export type Role = 'ROLE_CLIENT' | 'ROLE_CREATOR' | 'ROLE_AGENT' | 'ROLE_ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  username: string;
  avatarUrl: string | null;
  roles: Role[];
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface SignupData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  /** Always CREATOR — kept for API compatibility; backend ignores other values. */
  role?: 'CREATOR';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateRoleData {
  roles: Role[];
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  totalElements: number;
  totalPages: number;
  size: number;
  last: boolean;
}
