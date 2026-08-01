import API from './api';

export const sendRFQ = async (data) => {
  const response = await API.post('/quotations/rfq', data);
  return response.data;
};

export const submitQuotation = async (quotationData) => {
  const response = await API.post('/quotations', quotationData);
  return response.data;
};

export const getQuotationsByRequestId = async (requestId) => {
  const response = await API.get(`/quotations/${requestId}`);
  return response.data;
};
