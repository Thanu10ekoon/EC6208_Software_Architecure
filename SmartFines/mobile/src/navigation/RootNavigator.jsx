import { View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/theme';
import AuthStack from './AuthStack';
import DriverTabs from './DriverTabs';
import OfficerTabs from './OfficerTabs';

export default function RootNavigator() {
  const { session, isLoading } = useAuth();
  if (isLoading) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  if (!session) return <AuthStack />;
  if (session.roles.includes('traffic_officer')) return <OfficerTabs />;
  return <DriverTabs />;
}
