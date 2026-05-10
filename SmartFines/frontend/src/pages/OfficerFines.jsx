import { useEffect, useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import { createFine, listOfficerFines } from '../api/fines'
import { formatCurrency, formatDate } from '../utils/formatters'

const initialForm = {
  driverNic: '',
  regionId: '',
  vehicleNumber: '',
  violationDate: '',
  violationDetails: '',
  violationPlace: '',
  fineAmount: '',
  licenseCollectionLocation: '',
  dueAt: '',
}

const OfficerFines = () => {
  const [form, setForm] = useState(initialForm)
  const [fines, setFines] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadFines = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listOfficerFines()
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

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await createFine({
        ...form,
        regionId: Number(form.regionId),
        fineAmount: Number(form.fineAmount),
        dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : null,
      })
      setForm(initialForm)
      loadFines()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create fine')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <SectionHeader title="Issue fines" subtitle="Record traffic violations and fines." />

      <div className="panel">
        <form className="form grid" onSubmit={handleSubmit}>
          <label>
            Driver NIC
            <input name="driverNic" value={form.driverNic} onChange={handleChange} required />
          </label>
          <label>
            Vehicle number
            <input name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} required />
          </label>
          <label>
            Violation date
            <input type="date" name="violationDate" value={form.violationDate} onChange={handleChange} required />
          </label>
          <label>
            Region ID
            <input name="regionId" value={form.regionId} onChange={handleChange} required />
          </label>
          <label>
            Fine amount
            <input name="fineAmount" value={form.fineAmount} onChange={handleChange} required />
          </label>
          <label>
            Violation place
            <input name="violationPlace" value={form.violationPlace} onChange={handleChange} required />
          </label>
          <label>
            Violation details
            <input name="violationDetails" value={form.violationDetails} onChange={handleChange} required />
          </label>
          <label>
            Collection location
            <input name="licenseCollectionLocation" value={form.licenseCollectionLocation} onChange={handleChange} required />
          </label>
          <label>
            Due date (optional)
            <input type="datetime-local" name="dueAt" value={form.dueAt} onChange={handleChange} />
          </label>
          <button type="submit" disabled={saving}>Issue fine</button>
        </form>
        {error && <p className="form-error">{error}</p>}
      </div>

      <div className="panel">
        <h3>Issued fines</h3>
        {loading && <p>Loading fines...</p>}
        {!loading && fines.length === 0 && <p>No fines issued yet.</p>}
        {!loading && fines.length > 0 && (
          <div className="table">
            <div className="table-row header cols-5">
              <span>Reference</span>
              <span>Driver</span>
              <span>Violation date</span>
              <span>Amount</span>
              <span>Status</span>
            </div>
            {fines.map((fine) => (
              <div className="table-row cols-5" key={fine.id}>
                <span>{fine.fineReferenceNumber}</span>
                <span>{fine.driverUserId}</span>
                <span>{formatDate(fine.violationDate)}</span>
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

export default OfficerFines
