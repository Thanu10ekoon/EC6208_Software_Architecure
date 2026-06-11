import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import FormInput from '../../components/FormInput';
import ErrorBanner from '../../components/ErrorBanner';
import { extractApiError } from '../../utils/apiError';
import { colors, fonts, radius, shadowStrong, spacing } from '../../constants/theme';

const schema = yup.object({
  identifier: yup.string().required('This field is required'),
  password: yup.string().required('Password is required'),
});

const ROLES = [
  { key: 'DRIVER', label: 'Driver', icon: 'car-outline' },
  { key: 'OFFICER', label: 'Officer', icon: 'shield-outline' },
];

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [role, setRole] = useState('DRIVER');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { identifier: '', password: '' },
  });

  const identifierLabel = useMemo(
    () => (role === 'DRIVER' ? 'NIC Number' : 'Badge Number'),
    [role]
  );
  const identifierPlaceholder = useMemo(
    () => (role === 'DRIVER' ? 'Enter your NIC number' : 'Enter your badge number'),
    [role]
  );

  const onSubmit = async ({ identifier, password }) => {
    setApiError('');
    setLoading(true);
    try {
      await login({ loginType: role, identifier, password });
    } catch (err) {
      setLoading(false);
      setApiError(extractApiError(err));
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <View style={styles.logoWrap}>
              <Ionicons name="shield-checkmark" size={30} color={colors.white} />
            </View>
            <Text style={styles.appName}>SmartFines</Text>
            <Text style={styles.tagline}>Fine management · Sri Lanka</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.heading}>Sign in</Text>
            <Text style={styles.headingSub}>Secure access for drivers and officers.</Text>

            <View style={styles.roleRow}>
              {ROLES.map((r) => (
                <Pressable
                  key={r.key}
                  style={[styles.roleBtn, role === r.key && styles.roleBtnActive]}
                  onPress={() => setRole(r.key)}
                >
                  <Ionicons
                    name={r.icon}
                    size={14}
                    color={role === r.key ? colors.white : colors.textMuted}
                  />
                  <Text style={[styles.roleBtnText, role === r.key && styles.roleBtnTextActive]}>
                    {r.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Controller
              control={control}
              name="identifier"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label={identifierLabel}
                  placeholder={identifierPlaceholder}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.identifier?.message}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Password"
                  placeholder="Enter your password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  secureTextEntry
                  autoCapitalize="none"
                />
              )}
            />

            <ErrorBanner message={apiError} />

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.white} style={styles.spinner} />
              ) : null}
              <Text style={styles.submitBtnText}>{loading ? 'Signing in…' : 'Sign in'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.footerLink}
              onPress={() => navigation.navigate('DriverSignup')}
              activeOpacity={0.7}
            >
              <Text style={styles.footerText}>
                No account?{' '}
                <Text style={styles.footerLinkText}>Create a driver account</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl * 1.5,
    paddingBottom: spacing.xl,
  },
  brand: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.surfaceStrong,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: 30,
    fontFamily: fonts.extraBold,
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadowStrong,
  },
  heading: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: colors.text,
    letterSpacing: -0.3,
  },
  headingSub: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    marginTop: -spacing.sm,
  },
  roleRow: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 3,
    gap: spacing.xs,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 9,
    gap: 6,
  },
  roleBtnActive: { backgroundColor: colors.accent },
  roleBtnText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  roleBtnTextActive: {
    fontFamily: fonts.semiBold,
    color: colors.white,
  },
  submitBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 15,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  submitBtnDisabled: { opacity: 0.65 },
  spinner: { marginRight: 2 },
  submitBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fonts.semiBold,
    letterSpacing: 0.2,
  },
  footerLink: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  footerText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  footerLinkText: {
    fontFamily: fonts.semiBold,
    color: colors.accentStrong,
  },
});
