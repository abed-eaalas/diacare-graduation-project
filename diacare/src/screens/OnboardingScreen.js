import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
];

export default function OnboardingScreen() {
  const { user, completeProfile } = useApp();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState({
    gender: user.gender || '',
    weight: user.weight || '',
    height: user.height || '',
    diabetesType: user.diabetesType || '',
    allergies: user.allergies || '',
    medications: user.medications || '',
    glucoseTargetMin: String(user.glucoseTargetMin || ''),
    glucoseTargetMax: String(user.glucoseTargetMax || ''),
  });

  const currentStep = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  const progressText = useMemo(() => `Step ${stepIndex + 1} of ${STEPS.length}`, [stepIndex]);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const validateRange = (label, rawValue, min, max, unit) => {
    const text = String(rawValue ?? '').trim();
    if (!text) return true;

    const value = Number(text);
    if (Number.isNaN(value)) {
      Alert.alert(`Invalid ${label}`, `${label} must be a number`);
      return false;
    }

    if (value < min || value > max) {
      const suffix = unit ? ` ${unit}` : '';
      Alert.alert(`Invalid ${label}`, `${label} must be between ${min} and ${max}${suffix}`);
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateRange('Weight', form.weight, 20, 300, 'kg')) return;
    if (!validateRange('Height', form.height, 100, 230, 'cm')) return;
    if (!validateRange('Target Min', form.glucoseTargetMin, 50, 250)) return;
    if (!validateRange('Target Max', form.glucoseTargetMax, 60, 400)) return;

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
            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.choiceRow}>
              {['Male', 'Female'].map((gender) => {
                const isSelected = form.gender === gender;
                return (
                  <TouchableOpacity
                    key={gender}
                    style={[styles.choiceButton, isSelected && styles.choiceButtonSelected]}
                    onPress={() => handleChange('gender', gender)}
                  >
                    <Text style={[styles.choiceText, isSelected && styles.choiceTextSelected]}>{gender}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <AppInput label="Weight" value={form.weight} onChangeText={(t) => handleChange('weight', t)} keyboardType="numeric" />
            <AppInput label="Height" value={form.height} onChangeText={(t) => handleChange('height', t)} keyboardType="numeric" />
            <Text style={styles.inputLabel}>Diabetes Type</Text>
            <View style={styles.choiceRow}>
              {['Type 1', 'Type 2'].map((type) => {
                const isSelected = form.diabetesType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.choiceButton, isSelected && styles.choiceButtonSelected]}
                    onPress={() => handleChange('diabetesType', type)}
                  >
                    <Text style={[styles.choiceText, isSelected && styles.choiceTextSelected]}>{type}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <AppInput label="Target Min" value={form.glucoseTargetMin} onChangeText={(t) => handleChange('glucoseTargetMin', t)} keyboardType="numeric" />
            <AppInput label="Target Max" value={form.glucoseTargetMax} onChangeText={(t) => handleChange('glucoseTargetMax', t)} keyboardType="numeric" />
          </>
        ) : null}

        {currentStep.key === 'food' ? (
          <>
            <AppInput label="Allergies" value={form.allergies} onChangeText={(t) => handleChange('allergies', t)} />
            <AppInput label="Medications" value={form.medications} onChangeText={(t) => handleChange('medications', t)} />
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
  inputLabel: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: 8,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.sm,
  },
  choiceButton: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    alignItems: 'center',
  },
  choiceButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  choiceText: {
    color: colors.text,
    fontWeight: '600',
  },
  choiceTextSelected: {
    color: colors.white,
  },
});