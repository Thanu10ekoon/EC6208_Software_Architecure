import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, shadow, spacing } from '../../constants/theme';
import { listDriverFines } from '../../api/fines';
import { listPayments } from '../../api/payments';
import { extractApiError } from '../../utils/apiError';
import ErrorBanner from '../../components/ErrorBanner';

function StatCard({ label, value, helper, icon, iconBg, iconColor, highlight }) {
  return (
    <View style={styles.card}>
      <View style={[styles.cardIconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={16} color={iconColor} />
      </View>
      <Text style={[styles.cardValue, highlight && styles.cardValueHL]}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardHelper}>{helper}</Text>
    </View>
  );
}

export default function DriverDashboardScreen({ navigation }) {
  const [fines, setFines] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const [finesData, paymentsData] = await Promise.all([
        listDriverFines(),
        listPayments(),
      ]);
      setFines(Array.isArray(finesData) ? finesData : []);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = () => { setRefreshing(true); load(true); };

  const stats = useMemo(() => {
    const now = new Date();
    const activeFines = fines.filter(
      f => !['PAID', 'CANCELLED', 'VOID'].includes(f?.status)
    );
    const dueThisMonth = activeFines.filter(f => {
      if (!f?.dueAt) return false;
      const d = new Date(f.dueAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const starsLeft = Math.max(0, 5 - activeFines.length);
    const acceptedPayments = payments.filter(p => p?.paymentStatus === 'PAID').length;
    const receiptsUploaded = payments.filter(p => p?.paymentMethod === 'RECEIPT_UPLOAD').length;
    const awaitingApproval = payments.filter(
      p => p?.paymentMethod === 'RECEIPT_UPLOAD' && p?.receiptId && !p?.receiptVerifiedAt
    ).length;
    return {
      dueThisMonth,
      starsLeft,
      acceptedPayments,
      receiptsUploaded,
      awaitingApproval,
      activeFines: activeFines.length,
    };
  }, [fines, payments]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const allClear = stats.activeFines === 0;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
        />
      }
    >
      <ErrorBanner message={error} />

      <View style={[styles.statusBanner, allClear ? styles.statusGood : styles.statusWarn]}>
        <Ionicons
          name={allClear ? 'checkmark-circle-outline' : 'warning-outline'}
          size={18}
          color={allClear ? colors.mint : colors.accentStrong}
        />
        <Text style={[styles.statusText, { color: allClear ? colors.mint : colors.accentStrong }]}>
          {allClear
            ? "You're all clear — no active fines"
            : `You have ${stats.activeFines} active fine${stats.activeFines > 1 ? 's' : ''}`}
        </Text>
      </View>

      <View style={styles.grid}>
        <StatCard
          label="Active fines"
          value={stats.activeFines}
          helper="Need attention"
          icon="warning-outline"
          iconBg={colors.accentSoft}
          iconColor={colors.accentStrong}
          highlight={stats.activeFines > 0}
        />
        <StatCard
          label="Safe driving"
          value={`${stats.starsLeft}/5`}
          helper="Stars remaining"
          icon="star"
          iconBg={colors.mintSoft}
          iconColor={colors.mint}
        />
        <StatCard
          label="Paid fines"
          value={stats.acceptedPayments}
          helper="Accepted payments"
          icon="checkmark-circle"
          iconBg={colors.mintSoft}
          iconColor={colors.mint}
        />
        <StatCard
          label="Receipts"
          value={stats.receiptsUploaded}
          helper={stats.awaitingApproval > 0 ? `${stats.awaitingApproval} pending` : 'All reviewed'}
          icon="receipt-outline"
          iconBg={colors.accentSoft}
          iconColor={colors.accentStrong}
          highlight={stats.awaitingApproval > 0}
        />
      </View>

      <Text style={styles.sectionHeader}>Quick access</Text>
      <View style={styles.linkRow}>
        <TouchableOpacity
          style={styles.linkCard}
          onPress={() => navigation.navigate('Fines')}
          activeOpacity={0.75}
        >
          <View style={styles.linkIconWrap}>
            <Ionicons name="document-text-outline" size={18} color={colors.accent} />
          </View>
          <Text style={styles.linkCardText}>My Fines</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkCard}
          onPress={() => navigation.navigate('Payments')}
          activeOpacity={0.75}
        >
          <View style={styles.linkIconWrap}>
            <Ionicons name="card-outline" size={18} color={colors.accent} />
          </View>
          <Text style={styles.linkCardText}>Payments</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    marginBottom: spacing.lg,
  },
  statusGood: { backgroundColor: colors.mintSoft },
  statusWarn: { backgroundColor: colors.accentSoft },
  statusText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow,
  },
  cardIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: spacing.sm,
  },
  cardValue: {
    fontSize: 30,
    fontFamily: fonts.extraBold,
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  cardValueHL: { color: colors.accent },
  cardLabel: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 2,
  },
  cardHelper: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  sectionHeader: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  linkRow: { gap: spacing.sm },
  linkCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...shadow,
  },
  linkIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkCardText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
});
