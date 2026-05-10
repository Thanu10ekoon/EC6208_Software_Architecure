import client from './client'

export const markRecollection = async (fineId, payload) => {
  const { data } = await client.post(`/recollections/driver/${fineId}/mark`, payload)
  return data
}

export const confirmRecollection = async (fineId, payload) => {
  const { data } = await client.post(`/recollections/${fineId}/confirm`, payload)
  return data
}
