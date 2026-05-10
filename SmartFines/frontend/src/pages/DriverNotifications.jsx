import { useEffect, useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import { listNotifications } from '../api/notifications'
import { formatDate } from '../utils/formatters'

const DriverNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadNotifications = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listNotifications()
      setNotifications(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  return (
    <div className="page">
      <SectionHeader title="Notifications" subtitle="Updates on your fines and recollections." />
      <div className="panel list">
        {loading && <p>Loading notifications...</p>}
        {error && <p className="form-error">{error}</p>}
        {!loading && !error && notifications.length === 0 && <p>No notifications yet.</p>}
        {!loading && !error && notifications.map((notification) => (
          <div className="list-item" key={notification.id}>
            <div>
              <p className="list-title">{notification.title}</p>
              <span className="list-meta">{notification.message} · {formatDate(notification.createdAt)}</span>
            </div>
            <span className={`status ${notification.isRead ? 'success' : 'pending'}`}>
              {notification.isRead ? 'Read' : 'New'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DriverNotifications
