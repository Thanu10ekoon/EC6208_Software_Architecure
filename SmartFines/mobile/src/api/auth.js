import client from './client';

export const login = (data) => client.post('/auth/login', data).then((r) => r.data);
export const driverSignup = (data) => client.post('/auth/driver-signup', data).then((r) => r.data);
