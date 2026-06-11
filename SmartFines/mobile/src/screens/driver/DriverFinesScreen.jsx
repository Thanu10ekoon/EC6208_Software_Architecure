import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing } from '../../constants/theme';
import { listDriverFines } from '../../api/fines';
import { extractApiError } from '../../utils/apiError';
import { formatCurrency, formatDate } from '../../utils/formatters';

const STATUS_STYLES = {
  PAID: { bg: colors.mintSoft, text: colors.mint },
  DISPUTED: { bg: colors.accentSoft, text: colors.accentStrong },
  CANCELLED: { bg: colors.dangerSoft, text: colors.danger },
  VOID: { bg: colors.dangerSoft, text: colors.danger },
  ISSUED: { bg: colors.accentSoft, text: colors.accentStrong },
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.ISSUED;
  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.badgeText, { color: style.text }]}>{status}</Text>
    </View>
  );
}

function FineCard({ fine }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.ref} numberOfLines={1}>{fine.fineReferenceNumber}</Text>
        <StatusBadge status={fine.status} />
      </View>
      <Text style={styles.violation} numberOfLines={2}>{fine.violationDetails}</Text>
      <View style={styles.cardBottom}>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
          <Text style={styles.metaText}>{formatDate(fine.violationDate)}</Text>
        </View>
        <Text style={styles.amount}>{formatCurrency(fine.fineAmount)}</Text>
      </View>
    </View>
  );
}

function ListHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>My Fines</Text>
      <Text style={styles.subtitle}>Review your violations and payment status.</Text>
    </View>
  );
}

export default function DriverFinesScreen() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const data = await listDriverFines();
      setFines(Array.isArray(data) ? data : []);
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

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ListHeader />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={fines}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => <FineCard fine={item} />}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={
          error ? (
            <View style={styles.emptyBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons name="checkmark-circle-outline" size={48} color={colors.mint} />
              <Text style={styles.emptyText}>No fines on record.</Text>
            </View>
          )
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.lg, paddingBottom: spacing.xl, flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: spacing.lg },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textMuted },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ref: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
    flex: 1,
    marginRight: spacing.sm,
  },
  violation: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: colors.textMuted },
  amount: { fontSize: 15, fontWeight: '700', color: colors.text },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xl * 2,
    gap: spacing.md,
  },
  emptyText: { fontSize: 15, color: colors.textMuted },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
    backgroundColor: colors.dangerSoft,
    padding: spacing.md,
    borderRadius: radius.sm,
  },
});
