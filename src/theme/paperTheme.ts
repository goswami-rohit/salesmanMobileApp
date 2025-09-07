// src/theme/paperTheme.ts
import { MD3DarkTheme as DefaultTheme } from 'react-native-paper';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1d4ed8',      // blue-700
    accent: '#1d4ed8',
    background: '#1f2937',   // gray-800
    surface: '#374151',      // gray-700
    text: '#ffffff',
    onSurface: '#e5e7eb',    // gray-200
  },
  roundness: 8,
};

export default theme;
