import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/auth/LoginScreen';
import DriverSignupScreen from './src/screens/auth/DriverSignupScreen';
import { colors, spacing } from './src/constants/theme';

const Stack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="DriverSignup" component={DriverSignupScreen} />
    </Stack.Navigator>
  );
}

function AppPlaceholder() {
  const { session, logout } = useAuth();
  return (
    <View style={styles.placeholder}>
      <Text style={styles.welcomeText}>Welcome, {session?.fullName}</Text>
      <Text style={styles.roleText}>{session?.roles?.join(', ')}</Text>
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

function AppContent() {
  const { session, isLoading } = useAuth();
  if (isLoading) return null;
  return session ? <AppPlaceholder /> : <AuthNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  roleText: {
    fontSize: 14,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  logoutBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: 12,
  },
  logoutText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 15,
  },
});
