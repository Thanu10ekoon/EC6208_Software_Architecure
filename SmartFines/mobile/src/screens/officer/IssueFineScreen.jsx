import { useRef, useState } from 'react';
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
import { issueFine } from '../../api/officerFines';
import ErrorBanner from '../../components/ErrorBanner';
import FormInput from '../../components/FormInput';
import { colors, fonts, radius, shadow, spacing } from '../../constants/theme';
import { extractApiError } from '../../utils/apiError';

function formatDateForApi(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTimeForApi(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function dateFromForm(value, fallback = new Date()) {
  if (!value) return fallback;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

function timeFromForm(value, fallback = new Date()) {
  if (!value) return fallback;
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date(fallback);
  date.setHours(hours, minutes, 0, 0);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

function buildDueAt(dueDate, dueTime) {
  if (!dueDate || !dueTime) return null;
  const [year, month, day] = dueDate.split('-').map(Number);
  const [hours, minutes] = dueTime.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

const schema = yup
  .object({
    driverNic: yup
      .string()
      .trim()
      .max(30, 'Maximum 30 characters')
      .required('Driver NIC is required'),
    vehicleNumber: yup
      .string()
      .trim()
      .max(30, 'Maximum 30 characters')
      .required('Vehicle number is required'),
    violationDate: yup
      .string()
      .required('Violation date is required')
      .test(
        'not-in-future',
        'Violation date cannot be in the future',
        (value) => !value || value <= formatDateForApi(new Date())
      ),
    violationDetails: yup
      .string()
      .trim()
      .required('Violation details are required'),
    violationPlace: yup
      .string()
      .trim()
      .max(255, 'Maximum 255 characters')
      .required('Violation place is required'),
    fineAmount: yup
      .number()
      .typeError('Enter a valid fine amount')
      .positive('Fine amount must be greater than zero')
      .required('Fine amount is required')
      .transform((value, originalValue) => (originalValue === '' ? undefined : value)),
    regionId: yup
      .number()
      .typeError('Enter a valid region ID')
      .integer('Region ID must be a whole number')
      .positive('Region ID must be greater than zero')
      .required('Region ID is required')
      .transform((value, originalValue) => (originalValue === '' ? undefined : value)),
    licenseCollectionLocation: yup
      .string()
      .trim()
      .max(255, 'Maximum 255 characters')
      .required('Licence collection location is required'),
    dueDate: yup.string(),
    dueTime: yup.string(),
  })
  .test('complete-due-date', 'Select both a due date and time', function validateDue(values) {
    if (!values?.dueDate && !values?.dueTime) return true;

    if (!values?.dueDate) {
      return this.createError({
        path: 'dueDate',
        message: 'Select a due date',
      });
    }

    if (!values?.dueTime) {
      return this.createError({
        path: 'dueTime',
        message: 'Select a due time',
      });
    }

    if (values.violationDate && values.dueDate < values.violationDate) {
      return this.createError({
        path: 'dueDate',
        message: 'Due date cannot be before the violation date',
      });
    }

    return true;
  });

function defaultValues() {
  return {
    driverNic: '',
    vehicleNumber: '',
    violationDate: formatDateForApi(new Date()),
    violationDetails: '',
    violationPlace: '',
    fineAmount: '',
    regionId: '',
    licenseCollectionLocation: '',
    dueDate: '',
    dueTime: '',
  };
}

export default function IssueFineScreen({ navigation }) {
  const scrollRef = useRef(null);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [activePicker, setActivePicker] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: defaultValues(),
  });

  const violationDate = watch('violationDate');
  const dueDate = watch('dueDate');
  const dueTime = watch('dueTime');

  const onSubmit = async (data) => {
    setApiError('');
    setSuccess(null);
    setLoading(true);

    try {
      const dueAt = buildDueAt(data.dueDate, data.dueTime);
      const createdFine = await issueFine({
        driverNic: data.driverNic.trim(),
        regionId: Number(data.regionId),
        vehicleNumber: data.vehicleNumber.trim().toUpperCase(),
        violationDate: data.violationDate,
        violationDetails: data.violationDetails.trim(),
        violationPlace: data.violationPlace.trim(),
        fineAmount: Number(data.fineAmount),
        licenseCollectionLocation: data.licenseCollectionLocation.trim(),
        dueAt: dueAt ? dueAt.toISOString() : null,
      });

      setSuccess(createdFine);
      reset(defaultValues());
      setActivePicker(null);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } catch (err) {
      setApiError(extractApiError(err));
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } finally {
      setLoading(false);
    }
  };

  const clearDueDate = () => {
    setValue('dueDate', '', { shouldValidate: true });
    setValue('dueTime', '', { shouldValidate: true });
    setActivePicker(null);
  };

  const pickerValue = () => {
    if (activePicker === 'violationDate') {
      return dateFromForm(violationDate);
    }

    if (activePicker === 'dueDate') {
      return dateFromForm(dueDate);
    }

    return timeFromForm(dueTime, dateFromForm(dueDate));
  };

  const handlePickerChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setActivePicker(null);
    if (event.type === 'dismissed' || !selectedDate) return;

    if (activePicker === 'violationDate') {
      setValue('violationDate', formatDateForApi(selectedDate), {
        shouldValidate: true,
      });
    } else if (activePicker === 'dueDate') {
      setValue('dueDate', formatDateForApi(selectedDate), {
        shouldValidate: true,
      });
      if (!dueTime) {
        const defaultTime = new Date();
        defaultTime.setHours(23, 59, 0, 0);
        setValue('dueTime', formatTimeForApi(defaultTime), {
          shouldValidate: true,
        });
      }
    } else if (activePicker === 'dueTime') {
      setValue('dueTime', formatTimeForApi(selectedDate), {
        shouldValidate: true,
      });
    }

    if (Platform.OS === 'ios') setActivePicker(null);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.pageHeader}>
            <Text style={styles.eyebrow}>ISSUE FINE</Text>
            <Text style={styles.title}>New traffic violation</Text>
            <Text style={styles.subtitle}>
              Record the driver, vehicle, violation, and collection details.
            </Text>
          </View>

          {success ? (
            <View style={styles.successBanner}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark" size={18} color={colors.white} />
              </View>
              <View style={styles.successCopy}>
                <Text style={styles.successTitle}>Fine issued successfully</Text>
                <Text style={styles.successText}>
                  Reference: {success.fineReferenceNumber ?? 'Created'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('MyFines')}
                activeOpacity={0.7}
                style={styles.successAction}
              >
                <Text style={styles.successActionText}>View</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <ErrorBanner message={apiError} />

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Driver and vehicle</Text>

            <Controller
              control={control}
              name="driverNic"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Driver NIC"
                  placeholder="Enter the driver's NIC"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.driverNic?.message}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={30}
                />
              )}
            />

            <Controller
              control={control}
              name="vehicleNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Vehicle Number"
                  placeholder="e.g. ABC-1234"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.vehicleNumber?.message}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={30}
                />
              )}
            />

            <Text style={styles.sectionLabel}>Violation details</Text>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, errors.violationDate && styles.fieldLabelError]}>
                Violation Date
              </Text>
              <Pressable
                style={[styles.pickerButton, errors.violationDate && styles.pickerButtonError]}
                onPress={() => setActivePicker('violationDate')}
              >
                <Ionicons name="calendar-outline" size={17} color={colors.textMuted} />
                <Text style={styles.pickerButtonText}>{violationDate}</Text>
                <Ionicons name="chevron-down" size={15} color={colors.textMuted} />
              </Pressable>
              {errors.violationDate ? (
                <Text style={styles.fieldError}>{errors.violationDate.message}</Text>
              ) : null}
            </View>

            <Controller
              control={control}
              name="violationDetails"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Violation Details"
                  placeholder="Describe the traffic violation"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.violationDetails?.message}
                  autoCapitalize="sentences"
                  multiline
                  numberOfLines={4}
                  style={styles.multilineInput}
                />
              )}
            />

            <Controller
              control={control}
              name="violationPlace"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Violation Place"
                  placeholder="Street, junction, or town"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.violationPlace?.message}
                  autoCapitalize="words"
                  maxLength={255}
                />
              )}
            />

            <View style={styles.twoColumnRow}>
              <View style={styles.column}>
                <Controller
                  control={control}
                  name="fineAmount"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormInput
                      label="Fine Amount"
                      placeholder="LKR"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.fineAmount?.message}
                      keyboardType="decimal-pad"
                    />
                  )}
                />
              </View>
              <View style={styles.column}>
                <Controller
                  control={control}
                  name="regionId"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormInput
                      label="Region ID"
                      placeholder="e.g. 1"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.regionId?.message}
                      keyboardType="number-pad"
                    />
                  )}
                />
              </View>
            </View>

            <Text style={styles.sectionLabel}>Collection and due date</Text>

            <Controller
              control={control}
              name="licenseCollectionLocation"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Licence Collection Location"
                  placeholder="Station or collection office"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.licenseCollectionLocation?.message}
                  autoCapitalize="words"
                  maxLength={255}
                />
              )}
            />

            <View style={styles.optionalHeader}>
              <Text style={styles.optionalTitle}>Payment Due Date and Time</Text>
              <Text style={styles.optionalTag}>Optional</Text>
            </View>

            <View style={styles.twoColumnRow}>
              <View style={styles.column}>
                <Pressable
                  style={[styles.pickerButton, errors.dueDate && styles.pickerButtonError]}
                  onPress={() => setActivePicker('dueDate')}
                >
                  <Ionicons name="calendar-outline" size={17} color={colors.textMuted} />
                  <Text
                    style={[
                      styles.pickerButtonText,
                      !dueDate && styles.pickerPlaceholder,
                    ]}
                    numberOfLines={1}
                  >
                    {dueDate || 'Due date'}
                  </Text>
                </Pressable>
                {errors.dueDate ? (
                  <Text style={styles.fieldError}>{errors.dueDate.message}</Text>
                ) : null}
              </View>

              <View style={styles.column}>
                <Pressable
                  style={[
                    styles.pickerButton,
                    !dueDate && styles.pickerButtonDisabled,
                    errors.dueTime && styles.pickerButtonError,
                  ]}
                  onPress={() => dueDate && setActivePicker('dueTime')}
                  disabled={!dueDate}
                >
                  <Ionicons name="time-outline" size={17} color={colors.textMuted} />
                  <Text
                    style={[
                      styles.pickerButtonText,
                      !dueTime && styles.pickerPlaceholder,
                    ]}
                  >
                    {dueTime || 'Due time'}
                  </Text>
                </Pressable>
                {errors.dueTime ? (
                  <Text style={styles.fieldError}>{errors.dueTime.message}</Text>
                ) : null}
              </View>
            </View>

            {dueDate || dueTime ? (
              <TouchableOpacity
                style={styles.clearDueButton}
                onPress={clearDueDate}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle-outline" size={16} color={colors.textMuted} />
                <Text style={styles.clearDueText}>Clear due date</Text>
              </TouchableOpacity>
            ) : null}

            {activePicker ? (
              <DateTimePicker
                value={pickerValue()}
                mode={activePicker === 'dueTime' ? 'time' : 'date'}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={activePicker === 'violationDate' ? new Date() : undefined}
                minimumDate={
                  activePicker === 'dueDate'
                    ? dateFromForm(violationDate)
                    : undefined
                }
                onChange={handlePickerChange}
              />
            ) : null}

            <View style={styles.notice}>
              <Ionicons name="information-circle-outline" size={18} color={colors.accentStrong} />
              <Text style={styles.noticeText}>
                Issuing a fine records it immediately and updates the driver's licence stars.
              </Text>
            </View>

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
                {loading ? 'Issuing fine...' : 'Issue Fine'}
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
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  pageHeader: {
    marginBottom: spacing.lg,
  },
  eyebrow: {
    fontSize: 10,
    fontFamily: fonts.bold,
    letterSpacing: 2,
    color: colors.accentStrong,
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.text,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    lineHeight: 19,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mintSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  successIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.mint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCopy: { flex: 1 },
  successTitle: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.mint,
    marginBottom: 2,
  },
  successText: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  successAction: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  successActionText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.mint,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadow,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.accentStrong,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: spacing.xs,
  },
  fieldGroup: { gap: 6 },
  fieldLabel: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  fieldLabelError: { color: colors.danger },
  fieldError: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.danger,
    marginTop: 6,
  },
  pickerButton: {
    minHeight: 49,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: 13,
  },
  pickerButtonError: {
    borderColor: colors.danger,
  },
  pickerButtonDisabled: {
    opacity: 0.5,
  },
  pickerButtonText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  pickerPlaceholder: {
    color: colors.textMuted,
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  column: {
    flex: 1,
    minWidth: 0,
  },
  optionalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionalTitle: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  optionalTag: {
    fontSize: 10,
    fontFamily: fonts.medium,
    color: colors.textMuted,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  clearDueButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 2,
  },
  clearDueText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.accentStrong,
    lineHeight: 18,
  },
  submitButton: {
    minHeight: 50,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.white,
  },
});
