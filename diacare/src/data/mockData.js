export const initialUser = {
  role: 'patient',
  isLoggedIn: false,
  profileCompleted: false,
  name: 'Hadi',
  age: 22,
  gender: 'Male',
  weight: '72',
  height: '178',
  diabetesType: 'Type 1',
  allergies: 'Peanuts',
  foodPreferences: 'Mediterranean, grilled meals',
  restrictions: 'Low sugar',
  medications: 'Insulin Lispro',
  conditions: 'None',
    emergencyContact:
     { name: 'Mom', relation: 'Primary contact', phone: '+96170000000' },
  
     familyContacts: [
    { name: 'Dad', relation: 'Family', phone: '+96171111111' },
    { name: 'Sister', relation: 'Family', phone: '+96172222222' },
  ],
  doctorContact: { name: 'Dr. Karim', relation: 'Doctor', phone: '+96173333333' },
  glucoseTargetMin: '80',
  glucoseTargetMax: '140',
  language: 'English',
  voiceGuidance: true,
  largeText: false,
  kidMode: false,
};

export const glucoseReadings = [
  { id: '1', value: 112, time: '08:30 AM', context: 'Before Breakfast', status: 'good' },
  { id: '2', value: 154, time: '01:15 PM', context: 'After Lunch', status: 'warning' },
  { id: '3', value: 97, time: '07:45 PM', context: 'Before Dinner', status: 'good' },
];

export const medications = [
  { id: '1', name: 'Insulin Lispro', dose: '6 units', time: '08:00 AM', taken: true },
  { id: '2', name: 'Metformin', dose: '500 mg', time: '08:00 PM', taken: false },
];

export const mealPlan = {
  breakfast: {
    title: 'Oatmeal with berries',
    portion: '1 bowl', calories: 320, protein: '18%', fat: '22%', carbs: '48%', fiber: '10g', sugar: '8%', calcium: '12%', gi: 52,
  },
  lunch: {
    title: 'Grilled chicken quinoa bowl',
    portion: '1 plate', calories: 540, protein: '34%', fat: '24%', carbs: '32%', fiber: '12g', sugar: '5%', calcium: '10%', gi: 48,
  },
  dinner: {
    title: 'Baked salmon with vegetables',
    portion: '1 plate', calories: 460, protein: '38%', fat: '26%', carbs: '18%', fiber: '9g', sugar: '4%', calcium: '14%', gi: 35,
  },
  snacks: {
    title: 'Greek yogurt + apple slices',
    portion: '1 snack box', calories: 180, protein: '20%', fat: '16%', carbs: '30%', fiber: '5g', sugar: '7%', calcium: '16%', gi: 41,
  },
};

export const familyAlerts = [
  { id: '1', title: 'High glucose alert', subtitle: '154 mg/dL after lunch', time: '1:20 PM' },
  { id: '2', title: 'Medication missed', subtitle: 'Metformin pending', time: '8:05 PM' },
];

export const chatbotMessages = [
  { id: '1', from: 'bot', text: 'Hello! I am your AI Assistant. Ask me about meals, glucose, or medicine.' },
];
export const achievements = [
  { id: '1', title: '3-Day Check-in Streak', icon: '🔥' },
  { id: '2', title: 'Medication Hero', icon: '💊' },
  { id: '3', title: 'Healthy Meal Starter', icon: '🥗' },
];

export const kidLessons = [
  { id: '1', title: 'What is diabetes?', color: '#FFD9EC' },
  { id: '2', title: 'Why medicine matters', color: '#D7EEFF' },
  { id: '3', title: 'Choose better snacks', color: '#FFF3BF' },
];
