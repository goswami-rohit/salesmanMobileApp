// src/pages/forms/AttendanceInForm.tsx
import React, { useState, useEffect } from 'react';
import { View, Image, Alert, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from "expo-image-picker";
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BASE_URL} from '../../components/ReusableConstants';

// --- Type Definitions ---
type Step = 'camera' | 'location' | 'loading';
interface AttendanceInFormProps {
  userId: number;
  onSubmitted: () => void;
  onCancel: () => void;
}

// --- Component ---
export default function AttendanceInForm({ userId, onSubmitted, onCancel }: AttendanceInFormProps) {
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
    // This is a simple guard to prevent rapid, accidental double-taps.
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

      // Proceed to location step
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
      setStep('camera'); // Revert to camera step on failure
    }
  };

  const handleSubmit = async () => {
    if (!photoUri || !location) {
      return Alert.alert("Error", "Photo or location data is missing.");
    }
    setIsSubmitting(true);

    // FormData is required for sending images
    const formData = new FormData();

    formData.append('userId', String(userId));
    formData.append('attendanceDate', new Date().toISOString().split('T')[0]);
    formData.append('locationName', `Lat ${location.coords.latitude.toFixed(5)}, Lon ${location.coords.longitude.toFixed(5)}`);
    formData.append('inTimeTimestamp', new Date(location.timestamp).toISOString());
    formData.append('inTimeImageCaptured', 'true');
    formData.append('inTimeLatitude', String(location.coords.latitude));
    formData.append('inTimeLongitude', String(location.coords.longitude));
    formData.append('inTimeAccuracy', String(location.coords.accuracy));

    // Append the image file
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
        <>
          <Text variant="headlineSmall" className="text-slate-200 font-bold text-center mb-2">Selfie Capture</Text>
          <Text variant="bodyMedium" className="text-slate-400 text-center mb-6">
            Please take a clear selfie to mark your attendance.
          </Text>
          <View className="w-72 h-72 rounded-full bg-slate-800 border-2 border-slate-700 justify-center items-center overflow-hidden mb-6">
            <View className="flex-1 bg-slate-800 items-center justify-center">
              <Icon name="camera" size={64} color="#64748b" />
              <Text className="text-slate-500 mt-2">Tap below to open camera</Text>
            </View>
          </View>
          <Button mode="contained" icon="camera" onPress={takePicture} className="w-full p-1">
            Capture & Continue
          </Button>
        </>
      );
    }

    if (step === 'location' && photoUri && location) {
      return (
        <>
          <Text variant="headlineSmall" className="text-slate-200 font-bold text-center mb-4">Confirm Details</Text>
          <Image source={{ uri: photoUri }} className="w-48 h-48 rounded-full mb-6 border-2 border-slate-700" />
          <Text className="text-slate-400 text-base mb-2">Location Captured:</Text>
          <Text className="text-slate-200 text-base mb-6 font-semibold">
            Lat: {location.coords.latitude.toFixed(5)}, Lon: {location.coords.longitude.toFixed(5)}
          </Text>
          <Button
            mode="contained"
            onPress={handleSubmit}
            className="w-full p-1"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Confirm Check-in
          </Button>
        </>
      );
    }

    // Fallback view in case of an unexpected state
    return <Text className="text-red-500">Something went wrong. Please cancel and try again.</Text>;
  };

  return (
    <View className="flex-1 p-4 items-center justify-center bg-slate-900">
      {renderContent()}
      <Button
        onPress={onCancel}
        disabled={isSubmitting}
        className="absolute bottom-6"
        textColor="gray"
      >
        Cancel
      </Button>
    </View>
  );
}
