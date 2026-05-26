import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  chatbotMessages,
  familyAlerts as initialFamilyAlerts,
  glucoseReadings,
  initialUser,
  mealPlan as initialMealPlan,
  medications,
  kidLessons,
} from '../data/mockData';

const AppContext = createContext();

// For physical devices, derive host from Expo to avoid localhost issues
const getHost = () => {
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  if (hostUri) {
    return hostUri.split(':')[0];
  }
  return '192.168.0.146';
};

const normalizeBase = (value) => (value ? value.replace(/\/$/, '') : value);

const API_BASE = 'http://192.168.0.146:5000';
const API_URL = `${API_BASE}/api`;

const logHealthCheck = async () => {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
    if (res.ok) {
      console.log('HEALTH OK');
    } else {
      console.log('HEALTH NOT OK', res.status);
    }
  } catch (error) {
    console.log('HEALTH ERROR', error);
  }
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(initialUser);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore existing mock states
  const [glucoseLogs, setGlucoseLogs] = useState(glucoseReadings);
  const [meds, setMeds] = useState(medications);
  const [chatMessages, setChatMessages] = useState(chatbotMessages);
  const [alerts, setAlerts] = useState(initialFamilyAlerts);
  const [mealLogs, setMealLogs] = useState([]);
  const [mealPlan, setMealPlan] = useState(initialMealPlan);

  // Load token on startup
  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedUser = await AsyncStorage.getItem('userData');
        if (storedToken && storedUser) {
          setToken(storedToken);
          const parsedUser = JSON.parse(storedUser);
          setUser({ ...initialUser, ...(parsedUser && typeof parsedUser === 'object' ? parsedUser : {}) });
        }
      } catch (error) {
        console.error('Failed to load auth data', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStorageData();
  }, []);

  const login = async (email, password) => {
    console.log('LOGIN FUNCTION CALLED');
    try {
      await logHealthCheck();
      const loginUrl = `${API_URL}/auth/login`;
      console.log('AUTH API:', loginUrl);
      console.log('RAW FETCH LOGIN START');
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        const fullUser = { ...initialUser, ...data, isLoggedIn: true };
        setUser(fullUser);
        setToken(data.token);
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(fullUser));
      } else {
        const errorMsg = data.message || 'Login failed';
        if (errorMsg.toLowerCase().includes('invalid email or password') || errorMsg.toLowerCase().includes('invalid')) {
          alert('Wrong email or password');
        } else if (errorMsg.toLowerCase().includes('buffering timed out')) {
          alert('Server temporarily unavailable. Please try again.');
        } else if (errorMsg.toLowerCase().includes('temporarily unavailable')) {
          alert('Server temporarily unavailable. Please try again.');
        } else {
          alert(errorMsg);
        }
      }
    } catch (error) {
      console.log('AUTH FETCH ERROR', error);
      console.error('Login error:', error);
      alert('Cannot connect to server. Please ensure the backend is running at ' + API_BASE);
    }
  };

  const signup = async (payload) => {
    console.log('SIGNUP FUNCTION CALLED');
    try {
      await logHealthCheck();
      const signupUrl = `${API_URL}/auth/signup`;
      console.log('AUTH API:', signupUrl);
      console.log('RAW FETCH SIGNUP START');
      const response = await fetch(signupUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok) {
        const fullUser = {
          ...initialUser,
          ...data,
          isLoggedIn: true,
          profileCompleted: false,
        };
        setUser(fullUser);
        setToken(data.token);
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(fullUser));
      } else {
        const errorMsg = data.message || 'Signup failed';
        if (errorMsg.toLowerCase().includes('buffering timed out')) {
          alert('Server temporarily unavailable. Please try again.');
          return;
        }
        if (errorMsg.toLowerCase().includes('temporarily unavailable')) {
          alert('Server temporarily unavailable. Please try again.');
        } else {
          alert(errorMsg);
        }
      }
    } catch (error) {
      console.log('AUTH FETCH ERROR', error);
      console.error('Signup error:', error);
      alert('Cannot connect to server. Please ensure the backend is running at ' + API_BASE);
    }
  };

  const logout = async () => {
    setUser(initialUser);
    setToken(null);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
  };

  const completeProfile = async (payload) => {
    const targetGlucoseRange = `${payload.glucoseTargetMin}-${payload.glucoseTargetMax}`;
    const profileUpdate = {
      gender: payload.gender,
      weight: payload.weight,
      height: payload.height,
      diabetesType: payload.diabetesType,
      targetGlucoseRange,
    };

    if (!token) {
      setUser((prev) => ({
        ...prev,
        ...payload,
        profileCompleted: true,
      }));
      return;
    }

    try {
      console.log('PROFILE UPDATE START');
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileUpdate),
      });
      console.log('PROFILE RESPONSE STATUS', response.status);
      const raw = await response.text();
      console.log('PROFILE RAW RESPONSE', raw);
      const data = raw ? JSON.parse(raw) : {};
      console.log('PROFILE PARSE SUCCESS');

      if (response.ok) {
        setUser((prev) => ({
          ...prev,
          ...data,
          profileCompleted: true,
        }));
      } else {
        console.log('PROFILE UPDATE FAILED', data?.message || 'Unknown error');
        setUser((prev) => ({
          ...prev,
          ...payload,
          profileCompleted: true,
        }));
      }
    } catch (error) {
      console.log('PROFILE UPDATE ERROR', error);
      setUser((prev) => ({
        ...prev,
        ...payload,
        profileCompleted: true,
      }));
    }
  };

  const updateUserProfile = async (payload) => {
    // Always update local state first to avoid UI crashes.
    const nextUser = { ...user, ...payload };
    setUser(nextUser);

    try {
      await AsyncStorage.setItem('userData', JSON.stringify(nextUser));
    } catch (error) {
      console.error('Failed to persist profile updates', error);
    }

    if (!token) {
      return;
    }

    try {
      const targetMin = payload.glucoseTargetMin ?? user.glucoseTargetMin;
      const targetMax = payload.glucoseTargetMax ?? user.glucoseTargetMax;

      const profileUpdate = {
        ...(payload.name !== undefined ? { fullName: payload.name } : {}),
        ...(payload.age !== undefined ? { age: payload.age } : {}),
        ...(payload.gender !== undefined ? { gender: payload.gender } : {}),
        ...(payload.weight !== undefined ? { weight: payload.weight } : {}),
        ...(payload.height !== undefined ? { height: payload.height } : {}),
        ...(payload.diabetesType !== undefined ? { diabetesType: payload.diabetesType } : {}),
        ...(targetMin && targetMax ? { targetGlucoseRange: `${targetMin}-${targetMax}` } : {}),
      };

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileUpdate),
      });

      const data = await response.json();

      if (response.ok) {
        // Avoid overwriting local edited name with server 'name' field.
        if (payload.name !== undefined && data && typeof data === 'object') {
          delete data.name;
        }

        const mergedUser = { ...nextUser, ...data };
        setUser(mergedUser);
        await AsyncStorage.setItem('userData', JSON.stringify(mergedUser));
      }
    } catch (error) {
      console.log('UPDATE USER PROFILE ERROR', error);
    }
  };

  const toggleKidMode = () =>
    setUser((prev) => ({ ...prev, kidMode: !prev.kidMode }));

  const toggleVoice = () =>
    setUser((prev) => ({ ...prev, voiceGuidance: !prev.voiceGuidance }));

  const toggleLargeText = () =>
    setUser((prev) => ({ ...prev, largeText: !prev.largeText }));

  const addGlucoseLog = (log) => {
    setGlucoseLogs((prev) => [{ id: Date.now().toString(), ...log }, ...prev]);
  };

  const markMedicationTaken = (id) => {
    setMeds((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, taken: !item.taken } : item
      )
    );
  };

  const addMedication = (medication) => {
    const name = String(medication?.name ?? '').trim();
    const dose = String(medication?.dose ?? '').trim();
    const time = String(medication?.time ?? '').trim();

    if (!name || !dose || !time) {
      return false;
    }

    const newItem = {
      id: Date.now().toString(),
      name,
      dose,
      time,
      taken: false,
    };

    setMeds((prev) => [newItem, ...prev]);
    return true;
  };

  const removeMedication = (id) => {
    setMeds((prev) => prev.filter((item) => item.id !== id));
  };

  // ✅ FIXED MEAL LOGIC
  const addMealLog = (mealKey, mealTitle) => {
    setMealLogs((prev) => {
      const alreadyLogged = prev.some((item) => item.mealKey === mealKey);
      if (alreadyLogged) return prev;

      return [
        {
          id: Date.now().toString(),
          mealKey,
          mealTitle,
        },
        ...prev,
      ];
    });
  };

  // ✅ SIMPLE REGENERATE (for now random shuffle)
  const getRandomItem = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const regenerateMealPlan = () => {
  const breakfastOptions = [
    {
      title: 'Oatmeal with berries',
      portion: '1 bowl',
      calories: 320,
      protein: '18%',
      carbs: '48%',
      gi: 52,
    },
    {
      title: 'Eggs with avocado toast',
      portion: '2 slices',
      calories: 350,
      protein: '22%',
      carbs: '30%',
      gi: 45,
    },
    {
      title: 'Greek yogurt with nuts',
      portion: '1 bowl',
      calories: 280,
      protein: '25%',
      carbs: '20%',
      gi: 35,
    },
  ];

  const lunchOptions = [
    {
      title: 'Grilled chicken with rice',
      portion: '1 plate',
      calories: 520,
      protein: '35%',
      carbs: '40%',
      gi: 50,
    },
    {
      title: 'Lentil soup with salad',
      portion: '1 bowl',
      calories: 400,
      protein: '22%',
      carbs: '45%',
      gi: 35,
    },
    {
      title: 'Turkey sandwich',
      portion: '1 sandwich',
      calories: 430,
      protein: '30%',
      carbs: '35%',
      gi: 48,
    },
  ];

  const dinnerOptions = [
    {
      title: 'Grilled fish with vegetables',
      portion: '1 plate',
      calories: 450,
      protein: '40%',
      carbs: '20%',
      gi: 35,
    },
    {
      title: 'Chicken salad',
      portion: '1 bowl',
      calories: 380,
      protein: '35%',
      carbs: '15%',
      gi: 30,
    },
    {
      title: 'Beef with sweet potato',
      portion: '1 plate',
      calories: 500,
      protein: '32%',
      carbs: '30%',
      gi: 55,
    },
  ];

  const snackOptions = [
    {
      title: 'Apple with peanut butter',
      portion: '1 snack',
      calories: 180,
      protein: '10%',
      carbs: '25%',
      gi: 40,
    },
    {
      title: 'Yogurt and fruit',
      portion: '1 bowl',
      calories: 160,
      protein: '12%',
      carbs: '20%',
      gi: 35,
    },
    {
      title: 'Boiled eggs',
      portion: '2 eggs',
      calories: 150,
      protein: '20%',
      carbs: '5%',
      gi: 15,
    },
  ];

  const newPlan = {
    breakfast: getRandomItem(breakfastOptions),
    lunch: getRandomItem(lunchOptions),
    dinner: getRandomItem(dinnerOptions),
    snacks: getRandomItem(snackOptions),
  };

  setMealPlan(newPlan);
};

  const sendChatMessage = async (text) => {
    const trimmed = String(text ?? '').trim();
    if (!trimmed) return;

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

    const context = {
      ...(diabetesType ? { diabetesType } : {}),
      ...(latestGlucose && Number.isFinite(latestGlucose.value) ? { latestGlucose } : {}),
      ...(targetRange ? { targetRange } : {}),
      ...(medicationsList && medicationsList.length ? { medications: medicationsList } : {}),
    };

    const baseId = Date.now().toString();
    const userMessage = { id: baseId, from: 'user', text: trimmed };
    setChatMessages((prev) => [...prev, userMessage]);

    const fallbackText =
      "I’m having trouble reaching the AI service right now. I can still help with meals, glucose targets, medication reminders, and what to do in an emergency.";

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, context }),
      });

      const data = await response.json().catch(() => ({}));
      const replyText = typeof data?.reply === 'string' && data.reply.trim() ? data.reply.trim() : fallbackText;

      const botReply = {
        id: `${baseId}-bot`,
        from: 'bot',
        text: response.ok ? replyText : fallbackText,
      };

      setChatMessages((prev) => [...prev, botReply]);
    } catch (error) {
      console.log('CHAT FETCH ERROR', error);
      const botReply = { id: `${baseId}-bot`, from: 'bot', text: fallbackText };
      setChatMessages((prev) => [...prev, botReply]);
    }
  };

  const emergencyContacts = [
    user.emergencyContact,
    ...(user.familyContacts || []),
    ...(user.doctorContact ? [user.doctorContact] : []),
  ];

  const sendEmergencyAlert = () => {
    const latestReading = glucoseLogs[0];

    const alert = {
      id: Date.now().toString(),
      title: 'Emergency alert sent',
      subtitle: latestReading
        ? `${latestReading.value} mg/dL`
        : 'Emergency triggered',
      time: new Date().toLocaleTimeString(),
    };

    setAlerts((prev) => [alert, ...prev]);
  };

  const stats = {
    rewardPoints: glucoseLogs.length * 10 + mealLogs.length * 5,
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      glucoseLogs,
      meds,
      mealPlan,
      mealLogs,           // ✅ FIX
      addMealLog,         // ✅ FIX
      regenerateMealPlan, // ✅ FIX
      familyAlerts: alerts,
      emergencyContacts,
      chatMessages,
      kidLessons,
      stats,
      login,
      signup,
      logout,
      completeProfile,
      updateUserProfile,
      toggleKidMode,
      toggleVoice,
      toggleLargeText,
      addGlucoseLog,
      markMedicationTaken,
      addMedication,
      removeMedication,
      sendChatMessage,
      sendEmergencyAlert,
    }),
    [user, isLoading, glucoseLogs, meds, mealLogs, alerts, chatMessages, mealPlan]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);