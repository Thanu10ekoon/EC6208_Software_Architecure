import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '../constants/theme';

export default function ErrorBanner({ message, style }) {
  if (!message) return null;
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="alert-circle" size={16} color={colors.danger} style={styles.icon} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  icon: {
    marginTop: 1,
    flexShrink: 0,
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.danger,
    lineHeight: 18,
  },
});
