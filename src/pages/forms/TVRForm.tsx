import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, ActivityIndicator, TextInput, useTheme } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';

type Step = 'checkin' | 'form' | 'checkout' | 'loading';

export default function TVRForm() {
  const navigation = useNavigation();
  const theme = useTheme();
  const cameraRef = useRef<CameraView>(null);

  const [step, setStep] = useState<Step>('loading');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  // State for photos and location
  const [checkInPhotoUri, setCheckInPhotoUri] = useState<string | null>(null);
  const [checkOutPhotoUri, setCheckOutPhotoUri] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  
  // State for form fields (simplified version of your web form)
  const [siteName, setSiteName] = useState('');
  const [clientsRemarks, setClientsRemarks] = useState('');
  const [salespersonRemarks, setSalespersonRemarks] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const requestPerms = async () => {
      if (!cameraPermission?.granted) {
        await requestCameraPermission();
      }
      setStep('checkin');
    };
    requestPerms();
  }, [cameraPermission]);
  
  const handleCapture = async () => {
    if (cameraRef.current) {
      setStep('loading');
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });

      if (step === 'checkin') {
        if (photo) setCheckInPhotoUri(photo.uri);
        setStep('form');
      } else if (step === 'checkout') {
        if (photo) setCheckOutPhotoUri(photo.uri);
        await handleSubmit(photo?.uri);
      }
    }
  };

  const handleProceedToCheckout = async () => {
    if (!siteName.trim()) {
      return Alert.alert("Validation Error", "Please enter the site/person name.");
    }

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location access is required to submit the form.');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);

    setStep('checkout');
  };
  
  const handleSubmit = async (finalPhotoUri?: string) => {
    setIsSubmitting(true);
    console.log("--- SUBMITTING TVR ---");
    console.log({
      siteName,
      clientsRemarks,
      salespersonRemarks,
      checkInPhotoUri,
      checkOutPhotoUri: finalPhotoUri,
      latitude: location?.coords.latitude,
      longitude: location?.coords.longitude,
    });
    
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert('Success', 'TVR has been submitted successfully.');
      navigation.goBack();
    }, 2000);
  };
  
  const textInputTheme = {
    colors: {
      primary: theme.colors.primary, text: '#e5e7eb', placeholder: '#9ca3af',
      background: '#1e293b', outline: '#475569',
    },
  };

  const renderContent = () => {
    if (step === 'loading' || !cameraPermission) {
      return <ActivityIndicator animating={true} size="large" />;
    }

    if (step === 'checkin') {
      return (
        <View style={styles.cameraStepContainer}>
          <Text variant="headlineSmall" style={styles.title}>Site Check-in</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>Take a selfie to begin the technical visit.</Text>
          <View style={styles.cameraContainer}>
            <CameraView ref={cameraRef} style={styles.camera} facing={'front'} />
          </View>
          <Button mode="contained" icon="camera" onPress={handleCapture} style={styles.button}>
            Capture & Continue
          </Button>
        </View>
      );
    }

    if (step === 'form') {
      return (
        <ScrollView contentContainerStyle={styles.formContainer}>
            <Text variant="headlineSmall" style={styles.title}>Technical Visit Details</Text>
            {checkInPhotoUri && <Image source={{uri: checkInPhotoUri}} style={styles.photoPreview} />}
            <TextInput label="Site Name / Concerned Person" mode="outlined" value={siteName} onChangeText={setSiteName} style={styles.input} theme={textInputTheme} />
            <TextInput label="Client's Remarks" mode="outlined" value={clientsRemarks} onChangeText={setClientsRemarks} style={styles.input} multiline numberOfLines={4} theme={textInputTheme} />
            <TextInput label="Salesperson Remarks" mode="outlined" value={salespersonRemarks} onChangeText={setSalespersonRemarks} style={styles.input} multiline numberOfLines={4} theme={textInputTheme} />
            <Button mode="contained" onPress={handleProceedToCheckout} style={styles.button}>
                Capture Location & Proceed to Checkout
            </Button>
        </ScrollView>
      );
    }
    
    if (step === 'checkout') {
      return (
        <View style={styles.cameraStepContainer}>
          <Text variant="headlineSmall" style={styles.title}>Site Checkout</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>Take a final selfie to complete the visit.</Text>
          <View style={styles.cameraContainer}>
             <CameraView ref={cameraRef} style={styles.camera} facing={'front'} />
          </View>
          <Button mode="contained" icon="camera-check" onPress={handleCapture} style={styles.button} loading={isSubmitting} disabled={isSubmitting}>
             Capture & Submit TVR
          </Button>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['right', 'bottom', 'left']}>
      <AppHeader title="Technical Visit Report" />
      <View style={styles.container}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f172a" },
  container: { flex: 1, padding: 16 },
  cameraStepContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  formContainer: { alignItems: 'center', paddingVertical: 16, width: '100%' },
  title: { color: "#e5e7eb", marginBottom: 4, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { color: '#9ca3af', marginBottom: 24, textAlign: 'center' },
  cameraContainer: { width: 300, height: 300, borderRadius: 150, overflow: 'hidden', marginBottom: 24, borderWidth: 2, borderColor: '#334155' },
  camera: { flex: 1 },
  photoPreview: { width: 100, height: 100, borderRadius: 50, marginBottom: 24, borderWidth: 2, borderColor: '#334155' },
  input: { marginBottom: 16, width: '100%' },
  button: { marginTop: 8, paddingVertical: 4, width: '90%' }
});

