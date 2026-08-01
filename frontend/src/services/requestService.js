import API from './api';

export const getAllRequests = async () => {
  const response = await API.get('/requests');
  return response.data;
};

export const createRequest = async (requestData) => {
  const response = await API.post('/requests', requestData);
  return response.data;
};

export const getRequestById = async (id) => {
  const response = await API.get(`/requests/${id}`);
  return response.data;
};

export const updateRequestStatus = async (id, status) => {
  const response = await API.patch(`/requests/${id}/status`, { status });
  return response.data;
};

export const createApproval = async (approvalData) => {
  const response = await API.post('/approvals', approvalData);
  return response.data;
};
