import client from './client'

export const createPayment = async (payload) => {
  const { data } = await client.post('/payments', payload)
  return data
}

export const createStripeCheckout = async (payload) => {
  const { data } = await client.post('/payments/stripe/checkout', payload)
  return data
}

export const confirmStripeCheckout = async (sessionId) => {
  const { data } = await client.post('/payments/stripe/confirm', null, {
    params: { sessionId },
  })
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
