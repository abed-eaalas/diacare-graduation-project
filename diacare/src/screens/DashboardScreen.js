import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import InfoCard from '../components/InfoCard';
import { useApp } from '../context/AppContext';
import { colors, getTheme, radius, spacing } from '../utils/theme';

export default function DashboardScreen({ navigation }) {
  const { user, glucoseLogs, meds, mealPlan, familyAlerts, stats } = useApp();
  const theme = getTheme(user);

  const latest = glucoseLogs[0];
  const previous = glucoseLogs[1];
  const pendingMed = meds.find((m) => !m.taken);
  const recentReadings = glucoseLogs.slice(0, 6).reverse();

  const latestValue = latest?.value ?? 0;
  const previousValue = previous?.value ?? latestValue;
  const delta = latestValue - previousValue;
  const isUp = delta > 0;
  const isDown = delta < 0;
  const trendText = isUp ? `+${delta}` : isDown ? `${delta}` : '0';

  const maxGraphValue = Math.max(...recentReadings.map((item) => item.value), 180);

  const medicationTakenCount = meds.filter((m) => m.taken).length;
  const latestAlerts = familyAlerts.slice(0, 2);

  const toNumberOrNull = (value) => {
    const text = String(value ?? '').trim();
    if (!text) return null;
    const num = Number(text);
    return Number.isFinite(num) ? num : null;
  };

  const parsedTargetMin = toNumberOrNull(user.glucoseTargetMin);
  const parsedTargetMax = toNumberOrNull(user.glucoseTargetMax);

  let rangeMin = parsedTargetMin;
  let rangeMax = parsedTargetMax;

  if ((rangeMin === null || rangeMax === null) && user.targetGlucoseRange) {
    const parts = String(user.targetGlucoseRange).split('-').map((p) => toNumberOrNull(p));
    if (rangeMin === null) rangeMin = parts[0] ?? null;
    if (rangeMax === null) rangeMax = parts[1] ?? null;
  }

  const hasTargetRange = rangeMin !== null && rangeMax !== null;

  return (
    <ScreenContainer scrollable>
      <View style={styles.headerRow}>
        <Pressable
          style={[
            styles.rewardBadge,
            {
              backgroundColor: theme.kidMode ? theme.kidColors.tabYellow : '#FFF7E8',
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => navigation.navigate('Gamification')}
        >
          <Ionicons name="trophy-outline" size={22} color={theme.colors.primary} />
          <Text style={[styles.rewardPoints, { color: theme.colors.text }]}>
            {stats.rewardPoints}
          </Text>
        </Pressable>

        <View style={styles.headerTitleWrap}>
          <SectionTitle
            title={`Hello, ${user.name}`}
            subtitle={
              theme.kidMode
                ? 'Let’s take care of your health in a fun way'
                : 'Your smart diabetes dashboard'
            }
          />
        </View>

        <Pressable
          style={[
            styles.profileButton,
            {
              backgroundColor: theme.kidMode ? theme.kidColors.secondary : '#EAF5FF',
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons
            name={theme.kidMode ? 'happy-outline' : 'person-circle-outline'}
            size={28}
            color={theme.colors.primary}
          />
        </Pressable>
      </View>

      <InfoCard
        title="Blood sugar trend"
        subtitle={`${latest?.context || 'Latest reading'} • ${latest?.time || ''}`}
        color={theme.kidMode ? theme.kidColors.tabBlue : '#EAF5FF'}
      >
        <View style={styles.trendTopRow}>
          <View>
            <Text style={[styles.currentValue, { color: theme.colors.text }]}>
              {latestValue} mg/dL
            </Text>
            <Text style={styles.previousValue}>
              Previous: {previousValue} mg/dL
            </Text>
          </View>

          <View
            style={[
              styles.trendChip,
              {
                backgroundColor: isUp
                  ? '#FFE9E7'
                  : isDown
                  ? '#E8F7EE'
                  : '#EEF4FA',
              },
            ]}
          >
            <Ionicons
              name={isUp ? 'arrow-up' : isDown ? 'arrow-down' : 'remove'}
              size={16}
              color={isUp ? '#D84315' : isDown ? '#2E7D32' : '#607D8B'}
            />
            <Text
              style={[
                styles.trendChipText,
                {
                  color: isUp ? '#D84315' : isDown ? '#2E7D32' : '#607D8B',
                },
              ]}
            >
              {trendText} mg/dL
            </Text>
          </View>
        </View>

        <View style={styles.graphWrap}>
          {recentReadings.map((item) => {
            const height = Math.max((item.value / maxGraphValue) * 120, 20);

            return (
              <View key={item.id} style={styles.graphColumn}>
                <View
                  style={[
                    styles.graphBar,
                    {
                      height,
                      backgroundColor:
                        hasTargetRange && item.value >= rangeMin && item.value <= rangeMax
                          ? theme.colors.primary
                          : '#FFB300',
                    },
                  ]}
                />
                <Text style={styles.graphLabel}>{item.value}</Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.rangeText}>
          Target range: {hasTargetRange ? `${rangeMin} - ${rangeMax} mg/dL` : 'Not set'}
        </Text>
      </InfoCard>

      <InfoCard
        title="Recent alerts"
        subtitle="Important health updates in one place"
        color={theme.kidMode ? theme.kidColors.tabPink : '#FFF6FB'}
      >
        <View style={styles.alertsBox}>
          {latestAlerts.length ? (
            latestAlerts.map((alert) => (
              <View key={alert.id} style={styles.alertItem}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertMeta}>
                  {alert.subtitle} • {alert.time}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noAlertsText}>No recent alerts.</Text>
          )}
        </View>
      </InfoCard>

      <InfoCard
        title="Today's meal plan"
        value={mealPlan.breakfast.title}
        subtitle={`GI ${mealPlan.breakfast.gi} • ${mealPlan.breakfast.calories} kcal`}
        color={theme.kidMode ? theme.kidColors.secondary : theme.colors.card}
      />

      <InfoCard
        title="Medication reminder"
        value={pendingMed ? pendingMed.name : 'All taken'}
        subtitle={pendingMed ? `${pendingMed.dose} at ${pendingMed.time}` : 'Great job today'}
        color={theme.kidMode ? theme.kidColors.tabGreen : theme.colors.card}
      />

      {theme.canUseKidMode ? (
        <InfoCard
          title="Kids Mode"
          subtitle="A simplified, kid-friendly experience"
          color={theme.kidMode ? theme.kidColors.tabBlue : theme.colors.card}
        >
          <Pressable
            style={[
              styles.kidsModeButton,
              {
                backgroundColor: theme.kidMode ? theme.kidColors.tabYellow : '#F7F1FF',
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => navigation.navigate('KidsMode')}
          >
            <Ionicons name="sparkles-outline" size={18} color={theme.colors.primary} />
            <Text style={[styles.kidsModeButtonText, { color: theme.colors.text }]}>Open Kids Mode</Text>
          </Pressable>
        </InfoCard>
      ) : null}

      <InfoCard
        title="GI summary"
        value={theme.kidMode ? 'Good food choices today' : 'Low to Medium GI day'}
        subtitle={
          theme.kidMode
            ? 'Your meals help keep your sugar more steady.'
            : 'Meals selected to reduce blood sugar spikes.'
        }
        color={theme.kidMode ? theme.kidColors.tabBlue : theme.colors.card}
      >
      </InfoCard>

      <InfoCard title="Safety" subtitle="Emergency support is one tap away.">
        <Pressable
          style={[
            styles.emergency,
            { backgroundColor: theme.kidMode ? theme.colors.danger : colors.danger },
          ]}
          onPress={() => navigation.navigate('Emergency')}
        >
          <Text style={styles.emergencyText}>Emergency Help</Text>
        </Pressable>
      </InfoCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  rewardBadge: {
    minWidth: 62,
    height: 62,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginTop: 6,
    marginRight: spacing.sm,
  },
  rewardPoints: {
    marginTop: 4,
    fontWeight: '800',
    fontSize: 13,
  },
  headerTitleWrap: {
    flex: 1,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
    marginTop: 6,
  },
  trendTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  previousValue: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 13,
  },
  trendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  trendChipText: {
    fontWeight: '700',
    fontSize: 13,
  },
  graphWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 145,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  graphColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 4,
  },
  graphBar: {
    width: '70%',
    borderRadius: 12,
    minHeight: 20,
  },
  graphLabel: {
    marginTop: 8,
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
  },
  rangeText: {
    color: colors.muted,
    marginTop: 4,
  },
  familySummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  familyStatBox: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  familyStatValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  familyStatLabel: {
    marginTop: 6,
    color: colors.muted,
    fontSize: 13,
  },
  alertsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  alertsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
  },
  alertItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  alertTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  alertMeta: {
    color: colors.muted,
    marginTop: 4,
    lineHeight: 18,
  },
  noAlertsText: {
    color: colors.muted,
  },
  kidsModeButton: {
    marginTop: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  kidsModeButtonText: {
    marginLeft: 8,
    fontWeight: '700',
  },
  emergency: {
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  emergencyText: {
    color: '#fff',
    fontWeight: '800',
  },
});