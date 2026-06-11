import client from './client';

export const listPayments = () => client.get('/payments').then(r => r.data);
