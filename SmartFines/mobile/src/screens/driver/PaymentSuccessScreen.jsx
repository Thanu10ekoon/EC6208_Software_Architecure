import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, shadow, spacing } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';

export default function PaymentSuccessScreen({ route, navigation }) {
  const { fineRef, amount } = route.params;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle" size={80} color={colors.mint} />
        </View>
        <Text style={styles.heading}>Payment Successful!</Text>
        <Text style={styles.subheading}>Your fine has been paid and the record has been updated.</Text>

        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fine reference</Text>
            <Text style={styles.detailValue}>{fineRef}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount paid</Text>
            <Text style={[styles.detailValue, styles.detailAmount]}>{formatCurrency(amount)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('DriverPayments')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Back to Payments</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.mintSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  heading: {
    fontSize: 26,
    fontFamily: fonts.extraBold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subheading: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: '100%',
    marginBottom: spacing.xl,
    ...shadow,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  detailLabel: { fontSize: 13, fontFamily: fonts.regular, color: colors.textMuted },
  detailValue: { fontSize: 13, fontFamily: fonts.semiBold, color: colors.text },
  detailAmount: { fontSize: 16, fontFamily: fonts.bold, color: colors.mint },
  button: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radius.md,
    paddingVertical: 15,
    paddingHorizontal: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: { fontSize: 15, fontFamily: fonts.semiBold, color: colors.white, letterSpacing: 0.2 },
});
