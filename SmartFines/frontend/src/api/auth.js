import client from './client'

export const login = async (payload) => {
  const { data } = await client.post('/auth/login', payload)
  return data
}

export const driverSignup = async (payload) => {
  const { data } = await client.post('/auth/driver-signup', payload)
  return data
}
