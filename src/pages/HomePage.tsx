import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Card } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import AppHeader from '../components/AppHeader';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define the type for the route params and navigation
type RootStackParamList = {
  Home: { checkedIn?: boolean };
  AttendanceInForm: undefined;
  AttendanceOutForm: undefined;
};
type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;
type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

export default function HomePage() {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<HomeScreenRouteProp>();
  
  // State to manage if the user is currently checked in
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  // Effect to listen for navigation params from the attendance forms
  useEffect(() => {
    if (route.params?.checkedIn !== undefined) {
      setIsCheckedIn(route.params.checkedIn);
    }
  }, [route.params?.checkedIn]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
      <AppHeader title="Dashboard" />
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>Daily Attendance</Text>
            <Text variant="bodyMedium" style={styles.cardSubtitle}>
              {isCheckedIn ? "You are currently checked in." : "Please check in to start your day."}
            </Text>
            <View style={styles.buttonContainer}>
              <Button
                icon="login"
                mode="contained"
                onPress={() => navigation.navigate('AttendanceInForm')}
                disabled={isCheckedIn}
                style={[styles.button, isCheckedIn && styles.disabledButton]}
              >
                Check In
              </Button>
              <Button
                icon="logout"
                mode="outlined"
                onPress={() => navigation.navigate('AttendanceOutForm')}
                disabled={!isCheckedIn}
                style={[styles.button, !isCheckedIn && styles.disabledButton]}
                textColor={!isCheckedIn ? '#475569' : '#e5e7eb'}
              >
                Check Out
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>Quick Summary</Text>
            <Text variant="bodyMedium" style={styles.cardSubtitle}>Analytics overview will be shown here.</Text>
            <View style={styles.placeholder} />
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  container: { padding: 16 },
  card: {
    marginBottom: 16,
    backgroundColor: '#1e293b',
  },
  cardTitle: { color: '#e5e7eb', fontWeight: 'bold' },
  cardSubtitle: { color: '#9ca3af', marginTop: 4, marginBottom: 16 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  disabledButton: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  placeholder: {
    height: 150,
    backgroundColor: '#334155',
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});