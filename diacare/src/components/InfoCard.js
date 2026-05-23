import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, radius, spacing } from '../utils/theme';

export default function InfoCard({ title, value, subtitle, color = colors.card, children }) {
  const { user } = useApp();

  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      <Text style={[styles.title, user.largeText && styles.titleLarge]}>{title}</Text>
      {value ? (
        <Text style={[styles.value, user.largeText && styles.valueLarge]}>{value}</Text>
      ) : null}
      {subtitle ? (
        <Text style={[styles.subtitle, user.largeText && styles.subtitleLarge]}>
          {subtitle}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 8,
  },
  titleLarge: {
    fontSize: 18,
  },
  value: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  valueLarge: {
    fontSize: 32,
  },
  subtitle: {
    color: colors.text,
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
  },
  subtitleLarge: {
    fontSize: 18,
    lineHeight: 28,
  },
});