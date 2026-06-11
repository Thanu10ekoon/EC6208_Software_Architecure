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
import { colors, fonts, radius, shadow, spacing } from '../../constants/theme';
import { listDriverFines } from '../../api/fines';
import { extractApiError } from '../../utils/apiError';
import { formatCurrency, formatDate } from '../../utils/formatters';
import EmptyState from '../../components/EmptyState';
import ErrorBanner from '../../components/ErrorBanner';

const STATUS_STYLES = {
  PAID: { bg: colors.mintSoft, text: colors.mint, bar: colors.mint },
  ISSUED: { bg: colors.accentSoft, text: colors.accentStrong, bar: colors.accent },
  DISPUTED: { bg: colors.accentSoft, text: colors.accentStrong, bar: colors.accent },
  CANCELLED: { bg: colors.dangerSoft, text: colors.danger, bar: colors.danger },
  VOID: { bg: colors.dangerSoft, text: colors.danger, bar: colors.danger },
};

function FineCard({ fine }) {
  const s = STATUS_STYLES[fine.status] ?? STATUS_STYLES.ISSUED;
  return (
    <View style={styles.card}>
      <View style={[styles.statusBar, { backgroundColor: s.bar }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <Text style={styles.ref} numberOfLines={1}>{fine.fineReferenceNumber}</Text>
          <View style={[styles.badge, { backgroundColor: s.bg }]}>
            <Text style={[styles.badgeText, { color: s.text }]}>{fine.status}</Text>
          </View>
        </View>
        <Text style={styles.violation} numberOfLines={2}>{fine.violationDetails}</Text>
        <View style={styles.cardBottom}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
            <Text style={styles.metaText}>{formatDate(fine.violationDate)}</Text>
          </View>
          <Text style={styles.amount}>{formatCurrency(fine.fineAmount)}</Text>
        </View>
      </View>
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

  const onRefresh = () => { setRefreshing(true); load(true); };

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
      <FlatList
        data={fines}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => <FineCard fine={item} />}
        ListHeaderComponent={
          <View style={styles.pageHeader}>
            <Text style={styles.title}>My Fines</Text>
            <Text style={styles.subtitle}>Review your violations and payment status.</Text>
            <ErrorBanner message={error} style={styles.errorSpacing} />
          </View>
        }
        ListEmptyComponent={
          !error ? (
            <EmptyState
              icon="checkmark-circle-outline"
              title="No fines on record"
              subtitle="Keep up the good driving!"
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: spacing.lg, paddingBottom: spacing.xl, flexGrow: 1 },
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
    marginBottom: spacing.sm,
    lineHeight: 19,
  },
  errorSpacing: { marginTop: spacing.sm, marginBottom: 0 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    flexDirection: 'row',
    ...shadow,
  },
  statusBar: {
    width: 3,
  },
  cardContent: {
    flex: 1,
    padding: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ref: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  violation: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  amount: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.text,
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
