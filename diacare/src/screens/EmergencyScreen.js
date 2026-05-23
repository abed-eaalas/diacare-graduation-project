import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import AppButton from '../components/AppButton';
import { colors, radius, spacing } from '../utils/theme';

export default function EmergencyScreen() {
  return (
    <ScreenContainer>
      <View style={styles.banner}>
        <Text style={styles.title}>Emergency support</Text>
        <Text style={styles.text}>If blood sugar is dangerously high or low, follow your doctor’s plan, contact a trusted person, and call emergency support if symptoms are severe.</Text>
      </View>
      <View style={styles.instructions}>
        <Text style={styles.heading}>Quick instructions</Text>
        <Text style={styles.item}>• Recheck blood sugar.</Text>
        <Text style={styles.item}>• Follow fast-acting carb protocol if low.</Text>
        <Text style={styles.item}>• Hydrate and follow medical advice if high.</Text>
        <Text style={styles.item}>• Notify family/guardian immediately.</Text>
      </View>
      <AppButton title="Call Emergency" type="danger" onPress={() => {}} />
      <AppButton title="Notify Family Members" onPress={() => {}} />
      <AppButton title="Nearest Hospital (placeholder)" type="secondary" onPress={() => {}} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: '#FDECEC', borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: '#F6C7C7', marginBottom: spacing.md },
  title: { fontSize: 24, fontWeight: '800', color: colors.danger, marginBottom: 10 },
  text: { color: colors.text, lineHeight: 22 },
  instructions: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  heading: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 10 },
  item: { color: colors.text, marginBottom: 8 },
});
