import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, radius, shadow, spacing } from '../../constants/theme';
import { listDriverFines } from '../../api/fines';
import { listPayments } from '../../api/payments';
import { extractApiError } from '../../utils/apiError';

function StatCard({ label, value, helper, highlight }) {
  return (
    <View style={styles.card}>
      <Text style={[styles.cardValue, highlight && styles.cardValueHighlight]}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardHelper}>{helper}</Text>
    </View>
  );
}

export default function DriverDashboardScreen() {
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

  const onRefresh = () => {
    setRefreshing(true);
    load(true);
  };

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
    return { dueThisMonth, starsLeft, acceptedPayments, receiptsUploaded, awaitingApproval };
  }, [fines, payments]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

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
      <Text style={styles.subtitle}>Stay on top of your fines and receipts.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.grid}>
        <StatCard
          label="Active fines"
          value={stats.dueThisMonth}
          helper="Due this month"
          highlight={stats.dueThisMonth > 0}
        />
        <StatCard
          label="Stars left"
          value={`${stats.starsLeft} / 5`}
          helper="Safe driving record"
        />
        <StatCard
          label="Accepted"
          value={stats.acceptedPayments}
          helper="Paid fines"
        />
        <StatCard
          label="Receipts"
          value={stats.receiptsUploaded}
          helper={
            stats.awaitingApproval > 0
              ? `${stats.awaitingApproval} awaiting admin`
              : 'All reviewed'
          }
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  error: {
    fontSize: 13,
    color: colors.danger,
    marginBottom: spacing.md,
    backgroundColor: colors.dangerSoft,
    padding: spacing.md,
    borderRadius: radius.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    ...shadow,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardValueHighlight: {
    color: colors.accent,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  cardHelper: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
