import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import { useApp } from '../context/AppContext';
import { colors, radius, spacing } from '../utils/theme';

export default function GamificationScreen() {
  const { achievementStats } = useApp();

  const achievements = useMemo(() => {
    const glucoseLogCount = Number(achievementStats?.glucoseLogCount ?? 0);
    const mealLogCount = Number(achievementStats?.mealLogCount ?? 0);
    const userChatCount = Number(achievementStats?.userChatCount ?? 0);
    const mealPlanGenerationCount = Number(achievementStats?.mealPlanGenerationCount ?? 0);
    const anyMedicationTaken = !!achievementStats?.anyMedicationTaken;

    return [
      {
        key: 'firstGlucose',
        icon: '🩸',
        title: 'First Glucose Logged',
        description: 'Log your first glucose reading',
        unlocked: glucoseLogCount >= 1,
      },
      {
        key: 'mealTracker',
        icon: '🥗',
        title: 'Meal Tracker',
        description: 'Log 3 meals',
        unlocked: mealLogCount >= 3,
        progressText: `${Math.min(mealLogCount, 3)}/3`,
      },
      {
        key: 'aiExplorer',
        icon: '🤖',
        title: 'AI Explorer',
        description: 'Ask the AI assistant 3 questions',
        unlocked: userChatCount >= 3,
        progressText: `${Math.min(userChatCount, 3)}/3`,
      },
      {
        key: 'healthyDay',
        icon: '🍽️',
        title: 'Healthy Day',
        description: 'Generate a meal plan',
        unlocked: mealPlanGenerationCount >= 1,
      },
      {
        key: 'medReminder',
        icon: '💊',
        title: 'Medication Reminder',
        description: 'Mark medication as taken',
        unlocked: anyMedicationTaken,
      },
    ];
  }, [achievementStats]);

  return (
    <ScreenContainer scrollable>
      <SectionTitle
        title="Achievements"
        subtitle="Simple health badges based on your activity"
      />

      {achievements.map((item) => {
        const faded = !item.unlocked;

        return (
          <View
            key={item.key}
            style={[styles.card, faded && styles.cardLocked]}
          >
            <View style={styles.left}>
              <View style={styles.iconWrap}>
                <Text style={styles.icon}>{item.icon || '🏆'}</Text>
              </View>
            </View>

            <View style={styles.middle}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>

              <View style={styles.statusRow}>
                <View style={[styles.statusBadge, item.unlocked ? styles.badgeUnlocked : styles.badgeLocked]}>
                  <Text style={[styles.statusText, item.unlocked ? styles.textUnlocked : styles.textLocked]}>
                    {item.unlocked ? 'Unlocked' : 'Locked'}
                  </Text>
                </View>
                {item.progressText ? (
                  <Text style={styles.progressText}>{item.progressText}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.right}>
              <Ionicons
                name={item.unlocked ? 'checkmark-circle' : 'lock-closed'}
                size={22}
                color={item.unlocked ? colors.primary : colors.muted}
              />
            </View>
          </View>
        );
      })}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardLocked: {
    opacity: 0.55,
  },
  left: {
    marginRight: 12,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  middle: {
    flex: 1,
  },
  right: {
    marginLeft: 10,
    paddingTop: 2,
  },
  title: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  badgeUnlocked: {
    borderColor: colors.primary,
  },
  badgeLocked: {
    borderColor: colors.border,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  textUnlocked: {
    color: colors.primary,
  },
  textLocked: {
    color: colors.muted,
  },
  progressText: {
    marginLeft: 10,
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
});