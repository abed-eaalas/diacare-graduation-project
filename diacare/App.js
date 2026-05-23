import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { AppProvider } from './src/context/AppContext';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F4F9FF',
    primary: '#1E88E5',
    card: '#FFFFFF',
    text: '#16324F',
    border: '#D6E8FA',
  },
};

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer theme={theme}>
        <RootNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}
