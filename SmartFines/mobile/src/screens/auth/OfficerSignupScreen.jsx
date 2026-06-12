import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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
import { officerSignup } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import FormInput from '../../components/FormInput';
import ErrorBanner from '../../components/ErrorBanner';
import { extractApiError } from '../../utils/apiError';
import { colors, fonts, radius, shadow, spacing } from '../../constants/theme';

const schema = yup.object({
  fullName: yup.string().trim().required('Full name is required'),
  badgeNumber: yup.string().trim().required('Badge number is required'),
  officerCode: yup.string().trim().required('Officer code is required'),
  email: yup.string().trim().email('Enter a valid email').required('Email is required'),
  phone: yup.string().trim().required('Phone number is required'),
  nic: yup.string().trim(),
  stationName: yup.string().trim(),
  regionId: yup
    .number()
    .typeError('Region ID is required')
    .integer('Region ID must be a whole number')
    .positive('Region ID must be positive')
    .required('Region ID is required'),
  password: yup
    .string()
    .min(8, 'Minimum 8 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm your password'),
});

export default function OfficerSignupScreen({ navigation }) {
  const { login } = useAuth();
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: '',
      badgeNumber: '',
      officerCode: '',
      email: '',
      phone: '',
      nic: '',
      stationName: '',
      regionId: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async ({ confirmPassword, ...data }) => {
    setApiError('');
    setLoading(true);

    try {
      const payload = {
        ...data,
        nic: data.nic || null,
        stationName: data.stationName || null,
        regionId: Number(data.regionId),
      };
      await officerSignup(payload);
      await login({
        loginType: 'OFFICER',
        identifier: data.badgeNumber,
        password: data.password,
      });
    } catch (err) {
      setApiError(extractApiError(err));
      setLoading(false);
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
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={18} color={colors.accentStrong} />
              <Text style={styles.backText}>Back to sign in</Text>
            </TouchableOpacity>

            <View style={styles.heroIcon}>
              <Ionicons name="shield-checkmark" size={27} color={colors.white} />
            </View>

            <View style={styles.cardHeader}>
              <Text style={styles.eyebrow}>OFFICER REGISTRATION</Text>
              <Text style={styles.heading}>Create officer account</Text>
              <Text style={styles.subtitle}>
                Register your official identity and station details for traffic-fine duties.
              </Text>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Official credentials</Text>
              <Text style={styles.sectionSubtitle}>
                These details identify you when issuing fines.
              </Text>
            </View>

            <Controller
              control={control}
              name="badgeNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Badge Number"
                  placeholder="e.g. SLP45872"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.badgeNumber?.message}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              )}
            />

            <Controller
              control={control}
              name="officerCode"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Officer Code"
                  placeholder="Enter your official officer code"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.officerCode?.message}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              )}
            />

            <Controller
              control={control}
              name="stationName"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Station Name (optional)"
                  placeholder="Assigned police station"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.stationName?.message}
                  autoCapitalize="words"
                />
              )}
            />

            <Controller
              control={control}
              name="regionId"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Region ID"
                  placeholder="e.g. 1"
                  value={String(value ?? '')}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.regionId?.message}
                  keyboardType="number-pad"
                />
              )}
            />

            <View style={styles.divider} />

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Personal details</Text>
              <Text style={styles.sectionSubtitle}>
                Used for account access and official communication.
              </Text>
            </View>

            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.fullName?.message}
                  autoCapitalize="words"
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Official Email"
                  placeholder="officer@example.com"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Phone Number"
                  placeholder="+94 77 123 4567"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.phone?.message}
                  keyboardType="phone-pad"
                />
              )}
            />

            <Controller
              control={control}
              name="nic"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="NIC (optional)"
                  placeholder="National Identity Card number"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.nic?.message}
                  autoCapitalize="characters"
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
                  placeholder="Minimum 8 characters"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  secureTextEntry
                  autoCapitalize="none"
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                  secureTextEntry
                  autoCapitalize="none"
                />
              )}
            />

            <ErrorBanner message={apiError} />

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="shield-checkmark-outline" size={19} color={colors.white} />
              )}
              <Text style={styles.submitButtonText}>
                {loading ? 'Creating officer account...' : 'Create officer account'}
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
  },
  backText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.accentStrong,
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceStrong,
    marginTop: spacing.sm,
  },
  cardHeader: {
    gap: 5,
    marginBottom: spacing.sm,
  },
  eyebrow: {
    fontSize: 10,
    fontFamily: fonts.bold,
    letterSpacing: 2,
    color: colors.accentStrong,
  },
  heading: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    lineHeight: 19,
  },
  sectionHeader: {
    gap: 3,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  submitButton: {
    minHeight: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.white,
  },
});
