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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing } from '../../constants/theme';
import { listDriverFines } from '../../api/fines';
import { listPayments } from '../../api/payments';
import { extractApiError } from '../../utils/apiError';
import { formatCurrency, formatDate } from '../../utils/formatters';

const PAYMENT_STATUS = {
  PAID: { bg: colors.mintSoft, text: colors.mint },
  PENDING: { bg: colors.accentSoft, text: colors.accentStrong },
  FAILED: { bg: colors.dangerSoft, text: colors.danger },
  REVERSED: { bg: colors.dangerSoft, text: colors.danger },
};

function StatusBadge({ label, style }) {
  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.badgeText, { color: style.text }]}>{label}</Text>
    </View>
  );
}

function SectionTitle({ title }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function UnpaidFineCard({ fine, onPay }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.ref} numberOfLines={1}>{fine.fineReferenceNumber}</Text>
        <Text style={styles.amount}>{formatCurrency(fine.fineAmount)}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.violation} numberOfLines={1}>{fine.violationDetails}</Text>
        <TouchableOpacity style={styles.payBtn} onPress={onPay} activeOpacity={0.75}>
          <Text style={styles.payBtnText}>Pay</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PaymentHistoryCard({ payment, fineRef }) {
  const statusStyle = PAYMENT_STATUS[payment.paymentStatus] ?? PAYMENT_STATUS.PENDING;
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.ref} numberOfLines={1}>{fineRef || `Fine #${payment.fineId}`}</Text>
        <StatusBadge label={payment.paymentStatus} style={statusStyle} />
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.metaLine}>
          {formatCurrency(payment.amount)} · {payment.paymentMethod}
        </Text>
        <Text style={styles.metaDate}>{formatDate(payment.createdAt)}</Text>
      </View>
    </View>
  );
}

export default function DriverPaymentsScreen({ navigation }) {
  const [fines, setFines] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const [finesData, paymentsData] = await Promise.all([listDriverFines(), listPayments()]);
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

  const { unpaidFines, fineById } = useMemo(() => {
    const activePaymentFineIds = new Set(
      payments
        .filter(p => !['FAILED', 'REVERSED'].includes(p.paymentStatus))
        .map(p => p.fineId)
    );
    const unpaid = fines.filter(
      f => f.status !== 'PAID' && !activePaymentFineIds.has(f.id)
    );
    const byId = new Map(fines.map(f => [f.id, f]));
    return { unpaidFines: unpaid, fineById: byId };
  }, [fines, payments]);

  const handlePay = (fine) => {
    navigation.navigate('StripeCheckout', {
      fineId: fine.id,
      fineRef: fine.fineReferenceNumber,
      amount: fine.fineAmount,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.pageHeader}>
          <Text style={styles.title}>Payments</Text>
          <Text style={styles.subtitle}>Pay fines securely with Stripe.</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
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
        <View style={styles.pageHeader}>
          <Text style={styles.title}>Payments</Text>
          <Text style={styles.subtitle}>Pay fines securely with Stripe.</Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <SectionTitle title="Unpaid Fines" />
        {unpaidFines.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-circle-outline" size={28} color={colors.mint} />
            <Text style={styles.emptyText}>No unpaid fines.</Text>
          </View>
        ) : (
          unpaidFines.map(fine => (
            <UnpaidFineCard key={fine.id} fine={fine} onPay={() => handlePay(fine)} />
          ))
        )}

        <SectionTitle title="Payment History" style={styles.sectionGap} />
        {payments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No payments yet.</Text>
          </View>
        ) : (
          payments.map(payment => (
            <PaymentHistoryCard
              key={payment.id}
              payment={payment}
              fineRef={fineById.get(payment.fineId)?.fineReferenceNumber}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pageHeader: { marginBottom: spacing.lg },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textMuted },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  sectionGap: { marginTop: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ref: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  amount: { fontSize: 15, fontWeight: '700', color: colors.text },
  violation: { fontSize: 13, color: colors.textMuted, flex: 1, marginRight: spacing.sm },
  metaLine: { fontSize: 13, color: colors.textMuted },
  metaDate: { fontSize: 12, color: colors.textMuted },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.sm,
    gap: 4,
  },
  payBtnText: { fontSize: 13, fontWeight: '700', color: colors.white },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: { fontSize: 14, color: colors.textMuted },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    padding: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
});
