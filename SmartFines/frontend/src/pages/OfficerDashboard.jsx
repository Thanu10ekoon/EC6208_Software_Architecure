import { useEffect, useMemo, useState } from 'react'
import StatCard from '../components/StatCard'
import SectionHeader from '../components/SectionHeader'
import { listOfficerFines } from '../api/fines'

const OfficerDashboard = () => {
  const [fines, setFines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadFines = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listOfficerFines()
      setFines(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load fines')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFines()
  }, [])

  const stats = useMemo(() => {
    const statusOf = (fine) => String(fine?.status || '').toUpperCase()

    const totalFines = fines.length
    const paidCount = fines.filter((fine) => statusOf(fine) === 'PAID').length
    const disputedCount = fines.filter((fine) => statusOf(fine) === 'DISPUTED').length

    return {
      totalFines,
      paidCount,
      disputedCount,
    }
  }, [fines])

  return (
    <div className="page">
      <SectionHeader title="Officer workspace" subtitle="Issue fines and track payments." />
      {loading && <p>Loading stats...</p>}
      {error && <p className="form-error">{error}</p>}
      <div className="stat-grid">
        <StatCard label="Fines issued" value={stats.totalFines} helper="Loaded total" />
        <StatCard label="Paid" value={stats.paidCount} helper="Settled" />
        <StatCard label="Disputed" value={stats.disputedCount} helper="Under review" />
      </div>
    </div>
  )
}

export default OfficerDashboard
