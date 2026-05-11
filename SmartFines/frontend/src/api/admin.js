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

export const listAdminPayments = async () => {
  const { data } = await client.get('/admin/payments')
  return data
}

export const acceptPaymentReceipt = async (paymentId) => {
  const { data } = await client.patch(`/admin/payments/${paymentId}/accept`)
  return data
}

export const getReceiptFile = async (paymentId) => {
  const response = await client.get(`/payments/${paymentId}/receipt/file`, {
    responseType: 'blob',
  })
  return response
}
