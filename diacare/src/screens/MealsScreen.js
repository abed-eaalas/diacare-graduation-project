import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import InfoCard from '../components/InfoCard';
import AppButton from '../components/AppButton';
import { useApp } from '../context/AppContext';
import { colors, radius } from '../utils/theme';

const API_BASE = 'http://192.168.0.146:5000';
const API_URL = `${API_BASE}/api`;

export default function MealsScreen() {
  const { mealPlan, mealLogs, addMealLog, user, glucoseLogs, meds } = useApp();
  const [currentPlan, setCurrentPlan] = useState(mealPlan);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setCurrentPlan(mealPlan);
  }, [mealPlan]);

  if (!currentPlan || !currentPlan.breakfast) {
    return (
      <ScreenContainer>
        <Text style={{ textAlign: 'center', marginTop: 40 }}>
          Loading meals...
        </Text>
      </ScreenContainer>
    );
  }

  const meals = [
    { key: 'breakfast', data: currentPlan.breakfast },
    { key: 'lunch', data: currentPlan.lunch },
    { key: 'dinner', data: currentPlan.dinner },
    { key: 'snacks', data: currentPlan.snacks },
  ];

  const context = useMemo(() => {
    const diabetesType = String(user?.diabetesType ?? '').trim();
    const latest = glucoseLogs && glucoseLogs.length ? glucoseLogs[0] : null;
    const latestGlucose = latest
      ? {
          value: typeof latest.value === 'number' ? latest.value : Number(latest.value),
          time: latest.time ? String(latest.time) : undefined,
          context: latest.context ? String(latest.context) : undefined,
        }
      : undefined;

    const targetMinRaw = user?.glucoseTargetMin;
    const targetMaxRaw = user?.glucoseTargetMax;
    const targetMin = targetMinRaw !== undefined && targetMinRaw !== null ? Number(targetMinRaw) : NaN;
    const targetMax = targetMaxRaw !== undefined && targetMaxRaw !== null ? Number(targetMaxRaw) : NaN;
    const targetRange = Number.isFinite(targetMin) && Number.isFinite(targetMax)
      ? { min: targetMin, max: targetMax, unit: 'mg/dL' }
      : undefined;

    const medicationsList = Array.isArray(meds)
      ? meds.slice(0, 6).map((m) => ({
          name: m?.name,
          dose: m?.dose,
          time: m?.time,
          taken: !!m?.taken,
        }))
      : undefined;

    return {
      ...(diabetesType ? { diabetesType } : {}),
      ...(latestGlucose && Number.isFinite(latestGlucose.value) ? { latestGlucose } : {}),
      ...(targetRange ? { targetRange } : {}),
      ...(medicationsList && medicationsList.length ? { medications: medicationsList } : {}),
    };
  }, [user, glucoseLogs, meds]);

  const isMealLogged = (mealKey) => {
    return mealLogs?.some((item) => item.mealKey === mealKey);
  };

  const handleLogMeal = (mealKey, mealTitle) => {
    const alreadyLogged = isMealLogged(mealKey);

    if (alreadyLogged) {
      Alert.alert('Already logged');
      return;
    }

    addMealLog(mealKey, mealTitle);
    Alert.alert('Meal logged successfully');
  };

  const handleRegenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const response = await fetch(`${API_URL}/meals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context }),
      });

      const data = await response.json().catch(() => null);
      if (response.ok && data && typeof data === 'object') {
        setCurrentPlan(data);
        Alert.alert('New meal plan generated');
      } else {
        Alert.alert('Could not generate meals right now');
      }
    } catch (error) {
      Alert.alert('Could not generate meals right now');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ScreenContainer scrollable>
      <SectionTitle
        title="Meals Generator"
        subtitle="Personalized meals based on your profile"
      />

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Smart meals</Text>
        <Text style={styles.bannerText}>
          Generated based on your preferences and health profile.
        </Text>
      </View>

      {meals.map(({ key, data }) => {
        const logged = isMealLogged(key);

        return (
          <InfoCard
            key={key}
            title={key.toUpperCase()}
            value={data.title}
            subtitle={`${data.portion} • ${data.calories} kcal`}
          >
            <Text style={styles.nutrition}>
              Protein {data.protein} | Carbs {data.carbs}
            </Text>

            <AppButton
              title={logged ? 'Meal Logged' : 'Log Meal'}
              type={logged ? 'secondary' : 'primary'}
              onPress={() => handleLogMeal(key, data.title)}
            />
          </InfoCard>
        );
      })}

      <AppButton
        title={isGenerating ? 'Generating...' : 'Regenerate Meal Plan'}
        onPress={isGenerating ? undefined : handleRegenerate}
        style={isGenerating ? { opacity: 0.6 } : undefined}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#EAF5FF',
    padding: 16,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  bannerText: {
    color: colors.text,
  },
  nutrition: {
    color: colors.text,
    marginTop: 8,
  },
});