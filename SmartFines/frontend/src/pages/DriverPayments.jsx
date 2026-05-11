import { useEffect, useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import { listDriverFines } from '../api/fines'
import { createPayment, listPayments, uploadReceipt } from '../api/payments'
import { formatCurrency, formatDate } from '../utils/formatters'

const initialForm = {
  fineId: '',
  paymentMethod: 'RECEIPT_UPLOAD',
  transactionReference: '',
}

const DriverPayments = () => {
  const [form, setForm] = useState(initialForm)
  const [receiptFile, setReceiptFile] = useState(null)
  const [fines, setFines] = useState([])
  const [payments, setPayments] = useState([])
  const [fileMap, setFileMap] = useState({})
  const [fileInputKey, setFileInputKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [finesData, paymentsData] = await Promise.all([listDriverFines(), listPayments()])
      setFines(Array.isArray(finesData) ? finesData : [])
      setPayments(Array.isArray(paymentsData) ? paymentsData : [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load payment data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadData, 0)
    return () => clearTimeout(timer)
  }, [])

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const paymentFineIds = new Set(payments.map((payment) => payment.fineId))
  const payableFines = fines.filter((fine) => fine.status !== 'PAID' && !paymentFineIds.has(fine.id))
  const fineById = new Map(fines.map((fine) => [fine.id, fine]))

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (form.paymentMethod === 'RECEIPT_UPLOAD' && !receiptFile) {
      setError('Please select the payment receipt file')
      return
    }

    setSaving(true)
    setError('')
    try {
      const payment = await createPayment({
        fineId: Number(form.fineId),
        paymentMethod: form.paymentMethod,
        transactionReference: form.transactionReference || null,
      })
      if (form.paymentMethod === 'RECEIPT_UPLOAD') {
        await uploadReceipt(payment.id, receiptFile)
      }
      setForm(initialForm)
      setReceiptFile(null)
      setFileInputKey((prev) => prev + 1)
      loadData()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save payment')
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
      loadData()
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
            Fine
            <select name="fineId" value={form.fineId} onChange={handleChange} required disabled={loading}>
              <option value="">Select unpaid fine</option>
              {payableFines.map((fine) => (
                <option value={fine.id} key={fine.id}>
                  {fine.fineReferenceNumber} - {formatCurrency(fine.fineAmount)}
                </option>
              ))}
            </select>
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
          {form.paymentMethod === 'RECEIPT_UPLOAD' && (
            <label>
              Receipt file
              <input
                key={fileInputKey}
                type="file"
                accept="image/*,.pdf"
                onChange={(event) => setReceiptFile(event.target.files[0] || null)}
                required
              />
            </label>
          )}
          <button type="submit" disabled={saving}>Create payment</button>
        </form>
        {error && <p className="form-error">{error}</p>}
        {!loading && payableFines.length === 0 && <p className="muted">No unpaid fines are available for a new payment.</p>}
      </div>

      <div className="panel">
        <h3>Payment history</h3>
        {loading && <p>Loading payments...</p>}
        {!loading && payments.length === 0 && <p>No payments yet.</p>}
        {!loading && payments.length > 0 && (
          <div className="table">
            <div className="table-row header cols-7">
              <span>Payment ID</span>
              <span>Fine</span>
              <span>Amount</span>
              <span>Method</span>
              <span>Status</span>
              <span>Receipt</span>
              <span>Created</span>
            </div>
            {payments.map((payment) => {
              const fine = fineById.get(payment.fineId)
              return (
                <div className="table-row cols-7" key={payment.id}>
                  <span>{payment.id}</span>
                  <span>{fine?.fineReferenceNumber || payment.fineId}</span>
                  <span>{formatCurrency(payment.amount)}</span>
                  <span>{payment.paymentMethod}</span>
                  <span className={`status ${payment.paymentStatus === 'PAID' ? 'success' : 'pending'}`}>
                    {payment.paymentStatus}
                  </span>
                  <span>
                    {payment.receiptId ? (
                      <span>
                        {payment.receiptFileName || payment.receiptNumber || 'Uploaded'}
                        <br />
                        <span className={payment.receiptVerifiedAt ? 'status success' : 'status pending'}>
                          {payment.receiptVerifiedAt ? 'Accepted' : 'Awaiting admin'}
                        </span>
                      </span>
                    ) : payment.paymentMethod === 'RECEIPT_UPLOAD' ? (
                      <div className="receipt-upload">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(event) => handleFileChange(payment.id, event.target.files[0])}
                        />
                        <button type="button" className="ghost" onClick={() => handleUpload(payment.id)} disabled={saving}>
                          Upload
                        </button>
                      </div>
                    ) : (
                      <span className="muted">Not required</span>
                    )}
                  </span>
                  <span>{formatDate(payment.createdAt)}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default DriverPayments
