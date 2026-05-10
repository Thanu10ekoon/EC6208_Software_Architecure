import StatCard from '../components/StatCard'
import SectionHeader from '../components/SectionHeader'

const DriverDashboard = () => {
  return (
    <div className="page">
      <SectionHeader title="Driver dashboard" subtitle="Stay on top of your fines and receipts." />
      <div className="stat-grid">
        <StatCard label="Active fines" value="3" helper="Due this month" />
        <StatCard label="Stars left" value="4" helper="Safe driving" />
        <StatCard label="Receipts" value="2" helper="Uploaded" />
      </div>
    </div>
  )
}

export default DriverDashboard
