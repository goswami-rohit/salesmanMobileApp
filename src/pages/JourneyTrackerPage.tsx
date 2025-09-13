// src/pages/JourneyTrackerPage.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, useTheme, TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNPickerSelect from 'react-native-picker-select';

import AppHeader from '../components/AppHeader';
import LiquidGlassCard from '../components/LiquidGlassCard';

// --- Type Definitions ---
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

// --- LIQUID GLASS Components ---
interface JourneyStatsProps {
  distance: number;
  duration: number;
  theme: any;
}
const JourneyStats = ({ distance, duration, theme }: JourneyStatsProps) => (
  <View className="flex-row justify-around my-4">
    <View className="items-center">
      <Icon name="map-marker-distance" size={24} color={theme.colors.primary} />
      <Text className="text-xl font-bold mt-2" style={{ color: theme.colors.onSurface }}>
        {distance.toFixed(2)} km
      </Text>
      <Text className="text-xs" style={{ color: theme.colors.onSurfaceVariant }}>
        Distance
      </Text>
    </View>
    <View className="items-center">
      <Icon name="clock-time-four-outline" size={24} color={theme.colors.secondary} />
      <Text className="text-xl font-bold mt-2" style={{ color: theme.colors.onSurface }}>
        {Math.round(duration / 60)} min
      </Text>
      <Text className="text-xs" style={{ color: theme.colors.onSurfaceVariant }}>
        Duration
      </Text>
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
const TripPlanningCard = ({ 
  dealers, 
  onDealerSelect, 
  onStartTrip, 
  isLoadingLocation, 
  onGetCurrentLocation, 
  theme 
}: TripPlanningCardProps) => (
  <LiquidGlassCard className="mx-4 shadow-xl" intensity={18}>
    <View>
      <Text className="text-lg font-bold mb-4" style={{ color: theme.colors.onSurface }}>
        Plan New Journey
      </Text>
      
      <View className="mb-4">
        <TextInput
          label="Current Location"
          value="My Current Location"
          editable={false}
          right={<TextInput.Icon icon="crosshairs-gps" />}
          className="bg-transparent"
        />
        <Button 
          mode="contained-tonal" 
          onPress={onGetCurrentLocation} 
          loading={isLoadingLocation} 
          className="mt-3"
        >
          Fetch Location
        </Button>
      </View>

      <View className="mb-4">
        <View 
          className="py-2 px-3 rounded-lg border"
          style={{ 
            backgroundColor: '#374151',
            borderColor: theme.colors.outlineVariant 
          }}
        >
          <RNPickerSelect
            onValueChange={onDealerSelect}
            items={dealers.map(d => ({ label: d.name, value: d.id }))}
            placeholder={{ label: "Select Destination Dealer...", value: null }}
            style={{
              inputIOS: {
                fontSize: 16,
                paddingVertical: 12,
                paddingRight: 30,
                color: 'white',
              },
              inputAndroid: {
                fontSize: 16,
                paddingVertical: 12,
                paddingRight: 30,
                color: 'white',
              },
              iconContainer: {
                top: 15,
                right: 15,
              },
              placeholder: {
                color: '#9ca3af',
              },
            }}
            useNativeAndroidPickerStyle={false}
            Icon={() => <Icon name="chevron-down" size={24} color={theme.colors.onSurfaceVariant} />}
          />
        </View>
      </View>

      <Button mode="contained" onPress={onStartTrip} className="mt-3">
        Start Tracking
      </Button>
    </View>
  </LiquidGlassCard>
);

interface ActiveTripCardProps {
  dealer: Dealer;
  distance: number;
  duration: number;
  onCompleteTrip: () => void;
  theme: any;
}
const ActiveTripCard = ({ dealer, distance, duration, onCompleteTrip, theme }: ActiveTripCardProps) => (
  <LiquidGlassCard className="mx-4 shadow-xl" intensity={18}>
    <View>
      <View className="flex-row items-center mb-4">
        <Icon name="map-marker-path" size={24} color={theme.colors.primary} />
        <View className="ml-3">
          <Text className="text-lg font-bold" style={{ color: theme.colors.onSurface }}>
            Active Journey
          </Text>
          <Text className="text-sm" style={{ color: theme.colors.onSurfaceVariant }}>
            To: {dealer.name}
          </Text>
        </View>
      </View>
      
      <JourneyStats distance={distance} duration={duration} theme={theme} />
      
      <Button 
        mode="contained" 
        onPress={onCompleteTrip} 
        className="mt-3"
        style={{ backgroundColor: theme.colors.error }}
      >
        Complete Trip
      </Button>
    </View>
  </LiquidGlassCard>
);

interface CompletedTripCardProps {
  distance: number;
  duration: number;
  onStartNew: () => void;
  theme: any;
}
const CompletedTripCard = ({ distance, duration, onStartNew, theme }: CompletedTripCardProps) => (
  <LiquidGlassCard className="mx-4 shadow-xl" intensity={18}>
    <View>
      <View className="flex-row items-center mb-4">
        <Icon name="check-circle" size={24} color={theme.colors.secondary} />
        <Text className="text-lg font-bold ml-3" style={{ color: theme.colors.onSurface }}>
          Journey Completed
        </Text>
      </View>
      
      <JourneyStats distance={distance} duration={duration} theme={theme} />
      
      <Button mode="contained" onPress={onStartNew} className="mt-3">
        Start New Journey
      </Button>
    </View>
  </LiquidGlassCard>
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

  // Mock API calls
  useEffect(() => {
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
    console.log("Mock trip started.");
    setTimeout(() => {
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
    <SafeAreaView 
      className="flex-1" 
      style={{ backgroundColor: theme.colors.background }} 
      edges={['right', 'bottom', 'left']}
    >
      <AppHeader title="Journey Tracker" />
      <View className="flex-1 p-4">
        {/* Map Placeholder - LIQUID GLASS */}
        <LiquidGlassCard className="mx-4 mb-5 shadow-lg" intensity={12}>
          <View className="h-40 justify-center items-center">
            <Icon name="map-marker-path" size={48} color={theme.colors.primary} />
            <Text className="mt-2 text-sm" style={{ color: theme.colors.onSurfaceVariant }}>
              Map is not yet implemented
            </Text>
          </View>
        </LiquidGlassCard>

        {/* Main Content Card */}
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}