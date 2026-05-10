const StatCard = ({ label, value, helper }) => {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <h3 className="stat-value">{value}</h3>
      {helper && <span className="stat-helper">{helper}</span>}
    </div>
  )
}

export default StatCard
