import api from '../api';

export const adminUsersApi = {
    // Users
    getAllUsers: async (params: { page?: number; search?: string; is_active?: boolean; is_admin?: boolean; per_page?: number }) => {
        const queryParams: any = {};
        if (params.page) queryParams.page = params.page;
        if (params.search) queryParams.search = params.search;
        if (params.per_page) queryParams.per_page = params.per_page;
        if (params.is_active !== undefined) queryParams.is_active = params.is_active ? '1' : '0';
        if (params.is_admin !== undefined) queryParams.is_admin = params.is_admin ? '1' : '0';
        
        return api.get(`/admin/users`, { params: queryParams });
    },
    
    getStatistics: async () => {
        return api.get(`/admin/users/statistics`);
    },

    exportUsers: async () => {
        return api.get(`/admin/users/export`, { responseType: 'blob' });
    },

    showUser: async (userId: string | number) => {
        return api.get(`/admin/users/${userId}`);
    },

    createUser: async (data: any) => {
        return api.post(`/admin/users`, data);
    },

    updateUser: async (userId: string | number, data: any) => {
        return api.put(`/admin/users/${userId}`, data);
    },

    deleteUser: async (userId: string | number) => {
        return api.post(`/admin/users/${userId}`);
    },

    forceDeleteUser: async (userId: string | number) => {
        return api.delete(`/admin/users/${userId}/force`);
    },

    toggleBlockUser: async (userId: string | number) => {
        return api.post(`/admin/users/${userId}/toggle-block`);
    },

    getUserWallet: async (userId: string | number) => {
        return api.get(`/admin/users/${userId}/wallet`);
    },

    addUserBalance: async (userId: string | number, amount: number) => {
        return api.post(`/admin/users/${userId}/add-balance`, { amount });
    },
};
