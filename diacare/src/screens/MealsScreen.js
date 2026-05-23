import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import InfoCard from '../components/InfoCard';
import AppButton from '../components/AppButton';
import { useApp } from '../context/AppContext';
import { colors, radius } from '../utils/theme';

export default function MealsScreen() {
  const { mealPlan, mealLogs, addMealLog, regenerateMealPlan } = useApp();

  if (!mealPlan || !mealPlan.breakfast) {
    return (
      <ScreenContainer>
        <Text style={{ textAlign: 'center', marginTop: 40 }}>
          Loading meals...
        </Text>
      </ScreenContainer>
    );
  }

  const meals = [
    { key: 'breakfast', data: mealPlan.breakfast },
    { key: 'lunch', data: mealPlan.lunch },
    { key: 'dinner', data: mealPlan.dinner },
    { key: 'snacks', data: mealPlan.snacks },
  ];

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

  const handleRegenerate = () => {
    regenerateMealPlan();
    Alert.alert('New meal plan generated');
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

      <AppButton title="Regenerate Meal Plan" onPress={handleRegenerate} />
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