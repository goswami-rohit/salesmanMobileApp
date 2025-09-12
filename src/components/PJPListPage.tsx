// src/components/PJPListPage.tsx
// src/pages/PJPListPage.tsx
import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Text, ActivityIndicator, Card } from 'react-native-paper';
import { format, isSameDay } from 'date-fns';
import AppHeader from '../components/AppHeader';
import PJPFloatingCard from '../components/PJPFloatingCard';
import { useAppStore, BASE_URL, } from '../components/ReusableConstants';
import type { PJP } from '../components/ReusableConstants'; 
import Toast from 'react-native-toast-message';

export default function PJPListPage({ navigation }: any) {
  const theme = useTheme();
  const { user } = useAppStore();
  const route = useRoute();
  const { date } = route.params as { date?: string };

  const [pjps, setPjps] = useState<PJP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setError("User not authenticated.");
      setIsLoading(false);
      return;
    }

    const fetchPJPs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const today = new Date();
        const formattedDate = date ? format(new Date(date), 'yyyy-MM-dd') : format(today, 'yyyy-MM-dd');

        const url = `${BASE_URL}/api/pjp/user/${user.id}?startDate=${formattedDate}&endDate=${formattedDate}`;
        const response = await fetch(url);
        const result = await response.json();

        if (response.ok && result.success) {
          setPjps(result.data);
        } else {
          throw new Error(result.error || "Failed to fetch PJPs.");
        }
      } catch (e: any) {
        setError(e.message);
        Toast.show({ type: 'error', text1: 'Error fetching PJPs', text2: e.message });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPJPs();
  }, [user?.id, date]);

  const handleCardPress = (pjp: PJP) => {
    navigation.navigate('Journey', { selectedPJP: pjp });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" />
          <Text style={[styles.statusText, { color: theme.colors.onSurfaceVariant }]}>Loading missions...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.centeredContainer}>
          <Text style={[styles.statusText, { color: theme.colors.error }]}>Error: {error}</Text>
        </View>
      );
    }
    if (pjps.length === 0) {
      return (
        <View style={styles.centeredContainer}>
          <Text style={[styles.statusText, { color: theme.colors.onSurfaceVariant }]}>No missions found for this day.</Text>
        </View>
      );
    }
    return (
      <View style={styles.listContainer}>
        {pjps.map((pjp) => (
          <PJPFloatingCard
            key={pjp.id}
            pjp={pjp}
            onCardPress={handleCardPress}
          />
        ))}
      </View>
    );
  };

  const displayDate = date ? format(new Date(date), 'PPP') : format(new Date(), 'PPP');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader title={`Missions for ${displayDate}`} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingBottom: 100,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  statusText: {
    marginTop: 16,
    fontSize: 16,
  },
});