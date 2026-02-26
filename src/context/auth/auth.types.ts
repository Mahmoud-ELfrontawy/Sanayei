export type UserRole = "user" | "craftsman" | "company" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  status?: 'approved' | 'pending' | 'rejected';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  userType: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  setState: (state: Partial<AuthState>) => void;
  clearAuth: () => void;
}

export interface LoginResult {
  success: boolean;
  data?: {
    token: string;
    user: User;
    role: UserRole;
  };
  error?: string;
}

export interface AuthResponse {
  status?: boolean;
  success?: boolean;
  token?: string;
  access_token?: string;
  data?: {
    token?: string;
    user?: Record<string, unknown>;
    data?: Record<string, unknown>;
  };
  user?: Record<string, unknown>;
  craftsman?: Record<string, unknown>;
  company?: Record<string, unknown>;
  role?: string;
  redirect?: string;
  message?: string;
}

export interface PersistentData {
  myOrders: string | null;
  appNotifications: string | null;
  chatHistory: string | null;
  deletedContacts: string | null;
}
