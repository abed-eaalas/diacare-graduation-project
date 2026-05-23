import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, spacing } from '../utils/theme';

export default function SectionTitle({ title, subtitle, right }) {
  const { user } = useApp();

  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, user.largeText && styles.titleLarge]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, user.largeText && styles.subtitleLarge]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  titleLarge: {
    fontSize: 30,
  },
  subtitle: {
    color: colors.muted,
    marginTop: 4,
    fontSize: 14,
  },
  subtitleLarge: {
    fontSize: 18,
    lineHeight: 26,
  },
});