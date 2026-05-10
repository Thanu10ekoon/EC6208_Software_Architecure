import { useEffect, useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import { createOfficer, listOfficers } from '../api/admin'

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  nic: '',
  password: '',
  officerCode: '',
  badgeNumber: '',
  stationName: '',
  regionId: '',
}

const AdminOfficers = () => {
  const [form, setForm] = useState(initialForm)
  const [officers, setOfficers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadOfficers = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listOfficers()
      setOfficers(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load officers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOfficers()
  }, [])

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await createOfficer({
        ...form,
        regionId: Number(form.regionId),
      })
      setForm(initialForm)
      loadOfficers()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create officer')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <SectionHeader title="Officer management" subtitle="Create and manage traffic officers." />
      <div className="panel">
        <form className="form grid" onSubmit={handleSubmit}>
          <label>
            Full name
            <input name="fullName" value={form.fullName} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Phone
            <input name="phone" value={form.phone} onChange={handleChange} required />
          </label>
          <label>
            NIC
            <input name="nic" value={form.nic} onChange={handleChange} />
          </label>
          <label>
            Badge number
            <input name="badgeNumber" value={form.badgeNumber} onChange={handleChange} required />
          </label>
          <label>
            Officer code
            <input name="officerCode" value={form.officerCode} onChange={handleChange} required />
          </label>
          <label>
            Station name
            <input name="stationName" value={form.stationName} onChange={handleChange} />
          </label>
          <label>
            Region ID
            <input name="regionId" value={form.regionId} onChange={handleChange} required />
          </label>
          <label>
            Password
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </label>
          <button type="submit" disabled={saving}>Create officer</button>
        </form>
        {error && <p className="form-error">{error}</p>}
      </div>

      <div className="panel">
        <h3>Officer directory</h3>
        {loading && <p>Loading officers...</p>}
        {!loading && officers.length === 0 && <p>No officers yet.</p>}
        {!loading && officers.length > 0 && (
          <div className="table">
            <div className="table-row header cols-5">
              <span>Name</span>
              <span>Badge</span>
              <span>Station</span>
              <span>Region</span>
              <span>Email</span>
            </div>
            {officers.map((officer) => (
              <div className="table-row cols-5" key={officer.userId}>
                <span>{officer.fullName}</span>
                <span>{officer.badgeNumber}</span>
                <span>{officer.stationName || '-'}</span>
                <span>{officer.regionName || officer.regionId}</span>
                <span>{officer.email}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminOfficers
