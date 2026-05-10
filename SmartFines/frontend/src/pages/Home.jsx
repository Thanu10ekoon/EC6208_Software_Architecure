import { useAuth } from '../context/AuthContext'
import StatCard from '../components/StatCard'
import SectionHeader from '../components/SectionHeader'

const Home = () => {
  const { roles } = useAuth()

  return (
    <div className="page">
      <SectionHeader
        title="Overview"
        subtitle="Live snapshot of fines, payments, and recollections"
      />

      <div className="stat-grid">
        <StatCard label="Active Fines" value="128" helper="Last 30 days" />
        <StatCard label="Payments Received" value="LKR 2.4M" helper="Paid online" />
        <StatCard label="Pending Recollections" value="18" helper="Awaiting confirmation" />
      </div>

      <div className="panel">
        <h3>Quick actions</h3>
        <div className="chip-row">
          {roles.includes('admin') && <span className="chip">Add officer</span>}
          {roles.includes('traffic_officer') && <span className="chip">Issue fine</span>}
          {roles.includes('driver') && <span className="chip">Pay a fine</span>}
          <span className="chip ghost">Review notifications</span>
        </div>
      </div>
    </div>
  )
}

export default Home
