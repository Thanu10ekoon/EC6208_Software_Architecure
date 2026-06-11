import { useMemo, useState } from 'react';
import {
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
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import FormInput from '../../components/FormInput';
import { extractApiError } from '../../utils/apiError';
import { colors, radius, shadow, spacing } from '../../constants/theme';

const schema = yup.object({
  identifier: yup.string().required('This field is required'),
  password: yup.string().required('Password is required'),
});

const ROLES = [
  { key: 'DRIVER', label: 'Driver' },
  { key: 'OFFICER', label: 'Officer' },
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
          <View style={styles.card}>
            <Text style={styles.badge}>SMARTFINES</Text>
            <Text style={styles.heading}>Sign in</Text>
            <Text style={styles.subtitle}>Secure access for officers and drivers.</Text>

            <View style={styles.roleRow}>
              {ROLES.map((r) => (
                <Pressable
                  key={r.key}
                  style={[styles.roleBtn, role === r.key && styles.roleBtnActive]}
                  onPress={() => setRole(r.key)}
                >
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
                  placeholder={identifierLabel}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.identifier?.message}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType={role === 'DRIVER' ? 'default' : 'default'}
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

            {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              activeOpacity={0.85}
            >
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
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadow,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: colors.accentStrong,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  roleRow: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 4,
    gap: spacing.xs,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  roleBtnActive: {
    backgroundColor: colors.accent,
  },
  roleBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  roleBtnTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  apiError: {
    fontSize: 13,
    color: colors.danger,
  },
  submitBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  footerLink: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  footerText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  footerLinkText: {
    color: colors.accentStrong,
    fontWeight: '600',
  },
});
