import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, radius, spacing } from '../utils/theme';

export default function AppInput({ label, ...props }) {
  const { user } = useApp();
  const isLargeText = user?.largeText || false;

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={[styles.label, isLargeText && styles.labelLarge]}>{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, isLargeText && styles.inputLarge]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.sm,
  },
  label: {
    marginBottom: 6,
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  labelLarge: {
    fontSize: 19,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 15,
  },
  inputLarge: {
    fontSize: 21,
    paddingVertical: 18,
  },
});