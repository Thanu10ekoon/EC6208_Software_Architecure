import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import DriverSignupScreen from '../screens/auth/DriverSignupScreen';
import OfficerSignupScreen from '../screens/auth/OfficerSignupScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="DriverSignup" component={DriverSignupScreen} />
      <Stack.Screen name="OfficerSignup" component={OfficerSignupScreen} />
    </Stack.Navigator>
  );
}
