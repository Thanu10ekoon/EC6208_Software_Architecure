import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { colors, fonts, radius, shadow, spacing } from '../../constants/theme';
import { createStripeCheckout, confirmStripeCheckout } from '../../api/payments';
import { extractApiError } from '../../utils/apiError';
import { formatCurrency } from '../../utils/formatters';

export default function StripeCheckoutScreen({ route, navigation }) {
  const { fineId, fineRef, amount } = route.params;
  const [phase, setPhase] = useState('summary');
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [webViewLoading, setWebViewLoading] = useState(true);
  const [error, setError] = useState('');
  const confirming = useRef(false);

  const startCheckout = async () => {
    setPhase('loading');
    setError('');
    try {
      const result = await createStripeCheckout({ fineId });
      setCheckoutUrl(result.checkoutUrl);
      setSessionId(result.sessionId);
      setPhase('checkout');
    } catch (err) {
      setError(extractApiError(err));
      setPhase('error');
    }
  };

  const confirmPayment = async (sid) => {
    if (confirming.current) return;
    confirming.current = true;
    setPhase('confirming');
    try {
      await confirmStripeCheckout(sid);
      navigation.replace('PaymentSuccess', { fineRef, amount });
    } catch (err) {
      setError('Payment confirmation failed. If you completed payment, contact support.');
      setPhase('error');
      confirming.current = false;
    }
  };

  const onShouldStartLoadWithRequest = ({ url }) => {
    const sessionMatch = url.match(/[?&]session_id=([^&]+)/);
    if (sessionMatch) {
      confirmPayment(sessionMatch[1]);
      return false;
    }
    if (url.includes('localhost:5173') || url.includes('localhost:8151')) {
      setPhase('summary');
      return false;
    }
    return true;
  };

  if (phase === 'checkout' || phase === 'confirming') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => setPhase('summary')}
            style={styles.backBtn}
            disabled={phase === 'confirming'}
          >
            <Ionicons name="close" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Secure Checkout</Text>
          <View style={{ width: 40 }} />
        </View>

        <WebView
          source={{ uri: checkoutUrl }}
          originWhitelist={['https://*', 'http://*']}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          onLoadStart={() => setWebViewLoading(true)}
          onLoadEnd={() => setWebViewLoading(false)}
          style={styles.webView}
        />

        {(webViewLoading || phase === 'confirming') && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.overlayText}>
              {phase === 'confirming' ? 'Confirming payment…' : 'Loading checkout…'}
            </Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          disabled={phase === 'loading'}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.summaryCard}>
          <View style={styles.iconWrap}>
            <Ionicons name="lock-closed" size={28} color={colors.mint} />
          </View>
          <Text style={styles.summaryLabel}>Fine reference</Text>
          <Text style={styles.summaryRef}>{fineRef}</Text>
          <Text style={styles.summaryAmountLabel}>Amount due</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(amount)}</Text>
          <View style={styles.divider} />
          <View style={styles.stripeRow}>
            <Ionicons name="shield-checkmark-outline" size={14} color={colors.textMuted} />
            <Text style={styles.stripeNote}>Secured by Stripe</Text>
          </View>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.payButton, phase === 'loading' && styles.payButtonDisabled]}
          onPress={startCheckout}
          disabled={phase === 'loading'}
          activeOpacity={0.8}
        >
          {phase === 'loading' ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Ionicons name="card-outline" size={20} color={colors.white} />
          )}
          <Text style={styles.payButtonText}>
            {phase === 'loading' ? 'Preparing…' : `Pay ${formatCurrency(amount)}`}
          </Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Your card details are entered on Stripe's secure page within this app. Payment is confirmed automatically.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing.sm },
  navTitle: { fontSize: 16, fontFamily: fonts.bold, color: colors.text },
  webView: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  overlayText: { fontSize: 14, fontFamily: fonts.regular, color: colors.textMuted },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadow,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.mintSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  summaryLabel: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryRef: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.text,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  summaryAmountLabel: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryAmount: {
    fontSize: 32,
    fontFamily: fonts.extraBold,
    color: colors.text,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    width: '100%',
    marginVertical: spacing.md,
  },
  stripeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stripeNote: { fontSize: 12, fontFamily: fonts.regular, color: colors.textMuted },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: { flex: 1, fontSize: 13, fontFamily: fonts.regular, color: colors.danger, lineHeight: 18 },
  payButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 15,
    marginBottom: spacing.md,
  },
  payButtonDisabled: { opacity: 0.6 },
  payButtonText: { fontSize: 16, fontFamily: fonts.semiBold, color: colors.white, letterSpacing: 0.2 },
  disclaimer: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.md,
  },
});
