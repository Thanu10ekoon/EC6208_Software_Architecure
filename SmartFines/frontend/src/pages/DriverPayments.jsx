import { useEffect, useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import { createPayment, listPayments, uploadReceipt } from '../api/payments'
import { formatCurrency, formatDate } from '../utils/formatters'

const initialForm = {
  fineId: '',
  paymentMethod: 'ONLINE',
  transactionReference: '',
}

const DriverPayments = () => {
  const [form, setForm] = useState(initialForm)
  const [payments, setPayments] = useState([])
  const [fileMap, setFileMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadPayments = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listPayments()
      setPayments(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayments()
  }, [])

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await createPayment({
        fineId: Number(form.fineId),
        paymentMethod: form.paymentMethod,
        transactionReference: form.transactionReference || null,
      })
      setForm(initialForm)
      loadPayments()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create payment')
    } finally {
      setSaving(false)
    }
  }

  const handleFileChange = (paymentId, file) => {
    setFileMap((prev) => ({ ...prev, [paymentId]: file }))
  }

  const handleUpload = async (paymentId) => {
    const file = fileMap[paymentId]
    if (!file) {
      setError('Please select a receipt file')
      return
    }
    setSaving(true)
    setError('')
    try {
      await uploadReceipt(paymentId, file)
      setFileMap((prev) => ({ ...prev, [paymentId]: null }))
      loadPayments()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to upload receipt')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <SectionHeader title="Payments" subtitle="Track online payments and receipt uploads." />
      <div className="panel">
        <h3>Create payment</h3>
        <form className="form grid" onSubmit={handleSubmit}>
          <label>
            Fine ID
            <input name="fineId" value={form.fineId} onChange={handleChange} required />
          </label>
          <label>
            Payment method
            <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
              <option value="ONLINE">Online</option>
              <option value="RECEIPT_UPLOAD">Receipt upload</option>
            </select>
          </label>
          <label>
            Transaction reference
            <input name="transactionReference" value={form.transactionReference} onChange={handleChange} />
          </label>
          <button type="submit" disabled={saving}>Create payment</button>
        </form>
        {error && <p className="form-error">{error}</p>}
      </div>

      <div className="panel">
        <h3>Payment history</h3>
        {loading && <p>Loading payments...</p>}
        {!loading && payments.length === 0 && <p>No payments yet.</p>}
        {!loading && payments.length > 0 && (
          <div className="table">
            <div className="table-row header cols-6">
              <span>Payment ID</span>
              <span>Fine ID</span>
              <span>Amount</span>
              <span>Method</span>
              <span>Status</span>
              <span>Receipt</span>
            </div>
            {payments.map((payment) => (
              <div className="table-row cols-6" key={payment.id}>
                <span>{payment.id}</span>
                <span>{payment.fineId}</span>
                <span>{formatCurrency(payment.amount)}</span>
                <span>{payment.paymentMethod}</span>
                <span className={`status ${payment.paymentStatus === 'PAID' ? 'success' : 'pending'}`}>
                  {payment.paymentStatus}
                </span>
                <span>
                  <div className="receipt-upload">
                    <input
                      type="file"
                      onChange={(event) => handleFileChange(payment.id, event.target.files[0])}
                    />
                    <button type="button" className="ghost" onClick={() => handleUpload(payment.id)} disabled={saving}>
                      Upload
                    </button>
                  </div>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DriverPayments
