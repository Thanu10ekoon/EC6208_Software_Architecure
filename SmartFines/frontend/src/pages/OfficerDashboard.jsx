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
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const issuedThisMonth = fines.filter((fine) => {
      if (!fine?.issuedAt) {
        return false
      }
      const issuedAt = new Date(fine.issuedAt)
      return issuedAt.getMonth() === currentMonth && issuedAt.getFullYear() === currentYear
    }).length

    const paidCount = fines.filter((fine) => fine?.status === 'PAID').length
    const disputedCount = fines.filter((fine) => fine?.status === 'DISPUTED').length

    return {
      issuedThisMonth,
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
        <StatCard label="Fines issued" value={stats.issuedThisMonth} helper="This month" />
        <StatCard label="Paid" value={stats.paidCount} helper="Settled" />
        <StatCard label="Disputed" value={stats.disputedCount} helper="Under review" />
      </div>
    </div>
  )
}

export default OfficerDashboard
