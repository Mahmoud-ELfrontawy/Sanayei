import type { UserRole } from "./auth.types";

export const authRedirect = {
  handleLoginRedirect: (role: UserRole, customRedirect?: string) => {
    if (customRedirect) {
      window.location.href = customRedirect;
      return;
    }

    switch (role) {
      case 'admin':
        window.location.href = '/admin/dashboard';
        break;
      case 'craftsman':
        window.location.href = '/';
        break;
      case 'company':
        window.location.href = '/dashboard/company';
        break;
      default:
        window.location.href = '/';
        break;
    }
  },

  handleLogoutRedirect: () => {
    setTimeout(() => {
      window.location.href = "/";
    }, 500);
  }
};
