// src/pages/forms/AttendanceInForm.tsx
import React, { useState, useEffect } from 'react';
import { View, Image, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, ActivityIndicator, useTheme } from 'react-native-paper';
import * as ImagePicker from "expo-image-picker";
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BASE_URL } from '../../components/ReusableConstants';

// --- Type Definitions ---
type Step = 'camera' | 'location' | 'loading';
interface AttendanceInFormProps {
  userId: number;
  onSubmitted: () => void;
  onCancel: () => void;
}

// --- Component ---
export default function AttendanceInForm({ userId, onSubmitted, onCancel }: AttendanceInFormProps) {
  const theme = useTheme();
  const [step, setStep] = useState<Step>('loading');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'You need to grant camera access to check in.', [
          { text: 'OK', onPress: onCancel }
        ]);
        return;
      }
      setStep('camera');
    };
    requestPermissions();
  }, [onCancel]);

  const takePicture = async () => {
    if (step === 'loading') return;

    try {
      setStep("loading");
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        allowsEditing: false,
        exif: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setStep("camera");
        return;
      }

      const pickedUri = result.assets[0].uri;
      setPhotoUri(pickedUri);

      await fetchLocation();

    } catch (err) {
      console.error("ImagePicker capture error:", err);
      Alert.alert("Error", "Could not capture photo. Please try again.");
      setStep("camera");
    }
  };

  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('You need to grant location access to check in.');
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      setStep('location');
    } catch (err: any) {
      console.error('fetchLocation error', err);
      Alert.alert('Error', err.message || 'Unable to fetch location. Please try again.');
      setStep('camera');
    }
  };

  const handleSubmit = async () => {
    if (!photoUri || !location) {
      return Alert.alert("Error", "Photo or location data is missing.");
    }
    setIsSubmitting(true);

    const formData = new FormData();

    formData.append('userId', String(userId));
    formData.append('attendanceDate', new Date().toISOString().split('T')[0]);
    formData.append('locationName', `Lat ${location.coords.latitude.toFixed(5)}, Lon ${location.coords.longitude.toFixed(5)}`);
    formData.append('inTimeTimestamp', new Date(location.timestamp).toISOString());
    formData.append('inTimeImageCaptured', 'true');
    formData.append('inTimeLatitude', String(location.coords.latitude));
    formData.append('inTimeLongitude', String(location.coords.longitude));
    formData.append('inTimeAccuracy', String(location.coords.accuracy));

    formData.append('inTimeImage', {
      uri: photoUri,
      name: 'checkin.jpg',
      type: 'image/jpeg',
    } as any);

    try {
      const response = await fetch(`${BASE_URL}/api/attendance/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to check in.');

      Toast.show({ type: 'success', text1: 'Checked In Successfully!' });
      onSubmitted();
    } catch (error: any) {
      Alert.alert('Submission Failed', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (step === 'loading') {
      return <ActivityIndicator animating={true} size="large" />;
    }

    if (step === 'camera') {
      return (
        <View style={styles.contentContainer}>
          <Text variant="headlineSmall" style={styles.title}>Selfie Capture</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Please take a clear selfie to mark your attendance.
          </Text>
          <View style={styles.photoFrame}>
            <View style={styles.photoPlaceholder}>
              <Icon name="camera" size={64} color={theme.colors.onSurface} />
              <Text style={styles.placeholderText}>Tap below to open camera</Text>
            </View>
          </View>
          <Button mode="contained" icon="camera" onPress={takePicture} style={styles.button}>
            Capture & Continue
          </Button>
        </View>
      );
    }

    if (step === 'location' && photoUri && location) {
      return (
        <View style={styles.contentContainer}>
          <Text variant="headlineSmall" style={styles.title}>Confirm Details</Text>
          <Image source={{ uri: photoUri }} style={styles.confirmImage} />
          <Text style={styles.locationLabel}>Location Captured:</Text>
          <Text style={styles.locationText}>
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
        </View>
      );
    }
    
    return <Text style={styles.fallbackText}>Something went wrong. Please cancel and try again.</Text>;
  };

  return (
    <View style={[{ backgroundColor: theme.colors.background }, styles.container]}>
      {renderContent()}
      <Button
        onPress={onCancel}
        disabled={isSubmitting}
        style={styles.cancelButton}
        textColor={theme.colors.onSurface}
      >
        Cancel
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  photoFrame: {
    width: 288,
    height: 288,
    borderRadius: 144,
    backgroundColor: '#374151',
    borderWidth: 2,
    borderColor: '#4b5563',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 24,
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#94a3b8',
    marginTop: 8,
  },
  button: {
    width: '100%',
    padding: 4,
    borderRadius: 8,
  },
  confirmImage: {
    width: 192,
    height: 192,
    borderRadius: 96,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#4b5563',
  },
  locationLabel: {
    color: '#94a3b8',
    fontSize: 16,
    marginBottom: 4,
  },
  locationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 24,
  },
  cancelButton: {
    position: 'absolute',
    bottom: 24,
  },
  fallbackText: {
    color: 'red',
  },
});