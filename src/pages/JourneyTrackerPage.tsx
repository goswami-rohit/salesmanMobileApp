// src/pages/JourneyTrackerPage.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Card, useTheme, TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNPickerSelect from 'react-native-picker-select';

import AppHeader from '../components/AppHeader';

// --- Type Definitions (Reused from Web Page for Consistency) ---
interface Dealer {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}
interface Location {
  lat: number;
  lng: number;
  address?: string;
}
type TripStatus = 'idle' | 'active' | 'completed';

// --- Reusable UI Components for the Journey Flow ---

interface JourneyStatsProps {
  distance: number;
  duration: number;
  theme: any;
}
const JourneyStats = ({ distance, duration, theme }: JourneyStatsProps) => (
  <View style={styles.statsContainer}>
    <View style={styles.statItem}>
      <Icon name="map-marker-distance" size={24} color={theme.colors.primary} />
      <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{distance.toFixed(2)} km</Text>
      <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Distance</Text>
    </View>
    <View style={styles.statItem}>
      <Icon name="clock-time-four-outline" size={24} color={theme.colors.secondary} />
      <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{Math.round(duration / 60)} min</Text>
      <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Duration</Text>
    </View>
  </View>
);

interface TripPlanningCardProps {
  dealers: Dealer[];
  onDealerSelect: (dealerId: string) => void;
  onStartTrip: () => void;
  isLoadingLocation: boolean;
  onGetCurrentLocation: () => void;
  theme: any;
}
const TripPlanningCard = ({ dealers, onDealerSelect, onStartTrip, isLoadingLocation, onGetCurrentLocation, theme }: TripPlanningCardProps) => (
  <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
    <Card.Title
      title="Plan New Journey"
      titleStyle={[styles.cardTitle, { color: theme.colors.onSurface }]}
    />
    <Card.Content>
      <View style={styles.inputContainer}>
        <TextInput
          label="Current Location"
          value="My Current Location"
          editable={false}
          right={<TextInput.Icon icon="crosshairs-gps" />}
          style={styles.textInput}
        />
        <Button mode="contained-tonal" onPress={onGetCurrentLocation} loading={isLoadingLocation} style={styles.fetchButton}>
          Fetch Location
        </Button>
      </View>
      <View style={styles.inputContainer}>
        <View style={[styles.pickerWrapper, { borderColor: theme.colors.outlineVariant }]}>
          <RNPickerSelect
            onValueChange={onDealerSelect}
            items={dealers.map(d => ({ label: d.name, value: d.id }))}
            placeholder={{ label: "Select Destination Dealer...", value: null }}
            style={{ inputIOS: styles.pickerInput, inputAndroid: styles.pickerInput, iconContainer: styles.pickerIcon, placeholder: styles.pickerPlaceholder, }}
            useNativeAndroidPickerStyle={false}
            Icon={() => <Icon name="chevron-down" size={24} color={theme.colors.onSurfaceVariant} />}
          />
        </View>
      </View>
      <Button mode="contained" onPress={onStartTrip} style={styles.actionButton}>
        Start Tracking
      </Button>
    </Card.Content>
  </Card>
);

interface ActiveTripCardProps {
  dealer: Dealer;
  distance: number;
  duration: number;
  onCompleteTrip: () => void;
  theme: any;
}
const ActiveTripCard = ({ dealer, distance, duration, onCompleteTrip, theme }: ActiveTripCardProps) => (
  <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
    <Card.Title
      title="Active Journey"
      subtitle={`To: ${dealer.name}`}
      titleStyle={[styles.cardTitle, { color: theme.colors.onSurface }]}
      subtitleStyle={{ color: theme.colors.onSurfaceVariant }}
      left={(props) => <Icon name="map-marker-path" size={24} color={theme.colors.primary} />}
    />
    <Card.Content>
      <JourneyStats distance={distance} duration={duration} theme={theme} />
      <Button mode="contained" onPress={onCompleteTrip} style={[styles.actionButton, { backgroundColor: theme.colors.error }]}>
        Complete Trip
      </Button>
    </Card.Content>
  </Card>
);

interface CompletedTripCardProps {
  distance: number;
  duration: number;
  onStartNew: () => void;
  theme: any;
}
const CompletedTripCard = ({ distance, duration, onStartNew, theme }: CompletedTripCardProps) => (
  <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
    <Card.Title
      title="Journey Completed"
      titleStyle={[styles.cardTitle, { color: theme.colors.onSurface }]}
      left={(props) => <Icon name="check-circle" size={24} color={theme.colors.secondary} />}
    />
    <Card.Content>
      <JourneyStats distance={distance} duration={duration} theme={theme} />
      <Button mode="contained" onPress={onStartNew} style={styles.actionButton}>
        Start New Journey
      </Button>
    </Card.Content>
  </Card>
);

// --- Main Component ---
export default function JourneyTrackerPage() {
  const theme = useTheme();
  
  // States to mimic the web version's logic
  const [tripStatus, setTripStatus] = useState<TripStatus>('idle');
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Mock API calls to mimic the web version's functionality
  useEffect(() => {
    // Mock fetching dealers
    const mockFetchDealers = () => {
      setDealers([
        { id: '1', name: 'Alpha Dealer', address: '123 Main St', latitude: 26.1445, longitude: 91.7362 },
        { id: '2', name: 'Beta Motors', address: '456 Second Ave', latitude: 26.15, longitude: 91.74 },
        { id: '3', name: 'Gamma Sales', address: '789 Third St', latitude: 26.13, longitude: 91.75 },
      ]);
    };
    mockFetchDealers();
  }, []);

  const mockGetCurrentLocation = () => {
    setIsLoadingLocation(true);
    setTimeout(() => {
      // Mock location data
      console.log("Mock location fetched.");
      setIsLoadingLocation(false);
    }, 1500);
  };

  const mockStartTrip = () => {
    if (!selectedDealer) {
      Alert.alert("Error", "Please select a dealer to start a journey.");
      return;
    }
    setTripStatus('active');
    // Start mock location tracking
    console.log("Mock trip started.");
    setTimeout(() => {
      // Mock live data update
      setDistance(1.5);
      setDuration(120);
    }, 1000);
  };

  const mockCompleteTrip = () => {
    console.log("Mock trip completed.");
    setTripStatus('completed');
  };

  const mockStartNewJourney = () => {
    console.log("Starting a new mock journey.");
    setTripStatus('idle');
    setDistance(0);
    setDuration(0);
    setSelectedDealer(null);
  };

  const renderContent = () => {
    switch (tripStatus) {
      case 'idle':
        return (
          <TripPlanningCard
            dealers={dealers}
            onDealerSelect={(id) => setSelectedDealer(dealers.find(d => d.id === id) || null)}
            onStartTrip={mockStartTrip}
            isLoadingLocation={isLoadingLocation}
            onGetCurrentLocation={mockGetCurrentLocation}
            theme={theme}
          />
        );
      case 'active':
        return (
          <ActiveTripCard
            dealer={selectedDealer!}
            distance={distance}
            duration={duration}
            onCompleteTrip={mockCompleteTrip}
            theme={theme}
          />
        );
      case 'completed':
        return (
          <CompletedTripCard
            distance={distance}
            duration={duration}
            onStartNew={mockStartNewJourney}
            theme={theme}
          />
        );
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['right', 'bottom', 'left']}>
      <AppHeader title="Journey Tracker" />
      <View style={styles.container}>
        {/* Map Placeholder */}
        <View style={[styles.mapPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Icon name="map-marker-path" size={48} color={theme.colors.primary} />
          <Text style={[styles.mapText, { color: theme.colors.onSurfaceVariant }]}>Map is not yet implemented</Text>
        </View>

        {/* Main Content Card */}
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  mapPlaceholder: {
    height: 200,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  mapText: {
    marginTop: 8,
    fontSize: 14,
  },
  card: {
    borderRadius: 16,
    paddingVertical: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: 'transparent',
  },
  fetchButton: {
    marginTop: 12,
  },
  pickerWrapper: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#374151',
    borderRadius: 8,
    borderWidth: 1,
  },
  pickerInput: {
    fontSize: 16,
    paddingVertical: 12,
    paddingRight: 30,
    color: 'white',
  },
  pickerIcon: {
    top: 15,
    right: 15,
  },
  pickerPlaceholder: {
    color: '#9ca3af',
  },
  actionButton: {
    marginTop: 12,
  },
});