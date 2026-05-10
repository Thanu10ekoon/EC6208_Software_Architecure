import client from './client'

export const listNotifications = async () => {
  const { data } = await client.get('/notifications')
  return data
}
