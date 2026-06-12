import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { listOfficerFines } from '../../api/officerFines';
import ErrorBanner from '../../components/ErrorBanner';
import { colors, fonts, radius, shadow, spacing } from '../../constants/theme';
import { extractApiError } from '../../utils/apiError';

function StatCard({ label, value, helper, icon, iconBg, iconColor, highlight }) {
  return (
    <View style={styles.card}>
      <View style={[styles.cardIconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={16} color={iconColor} />
      </View>
      <Text style={[styles.cardValue, highlight && styles.cardValueHighlight]}>
        {value}
      </Text>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardHelper}>{helper}</Text>
    </View>
  );
}

function isToday(value) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate()
  );
}

export default function OfficerDashboardScreen({ navigation }) {
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

  const onRefresh = () => {
    setRefreshing(true);
    loadFines({ silent: true });
  };

  const stats = useMemo(() => {
    const statusOf = (fine) => String(fine?.status ?? '').toUpperCase();
    const activeStatuses = new Set(['ISSUED', 'DISPUTED']);

    return {
      issuedToday: fines.filter((fine) => isToday(fine?.issuedAt)).length,
      totalIssued: fines.length,
      activeFines: fines.filter((fine) => activeStatuses.has(statusOf(fine))).length,
      paidFines: fines.filter((fine) => statusOf(fine) === 'PAID').length,
    };
  }, [fines]);

  if (loading && fines.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading officer activity...</Text>
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
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>OFFICER WORKSPACE</Text>
        <Text style={styles.title}>Traffic fine overview</Text>
        <Text style={styles.subtitle}>
          Review your activity and move quickly to the next task.
        </Text>
      </View>

      <ErrorBanner message={error} />

      <View style={styles.grid}>
        <StatCard
          label="Issued today"
          value={stats.issuedToday}
          helper="Today's activity"
          icon="today-outline"
          iconBg={colors.accentSoft}
          iconColor={colors.accentStrong}
          highlight={stats.issuedToday > 0}
        />
        <StatCard
          label="Total issued"
          value={stats.totalIssued}
          helper="All recorded fines"
          icon="documents-outline"
          iconBg={colors.accentSoft}
          iconColor={colors.accentStrong}
        />
        <StatCard
          label="Active"
          value={stats.activeFines}
          helper="Issued or disputed"
          icon="warning-outline"
          iconBg={colors.accentSoft}
          iconColor={colors.accentStrong}
          highlight={stats.activeFines > 0}
        />
        <StatCard
          label="Paid"
          value={stats.paidFines}
          helper="Settled fines"
          icon="checkmark-circle"
          iconBg={colors.mintSoft}
          iconColor={colors.mint}
        />
      </View>

      <Text style={styles.sectionHeader}>Quick access</Text>
      <View style={styles.linkRow}>
        <TouchableOpacity
          style={styles.linkCard}
          onPress={() => navigation.navigate('IssueFine')}
          activeOpacity={0.75}
        >
          <View style={styles.linkIconWrap}>
            <Ionicons name="add-circle-outline" size={19} color={colors.accent} />
          </View>
          <View style={styles.linkCopy}>
            <Text style={styles.linkCardText}>Issue a Fine</Text>
            <Text style={styles.linkCardHelper}>Record a new traffic violation</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkCard}
          onPress={() => navigation.navigate('MyFines')}
          activeOpacity={0.75}
        >
          <View style={styles.linkIconWrap}>
            <Ionicons name="document-text-outline" size={19} color={colors.accent} />
          </View>
          <View style={styles.linkCopy}>
            <Text style={styles.linkCardText}>View Issued Fines</Text>
            <Text style={styles.linkCardHelper}>Track status and payment progress</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  intro: {
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
  cardValueHighlight: { color: colors.accent },
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
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkCopy: {
    flex: 1,
  },
  linkCardText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 2,
  },
  linkCardHelper: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
});
