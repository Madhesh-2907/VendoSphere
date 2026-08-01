import API from './api';

export const createPurchaseOrder = async (poData) => {
  const response = await API.post('/purchase-orders', poData);
  return response.data;
};

export const getAllPurchaseOrders = async () => {
  const response = await API.get('/purchase-orders');
  return response.data;
};

export const updatePOStatus = async (id, status) => {
  const response = await API.patch(`/purchase-orders/${id}/status`, { status });
  return response.data;
};

export const getDeliveryByPOId = async (poId) => {
  const response = await API.get(`/deliveries/${poId}`);
  return response.data;
};

export const updateDelivery = async (id, deliveryData) => {
  const response = await API.patch(`/deliveries/${id}`, deliveryData);
  return response.data;
};

export const getReportsSummary = async () => {
  const response = await API.get('/reports/summary');
  return response.data;
};

export const getSpendByCategory = async () => {
  const response = await API.get('/reports/spend-by-category');
  return response.data;
};

export const getActivityFeed = async () => {
  const response = await API.get('/reports/activity-feed');
  return response.data;
};

export const getNotifications = async () => {
  const response = await API.get('/reports/notifications');
  return response.data;
};
