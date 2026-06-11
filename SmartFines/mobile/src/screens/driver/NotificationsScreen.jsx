import { useCallback, useState } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { colors, fonts, radius, shadow, spacing } from '../../constants/theme';
import { listNotifications } from '../../api/notifications';
import { extractApiError } from '../../utils/apiError';
import { formatDateTime } from '../../utils/formatters';
import EmptyState from '../../components/EmptyState';
import ErrorBanner from '../../components/ErrorBanner';

const TYPE_CONFIG = {
  payment_received: { icon: 'checkmark-circle', color: colors.mint, bg: colors.mintSoft },
  receipt_uploaded: { icon: 'document-attach', color: colors.accent, bg: colors.accentSoft },
  license_recollected: { icon: 'car', color: colors.danger, bg: colors.dangerSoft },
};
const DEFAULT_CONFIG = { icon: 'notifications', color: colors.textMuted, bg: 'rgba(40,32,21,0.07)' };

function NotificationCard({ item }) {
  const cfg = TYPE_CONFIG[item.type] ?? DEFAULT_CONFIG;
  return (
    <View style={[styles.card, !item.isRead && styles.cardUnread]}>
      {!item.isRead && <View style={styles.unreadBar} />}
      <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icon} size={20} color={cfg.color} />
      </View>
      <View style={styles.body}>
        <View style={styles.bodyTop}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardDate}>{formatDateTime(item.createdAt)}</Text>
        </View>
        <Text style={styles.cardMessage} numberOfLines={3}>{item.message}</Text>
      </View>
    </View>
  );
}

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const data = await listNotifications();
      const list = Array.isArray(data) ? data : [];
      setNotifications(list);
      const unread = list.filter(n => !n.isRead).length;
      navigation.setOptions({ tabBarBadge: unread > 0 ? unread : undefined });
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = () => { setRefreshing(true); load(true); };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
        data={notifications}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => <NotificationCard item={item} />}
        ListHeaderComponent={
          <View style={styles.pageHeader}>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'Updates on your fines and payments.'}
            </Text>
            <ErrorBanner message={error} style={styles.errorSpacing} />
          </View>
        }
        ListEmptyComponent={
          !error ? (
            <EmptyState
              icon="notifications-off-outline"
              title="No notifications yet."
              subtitle="You'll be notified when something happens."
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadow,
  },
  cardUnread: { backgroundColor: '#fffdf8' },
  unreadBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.accent,
    borderTopLeftRadius: radius.md,
    borderBottomLeftRadius: radius.md,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  body: { flex: 1 },
  bodyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.text,
    flex: 1,
  },
  cardDate: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    flexShrink: 0,
  },
  cardMessage: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
