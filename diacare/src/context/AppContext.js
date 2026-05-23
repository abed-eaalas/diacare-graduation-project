import React, { createContext, useContext, useMemo, useState } from 'react';
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

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(initialUser);
  const [glucoseLogs, setGlucoseLogs] = useState(glucoseReadings);
  const [meds, setMeds] = useState(medications);
  const [chatMessages, setChatMessages] = useState(chatbotMessages);
  const [alerts, setAlerts] = useState(initialFamilyAlerts);

  // ✅ NEW STATES (FIX)
  const [mealLogs, setMealLogs] = useState([]);
  const [mealPlan, setMealPlan] = useState(initialMealPlan);

  const login = () => setUser((prev) => ({ ...prev, isLoggedIn: true }));

  const signup = (payload) =>
    setUser((prev) => ({
      ...prev,
      ...payload,
      isLoggedIn: true,
      profileCompleted: false,
    }));

  const logout = () => setUser(initialUser);

  const completeProfile = (payload) =>
    setUser((prev) => ({
      ...prev,
      ...payload,
      profileCompleted: true,
    }));

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

  const sendChatMessage = (text) => {
    const userMessage = { id: Date.now().toString(), from: 'user', text };
    const botReply = {
      id: `${Date.now()}-bot`,
      from: 'bot',
      text: 'Stay consistent with your care plan.',
    };
    setChatMessages((prev) => [...prev, userMessage, botReply]);
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
      toggleKidMode,
      toggleVoice,
      toggleLargeText,
      addGlucoseLog,
      markMedicationTaken,
      sendChatMessage,
      sendEmergencyAlert,
    }),
    [user, glucoseLogs, meds, mealLogs, alerts, chatMessages, mealPlan]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);