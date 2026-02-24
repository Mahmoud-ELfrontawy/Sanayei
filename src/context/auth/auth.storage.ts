import type { UserRole, PersistentData } from "./auth.types";

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_TYPE_KEY = "userType";
const USER_KEY = "auth_user";

export const authStorage = {
  setUser: (user: any) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: (): any | null => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  setToken: (token: string) => {
    // Set cookie
    const d = new Date();
    d.setTime(d.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${TOKEN_KEY}=${token};${expires};path=/;SameSite=Lax`;
    
    // Single source in localStorage
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken: (): string | null => {
    // 1. Check cookie
    const name = TOKEN_KEY + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1);
      if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
    }
    // 2. Check localStorage
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem("token");
  },

  setRefreshToken: (token: string) => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setUserType: (type: UserRole) => {
    localStorage.setItem(USER_TYPE_KEY, type);
  },

  getUserType: (): UserRole | null => {
    return localStorage.getItem(USER_TYPE_KEY) as UserRole | null;
  },

  clearAuth: () => {
    // Clear cookies
    document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    
    // Clear ALL possible auth keys to ensure no stale data
    const keysToClear = [
        TOKEN_KEY, 
        USER_KEY,
        "token", // Legacy key
        REFRESH_TOKEN_KEY, 
        USER_TYPE_KEY, 
        "user_id", 
        "user_name"
    ];
    keysToClear.forEach(k => localStorage.removeItem(k));
  },

  savePersistentData: (): PersistentData => {
    return {
      myOrders: localStorage.getItem("myOrders"),
      appNotifications: localStorage.getItem("app_notifications"),
      chatHistory: localStorage.getItem("chatHistory"),
      deletedContacts: localStorage.getItem("deletedContacts"),
    };
  },

  restorePersistentData: (data: PersistentData) => {
    if (!data) return;
    const entries = Object.entries(data) as [keyof PersistentData, string | null][];
    entries.forEach(([key, value]) => {
      if (value) {
        const storageKey = key === "appNotifications" ? "app_notifications" : key;
        localStorage.setItem(storageKey, value);
      }
    });
  }
};
