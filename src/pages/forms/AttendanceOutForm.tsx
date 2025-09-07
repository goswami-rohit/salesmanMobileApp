import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, ActivityIndicator, useTheme } from 'react-native-paper';
// Use the new CameraView component from expo-camera
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppHeader from '../../components/AppHeader';

// Define the navigation props type for type safety
type RootStackParamList = {
  Home: { checkedIn: boolean };
  // Add other screen names here as needed
};
type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

export default function AttendanceOutForm() {
  const navigation = useNavigation<NavigationProps>();
  const theme = useTheme();
  // Use the new CameraView type for the ref
  const cameraRef = useRef<CameraView>(null);

  const [step, setStep] = useState<'camera' | 'location' | 'loading'>('loading');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const requestPermissions = async () => {
      if (!cameraPermission?.granted) {
        const status = await requestCameraPermission();
        if (!status.granted) {
          Alert.alert('Permission required', 'You need to grant camera access to check out.');
          navigation.goBack();
          return;
        }
      }
      setStep('camera');
    };
    requestPermissions();
  }, [cameraPermission]);

  const takePicture = async () => {
    if (cameraRef.current) {
      setStep('loading');
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (photo) {
        setPhotoUri(photo.uri);
        await fetchLocation();
      }
    }
  };

  const fetchLocation = async () => {
    let locationStatus = await Location.getForegroundPermissionsAsync();
    if (!locationStatus.granted) {
      locationStatus = await requestLocationPermission();
    }

    if (!locationStatus.granted) {
      Alert.alert('Permission required', 'You need to grant location access to check out.');
      setStep('camera');
      return;
    }

    const currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);
    setStep('location');
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    console.log({
      photoUri,
      latitude: location?.coords.latitude,
      longitude: location?.coords.longitude,
      timestamp: location?.timestamp,
    });
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert('Success', 'You have been successfully checked out.');
      navigation.navigate('Home', { checkedIn: false });
    }, 1500);
  };

  const renderContent = () => {
    if (step === 'loading' || !cameraPermission?.granted) {
      return <ActivityIndicator animating={true} size="large" />;
    }

    if (step === 'camera') {
      return (
        <>
          <Text variant="headlineSmall" style={styles.title}>Selfie Capture</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Please take a selfie to mark your check-out.
          </Text>
          <View style={styles.cameraContainer}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={'front'}
            />
          </View>
          <Button mode="contained" icon="camera" onPress={takePicture} style={styles.button}>
            Capture & Continue
          </Button>
        </>
      );
    }

    if (step === 'location' && photoUri && location) {
      return (
        <>
          <Text variant="headlineSmall" style={styles.title}>Confirm Details</Text>
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          <Text style={styles.locationText}>
            Location Captured:
          </Text>
          <Text style={styles.locationCoords}>
            Lat: {location.coords.latitude.toFixed(5)}, Lon: {location.coords.longitude.toFixed(5)}
          </Text>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Confirm Check-out
          </Button>
        </>
      );
    }

    return <Text style={{ color: theme.colors.error }}>Something went wrong. Please try again.</Text>;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['right', 'bottom', 'left']}>
      <AppHeader title="Attendance Check-out" />
      <View style={styles.container}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

// Styles are identical to AttendanceInForm
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#0f172a" },
    container: { flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center' },
    title: { color: "#e5e7eb", marginBottom: 4, fontWeight: 'bold', textAlign: 'center' },
    subtitle: { color: '#9ca3af', marginBottom: 24, textAlign: 'center' },
    cameraContainer: {
      width: 300,
      height: 300,
      borderRadius: 150,
      overflow: 'hidden',
      marginBottom: 24,
      borderWidth: 2,
      borderColor: '#334155'
    },
    camera: { flex: 1 },
    photoPreview: {
      width: 200,
      height: 200,
      borderRadius: 100,
      marginBottom: 24,
      borderWidth: 2,
      borderColor: '#334155'
    },
    locationText: { color: '#9ca3af', fontSize: 16, marginBottom: 8 },
    locationCoords: { color: '#e5e7eb', fontSize: 16, marginBottom: 24, fontWeight: '600' },
    button: { marginTop: 8, paddingVertical: 4, width: '100%' }
  });

