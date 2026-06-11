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
import { colors, fonts, radius, shadow, spacing } from '../../constants/theme';
import { listDriverFines } from '../../api/fines';
import { listPayments } from '../../api/payments';
import { extractApiError } from '../../utils/apiError';
import { formatCurrency, formatDate } from '../../utils/formatters';
import EmptyState from '../../components/EmptyState';
import ErrorBanner from '../../components/ErrorBanner';

const PAYMENT_STATUS = {
  PAID: { bg: colors.mintSoft, text: colors.mint },
  PENDING: { bg: colors.accentSoft, text: colors.accentStrong },
  FAILED: { bg: colors.dangerSoft, text: colors.danger },
  REVERSED: { bg: colors.dangerSoft, text: colors.danger },
};

function SectionHeader({ title }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function UnpaidFineCard({ fine, onPay }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.ref} numberOfLines={1}>{fine.fineReferenceNumber}</Text>
        <Text style={styles.amount}>{formatCurrency(fine.fineAmount)}</Text>
      </View>
      <Text style={styles.violation} numberOfLines={2}>{fine.violationDetails}</Text>
      <View style={styles.divider} />
      <TouchableOpacity style={styles.payBtn} onPress={onPay} activeOpacity={0.8}>
        <Ionicons name="card-outline" size={16} color={colors.white} />
        <Text style={styles.payBtnText}>Pay with Stripe</Text>
        <Ionicons name="arrow-forward" size={14} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

function PaymentHistoryCard({ payment, fineRef }) {
  const s = PAYMENT_STATUS[payment.paymentStatus] ?? PAYMENT_STATUS.PENDING;
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.ref} numberOfLines={1}>{fineRef || `Fine #${payment.fineId}`}</Text>
        <View style={[styles.badge, { backgroundColor: s.bg }]}>
          <Text style={[styles.badgeText, { color: s.text }]}>{payment.paymentStatus}</Text>
        </View>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.metaLine}>
          {formatCurrency(payment.amount)} · {payment.paymentMethod?.replace('_', ' ')}
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

  const onRefresh = () => { setRefreshing(true); load(true); };

  const { unpaidFines, fineById } = useMemo(() => {
    const activeIds = new Set(
      payments
        .filter(p => !['FAILED', 'REVERSED'].includes(p.paymentStatus))
        .map(p => p.fineId)
    );
    return {
      unpaidFines: fines.filter(f => f.status !== 'PAID' && !activeIds.has(f.id)),
      fineById: new Map(fines.map(f => [f.id, f])),
    };
  }, [fines, payments]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
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

        <ErrorBanner message={error} />

        <SectionHeader title="Unpaid Fines" />
        {unpaidFines.length === 0 ? (
          <EmptyState
            icon="checkmark-circle-outline"
            title="No unpaid fines"
            subtitle="All fines are settled."
          />
        ) : (
          unpaidFines.map(fine => (
            <UnpaidFineCard
              key={fine.id}
              fine={fine}
              onPay={() => navigation.navigate('StripeCheckout', {
                fineId: fine.id,
                fineRef: fine.fineReferenceNumber,
                amount: fine.fineAmount,
              })}
            />
          ))
        )}

        <SectionHeader title="Payment History" />
        {payments.length === 0 ? (
          <EmptyState icon="receipt-outline" title="No payments yet." />
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  pageHeader: { marginBottom: spacing.lg },
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
  sectionHeader: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
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
    fontFamily: fonts.bold,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  amount: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  violation: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: -spacing.md,
    marginBottom: spacing.sm,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: 11,
    borderRadius: radius.sm,
    gap: spacing.sm,
  },
  payBtnText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.white,
  },
  metaLine: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  metaDate: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
