import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../constants/theme';

export default function FormInput({ label, error, containerStyle, style: externalStyle, onFocus, onBlur, ...props }) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
      ) : null}
      <TextInput
        style={[
          styles.input,
          externalStyle,
          focused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
        placeholderTextColor={colors.textMuted}
        onFocus={() => { setFocused(true); onFocus?.(); }}
        onBlur={() => { setFocused(false); onBlur?.(); }}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.text,
    letterSpacing: 0.1,
  },
  labelFocused: {
    color: colors.accent,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  inputFocused: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.danger,
  },
});
