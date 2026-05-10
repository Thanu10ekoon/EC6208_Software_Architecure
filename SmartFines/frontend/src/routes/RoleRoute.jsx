import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const RoleRoute = ({ roles = [], children }) => {
  const { token, roles: userRoles } = useAuth()
  if (!token) {
    return <Navigate to="/login" replace />
  }
  const allowed = roles.length === 0 || roles.some((role) => userRoles.includes(role))
  if (!allowed) {
    return <Navigate to="/" replace />
  }
  return children
}

export default RoleRoute
