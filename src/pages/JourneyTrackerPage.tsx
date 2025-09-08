// src/pages/JourneyTrackerPage.tsx 
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import AppHeader from '../components/AppHeader';

export default function JourneyTrackerPage() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
      <AppHeader title="Journey Tracker" />
      <View style={styles.container}>
        <Text variant="titleLarge" style={styles.text}>
          Journey Tracking Feature
        </Text>
        <Text style={styles.subtext}>This area will contain maps and location data.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  text: { color: '#e5e7eb' },
  subtext: { color: '#9ca3af', marginTop: 8 },
});
