import client from './client'

export const createPayment = async (payload) => {
  const { data } = await client.post('/payments', payload)
  return data
}

export const listPayments = async () => {
  const { data } = await client.get('/payments')
  return data
}

export const uploadReceipt = async (paymentId, file) => {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await client.post(`/payments/${paymentId}/receipt`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
