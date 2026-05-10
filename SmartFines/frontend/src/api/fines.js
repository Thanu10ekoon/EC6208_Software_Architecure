import client from './client'

export const createFine = async (payload) => {
  const { data } = await client.post('/fines', payload)
  return data
}

export const listDriverFines = async () => {
  const { data } = await client.get('/fines/driver')
  return data
}

export const listOfficerFines = async () => {
  const { data } = await client.get('/fines/officer')
  return data
}
