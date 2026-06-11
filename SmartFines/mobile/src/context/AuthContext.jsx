import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin } from '../api/auth';

const TOKEN_KEY = 'smartfines.token';
const SESSION_KEY = 'smartfines.session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY)
      .then((raw) => { if (raw) setSession(JSON.parse(raw)); })
      .finally(() => { setIsLoading(false); });
  }, []);

  const login = async (credentials) => {
    const data = await apiLogin(credentials);
    const sess = {
      accessToken: data.accessToken,
      userId: data.userId,
      fullName: data.fullName,
      roles: data.roles ?? [],
      status: data.status,
    };
    await AsyncStorage.multiSet([
      [TOKEN_KEY, data.accessToken],
      [SESSION_KEY, JSON.stringify(sess)],
    ]);
    setSession(sess);
    return sess;
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, SESSION_KEY]);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
