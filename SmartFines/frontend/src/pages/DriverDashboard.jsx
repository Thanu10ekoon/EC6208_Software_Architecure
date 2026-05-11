import { useEffect, useMemo, useState } from 'react'
import StatCard from '../components/StatCard'
import SectionHeader from '../components/SectionHeader'
import { listDriverFines } from '../api/fines'
import { listPayments } from '../api/payments'

const DriverDashboard = () => {
  const [fines, setFines] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      const [finesData, paymentsData] = await Promise.all([listDriverFines(), listPayments()])
      setFines(Array.isArray(finesData) ? finesData : [])
      setPayments(Array.isArray(paymentsData) ? paymentsData : [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const stats = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const activeFines = fines.filter((fine) =>
      fine?.status && !['PAID', 'CANCELLED', 'VOID'].includes(fine.status)
    )

    const dueThisMonth = activeFines.filter((fine) => {
      if (!fine?.dueAt) {
        return false
      }
      const dueAt = new Date(fine.dueAt)
      return dueAt.getMonth() === currentMonth && dueAt.getFullYear() === currentYear
    }).length

    const receiptsUploaded = payments.filter(
      (payment) => payment?.paymentMethod === 'RECEIPT_UPLOAD'
    ).length

    const starsLeft = Math.max(0, 5 - activeFines.length)

    return {
      dueThisMonth,
      receiptsUploaded,
      starsLeft,
    }
  }, [fines, payments])

  return (
    <div className="page">
      <SectionHeader title="Driver dashboard" subtitle="Stay on top of your fines and receipts." />
      {loading && <p>Loading stats...</p>}
      {error && <p className="form-error">{error}</p>}
      <div className="stat-grid">
        <StatCard label="Active fines" value={stats.dueThisMonth} helper="Due this month" />
        <StatCard label="Stars left" value={stats.starsLeft} helper="Safe driving" />
        <StatCard label="Receipts" value={stats.receiptsUploaded} helper="Uploaded" />
      </div>
    </div>
  )
}

export default DriverDashboard
