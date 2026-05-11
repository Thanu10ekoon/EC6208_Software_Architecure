import { useEffect, useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import { acceptPaymentReceipt, getReceiptFile, listAdminPayments } from '../api/admin'
import { formatCurrency, formatDate } from '../utils/formatters'

const AdminPayments = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [openingId, setOpeningId] = useState(null)
  const [acceptingId, setAcceptingId] = useState(null)
  const [error, setError] = useState('')

  const loadPayments = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listAdminPayments()
      setPayments(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadPayments, 0)
    return () => clearTimeout(timer)
  }, [])

  const handleViewReceipt = async (payment) => {
    setOpeningId(payment.id)
    setError('')
    try {
      const response = await getReceiptFile(payment.id)
      const file = new Blob([response.data], {
        type: response.headers['content-type'] || payment.receiptMimeType || 'application/octet-stream',
      })
      const url = URL.createObjectURL(file)
      window.open(url, '_blank', 'noopener,noreferrer')
      setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to open receipt')
    } finally {
      setOpeningId(null)
    }
  }

  const handleAcceptPayment = async (payment) => {
    setAcceptingId(payment.id)
    setError('')
    try {
      await acceptPaymentReceipt(payment.id)
      await loadPayments()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to accept payment')
    } finally {
      setAcceptingId(null)
    }
  }

  return (
    <div className="page">
      <SectionHeader title="Payments" subtitle="Review submitted payments and uploaded receipts." />
      <div className="panel">
        <h3>Payment receipts</h3>
        {loading && <p>Loading payments...</p>}
        {error && <p className="form-error">{error}</p>}
        {!loading && payments.length === 0 && <p>No payments yet.</p>}
        {!loading && payments.length > 0 && (
          <div className="table">
            <div className="table-row header cols-9">
              <span>Payment ID</span>
              <span>Fine ID</span>
              <span>Driver</span>
              <span>Amount</span>
              <span>Method</span>
              <span>Status</span>
              <span>Receipt</span>
              <span>Approval</span>
              <span>Created</span>
            </div>
            {payments.map((payment) => (
              <div className="table-row cols-9" key={payment.id}>
                <span>{payment.id}</span>
                <span>{payment.fineId}</span>
                <span>{payment.driverUserId}</span>
                <span>{formatCurrency(payment.amount)}</span>
                <span>{payment.paymentMethod}</span>
                <span className={`status ${payment.paymentStatus === 'PAID' ? 'success' : 'pending'}`}>
                  {payment.paymentStatus}
                </span>
                <span>
                  {payment.receiptId ? (
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => handleViewReceipt(payment)}
                      disabled={openingId === payment.id}
                    >
                      {openingId === payment.id ? 'Opening...' : payment.receiptFileName || payment.receiptNumber}
                    </button>
                  ) : (
                    <span className="muted">Not uploaded</span>
                  )}
                </span>
                <span>
                  {payment.receiptVerifiedAt ? (
                    <span className="status success">Accepted</span>
                  ) : payment.receiptId && payment.paymentStatus !== 'PAID' ? (
                    <button
                      type="button"
                      className="compact-button"
                      onClick={() => handleAcceptPayment(payment)}
                      disabled={acceptingId === payment.id}
                    >
                      {acceptingId === payment.id ? 'Accepting...' : 'Accept'}
                    </button>
                  ) : payment.paymentStatus === 'PAID' ? (
                    <span className="status success">Paid</span>
                  ) : (
                    <span className="muted">Waiting</span>
                  )}
                </span>
                <span>{formatDate(payment.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPayments
