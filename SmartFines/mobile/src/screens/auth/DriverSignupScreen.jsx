import { useState } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { driverSignup } from '../../api/auth';
import FormInput from '../../components/FormInput';
import ErrorBanner from '../../components/ErrorBanner';
import { extractApiError } from '../../utils/apiError';
import { colors, fonts, radius, shadow, spacing } from '../../constants/theme';

const schema = yup.object({
  fullName: yup.string().required('Full name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  nic: yup.string().required('NIC is required'),
  password: yup.string().min(8, 'Minimum 8 characters').required('Password is required'),
  licenseNumber: yup.string().required('License number is required'),
  dateOfBirth: yup.string().required('Date of birth is required'),
  address: yup.string(),
  regionId: yup
    .number()
    .integer()
    .positive('Must be a positive number')
    .nullable()
    .transform((v, o) => (o === '' ? null : v)),
});

export default function DriverSignupScreen({ navigation }) {
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      nic: '',
      password: '',
      licenseNumber: '',
      dateOfBirth: '',
      address: '',
      regionId: '',
    },
  });

  const dateOfBirth = watch('dateOfBirth');

  const onSubmit = async (data) => {
    setApiError('');
    setLoading(true);
    try {
      await driverSignup({
        ...data,
        regionId: data.regionId ? Number(data.regionId) : null,
      });
      navigation.navigate('Login');
    } catch (err) {
      setApiError(extractApiError(err));
    } finally {
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
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={18} color={colors.accentStrong} />
              <Text style={styles.backText}>Back to sign in</Text>
            </TouchableOpacity>

            <View style={styles.cardHeader}>
              <Text style={styles.eyebrow}>DRIVER ONBOARDING</Text>
              <Text style={styles.heading}>Create account</Text>
              <Text style={styles.subtitle}>Join SmartFines to manage your fines and payments.</Text>
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
                  label="Email"
                  placeholder="you@example.com"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Phone"
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
                  label="NIC"
                  placeholder="National Identity Card number"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.nic?.message}
                  autoCapitalize="none"
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
              name="licenseNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="License Number"
                  placeholder="Driver license number"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.licenseNumber?.message}
                  autoCapitalize="characters"
                />
              )}
            />

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, errors.dateOfBirth && styles.fieldLabelError]}>
                Date of Birth
              </Text>
              <Pressable
                style={[styles.dateBtn, errors.dateOfBirth ? styles.dateBtnError : null]}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={dateOfBirth ? colors.text : colors.textMuted}
                />
                <Text style={[styles.dateBtnText, !dateOfBirth && styles.datePlaceholder]}>
                  {dateOfBirth || 'Select date of birth'}
                </Text>
              </Pressable>
              {errors.dateOfBirth ? (
                <Text style={styles.fieldError}>{errors.dateOfBirth.message}</Text>
              ) : null}
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={dateOfBirth ? new Date(dateOfBirth) : new Date(2000, 0, 1)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={(event, date) => {
                  if (Platform.OS === 'android') setShowDatePicker(false);
                  if (event.type !== 'dismissed' && date) {
                    setValue('dateOfBirth', date.toISOString().split('T')[0], {
                      shouldValidate: true,
                    });
                  }
                  if (Platform.OS === 'ios' && event.type === 'set') setShowDatePicker(false);
                }}
              />
            )}

            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Address (optional)"
                  placeholder="Home address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.address?.message}
                  autoCapitalize="sentences"
                  multiline
                  numberOfLines={2}
                  containerStyle={styles.multilineContainer}
                  style={styles.multilineInput}
                />
              )}
            />

            <Controller
              control={control}
              name="regionId"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Region ID (optional)"
                  placeholder="e.g. 1"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.regionId?.message}
                  keyboardType="number-pad"
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
              <Text style={styles.submitBtnText}>
                {loading ? 'Creating account…' : 'Create account'}
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.xs,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.accentStrong,
  },
  cardHeader: {
    gap: 4,
    marginBottom: spacing.xs,
  },
  eyebrow: {
    fontSize: 10,
    fontFamily: fonts.bold,
    letterSpacing: 2,
    color: colors.accentStrong,
    textTransform: 'uppercase',
  },
  heading: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.text,
    letterSpacing: -0.3,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    lineHeight: 19,
  },
  fieldGroup: { gap: 6 },
  fieldLabel: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.text,
    letterSpacing: 0.1,
  },
  fieldLabelError: { color: colors.danger },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateBtnError: { borderColor: colors.danger },
  dateBtnText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  datePlaceholder: { color: colors.textMuted },
  fieldError: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.danger,
  },
  multilineContainer: {},
  multilineInput: {
    height: 64,
    textAlignVertical: 'top',
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
});
