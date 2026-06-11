import { Alert, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import OfficerDashboardScreen from '../screens/officer/OfficerDashboardScreen';
import IssueFineScreen from '../screens/officer/IssueFineScreen';
import OfficerFinesScreen from '../screens/officer/OfficerFinesScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

function tabIcon(route, focused, color) {
  const icons = {
    Dashboard: focused ? 'home' : 'home-outline',
    IssueFine: focused ? 'add-circle' : 'add-circle-outline',
    MyFines: focused ? 'document-text' : 'document-text-outline',
  };
  return <Ionicons name={icons[route.name]} size={22} color={color} />;
}

export default function OfficerTabs() {
  const insets = useSafeAreaInsets();
  const { session, logout } = useAuth();
  const fullName = session?.fullName ?? 'Officer';

  const confirmLogout = () => {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: logout },
      ],
      { cancelable: true }
    );
  };

  const tabBarStyle = {
    backgroundColor: colors.surfaceStrong,
    borderTopWidth: 0,
    height: 68 + insets.bottom,
    paddingTop: 10,
    paddingBottom: insets.bottom + 8,
  };

  const dashboardHeaderOptions = {
    headerShown: true,
    headerTitle: `Hi, ${fullName}`,
    headerTitleStyle: {
      color: colors.text,
      fontSize: 18,
      fontFamily: fonts.bold,
      letterSpacing: -0.3,
    },
    headerStyle: { backgroundColor: colors.bg },
    headerShadowVisible: false,
    headerRight: () => (
      <TouchableOpacity onPress={confirmLogout} style={{ marginRight: 16, padding: 4 }}>
        <Ionicons name="log-out-outline" size={24} color={colors.accent} />
      </TouchableOpacity>
    ),
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: fonts.semiBold,
          marginTop: 1,
        },
        tabBarItemStyle: { paddingHorizontal: 0 },
        tabBarIcon: ({ focused, color }) => tabIcon(route, focused, color),
      })}
    >
      <Tab.Screen name="Dashboard" component={OfficerDashboardScreen} options={dashboardHeaderOptions} />
      <Tab.Screen
        name="IssueFine"
        component={IssueFineScreen}
        options={{ tabBarLabel: 'Issue Fine' }}
      />
      <Tab.Screen
        name="MyFines"
        component={OfficerFinesScreen}
        options={{ tabBarLabel: 'Issued Fines' }}
      />
    </Tab.Navigator>
  );
}
