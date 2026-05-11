import { useEffect, useState } from 'react'
import StatCard from '../components/StatCard'
import SectionHeader from '../components/SectionHeader'
import { getAdminStats } from '../api/admin'
import { formatCurrency } from '../utils/formatters'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadStats = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAdminStats()
      setStats(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  return (
    <div className="page">
      <SectionHeader title="Admin control" subtitle="Monitor collections and manage officers." />
      {loading && <p>Loading stats...</p>}
      {error && <p className="form-error">{error}</p>}
      {stats && (
        <div className="stat-grid">
          <StatCard label="Total fines" value={stats.totalFines} helper="All regions" />
          <StatCard label="Collected" value={formatCurrency(stats.totalCollectedAmount)} helper="Paid fines" />
          <StatCard label="Outstanding" value={formatCurrency(stats.totalOutstandingAmount)} helper="Pending" />
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
