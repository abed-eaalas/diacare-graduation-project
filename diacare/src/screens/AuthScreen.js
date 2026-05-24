import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenContainer from '../components/ScreenContainer';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import { useApp } from '../context/AppContext';
import { colors, radius, spacing } from '../utils/theme';

const COUNTRY_CODES = [
  { label: 'Lebanon (+961)', value: '+961' },
  { label: 'UAE (+971)', value: '+971' },
  { label: 'Saudi Arabia (+966)', value: '+966' },
  { label: 'Qatar (+974)', value: '+974' },
  { label: 'Kuwait (+965)', value: '+965' },
  { label: 'Jordan (+962)', value: '+962' },
  { label: 'Egypt (+20)', value: '+20' },
  { label: 'Turkey (+90)', value: '+90' },
  { label: 'United States (+1)', value: '+1' },
  { label: 'United Kingdom (+44)', value: '+44' },
];

export default function AuthScreen() {
  const { login, signup, isLoading } = useApp();
  const [isSignup, setIsSignup] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [signupForm, setSignupForm] = useState({
    fullName: '',
    age: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleLoginChange = (key, value) => {
    setLoginForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSignupChange = (key, value) => {
    if (key === 'age') {
      const numbersOnly = value.replace(/[^0-9]/g, '');
      if (numbersOnly === '') {
        setSignupForm((prev) => ({ ...prev, age: '' }));
        return;
      }

      const limitedAge = Math.max(0, Math.min(100, Number(numbersOnly)));
      setSignupForm((prev) => ({ ...prev, age: String(limitedAge) }));
      return;
    }

    setSignupForm((prev) => ({ ...prev, [key]: value }));
  };

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleSubmit = () => {
    console.log('HANDLE SUBMIT');
    if (!isSignup) {
      console.log('LOGIN BUTTON PRESSED');
      const email = loginForm.email.trim();
      const password = loginForm.password.trim();

      if (!email || !password) {
        console.log('LOGIN VALIDATION FAILED: missing email or password');
        alert('Please enter both email and password.');
        return;
      }

      if (!isValidEmail(email)) {
        console.log('LOGIN VALIDATION FAILED: invalid email format');
        alert('Please enter a valid email address.');
        return;
      }

      login(email, password);
      return;
    }

    console.log('SIGNUP BUTTON PRESSED');
    const fullName = signupForm.fullName.trim();
    const email = signupForm.email.trim();
    const password = signupForm.password.trim();
    const confirmPassword = signupForm.confirmPassword.trim();
    const age = Number(signupForm.age);

    if (!fullName) {
      console.log('SIGNUP VALIDATION FAILED: missing full name');
      alert('Please enter your full name.');
      return;
    }

    if (Number.isNaN(age) || age < 0 || age > 100) {
      console.log('SIGNUP VALIDATION FAILED: invalid age');
      alert('Age must be a number from 0 to 100.');
      return;
    }

    if (!isValidEmail(email)) {
      console.log('SIGNUP VALIDATION FAILED: invalid email format');
      alert('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      console.log('SIGNUP VALIDATION FAILED: password too short');
      alert('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      console.log('SIGNUP VALIDATION FAILED: password mismatch');
      alert('Password and confirm password do not match.');
      return;
    }

    signup({
      name: fullName,
      age,
      email,
      password,
    });
  };

  return (
    <ScreenContainer scrollable>
      <LinearGradient colors={[colors.primary, '#64B5F6']} style={styles.hero}>
        <Text style={styles.logo}>DiaCare</Text>
        <Text style={styles.heroText}>Smart, safe, and personalized diabetes care.</Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.title}>{isSignup ? 'Create account' : 'Welcome back'}</Text>

        {!isSignup ? (
          <>
            <AppInput
              label="Email"
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={loginForm.email}
              onChangeText={(t) => handleLoginChange('email', t)}
            />
            <AppInput
              label="Password"
              placeholder="Enter password"
              secureTextEntry
              value={loginForm.password}
              onChangeText={(t) => handleLoginChange('password', t)}
            />
            <Text style={styles.link}>Forgot password?</Text>
          </>
        ) : (
          <>
            <AppInput
              label="Full Name"
              placeholder="Enter your full name"
              value={signupForm.fullName}
              onChangeText={(t) => handleSignupChange('fullName', t)}
            />

            <AppInput
              label="Age"
              placeholder="Enter your age"
              keyboardType="number-pad"
              value={signupForm.age}
              onChangeText={(t) => handleSignupChange('age', t)}
              maxLength={3}
            />

            <AppInput
              label="Email"
              placeholder="Enter a valid email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={signupForm.email}
              onChangeText={(t) => handleSignupChange('email', t)}
            />

            <AppInput
              label="Password"
              placeholder="Enter password"
              secureTextEntry
              value={signupForm.password}
              onChangeText={(t) => handleSignupChange('password', t)}
            />

            <AppInput
              label="Confirm Password"
              placeholder="Re-enter password"
              secureTextEntry
              value={signupForm.confirmPassword}
              onChangeText={(t) => handleSignupChange('confirmPassword', t)}
            />
          </>
        )}

        <AppButton title={isSignup ? 'Sign Up' : 'Login'} onPress={handleSubmit} />

        <Text style={styles.switch} onPress={() => setIsSignup(!isSignup)}>
          {isSignup ? 'Already have an account? Login' : 'No account? Sign Up'}
        </Text>
      </View>


      <Modal visible={showCountryModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select country code</Text>

            {COUNTRY_CODES.map((item) => (
              <Pressable
                key={item.value}
                style={styles.countryOption}
                onPress={() => {
                  handleSignupChange('countryCode', item.value);
                  setShowCountryModal(false);
                }}
              >
                <Text style={styles.countryText}>{item.label}</Text>
              </Pressable>
            ))}

            <AppButton
              title="Close"
              type="secondary"
              onPress={() => setShowCountryModal(false)}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    marginBottom: spacing.lg,
  },
  logo: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
  },
  heroText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 16,
    maxWidth: '80%',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  link: {
    color: colors.primaryDark,
    marginVertical: spacing.sm,
    fontWeight: '600',
  },
  switch: {
    textAlign: 'center',
    marginTop: spacing.md,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  modeRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    gap: 8,
  },
  modeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F7FAFD',
  },
  modeButtonActive: {
    backgroundColor: '#EAF5FF',
    borderColor: colors.primary,
  },
  modeText: {
    color: colors.text,
    fontWeight: '600',
  },
  modeTextActive: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  dropdownLabel: {
    marginBottom: 6,
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  dropdown: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    color: colors.text,
    fontSize: 15,
  },
  dropdownArrow: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(16, 24, 40, 0.35)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  countryOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  countryText: {
    color: colors.text,
    fontWeight: '600',
  },
});