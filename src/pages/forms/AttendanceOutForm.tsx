// src/pages/forms/AttendanceOutForm.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, ActivityIndicator, useTheme, Avatar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppHeader from '../../components/AppHeader';
import { createAttendanceOut } from '../../backendConnections/apiServices';

type RootStackParamList = {
  Home: { checkedIn: boolean };
};
type NavigationProps = NativeStackNavigationProp<RootStackParamList>;
type UserLite = { id: number };

export default function AttendanceOutForm() {
  const navigation = useNavigation<NavigationProps>();
  const theme = useTheme();

  const [currentUser] = useState<UserLite>({ id: 1 });

  const [step, setStep] = useState<'camera' | 'location' | 'loading'>('loading');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const requestPermissions = async () => {
      // Use ImagePicker permission because we're launching native camera intent
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'You need to grant camera access to check out.');
        navigation.goBack();
        return;
      }
      setStep('camera');
    };
    requestPermissions();
  }, []);

  const takePicture = async () => {
    console.log('[AttendanceOut] takePicture (ImagePicker-first) called. step:', step);

    if ((takePicture as any).inProgress) {
      console.warn('[AttendanceOut] capture already in progress');
      return;
    }
    (takePicture as any).inProgress = true;

    try {
      setStep('loading');

      // 1) Request ImagePicker permission (already requested on mount, but defensive)
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      console.log('[AttendanceOut] ImagePicker permission:', perm.status);
      if (perm.status !== 'granted') {
        Alert.alert('Permission required', 'Camera permission is required to take photos.');
        setStep('camera');
        (takePicture as any).inProgress = false;
        return;
      }

      // 2) Launch native camera via ImagePicker
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        allowsEditing: false,
        exif: false,
      });
      //console.log('[AttendanceOut] ImagePicker result:', result);

      if (!result || result.canceled || !result.assets || result.assets.length === 0) {
        console.log('[AttendanceOut] no photo taken or cancelled');
        setStep('camera');
        (takePicture as any).inProgress = false;
        return;
      }

      const pickedUri = result.assets[0].uri;
      setPhotoUri(pickedUri);
      //console.log('[AttendanceOut] pickedUri:', pickedUri);

      // 3) Fetch location (existing function)
      await fetchLocation();

      (takePicture as any).inProgress = false;
      return;
    } catch (err) {
      console.error('[AttendanceOut] ImagePicker capture error:', err);
      Alert.alert('Error', 'Could not capture photo. Try again.');
      setStep('camera');
      (takePicture as any).inProgress = false;
      return;
    }
  };

  const fetchLocation = async () => {
    try {
      console.log('[AttendanceOut] requesting location permission');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        const response = await Location.requestForegroundPermissionsAsync();
        if (response.status !== 'granted') {
          Alert.alert('Permission required', 'You need to grant location access to check out.');
          setStep('camera');
          return;
        }
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      setStep('location');
    } catch (err) {
      console.error('[AttendanceOut] fetchLocation error', err);
      Alert.alert('Error', 'Unable to fetch location. Please try again.');
      setStep('camera');
    }
  };

  const handleSubmit = async () => {
    if (!photoUri || !location) {
      return Alert.alert('Error', 'Photo or location data is missing.');
    }
    setIsSubmitting(true);

    const attendancePayload = {
      userId: currentUser.id,
      outTimeTimestamp: new Date(location.timestamp).toISOString(),
      outTimeImageCaptured: true,
      outTimeImageUrl: photoUri, // replace with uploaded URL once you wire upload
      outTimeLatitude: location.coords.latitude,
      outTimeLongitude: location.coords.longitude,
      outTimeAccuracy: location.coords.accuracy,
    };

    const result = await createAttendanceOut(attendancePayload) as { success: boolean };
    setIsSubmitting(false);

    if (result.success) {
      Alert.alert('Success', 'You have been successfully checked out.');
      navigation.navigate('Home', { checkedIn: false });
    } else {
      Alert.alert('Error', 'Failed to check out.');
    }
  };

  const renderContent = () => {
    if (step === 'loading') {
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
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.camera} />
            ) : (
              <View style={styles.placeholder}>
                <Avatar.Icon size={96} icon="camera" />
                <Text style={{ color: '#9ca3af', marginTop: 8 }}>Tap Capture to open phone camera</Text>
              </View>
            )}
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#e5e7eb', marginBottom: 4, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { color: '#9ca3af', marginBottom: 24, textAlign: 'center' },
  cameraContainer: {
    width: 300,
    height: 300,
    borderRadius: 150,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#071024',
  },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  camera: { width: '100%', height: '100%' },
  photoPreview: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#334155',
  },
  locationText: { color: '#9ca3af', fontSize: 16, marginBottom: 8 },
  locationCoords: { color: '#e5e7eb', fontSize: 16, marginBottom: 24, fontWeight: '600' },
  button: { marginTop: 8, paddingVertical: 4, width: '100%' },
});
