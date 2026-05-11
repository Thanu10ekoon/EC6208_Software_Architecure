import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import AppShell from './layouts/AppShell'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRoute from './routes/RoleRoute'
import { useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import DriverSignup from './pages/DriverSignup'
import AdminDashboard from './pages/AdminDashboard'
import OfficerDashboard from './pages/OfficerDashboard'
import DriverDashboard from './pages/DriverDashboard'
import DriverFines from './pages/DriverFines'
import DriverPayments from './pages/DriverPayments'
import DriverNotifications from './pages/DriverNotifications'
import OfficerFines from './pages/OfficerFines'
import AdminOfficers from './pages/AdminOfficers'
import AdminStats from './pages/AdminStats'
import AdminPayments from './pages/AdminPayments'
import NotFound from './pages/NotFound'

const RoleHome = () => {
  const { roles } = useAuth()
  if (roles.includes('admin')) return <AdminDashboard />
  if (roles.includes('traffic_officer')) return <OfficerDashboard />
  if (roles.includes('driver')) return <DriverDashboard />
  return <Home />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<DriverSignup />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell>
              <RoleHome />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/driver/fines"
        element={
          <RoleRoute roles={['driver']}>
            <AppShell>
              <DriverFines />
            </AppShell>
          </RoleRoute>
        }
      />
      <Route
        path="/driver/payments"
        element={
          <RoleRoute roles={['driver']}>
            <AppShell>
              <DriverPayments />
            </AppShell>
          </RoleRoute>
        }
      />
      <Route
        path="/driver/notifications"
        element={
          <RoleRoute roles={['driver']}>
            <AppShell>
              <DriverNotifications />
            </AppShell>
          </RoleRoute>
        }
      />

      <Route
        path="/officer/fines"
        element={
          <RoleRoute roles={['traffic_officer']}>
            <AppShell>
              <OfficerFines />
            </AppShell>
          </RoleRoute>
        }
      />

      <Route
        path="/admin/officers"
        element={
          <RoleRoute roles={['admin']}>
            <AppShell>
              <AdminOfficers />
            </AppShell>
          </RoleRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <RoleRoute roles={['admin']}>
            <AppShell>
              <AdminPayments />
            </AppShell>
          </RoleRoute>
        }
      />
      <Route
        path="/admin/stats"
        element={
          <RoleRoute roles={['admin']}>
            <AppShell>
              <AdminStats />
            </AppShell>
          </RoleRoute>
        }
      />

      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
