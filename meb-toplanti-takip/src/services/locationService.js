import api from './api';

const locationService = {
  addLocation: async (locationData) => {
    const response = await api.post('/locations/AddLocation', locationData);
    return response.data;
  },
  
  getAllLocations: async () => {
    const response = await api.get('/locations');
    return response.data;
  },
  
  getLocationById: async (id) => {
    const response = await api.get(`/locations/${id}`);
    return response.data;
  }
};

export default locationService;