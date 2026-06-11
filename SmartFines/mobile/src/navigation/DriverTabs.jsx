import { useEffect, useState } from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import DriverDashboardScreen from '../screens/driver/DriverDashboardScreen';
import DriverFinesScreen from '../screens/driver/DriverFinesScreen';
import DriverPaymentsScreen from '../screens/driver/DriverPaymentsScreen';
import StripeCheckoutScreen from '../screens/driver/StripeCheckoutScreen';
import PaymentSuccessScreen from '../screens/driver/PaymentSuccessScreen';
import NotificationsScreen from '../screens/driver/NotificationsScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { listNotifications } from '../api/notifications';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function PaymentsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DriverPayments" component={DriverPaymentsScreen} />
      <Stack.Screen name="StripeCheckout" component={StripeCheckoutScreen} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
    </Stack.Navigator>
  );
}

function tabIcon(route, focused, color) {
  const icons = {
    Dashboard: focused ? 'home' : 'home-outline',
    Fines: focused ? 'document-text' : 'document-text-outline',
    Payments: focused ? 'card' : 'card-outline',
    Notifications: focused ? 'notifications' : 'notifications-outline',
  };
  return <Ionicons name={icons[route.name]} size={22} color={color} />;
}

export default function DriverTabs() {
  const insets = useSafeAreaInsets();
  const { session, logout } = useAuth();
  const fullName = session?.fullName ?? 'Driver';
  const [notifBadge, setNotifBadge] = useState(undefined);

  useEffect(() => {
    listNotifications()
      .then(data => {
        const count = Array.isArray(data) ? data.filter(n => !n.isRead).length : 0;
        setNotifBadge(count > 0 ? count : undefined);
      })
      .catch(() => {});
  }, []);

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
      <Tab.Screen name="Dashboard" component={DriverDashboardScreen} options={dashboardHeaderOptions} />
      <Tab.Screen name="Fines" component={DriverFinesScreen} />
      <Tab.Screen name="Payments" component={PaymentsStack} />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ tabBarBadge: notifBadge }}
      />
    </Tab.Navigator>
  );
}
