// src/pages/forms/AttendanceInForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, ActivityIndicator, useTheme } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from "expo-image-picker";
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppHeader from '../../components/AppHeader';

// Define the navigation props type for type safety
type RootStackParamList = {
  Home: { checkedIn: boolean };
};
type NavigationProps = NativeStackNavigationProp<RootStackParamList>;
type UserLite = { id: number };

interface AttendanceInFormProps {
  userId: number;
  onSubmitted: () => void;
  onCancel: () => void;
}

export default function AttendanceInForm({ userId, onSubmitted, onCancel }: AttendanceInFormProps) {
  const navigation = useNavigation<NavigationProps>();
  const theme = useTheme();
  const cameraRef = useRef<CameraView>(null);

  // In a real app, user would come from a global state/context
  const [currentUser] = useState<UserLite>({ id: 1 });

  const [step, setStep] = useState<'camera' | 'location' | 'loading'>('loading');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const requestPermissions = async () => {
      // Use ImagePicker permission since we open the native camera activity
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'You need to grant camera access to check in.');
        navigation.goBack();
        return;
      }
      setStep('camera');
    };
    requestPermissions();
  }, []);

  const takePicture = async () => {
    console.log("[AttendanceIn] takePicture (ImagePicker-first) called. step:", step);

    // Prevent duplicate captures
    if ((takePicture as any).inProgress) {
      console.warn("[AttendanceIn] capture already in progress");
      return;
    }
    (takePicture as any).inProgress = true;

    try {
      setStep("loading");

      // 1) Request ImagePicker camera permission (handles runtime permission on Android)
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      console.log("[AttendanceIn] ImagePicker permission:", perm.status);
      if (perm.status !== "granted") {
        Alert.alert("Permission required", "Camera permission is required to take photos.");
        setStep("camera");
        (takePicture as any).inProgress = false;
        return;
      }

      // 2) Launch ImagePicker camera UI (user-friendly fallback that works on most devices)
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        allowsEditing: false,
        exif: false,
      });
      //console.log("[AttendanceIn] ImagePicker result:", result);

      // ImagePicker result shape: { canceled: boolean, assets?: [{ uri, ... }] }
      if (!result || result.canceled || !result.assets || result.assets.length === 0) {
        console.log("[AttendanceIn] no photo taken or cancelled");
        setStep("camera");
        (takePicture as any).inProgress = false;
        return;
      }

      const pickedUri = result.assets[0].uri;
      setPhotoUri(pickedUri);
      //console.log("[AttendanceIn] pickedUri:", pickedUri);

      // 3) proceed to location step (your existing fetchLocation handles it)
      await fetchLocation();

      (takePicture as any).inProgress = false;
      return;
    } catch (err) {
      console.error("[AttendanceIn] ImagePicker primary capture error:", err);
      // As a secondary fallback we could try expo-camera here, but skip for now to keep UX reliable
      Alert.alert("Error", "Could not capture photo. Try again.");
      setStep("camera");
      (takePicture as any).inProgress = false;
      return;
    }
  };

  const fetchLocation = async () => {
    try {
      console.log('[AttendanceIn] requesting location permission');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // try again once (keeps behavior similar to your previous implementation)
        const response = await Location.requestForegroundPermissionsAsync();
        if (response.status !== 'granted') {
          Alert.alert('Permission required', 'You need to grant location access to check in.');
          setStep('camera');
          return;
        }
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      setStep('location');
    } catch (err) {
      console.error('[AttendanceIn] fetchLocation error', err);
      Alert.alert('Error', 'Unable to fetch location. Please try again.');
      setStep('camera');
    }
  };

  const handleSubmit = async () => {
    if (!photoUri || !location) {
      return Alert.alert("Error", "Photo or location data is missing.");
    }
    setIsSubmitting(true);

    /*
    // --- IMAGE UPLOAD LOGIC (COMMENTED OUT) ---
    // In a real app, you would first upload the image to a service (like R2/S3)
    // and get back a public URL to store in your database.
    // This function would likely live in your apiService.ts file.
    // const inTimeImageUrl = await uploadImage(photoUri, 'attendance-in');
    */

    const attendancePayload = {
      userId: currentUser.id,
      attendanceDate: new Date().toISOString().split('T')[0],
      locationName: `Lat ${location.coords.latitude.toFixed(5)}, Lon ${location.coords.longitude.toFixed(5)}`,
      inTimeTimestamp: new Date(location.timestamp).toISOString(),
      inTimeImageCaptured: true,
      inTimeImageUrl: photoUri, // Replace with inTimeImageUrl from upload service
      inTimeLatitude: location.coords.latitude,
      inTimeLongitude: location.coords.longitude,
      inTimeAccuracy: location.coords.accuracy,
    };

    // Call the central API service function
    const result = await createAttendanceIn(attendancePayload) as { success: boolean };
    setIsSubmitting(false);

    if (result.success) {
      Alert.alert('Success', 'You have been successfully checked in.');
      navigation.navigate('Home', { checkedIn: true });
    } else {
      Alert.alert('Error', 'Failed to check in.');
    }
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
            Please take a clear selfie to mark your attendance.
          </Text>

          {/* SHOW PREVIEW IF A PHOTO WAS ALREADY TAKEN; OTHERWISE SHOW A PLACEHOLDER */}
          <View style={styles.cameraContainer}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.camera} />
            ) : (
              // simple centered placeholder circle
              <View style={{
                flex: 1,
                backgroundColor: '#071024',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Text style={{ color: '#9ca3af' }}>Tap Capture to open phone camera</Text>
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
            Confirm Check-in
          </Button>
        </>
      );
    }

    return <Text style={{ color: theme.colors.error }}>Something went wrong. Please try again.</Text>;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['right', 'bottom', 'left']}>
      <AppHeader title="Attendance Check-in" />
      <View style={styles.container}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

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

