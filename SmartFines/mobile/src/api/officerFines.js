import client from './client';

export const listOfficerFines = () =>
  client.get('/fines/officer').then((response) => response.data);

export const issueFine = (payload) =>
  client.post('/fines', payload).then((response) => response.data);
