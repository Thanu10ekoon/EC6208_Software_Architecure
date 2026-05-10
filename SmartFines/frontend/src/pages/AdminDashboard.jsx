import StatCard from '../components/StatCard'
import SectionHeader from '../components/SectionHeader'

const AdminDashboard = () => {
  return (
    <div className="page">
      <SectionHeader title="Admin control" subtitle="Monitor collections and manage officers." />
      <div className="stat-grid">
        <StatCard label="Total fines" value="1,842" helper="All regions" />
        <StatCard label="Collected" value="LKR 12.6M" helper="Paid fines" />
        <StatCard label="Outstanding" value="LKR 3.1M" helper="Pending" />
      </div>
    </div>
  )
}

export default AdminDashboard
