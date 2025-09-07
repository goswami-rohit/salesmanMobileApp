// src/pages/Journey.tsx
import React from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function Journey() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text variant="titleLarge" style={styles.text}>
          Hello — this is Journey page
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f172a' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#ffffff' },
});
