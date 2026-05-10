import StatCard from '../components/StatCard'
import SectionHeader from '../components/SectionHeader'

const OfficerDashboard = () => {
  return (
    <div className="page">
      <SectionHeader title="Officer workspace" subtitle="Issue fines and track payments." />
      <div className="stat-grid">
        <StatCard label="Fines issued" value="48" helper="This month" />
        <StatCard label="Paid" value="32" helper="Settled" />
        <StatCard label="Disputed" value="4" helper="Under review" />
      </div>
    </div>
  )
}

export default OfficerDashboard
