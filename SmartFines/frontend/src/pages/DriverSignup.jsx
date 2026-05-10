import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { driverSignup } from '../api/auth'

const DriverSignup = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    nic: '',
    password: '',
    licenseNumber: '',
    dateOfBirth: '',
    address: '',
    regionId: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await driverSignup({
        ...form,
        regionId: form.regionId ? Number(form.regionId) : null,
      })
      navigate('/login')
    } catch (err) {
      setError(err?.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card wide">
        <div className="auth-header">
          <p className="badge">Driver onboarding</p>
          <h1>Create your account</h1>
          <p className="auth-subtitle">Join SmartFines to manage your penalties and receipts.</p>
        </div>

        <form onSubmit={handleSubmit} className="form grid">
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
            <input name="nic" value={form.nic} onChange={handleChange} required />
          </label>
          <label>
            Password
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </label>
          <label>
            License number
            <input name="licenseNumber" value={form.licenseNumber} onChange={handleChange} required />
          </label>
          <label>
            Date of birth
            <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required />
          </label>
          <label>
            Address
            <input name="address" value={form.address} onChange={handleChange} />
          </label>
          <label>
            Region ID
            <input name="regionId" value={form.regionId} onChange={handleChange} />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default DriverSignup
