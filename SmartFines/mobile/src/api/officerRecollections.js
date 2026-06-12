import client from './client';

export const confirmOfficerRecollection = (fineId, payload) =>
  client
    .post(`/recollections/${fineId}/confirm`, payload)
    .then((response) => response.data);

export const markOfficerNotificationsRead = () =>
  client.patch('/notifications/read-all').then((response) => response.data);
