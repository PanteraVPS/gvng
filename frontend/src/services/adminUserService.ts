import api from './api';

export const getAllUsers = async () => {
    try {
        const res = await api.get('/admin/users');
        return res.data;
    } catch (error) {
        console.error('Failed to fetch users', error);
        return [];
    }
};

export const updateUser = async (id: string, userData: any) => {
    try {
        const res = await api.put(`/admin/users/${id}`, userData);
        return res.data;
    } catch (error) {
        console.error('Failed to update user', error);
        return null;
    }
};
