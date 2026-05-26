import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import AppButton from '../components/AppButton';
import { useApp } from '../context/AppContext';
import { colors, getTheme, radius, spacing } from '../utils/theme';

export default function AccessibilityScreen() {
  const { user, toggleVoice, toggleLargeText, toggleKidMode, logout } = useApp();
  const theme = getTheme(user);

  return (
    <ScreenContainer scrollable>
      <SectionTitle
        title="Settings"
        subtitle="Accessibility, preferences, and account options"
      />

      <View
        style={[
          styles.groupCard,
          theme.kidMode && {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.card,
          },
        ]}
      >
        <Text style={[styles.groupTitle, user.largeText && styles.groupTitleLarge]}>
          Accessibility
        </Text>
        <Text style={[styles.groupSubtitle, user.largeText && styles.groupSubtitleLarge]}>
          Manage supportive reading and navigation options in one place.
        </Text>

        <ToggleRow
          title="Audio feedback"
          subtitle="Enable manual voice playback for AI replies"
          value={user.voiceGuidance}
          onChange={toggleVoice}
          largeText={user.largeText}
          activeColor={theme.colors.primary}
        />

        <ToggleRow
          title="Large text"
          subtitle="Increase text size across the app"
          value={user.largeText}
          onChange={toggleLargeText}
          largeText={user.largeText}
          activeColor={theme.colors.primary}
        />

        {theme.canUseKidMode ? (
          <ToggleRow
            title="Kid-friendly mode"
            subtitle={
              theme.kidVariant === 'girl'
                ? 'Uses softer playful colors for a girl-friendly experience'
                : 'Uses blue playful colors for a boy-friendly experience'
            }
            value={theme.kidMode}
            onChange={toggleKidMode}
            largeText={user.largeText}
            activeColor={theme.colors.primary}
          />
        ) : (
          <View style={styles.infoBox}>
            <Text style={[styles.infoTitle, user.largeText && styles.toggleTitleLarge]}>
              Kid-friendly mode
            </Text>
            <Text style={[styles.infoText, user.largeText && styles.toggleSubtitleLarge]}>
              Hidden because this patient is not in the child age group.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.groupCard}>
        <Text style={[styles.groupTitle, user.largeText && styles.groupTitleLarge]}>
          Language support
        </Text>
        <Text style={[styles.groupSubtitle, user.largeText && styles.groupSubtitleLarge]}>
          Prepare the app for English, Arabic, and other languages using localization files.
        </Text>
      </View>

      <AppButton title="Logout" type="danger" onPress={logout} />
    </ScreenContainer>
  );
}

function ToggleRow({ title, subtitle, value, onChange, largeText, activeColor }) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleTextWrap}>
        <Text style={[styles.toggleTitle, largeText && styles.toggleTitleLarge]}>
          {title}
        </Text>
        <Text style={[styles.toggleSubtitle, largeText && styles.toggleSubtitleLarge]}>
          {subtitle}
        </Text>
      </View>

      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: activeColor }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  groupCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  groupTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  groupTitleLarge: {
    fontSize: 24,
  },
  groupSubtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  groupSubtitleLarge: {
    fontSize: 18,
    lineHeight: 26,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF5FC',
  },
  toggleTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  toggleTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 2,
  },
  toggleTitleLarge: {
    fontSize: 20,
  },
  toggleSubtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  toggleSubtitleLarge: {
    fontSize: 17,
    lineHeight: 24,
  },
  infoBox: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#EEF5FC',
    paddingTop: spacing.md,
  },
  infoTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 6,
  },
  infoText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
});