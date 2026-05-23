import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import InfoCard from '../components/InfoCard';
import { useApp } from '../context/AppContext';
import { colors, radius } from '../utils/theme';

export default function GlucoseScreen() {
  const { glucoseLogs, addGlucoseLog } = useApp();
  const [value, setValue] = useState('');
  const [context, setContext] = useState('Before Meal');

  return (
    <ScreenContainer scrollable>
      <SectionTitle title="Glucose tracking" subtitle="Log readings and follow trends" />
      <View style={styles.form}>
        <AppInput label="Blood sugar reading" placeholder="e.g. 115" value={value} onChangeText={setValue} keyboardType="numeric" />
        <AppInput label="Context" value={context} onChangeText={setContext} />
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
});
