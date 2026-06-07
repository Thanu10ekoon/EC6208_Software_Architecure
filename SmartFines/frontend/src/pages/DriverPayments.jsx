import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { listDriverFines } from '../api/fines'
import { confirmStripeCheckout, createPayment, createStripeCheckout, listPayments, uploadReceipt } from '../api/payments'
import { formatCurrency, formatDate } from '../utils/formatters'

const initialForm = {
  fineId: '',
  paymentMethod: 'RECEIPT_UPLOAD',
  transactionReference: '',
}

const DriverPayments = () => {
  const [form, setForm] = useState(initialForm)
  const [searchParams, setSearchParams] = useSearchParams()
  const [receiptFile, setReceiptFile] = useState(null)
  const [fines, setFines] = useState([])
  const [payments, setPayments] = useState([])
  const [fileMap, setFileMap] = useState({})
  const [fileInputKey, setFileInputKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

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

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
      return
    }

    const confirmPayment = async () => {
      setSaving(true)
      setError('')
      setNotice('')
      try {
        await confirmStripeCheckout(sessionId)
        setNotice('Online payment completed')
        setSearchParams({})
        await loadData()
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to confirm Stripe payment')
      } finally {
        setSaving(false)
      }
    }

    confirmPayment()
  }, [searchParams, setSearchParams])

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const activePaymentFineIds = new Set(
    payments
      .filter((payment) => !['FAILED', 'REVERSED'].includes(payment.paymentStatus))
      .map((payment) => payment.fineId)
  )
  const payableFines = fines.filter((fine) => fine.status !== 'PAID' && !activePaymentFineIds.has(fine.id))
  const fineById = new Map(fines.map((fine) => [fine.id, fine]))
  const selectedFine = fineById.get(Number(form.fineId))

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (form.paymentMethod === 'RECEIPT_UPLOAD' && !receiptFile) {
      setError('Please select the payment receipt file')
      return
    }

    setSaving(true)
    setError('')
    setNotice('')
    try {
      if (form.paymentMethod === 'ONLINE') {
        try {
          const checkout = await createStripeCheckout({
            fineId: Number(form.fineId),
          })
          window.location.assign(checkout.checkoutUrl)
        } catch (err) {
          setError(stripeCheckoutError(err))
        }
        return
      }

      const payment = await createPayment({
        fineId: Number(form.fineId),
        paymentMethod: form.paymentMethod,
        transactionReference: form.transactionReference || null,
      })
      await uploadReceipt(payment.id, receiptFile)
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

  const stripeCheckoutError = (err) => {
    if (err?.response?.data?.message) {
      return err.response.data.message
    }
    if (err?.response?.status) {
      return `Failed to start Stripe Checkout (${err.response.status})`
    }
    if (err?.request) {
      return 'Failed to start Stripe Checkout: backend did not respond'
    }
    return err?.message || 'Failed to start Stripe Checkout'
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
            <input
              name="transactionReference"
              value={form.transactionReference}
              onChange={handleChange}
              disabled={form.paymentMethod === 'ONLINE'}
              placeholder={form.paymentMethod === 'ONLINE' ? 'Created by Stripe Checkout' : 'Bank or receipt reference'}
            />
          </label>
          {form.paymentMethod === 'ONLINE' && (
            <div className="payment-card-form stripe-checkout-summary">
              <div>
                <strong>Stripe Checkout</strong>
                <p>Card details are entered on Stripe's secure test payment page.</p>
              </div>
              {selectedFine && (
                <div className="payment-summary">
                  <span>Amount to pay</span>
                  <strong>{formatCurrency(selectedFine.fineAmount)}</strong>
                </div>
              )}
            </div>
          )}
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
          <div className="form-actions">
            <button type="submit" disabled={saving || !form.fineId}>
              {saving ? 'Processing...' : form.paymentMethod === 'ONLINE' ? 'Pay online' : 'Create payment'}
            </button>
          </div>
        </form>
        {notice && <p className="form-success">{notice}</p>}
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
