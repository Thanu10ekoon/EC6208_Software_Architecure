import client from './client';

export const listNotifications = () => client.get('/notifications').then(r => r.data);
