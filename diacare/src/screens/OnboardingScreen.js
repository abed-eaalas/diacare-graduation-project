import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import SectionTitle from '../components/SectionTitle';
import { useApp } from '../context/AppContext';
import { colors, radius, spacing } from '../utils/theme';

const STEPS = [
  {
    key: 'health',
    title: 'Health basics',
    subtitle: 'Add the main health information we need first',
  },
  {
    key: 'food',
    title: 'Food profile',
    subtitle: 'Tell the app what food works best for you',
  },
  {
    key: 'support',
    title: 'Support and safety',
    subtitle: 'Optional details you can finish now or later',
  },
];

export default function OnboardingScreen() {
  const { user, completeProfile } = useApp();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState({
    gender: user.gender || '',
    weight: user.weight || '',
    height: user.height || '',
    diabetesType: user.diabetesType || '',
    conditions: user.conditions || '',
    allergies: user.allergies || '',
    foodPreferences: user.foodPreferences || '',
    restrictions: user.restrictions || '',
    medications: user.medications || '',
    emergencyContact: user.emergencyContact?.phone || '',
    glucoseTargetMin: String(user.glucoseTargetMin || ''),
    glucoseTargetMax: String(user.glucoseTargetMax || ''),
    dailyHabits: user.dailyHabits || '',
  });

  const currentStep = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  const progressText = useMemo(() => `Step ${stepIndex + 1} of ${STEPS.length}`, [stepIndex]);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleNext = () => {
    if (isLastStep) {
      completeProfile(form);
      return;
    }

    setStepIndex((prev) => prev + 1);
  };

  const handleSkip = () => {
    if (isLastStep) {
      completeProfile(form);
      return;
    }

    setStepIndex((prev) => prev + 1);
  };

  return (
    <ScreenContainer scrollable>
      <SectionTitle
        title="Patient onboarding"
        subtitle="Complete only the important details now"
      />

      <View style={styles.progressCard}>
        <Text style={styles.progressText}>{progressText}</Text>
        <Text style={styles.stepTitle}>{currentStep.title}</Text>
        <Text style={styles.stepSubtitle}>{currentStep.subtitle}</Text>
      </View>

      <View style={styles.box}>
        {currentStep.key === 'health' ? (
          <>
            <AppInput label="Gender" value={form.gender} onChangeText={(t) => handleChange('gender', t)} />
            <AppInput label="Weight" value={form.weight} onChangeText={(t) => handleChange('weight', t)} />
            <AppInput label="Height" value={form.height} onChangeText={(t) => handleChange('height', t)} />
            <AppInput label="Diabetes Type" value={form.diabetesType} onChangeText={(t) => handleChange('diabetesType', t)} />
            <AppInput label="Medical Conditions" value={form.conditions} onChangeText={(t) => handleChange('conditions', t)} />
            <AppInput label="Target Min" value={form.glucoseTargetMin} onChangeText={(t) => handleChange('glucoseTargetMin', t)} keyboardType="numeric" />
            <AppInput label="Target Max" value={form.glucoseTargetMax} onChangeText={(t) => handleChange('glucoseTargetMax', t)} keyboardType="numeric" />
          </>
        ) : null}

        {currentStep.key === 'food' ? (
          <>
            <AppInput label="Allergies" value={form.allergies} onChangeText={(t) => handleChange('allergies', t)} />
            <AppInput label="Food Preferences" value={form.foodPreferences} onChangeText={(t) => handleChange('foodPreferences', t)} />
            <AppInput label="Dietary Restrictions" value={form.restrictions} onChangeText={(t) => handleChange('restrictions', t)} />
            <AppInput label="Medications" value={form.medications} onChangeText={(t) => handleChange('medications', t)} />
          </>
        ) : null}

        {currentStep.key === 'support' ? (
          <>
            <AppInput label="Emergency Contact" value={form.emergencyContact} onChangeText={(t) => handleChange('emergencyContact', t)} />
            <AppInput label="Daily Habits / Lifestyle" value={form.dailyHabits} onChangeText={(t) => handleChange('dailyHabits', t)} />
          </>
        ) : null}

        <View style={styles.buttonRow}>
          <AppButton
            title="Skip"
            type="secondary"
            onPress={handleSkip}
            style={styles.rowButton}
          />
          <AppButton
            title={isLastStep ? 'Finish Setup' : 'Next'}
            onPress={handleNext}
            style={styles.rowButton}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  progressCard: {
    backgroundColor: '#EAF5FF',
    borderRadius: radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  progressText: {
    color: colors.primaryDark,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  stepSubtitle: {
    color: colors.text,
    lineHeight: 20,
  },
  box: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: spacing.sm,
  },
  rowButton: {
    flex: 1,
  },
});