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
import { colors, radius, shadow, spacing } from '../../constants/theme';
import { listNotifications } from '../../api/notifications';
import { extractApiError } from '../../utils/apiError';
import { formatDateTime } from '../../utils/formatters';

const TYPE_CONFIG = {
  payment_received: { icon: 'checkmark-circle', color: colors.mint, bg: colors.mintSoft },
  receipt_uploaded: { icon: 'document-attach', color: colors.accent, bg: colors.accentSoft },
  license_recollected: { icon: 'car', color: colors.danger, bg: colors.dangerSoft },
};
const DEFAULT_CONFIG = { icon: 'notifications', color: colors.textMuted, bg: colors.border };

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

function ListHeader({ unreadCount }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Notifications</Text>
      <Text style={styles.subtitle}>
        {unreadCount > 0
          ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
          : 'Updates on your fines and payments.'}
      </Text>
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

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load(true);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ListHeader unreadCount={0} />
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
        ListHeaderComponent={<ListHeader unreadCount={unreadCount} />}
        ListEmptyComponent={
          error ? (
            <View style={styles.emptyBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.border} />
              <Text style={styles.emptyText}>No notifications yet.</Text>
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
    borderTopLeftRadius: radius.md,
    borderBottomLeftRadius: radius.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  cardDate: { fontSize: 11, color: colors.textMuted, flexShrink: 0 },
  cardMessage: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
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
