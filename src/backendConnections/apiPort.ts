// src/backendConnections/apiPort.ts

import { Platform } from 'react-native';

// DEV_IP: the host IP you saw in Metro logs (example you gave earlier: 10.90.36.165).
// If you use Android emulator and prefer emulator mapping, set ANDROID_EMULATOR_TO_HOST = '10.0.2.2'
const DEV_IP = '10.90.36.165'; // <- replace if Metro shows another IP
const DEV_PORT = 3000;

export const API_HOST = __DEV__
  ? Platform.OS === 'android'
    // If using Android emulator AVD use 10.0.2.2 instead of host IP if you prefer:
    ? `http://${DEV_IP}:${DEV_PORT}`
    : `http://localhost:${DEV_PORT}`
  : 'https://api.yourdomain.com';