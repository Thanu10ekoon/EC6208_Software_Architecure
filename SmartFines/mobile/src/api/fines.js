import client from './client';

export const listDriverFines = () => client.get('/fines/driver').then(r => r.data);
