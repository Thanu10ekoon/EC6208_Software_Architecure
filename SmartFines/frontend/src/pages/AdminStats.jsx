import { useEffect, useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import StatCard from '../components/StatCard'
import { getAdminStats } from '../api/admin'
import { formatCurrency } from '../utils/formatters'

const AdminStats = () => {
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
      <SectionHeader title="Regional statistics" subtitle="Collections by region." />
      {loading && <p>Loading stats...</p>}
      {error && <p className="form-error">{error}</p>}
      {stats && (
        <>
          <div className="stat-grid">
            <StatCard label="Total fines" value={stats.totalFines} helper="All regions" />
            <StatCard label="Paid fines" value={stats.paidFines} helper="Settled" />
            <StatCard label="Outstanding" value={formatCurrency(stats.totalOutstandingAmount)} helper="Pending" />
          </div>

          <div className="panel">
            <div className="table">
              <div className="table-row header cols-5">
                <span>Region</span>
                <span>Total fines</span>
                <span>Paid</span>
                <span>Collected</span>
                <span>Outstanding</span>
              </div>
              {stats.regionStats.map((region) => (
                <div className="table-row cols-5" key={region.regionId}>
                  <span>{region.regionName}</span>
                  <span>{region.totalFines}</span>
                  <span>{region.paidFines}</span>
                  <span>{formatCurrency(region.totalCollectedAmount)}</span>
                  <span>{formatCurrency(region.totalOutstandingAmount)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminStats
