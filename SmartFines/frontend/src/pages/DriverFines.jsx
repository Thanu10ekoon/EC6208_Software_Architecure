import { useEffect, useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import { listDriverFines } from '../api/fines'
import { formatCurrency, formatDate } from '../utils/formatters'

const DriverFines = () => {
  const [fines, setFines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadFines = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listDriverFines()
      setFines(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load fines')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFines()
  }, [])

  return (
    <div className="page">
      <SectionHeader title="My fines" subtitle="Review your violations and payment status." />
      <div className="panel">
        {loading && <p>Loading fines...</p>}
        {error && <p className="form-error">{error}</p>}
        {!loading && !error && fines.length === 0 && <p>No fines yet.</p>}
        {!loading && !error && fines.length > 0 && (
          <div className="table">
            <div className="table-row header cols-5">
              <span>Reference</span>
              <span>Violation date</span>
              <span>Violation</span>
              <span>Amount</span>
              <span>Status</span>
            </div>
            {fines.map((fine) => (
              <div className="table-row cols-5" key={fine.id}>
                <span>{fine.fineReferenceNumber}</span>
                <span>{formatDate(fine.violationDate)}</span>
                <span>{fine.violationDetails}</span>
                <span>{formatCurrency(fine.fineAmount)}</span>
                <span className={`status ${fine.status === 'PAID' ? 'success' : 'pending'}`}>
                  {fine.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DriverFines
