import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import InfoCard from '../components/InfoCard';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import { useApp } from '../context/AppContext';
import { colors, radius, spacing } from '../utils/theme';

export default function ProfileScreen() {
  const { user, meds, updateUserProfile, markMedicationTaken, addMedication, removeMedication } = useApp();

  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingHealth, setIsEditingHealth] = useState(false);
  const [isEditingMedication, setIsEditingMedication] = useState(false);

  const [personalForm, setPersonalForm] = useState({
    fullName: user.fullName || user.name || '',
    age: String(user.age || ''),
    weight: user.weight || '',
    height: user.height || '',
  });

  const [healthForm, setHealthForm] = useState({
    diabetesType: user.diabetesType || '',
    glucoseTargetMin: String(user.glucoseTargetMin || ''),
    glucoseTargetMax: String(user.glucoseTargetMax || ''),
    conditions: user.conditions || '',
    allergies: user.allergies || '',
    foodPreferences: user.foodPreferences || '',
    restrictions: user.restrictions || '',
  });

  const [newMedication, setNewMedication] = useState({
    name: '',
    dose: '',
    time: '',
  });

  const patientSubtitle = useMemo(() => {
    return `${user.diabetesType} • Target ${user.glucoseTargetMin}-${user.glucoseTargetMax} mg/dL`;
  }, [user]);

  const handlePersonalChange = (key, value) => {
    setPersonalForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleHealthChange = (key, value) => {
    setHealthForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSavePersonal = () => {
    updateUserProfile(personalForm);
    setIsEditingPersonal(false);
    Alert.alert('Saved', 'Personal information updated.');
  };

  const handleSaveHealth = () => {
    updateUserProfile(healthForm);
    setIsEditingHealth(false);
    Alert.alert('Saved', 'Health profile updated.');
  };

  const handleAddMedication = () => {
    const success = addMedication(newMedication);

    if (!success) {
      Alert.alert('Missing info', 'Please enter medication name, dose, and time.');
      return;
    }

    setNewMedication({ name: '', dose: '', time: '' });
    Alert.alert('Saved', 'Medication added.');
  };

  return (
    <ScreenContainer scrollable>
      <SectionTitle title="Profile" subtitle="Manage your health setup" />

      {!isEditingPersonal ? (
        <InfoCard title="Patient" value={user.fullName || user.name} subtitle={patientSubtitle}>
          <View style={styles.actionRow}>
            <AppButton title="Edit" onPress={() => setIsEditingPersonal(true)} style={styles.actionButton} />
          </View>
        </InfoCard>
      ) : (
        <InfoCard title="Edit personal information">
          <AppInput
            label="Full Name"
            value={personalForm.fullName}
            onChangeText={(t) => handlePersonalChange('fullName', t)}
          />
          <AppInput
            label="Age"
            value={personalForm.age}
            onChangeText={(t) => handlePersonalChange('age', t)}
            keyboardType="numeric"
          />
          <AppInput
            label="Weight"
            value={personalForm.weight}
            onChangeText={(t) => handlePersonalChange('weight', t)}
          />
          <AppInput
            label="Height"
            value={personalForm.height}
            onChangeText={(t) => handlePersonalChange('height', t)}
          />

          <View style={styles.dualButtonRow}>
            <AppButton
              title="Cancel"
              type="secondary"
              onPress={() => setIsEditingPersonal(false)}
              style={styles.dualButton}
            />
            <AppButton
              title="Save"
              onPress={handleSavePersonal}
              style={styles.dualButton}
            />
          </View>
        </InfoCard>
      )}

      {!isEditingHealth ? (
        <InfoCard
          title="Health profile"
          subtitle={`Allergies: ${user.allergies}\nFood preferences: ${user.foodPreferences}\nRestrictions: ${user.restrictions}`}
        >
          <Text style={styles.extraText}>Conditions: {user.conditions || 'Not set'}</Text>
          <Text style={styles.extraText}>
            Glucose target: {user.glucoseTargetMin}-{user.glucoseTargetMax} mg/dL
          </Text>

          <View style={styles.actionRow}>
            <AppButton title="Edit" onPress={() => setIsEditingHealth(true)} style={styles.actionButton} />
          </View>
        </InfoCard>
      ) : (
        <InfoCard title="Edit health profile">
          <AppInput
            label="Diabetes Type"
            value={healthForm.diabetesType}
            onChangeText={(t) => handleHealthChange('diabetesType', t)}
          />
          <AppInput
            label="Target Min"
            value={healthForm.glucoseTargetMin}
            onChangeText={(t) => handleHealthChange('glucoseTargetMin', t)}
            keyboardType="numeric"
          />
          <AppInput
            label="Target Max"
            value={healthForm.glucoseTargetMax}
            onChangeText={(t) => handleHealthChange('glucoseTargetMax', t)}
            keyboardType="numeric"
          />
          <AppInput
            label="Conditions"
            value={healthForm.conditions}
            onChangeText={(t) => handleHealthChange('conditions', t)}
          />
          <AppInput
            label="Allergies"
            value={healthForm.allergies}
            onChangeText={(t) => handleHealthChange('allergies', t)}
          />
          <AppInput
            label="Food Preferences"
            value={healthForm.foodPreferences}
            onChangeText={(t) => handleHealthChange('foodPreferences', t)}
          />
          <AppInput
            label="Restrictions"
            value={healthForm.restrictions}
            onChangeText={(t) => handleHealthChange('restrictions', t)}
          />

          <View style={styles.dualButtonRow}>
            <AppButton
              title="Cancel"
              type="secondary"
              onPress={() => setIsEditingHealth(false)}
              style={styles.dualButton}
            />
            <AppButton
              title="Save"
              onPress={handleSaveHealth}
              style={styles.dualButton}
            />
          </View>
        </InfoCard>
      )}

      <Text style={styles.heading}>Medication adherence</Text>

      {!isEditingMedication ? (
        <>
          {meds.map((item) => (
            <View key={item.id} style={styles.medRow}>
              <View>
                <Text style={styles.medName}>{item.name}</Text>
                <Text style={styles.medMeta}>
                  {item.dose} • {item.time}
                </Text>
              </View>

              <AppButton
                title={item.taken ? 'Taken' : 'Mark Taken'}
                type={item.taken ? 'secondary' : 'primary'}
                onPress={() => markMedicationTaken(item.id)}
                style={{ width: 120 }}
              />
            </View>
          ))}

          <AppButton title="Edit Medications" onPress={() => setIsEditingMedication(true)} />
        </>
      ) : (
        <>
          <InfoCard title="Add medication">
            <AppInput
              label="Medication Name"
              value={newMedication.name}
              onChangeText={(t) => setNewMedication((prev) => ({ ...prev, name: t }))}
            />
            <AppInput
              label="Dose"
              value={newMedication.dose}
              onChangeText={(t) => setNewMedication((prev) => ({ ...prev, dose: t }))}
            />
            <AppInput
              label="Time"
              value={newMedication.time}
              onChangeText={(t) => setNewMedication((prev) => ({ ...prev, time: t }))}
              placeholder="Example: 08:00 AM"
            />

            <AppButton title="Add Medication" onPress={handleAddMedication} />
          </InfoCard>

          {meds.map((item) => (
            <View key={item.id} style={styles.medRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.medName}>{item.name}</Text>
                <Text style={styles.medMeta}>
                  {item.dose} • {item.time}
                </Text>
              </View>

              <View style={styles.editMedicationButtons}>
                <AppButton
                  title={item.taken ? 'Taken' : 'Mark Taken'}
                  type={item.taken ? 'secondary' : 'primary'}
                  onPress={() => markMedicationTaken(item.id)}
                  style={styles.smallButton}
                />
                <AppButton
                  title="Remove"
                  type="danger"
                  onPress={() => removeMedication(item.id)}
                  style={styles.smallButton}
                />
              </View>
            </View>
          ))}

          <AppButton title="Done Editing Medications" onPress={() => setIsEditingMedication(false)} />
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    marginTop: spacing.sm,
  },
  actionButton: {
    width: 110,
  },
  dualButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: spacing.xs,
  },
  dualButton: {
    flex: 1,
  },
  extraText: {
    color: colors.text,
    marginTop: 8,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  medRow: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  medName: {
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  medMeta: {
    color: colors.muted,
    marginBottom: 12,
  },
  editMedicationButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  smallButton: {
    flex: 1,
  },
});