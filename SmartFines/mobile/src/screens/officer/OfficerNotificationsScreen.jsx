import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { listNotifications } from '../../api/notifications';
import { listOfficerFines } from '../../api/officerFines';
import {
  confirmOfficerRecollection,
  markOfficerNotificationsRead,
} from '../../api/officerRecollections';
import EmptyState from '../../components/EmptyState';
import ErrorBanner from '../../components/ErrorBanner';
import { colors, fonts, radius, shadow, spacing } from '../../constants/theme';
import { extractApiError } from '../../utils/apiError';
import { formatDateTime } from '../../utils/formatters';

const TYPE_CONFIG = {
  payment_received: {
    icon: 'checkmark-circle',
    color: colors.mint,
    bg: colors.mintSoft,
  },
  receipt_uploaded: {
    icon: 'document-attach',
    color: colors.accent,
    bg: colors.accentSoft,
  },
  license_recollected: {
    icon: 'car',
    color: colors.danger,
    bg: colors.dangerSoft,
  },
};

const DEFAULT_CONFIG = {
  icon: 'notifications',
  color: colors.textMuted,
  bg: 'rgba(40, 32, 21, 0.07)',
};

function findRelatedFine(notification, fines) {
  if (
    notification.type !== 'license_recollected' ||
    notification.relatedFineId == null
  ) {
    return null;
  }

  return fines.find((fine) => fine.id === notification.relatedFineId) ?? null;
}

function NotificationCard({
  item,
  relatedFine,
  onConfirm,
}) {
  const config = TYPE_CONFIG[item.type] ?? DEFAULT_CONFIG;
  const confirmed = item.recollectionStatus === 'CONFIRMED';
  const canConfirm =
    item.type === 'license_recollected' &&
    item.recollectionStatus === 'MARKED_BY_DRIVER' &&
    relatedFine;

  return (
    <View style={[styles.card, !item.isRead && styles.cardUnread]}>
      {!item.isRead ? <View style={styles.unreadBar} /> : null}

      <View style={[styles.iconWrap, { backgroundColor: config.bg }]}>
        <Ionicons name={config.icon} size={20} color={config.color} />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.cardDate}>
            {formatDateTime(item.createdAt)}
          </Text>
        </View>

        <Text style={styles.cardMessage}>{item.message}</Text>

        {confirmed ? (
          <View style={styles.confirmedPill}>
            <Ionicons name="checkmark-circle" size={14} color={colors.mint} />
            <Text style={styles.confirmedText}>Collection confirmed</Text>
          </View>
        ) : null}

        {canConfirm && !confirmed ? (
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => onConfirm(item, relatedFine)}
            activeOpacity={0.8}
          >
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.white} />
            <Text style={styles.confirmButtonText}>Confirm collection</Text>
          </TouchableOpacity>
        ) : null}

        {item.type === 'license_recollected' &&
        item.relatedFineId != null &&
        !relatedFine &&
        !confirmed ? (
          <Text style={styles.unavailableText}>
            The matching fine is not available in your issued-fines list.
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default function OfficerNotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmationError, setConfirmationError] = useState('');

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError('');

    try {
      const [notificationData, fineData] = await Promise.all([
        listNotifications(),
        listOfficerFines(),
      ]);
      const notificationList = Array.isArray(notificationData)
        ? notificationData
        : [];
      setNotifications(notificationList);
      setFines(Array.isArray(fineData) ? fineData : []);

      if (notificationList.some((notification) => !notification.isRead)) {
        try {
          await markOfficerNotificationsRead();
          setNotifications((current) =>
            current.map((notification) => ({
              ...notification,
              isRead: true,
            }))
          );
        } catch (readError) {
          setError(extractApiError(readError));
        }
      }
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (left, right) =>
          new Date(right?.createdAt ?? 0).getTime() -
          new Date(left?.createdAt ?? 0).getTime()
      ),
    [notifications]
  );

  const openConfirmation = (notification, fine) => {
    setSelected({ notification, fine });
    setNotes('');
    setConfirmationError('');
  };

  const closeConfirmation = () => {
    if (confirming) return;
    setSelected(null);
    setNotes('');
    setConfirmationError('');
  };

  const submitConfirmation = async () => {
    if (!selected) return;

    setConfirming(true);
    setConfirmationError('');

    try {
      await confirmOfficerRecollection(selected.fine.id, {
        notes: notes.trim(),
      });
      setSuccess(
        `Licence collection confirmed for ${selected.fine.fineReferenceNumber}.`
      );
      setSelected(null);
      setNotes('');
      await load({ silent: true });
    } catch (err) {
      setConfirmationError(extractApiError(err));
    } finally {
      setConfirming(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setSuccess('');
    load({ silent: true });
  };

  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading officer updates...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={sortedNotifications}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <NotificationCard
            item={item}
            relatedFine={findRelatedFine(item, fines)}
            onConfirm={openConfirmation}
          />
        )}
        ListHeaderComponent={
          <View style={styles.pageHeader}>
            <Text style={styles.eyebrow}>OFFICER ACTIVITY</Text>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>
              Track payments, receipt uploads, and licence recollection updates.
            </Text>

            <View style={styles.summaryPill}>
              <Ionicons
                name="notifications-outline"
                size={14}
                color={colors.accentStrong}
              />
              <Text style={styles.summaryText}>
                {sortedNotifications.length} update
                {sortedNotifications.length === 1 ? '' : 's'}
              </Text>
            </View>

            {success ? (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={17} color={colors.mint} />
                <Text style={styles.successText}>{success}</Text>
              </View>
            ) : null}

            <ErrorBanner message={error} style={styles.errorSpacing} />
          </View>
        }
        ListEmptyComponent={
          !error ? (
            <EmptyState
              icon="notifications-off-outline"
              title="No officer updates yet"
              subtitle="Payment, receipt, and licence collection updates will appear here."
            />
          ) : null
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      />

      <Modal
        visible={Boolean(selected)}
        transparent
        animationType="fade"
        onRequestClose={closeConfirmation}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color={colors.accent}
              />
            </View>

            <Text style={styles.modalTitle}>Confirm licence collection</Text>
            <Text style={styles.modalSubtitle}>
              Confirm that the collected licence has been received for this fine.
            </Text>

            <View style={styles.fineSummary}>
              <Text style={styles.fineReference}>
                {selected?.fine?.fineReferenceNumber}
              </Text>
              <Text style={styles.fineMeta}>
                Driver #{selected?.fine?.driverUserId}  |  {selected?.fine?.vehicleNumber}
              </Text>
            </View>

            <Text style={styles.inputLabel}>Notes (optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add collection details"
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={255}
              editable={!confirming}
              style={styles.notesInput}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>{notes.length}/255</Text>

            <ErrorBanner message={confirmationError} style={styles.modalError} />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeConfirmation}
                disabled={confirming}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, confirming && styles.buttonDisabled]}
                onPress={submitConfirmation}
                disabled={confirming}
                activeOpacity={0.8}
              >
                {confirming ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={17} color={colors.white} />
                    <Text style={styles.submitButtonText}>Confirm</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    flexGrow: 1,
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
  summaryPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: spacing.md,
  },
  summaryText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.accentStrong,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.mintSoft,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.mint,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  successText: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.mint,
    lineHeight: 18,
  },
  errorSpacing: {
    marginTop: spacing.md,
    marginBottom: 0,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadow,
  },
  cardUnread: {
    backgroundColor: '#fffdf8',
  },
  unreadBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.accent,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: 4,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  cardDate: {
    flexShrink: 0,
    fontSize: 10,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  cardMessage: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    lineHeight: 18,
  },
  confirmButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceStrong,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: spacing.md,
  },
  confirmButtonText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.white,
  },
  confirmedPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.mintSoft,
    borderRadius: radius.sm,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginTop: spacing.md,
  },
  confirmedText: {
    fontSize: 10,
    fontFamily: fonts.semiBold,
    color: colors.mint,
  },
  unavailableText: {
    fontSize: 10,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    lineHeight: 15,
    marginTop: spacing.sm,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 31, 28, 0.62)',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadow,
  },
  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 19,
    fontFamily: fonts.bold,
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  fineSummary: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  fineReference: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: 4,
  },
  fineMeta: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  notesInput: {
    minHeight: 92,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.text,
    backgroundColor: colors.white,
  },
  characterCount: {
    alignSelf: 'flex-end',
    fontSize: 10,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    marginTop: 5,
  },
  modalError: {
    marginTop: spacing.sm,
    marginBottom: 0,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },
  cancelButtonText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  submitButton: {
    flex: 1,
    minHeight: 46,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
  },
  submitButtonText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.white,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
});
