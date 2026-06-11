import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import DriverTabs from './DriverTabs';
import OfficerTabs from './OfficerTabs';

export default function RootNavigator() {
  const { session, isLoading } = useAuth();
  if (isLoading) return null;
  if (!session) return <AuthStack />;
  if (session.roles.includes('traffic_officer')) return <OfficerTabs />;
  return <DriverTabs />;
}
