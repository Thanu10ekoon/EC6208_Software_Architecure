import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { getAuthToken, setAuthToken } from '../api/client'
import { login as loginApi } from '../api/auth'

const AuthContext = createContext(null)
const USER_KEY = 'smartfines.user'

const loadUser = () => {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(loadUser)
  const [token, setToken] = useState(getAuthToken())

  const login = useCallback(async ({ loginType, identifier, password }) => {
    const response = await loginApi({ loginType, identifier, password })
    setAuthToken(response.accessToken)
    localStorage.setItem(USER_KEY, JSON.stringify(response))
    setToken(response.accessToken)
    setUser(response)
    return response
  }, [])

  const logout = useCallback(() => {
    setAuthToken(null)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      roles: user?.roles || [],
    }),
    [user, token, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
