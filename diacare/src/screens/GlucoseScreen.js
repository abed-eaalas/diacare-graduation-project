import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import InfoCard from '../components/InfoCard';
import { useApp } from '../context/AppContext';
import { colors, radius } from '../utils/theme';

const CONTEXT_OPTIONS = [
  'Before Breakfast',
  'After Breakfast',
  'Before Lunch',
  'After Lunch',
  'Before Dinner',
  'After Dinner',
  'Before Sleep',
];

export default function GlucoseScreen() {
  const { glucoseLogs, addGlucoseLog } = useApp();
  const [value, setValue] = useState('');
  const [context, setContext] = useState('Before Breakfast');

  return (
    <ScreenContainer scrollable>
      <SectionTitle title="Glucose tracking" subtitle="Log readings and follow trends" />
      <View style={styles.form}>
        <AppInput label="Blood sugar reading" placeholder="e.g. 115" value={value} onChangeText={setValue} keyboardType="numeric" />
        <Text style={styles.inputLabel}>Context</Text>
        <View style={styles.choiceWrap}>
          {CONTEXT_OPTIONS.map((option) => {
            const isSelected = context === option;
            return (
              <TouchableOpacity
                key={option}
                style={[styles.choiceButton, isSelected && styles.choiceButtonSelected]}
                onPress={() => setContext(option)}
              >
                <Text style={[styles.choiceText, isSelected && styles.choiceTextSelected]}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <AppButton
          title="Add Reading"
          onPress={() => {
            if (!value) return;
            addGlucoseLog({ value: Number(value), time: 'Now', context, status: Number(value) > 180 || Number(value) < 70 ? 'danger' : 'good' });
            setValue('');
          }}
        />
      </View>
      {glucoseLogs.map((item) => (
        <InfoCard
          key={item.id}
          title={item.context}
          value={`${item.value} mg/dL`}
          subtitle={item.time}
          color={item.status === 'danger' ? '#FDECEC' : item.status === 'warning' ? '#FFF8E1' : '#ECF8EF'}
        />
      ))}
      <InfoCard title="AI trend insight" subtitle="Pattern estimate: values are more likely to rise after lunch. Consider lower-GI carbs and post-meal walking." />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: { backgroundColor: colors.card, borderRadius: radius.xl, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
  inputLabel: {
    marginBottom: 6,
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  choiceWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  choiceButton: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 12,
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
