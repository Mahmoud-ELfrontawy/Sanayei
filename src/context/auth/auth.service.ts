import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from "axios";
import { authStorage } from "./auth.storage";
import type { AuthResponse, User, UserRole, LoginResult } from "./auth.types";
import { getFullImageUrl } from "../../utils/imageUrl";
import { BASE_URL } from "../../Api/api";

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface ProfileApiResponse {
  id?: number;
  user_id?: number;
  name?: string;
  email?: string;
  company_name?: string;
  company_email?: string;
  company_logo?: string;
  profile_photo?: string;
  profile_image_url?: string;
  avatar?: string;
  craftsman?: ProfileApiResponse;
  company?: ProfileApiResponse;
  data?: ProfileApiResponse;
  status?: 'approved' | 'pending' | 'rejected';
}

class AuthService {
  private api: AxiosInstance;
  private rawApi: AxiosInstance; // For login attempts without interceptors

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });

    this.rawApi = axios.create({
      baseURL: BASE_URL,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use((config) => {
      const token = authStorage.getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as ExtendedAxiosRequestConfig;
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;
          const refreshSuccess = await this.refreshToken();
          if (refreshSuccess) {
            const newToken = authStorage.getToken();
            if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.api(originalRequest);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private normalizeUser(data: ProfileApiResponse): User | null {
    if (!data) return null;
    let u = data.data || data.craftsman || data.company || data;
    
    if (u.data && typeof u.data === 'object' && !Array.isArray(u.data)) {
        u = u.data;
    }

    const id = u.id || u.user_id;
    if (!id) return null;

    return {
      id,
      name: u.name || u.company_name || "",
      email: u.email || u.company_email || "",
      avatar: getFullImageUrl(u.profile_photo || u.company_logo || u.profile_image_url || u.avatar),
      status: u.status
    };
  }

  async login(phoneOrEmail: string, password: string): Promise<LoginResult> {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(phoneOrEmail);
    const lastRole = authStorage.getUserType();
    
    // Define all possible login strategies
    const strategies = [
      { url: `admin/login`, payload: { email: phoneOrEmail, password }, type: 'admin' as UserRole, condition: isEmail },
      { url: `companies/login`, payload: { company_email: phoneOrEmail, company_password: password }, type: 'company' as UserRole, condition: isEmail },
      { url: `craftsmen/login`, payload: { login: phoneOrEmail, password }, type: 'craftsman' as UserRole, condition: true },
      { url: `auth/login`, payload: { email: phoneOrEmail, login: phoneOrEmail, password }, type: 'user' as UserRole, condition: true }
    ].filter(s => s.condition);

    // Prioritize the last successful role to minimize failed requests
    const sortedStrategies = lastRole 
      ? [...strategies.filter(s => s.type === lastRole), ...strategies.filter(s => s.type !== lastRole)]
      : strategies;

    let lastError: AxiosError<AuthResponse> | null = null;

    for (const strategy of sortedStrategies) {
      try {
        // Use rawApi to avoid interceptors overhead during login
        const { data } = await this.rawApi.post<AuthResponse>(strategy.url, strategy.payload);
        const token = data.token || data.data?.token || data.access_token;
        
        if (token) {
          const role = (data.role as UserRole) || strategy.type;
          const userData = data.user || data.craftsman || data.company || data.data?.user || data.data || {};
          const user = this.normalizeUser(userData as ProfileApiResponse);

          if (user) {
            if (user.status === 'rejected') {
              return { success: false, error: "تم حظر هذا الحساب من قبل الإدارة. يرجى التواصل مع الدعم الفني." };
            }
            return { success: true, data: { token, user, role } };
          }
        }
      } catch (error: unknown) {
        lastError = error as AxiosError<AuthResponse>;
        
        // 403 Forbidden - Account not active
        if (lastError.response?.status === 403) {
          return { success: false, error: lastError.response?.data?.message || "حسابك غير مفعل بعد." };
        }
        
        // 422 Unprocessable - Specifically for Craftsman pending state
        if (lastError.response?.status === 422 && strategy.type === 'craftsman') {
          const msg = lastError.response?.data?.message || "";
          if (/انتظار|مراجعة|معلق|pending/.test(msg)) {
             return { success: false, error: msg };
          }
        }

        // If it's a 401, we just continue to the next strategy
      }
    }

    return { 
      success: false, 
      error: lastError?.response?.data?.message || "فشل تسجيل الدخول، يرجى التحقق من البيانات" 
    };
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = authStorage.getRefreshToken();
    if (!refreshToken) return false;
    try {
      const { data } = await axios.post<{ token: string; refresh_token?: string }>(`${BASE_URL}auth/refresh`, {
        refresh_token: refreshToken
      });
      if (data.token) {
        authStorage.setToken(data.token);
        if (data.refresh_token) authStorage.setRefreshToken(data.refresh_token);
        return true;
      }
      return false;
    } catch { return false; }
  }

  async fetchProfile(type: UserRole): Promise<User | null> {
    try {
      const endpoint = type === "craftsman" ? "craftsmen/profile/me" : 
                       type === "company"   ? "company/me" : "user/me";
      const { data } = await this.api.get<ProfileApiResponse>(endpoint);
      const user = this.normalizeUser(data);
      if (user && user.status === 'rejected') {
          // Force logout for rejected accounts
          throw { response: { status: 403, data: { message: "Account banned" } } } as AxiosError;
      }
      return user;
    } catch (err) { 
      // Important: Re-throw if it's an auth error so AuthProvider can handle it
      if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
          throw err;
      }
      return null; 
    }
  }

  async logout(): Promise<void> {
    try { await this.api.post("/auth/logout"); } 
    catch { /* ignore */ } 
    finally { authStorage.clearAuth(); }
  }
}

export const authService = new AuthService();
