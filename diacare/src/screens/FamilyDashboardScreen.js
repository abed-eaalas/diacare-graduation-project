import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import InfoCard from '../components/InfoCard';
import { useApp } from '../context/AppContext';
import { colors, radius } from '../utils/theme';

export default function FamilyDashboardScreen() {
  const { user, glucoseLogs, familyAlerts, meds } = useApp();

  return (
    <ScreenContainer>
      <SectionTitle title="Family dashboard" subtitle="Shared monitoring for trusted relatives" />
      <InfoCard title="Patient status" value={user.name} subtitle={`Latest glucose: ${glucoseLogs[0].value} mg/dL`} color="#EAF5FF" />
      <InfoCard title="Medication adherence" value={`${meds.filter((m) => m.taken).length}/${meds.length} taken`} subtitle="Family members can monitor adherence safely." />
      <View style={styles.box}>
        <Text style={styles.heading}>Recent alerts</Text>
        {familyAlerts.map((alert) => (
          <View key={alert.id} style={styles.alertItem}>
            <Text style={styles.alertTitle}>{alert.title}</Text>
            <Text style={styles.alertMeta}>{alert.subtitle} • {alert.time}</Text>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.card, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: 16 },
  heading: { fontWeight: '700', fontSize: 18, color: colors.text, marginBottom: 12 },
  alertItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  alertTitle: { color: colors.text, fontWeight: '700' },
  alertMeta: { color: colors.muted, marginTop: 4 },
});
