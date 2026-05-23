import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import { useApp } from '../context/AppContext';
import { colors, radius, spacing } from '../utils/theme';

export default function GamificationScreen() {
  const { healthyRewards, stats } = useApp();

  return (
    <ScreenContainer scrollable>
      <SectionTitle
        title="Healthy rewards"
        subtitle="These rewards are based on your real health stats in the app"
      />

      <View style={styles.scoreCard}>
        <Text style={styles.big}>{stats.rewardPoints} points</Text>
        <Text style={styles.sub}>Level {stats.level}</Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Real stats used for rewards</Text>
        <Text style={styles.statsText}>
          Glucose logs: {stats.totalGlucoseLogs} × 10 points
        </Text>
        <Text style={styles.statsText}>
          Meal logs: {stats.totalMealLogs} × 5 points
        </Text>
        <Text style={styles.statsText}>
          In-range readings: {stats.inRangeCount} ({stats.targetMin} - {stats.targetMax} mg/dL)
        </Text>
        <Text style={styles.statsText}>
          Medication taken: {stats.medicationTakenCount}/{stats.medicationTotal} × 10 points
        </Text>
        <Text style={styles.statsText}>
          Medication adherence: {stats.medicationAdherence}%
        </Text>
      </View>

      {healthyRewards.map((item) => (
        <View key={item.id} style={styles.rewardCard}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>{item.icon}</Text>
          </View>

          <View style={styles.textWrap}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>

            <View
              style={[
                styles.statusBadge,
                item.unlocked ? styles.unlockedBadge : styles.progressBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  item.unlocked ? styles.unlockedText : styles.progressText,
                ]}
              >
                {item.unlocked ? 'Unlocked' : 'In Progress'}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scoreCard: {
    backgroundColor: '#EAF5FF',
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  big: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  sub: {
    marginTop: 8,
    color: colors.muted,
  },
  statsCard: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
  },
  statsText: {
    color: colors.muted,
    marginBottom: 6,
    fontSize: 14,
  },
  rewardCard: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EAF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  textWrap: {
    flex: 1,
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
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  unlockedBadge: {
    backgroundColor: '#E8F7EC',
  },
  progressBadge: {
    backgroundColor: '#FFF4D6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  unlockedText: {
    color: '#1E8E3E',
  },
  progressText: {
    color: '#B7791F',
  },
});