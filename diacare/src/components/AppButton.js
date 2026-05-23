import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, radius, spacing } from '../utils/theme';

export default function AppButton({ title, onPress, type = 'primary', style }) {
  const { user } = useApp();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        type === 'secondary' && styles.secondary,
        type === 'danger' && styles.danger,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          type !== 'primary' && styles.altText,
          user.largeText && styles.textLarge,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  secondary: {
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  text: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  textLarge: {
    fontSize: 21,
  },
  altText: {
    color: colors.text,
  },
});