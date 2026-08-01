import API from './api';

export const getAllVendors = async (params = {}) => {
  const response = await API.get('/vendors', { params });
  return response.data;
};

export const getVendorById = async (id) => {
  const response = await API.get(`/vendors/${id}`);
  return response.data;
};

export const createVendor = async (vendorData) => {
  const response = await API.post('/vendors', vendorData);
  return response.data;
};

export const updateVendor = async (id, vendorData) => {
  const response = await API.put(`/vendors/${id}`, vendorData);
  return response.data;
};

export const updateVendorStatus = async (id, status) => {
  const response = await API.patch(`/vendors/${id}/status`, { status });
  return response.data;
};

export const deleteVendor = async (id) => {
  const response = await API.delete(`/vendors/${id}`);
  return response.data;
};
