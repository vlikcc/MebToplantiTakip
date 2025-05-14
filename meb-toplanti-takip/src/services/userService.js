import api from './api';

const userService = {
  getAllUsers: async () => {
    const response = await api.get('/users/GetUsers');
    return response.data;
  },
  
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  getUserByDeviceId: async (deviceId) => {
    const response = await api.get(`/users/GetUserByDeviceId/${deviceId}`);
    return response.data;
  },
  
  createUser: async (userData) => {
    const response = await api.post('/users/AddUser', userData);
    return response.data;
  },
  
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export default userService;