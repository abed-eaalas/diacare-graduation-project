export const colors = {
  primary: '#1E88E5',
  secondary: '#EAF5FF',
  background: '#F7FBFF',
  card: '#FFFFFF',
  text: '#16324F',
  muted: '#6B7C93',
  border: '#D8E7F5',
  danger: '#E53935',
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
};

export const spacing = {
  xs: 6,
  sm: 12,
  md: 16,
  lg: 22,
  xl: 30,
};

export const kidGirlColors = {
  primary: '#D96AA7',
  secondary: '#FFF0F7',
  background: '#FFF8FC',
  card: '#FFFFFF',
  text: '#5A2D4D',
  muted: '#9A6D87',
  border: '#F4D8E8',
  danger: '#FF6B81',
  tabPink: '#FFD6E7',
  tabBlue: '#F9DDF3',
  tabYellow: '#FFE9F5',
  tabGreen: '#FDE5EF',
  tabPurple: '#F3DFF0',
  hero: '#FFE3F0',
};

export const kidBoyColors = {
  primary: '#4A90E2',
  secondary: '#EAF4FF',
  background: '#F5FAFF',
  card: '#FFFFFF',
  text: '#1F3F66',
  muted: '#6A86A8',
  border: '#D8E9FA',
  danger: '#FF6B6B',
  tabPink: '#DDEEFF',
  tabBlue: '#D7EBFF',
  tabYellow: '#E4F3FF',
  tabGreen: '#DAF1FF',
  tabPurple: '#DDE7FF',
  hero: '#DFF1FF',
};

export function isChildUser(user) {
  const age = Number(user?.age);
  return !Number.isNaN(age) && age < 18;
}

export function getKidVariant(user) {
  const gender = String(user?.gender || '').trim().toLowerCase();

  if (gender === 'female' || gender === 'girl') {
    return 'girl';
  }

  return 'boy';
}

export function getKidColors(user) {
  return getKidVariant(user) === 'girl' ? kidGirlColors : kidBoyColors;
}

export function getTheme(user) {
  const canUseKidMode = isChildUser(user);
  const kidMode = canUseKidMode && !!user?.kidMode;
  const activeKidColors = getKidColors(user);

  return {
    colors: kidMode ? activeKidColors : colors,
    kidColors: activeKidColors,
    radius,
    spacing,
    kidMode,
    canUseKidMode,
    kidVariant: getKidVariant(user),
  };
}