import client from './client'

export const createOfficer = async (payload) => {
  const { data } = await client.post('/admin/officers', payload)
  return data
}

export const listOfficers = async () => {
  const { data } = await client.get('/admin/officers')
  return data
}

export const getAdminStats = async () => {
  const { data } = await client.get('/admin/stats')
  return data
}
