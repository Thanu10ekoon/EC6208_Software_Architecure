import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loginType, setLoginType] = useState('DRIVER')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const label = useMemo(() => {
    if (loginType === 'ADMIN') return 'Admin username or email'
    if (loginType === 'OFFICER') return 'Officer badge number'
    return 'Driver NIC'
  }, [loginType])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await login({ loginType, identifier, password })
      if (response.roles.includes('admin')) navigate('/admin/officers')
      else if (response.roles.includes('traffic_officer')) navigate('/officer/fines')
      else navigate('/driver/fines')
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <p className="badge">SmartFines</p>
          <h1>Sign in</h1>
          <p className="auth-subtitle">Secure access for admins, officers, and drivers.</p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <label>
            Role
            <select value={loginType} onChange={(event) => setLoginType(event.target.value)}>
              <option value="ADMIN">Admin</option>
              <option value="OFFICER">Traffic officer</option>
              <option value="DRIVER">Driver</option>
            </select>
          </label>

          <label>
            {label}
            <input
              type="text"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder={label}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          Driver account? <a href="/signup">Create one</a>
        </p>
      </div>
    </div>
  )
}

export default Login
