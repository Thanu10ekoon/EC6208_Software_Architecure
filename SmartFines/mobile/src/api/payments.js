import client from './client';

export const listPayments = () => client.get('/payments').then(r => r.data);

export const createStripeCheckout = (data) =>
  client.post('/payments/stripe/checkout', data).then(r => r.data);

export const confirmStripeCheckout = (sessionId) =>
  client.post('/payments/stripe/confirm', null, { params: { sessionId } }).then(r => r.data);
