import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { listOfficerFines } from '../../api/officerFines';
import EmptyState from '../../components/EmptyState';
import ErrorBanner from '../../components/ErrorBanner';
import { colors, fonts, radius, shadow, spacing } from '../../constants/theme';
import { extractApiError } from '../../utils/apiError';
import { formatCurrency, formatDate } from '../../utils/formatters';

const STATUS_STYLES = {
  PAID: { bg: colors.mintSoft, text: colors.mint, bar: colors.mint },
  ISSUED: { bg: colors.accentSoft, text: colors.accentStrong, bar: colors.accent },
  DISPUTED: { bg: colors.accentSoft, text: colors.accentStrong, bar: colors.accent },
  CANCELLED: { bg: colors.dangerSoft, text: colors.danger, bar: colors.danger },
  VOID: { bg: colors.dangerSoft, text: colors.danger, bar: colors.danger },
};

function FineCard({ fine }) {
  const status = String(fine?.status ?? 'ISSUED').toUpperCase();
  const statusStyle = STATUS_STYLES[status] ?? STATUS_STYLES.ISSUED;
  const driverLabel = fine.driverName || fine.driverNic || `Driver #${fine.driverUserId}`;

  return (
    <View style={styles.card}>
      <View style={[styles.statusBar, { backgroundColor: statusStyle.bar }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <Text style={styles.reference} numberOfLines={1}>
            {fine.fineReferenceNumber}
          </Text>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>
              {status}
            </Text>
          </View>
        </View>

        <View style={styles.identityRow}>
          <View style={styles.identityItem}>
            <Ionicons name="person-outline" size={13} color={colors.textMuted} />
            <Text style={styles.identityText}>{driverLabel}</Text>
          </View>
          <View style={styles.identityDivider} />
          <View style={styles.identityItem}>
            <Ionicons name="car-outline" size={14} color={colors.textMuted} />
            <Text style={styles.identityText}>{fine.vehicleNumber}</Text>
          </View>
        </View>

        {fine.driverLicenseNumberSnapshot ? (
          <Text style={styles.licenseText}>
            Licence: {fine.driverLicenseNumberSnapshot}
          </Text>
        ) : null}

        <Text style={styles.violation} numberOfLines={2}>
          {fine.violationDetails}
        </Text>

        {fine.violationPlace ? (
          <View style={styles.placeRow}>
            <Ionicons name="location-outline" size={13} color={colors.textMuted} />
            <Text style={styles.placeText} numberOfLines={1}>{fine.violationPlace}</Text>
          </View>
        ) : null}

        <View style={styles.cardBottom}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
            <Text style={styles.metaText}>{formatDate(fine.violationDate)}</Text>
          </View>
          <Text style={styles.amount}>{formatCurrency(fine.fineAmount)}</Text>
        </View>
      </View>
    </View>
  );
}

function sortNewestFirst(fines) {
  return [...fines].sort((left, right) => {
    const leftTime = new Date(left?.issuedAt ?? left?.violationDate ?? 0).getTime();
    const rightTime = new Date(right?.issuedAt ?? right?.violationDate ?? 0).getTime();
    return rightTime - leftTime;
  });
}

export default function OfficerFinesScreen() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadFines = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError('');

    try {
      const data = await listOfficerFines();
      setFines(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFines();
    }, [loadFines])
  );

  const sortedFines = useMemo(() => sortNewestFirst(fines), [fines]);

  const onRefresh = () => {
    setRefreshing(true);
    loadFines({ silent: true });
  };

  if (loading && fines.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading issued fines...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={sortedFines}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <FineCard fine={item} />}
        ListHeaderComponent={
          <View style={styles.pageHeader}>
            <Text style={styles.eyebrow}>FINE HISTORY</Text>
            <Text style={styles.title}>Issued Fines</Text>
            <Text style={styles.subtitle}>
              Review the violations you recorded and their current status.
            </Text>
            <View style={styles.summaryPill}>
              <Ionicons name="documents-outline" size={14} color={colors.accentStrong} />
              <Text style={styles.summaryText}>
                {sortedFines.length} fine{sortedFines.length === 1 ? '' : 's'} issued
              </Text>
            </View>
            <ErrorBanner message={error} style={styles.errorSpacing} />
          </View>
        }
        ListEmptyComponent={
          !error ? (
            <EmptyState
              icon="document-text-outline"
              title="No fines issued yet"
              subtitle="Fines you issue will appear here."
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
  errorSpacing: {
    marginTop: spacing.md,
    marginBottom: 0,
  },
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
  reference: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    letterSpacing: 0.5,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  identityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1,
  },
  identityDivider: {
    width: 1,
    height: 13,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  identityText: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  licenseText: {
    fontSize: 10,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  violation: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.text,
    lineHeight: 19,
    marginBottom: 6,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.md,
  },
  placeText: {
    flex: 1,
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
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
});
