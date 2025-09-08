// src/pages/forms/DVRForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, ActivityIndicator, TextInput, useTheme, Menu, Modal, Portal, Checkbox } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';
import { DEALER_TYPES, BRANDS, FEEDBACKS } from '../../components/ReusableConstants';
import { createDvr } from '../../backendConnections/apiServices'; // Import the service function

type Step = 'checkin' | 'form' | 'checkout' | 'loading';
type UserLite = { id: number };

export default function DVRForm() {
  const navigation = useNavigation();
  const theme = useTheme();
  const cameraRef = useRef<CameraView>(null);

  // In a real app, user would come from a global state/context
  const [currentUser] = useState<UserLite>({ id: 1 });

  // --- State Management ---
  const [step, setStep] = useState<Step>('loading');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  // Photos and Timestamps
  const [checkInPhotoUri, setCheckInPhotoUri] = useState<string | null>(null);
  const [checkOutPhotoUri, setCheckOutPhotoUri] = useState<string | null>(null);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);

  // Geolocation
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [geoBusy, setGeoBusy] = useState(false);
  
  // Form Fields
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));
  const [dealerType, setDealerType] = useState('');
  const [dealerName, setDealerName] = useState('');
  const [subDealerName, setSubDealerName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [visitType, setVisitType] = useState('');
  const [dealerTotalPotential, setDealerTotalPotential] = useState('');
  const [dealerBestPotential, setDealerBestPotential] = useState('');
  const [brandSelling, setBrandSelling] = useState<string[]>([]);
  const [contactPerson, setContactPerson] = useState('');
  const [contactPersonPhoneNo, setContactPersonPhoneNo] = useState('');
  const [todayOrderMt, setTodayOrderMt] = useState('');
  const [todayCollectionRupees, setTodayCollectionRupees] = useState('');
  const [overdueAmount, setOverdueAmount] = useState('');
  const [feedbacks, setFeedbacks] = useState('');
  const [solutionBySalesperson, setSolutionBySalesperson] = useState('');
  const [anyRemarks, setAnyRemarks] = useState('');

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dealerTypeMenuVisible, setDealerTypeMenuVisible] = useState(false);
  const [feedbackMenuVisible, setFeedbackMenuVisible] = useState(false);
  const [brandsModalVisible, setBrandsModalVisible] = useState(false);

  // --- Permission Handling ---
  useEffect(() => {
    const requestPerms = async () => {
      const { status } = await requestCameraPermission();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required.');
        navigation.goBack();
        return;
      }
      setStep('checkin');
    };
    requestPerms();
  }, []);

  // --- Core Logic Functions ---
  const handleCapture = async () => {
    if (cameraRef.current) {
      setStep('loading');
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });

      if (step === 'checkin') {
        if (photo) {
          setCheckInPhotoUri(photo.uri);
          setCheckInTime(new Date().toISOString());
        }
        setStep('form');
      } else if (step === 'checkout') {
        if (photo) {
          setCheckOutPhotoUri(photo.uri);
          setCheckOutTime(new Date().toISOString());
        }
        await handleSubmit(photo?.uri);
      }
    }
  };
  
  const useMyLocation = async () => {
    setGeoBusy(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location access is required.');
      setGeoBusy(false);
      return;
    }
    try {
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      setLocationName(`Lat ${loc.coords.latitude.toFixed(5)}, Lon ${loc.coords.longitude.toFixed(5)}`);
    } catch (error) {
       Alert.alert('Error', 'Could not fetch location.');
    } finally {
      setGeoBusy(false);
    }
  };

  const validate = (): string | null => {
    if (!dealerType || !dealerName || !locationName || !visitType || !feedbacks) {
      return "Please fill all required fields.";
    }
    if (brandSelling.length === 0) {
      return "Please select at least one brand.";
    }
    return null;
  };

  const handleProceedToCheckout = () => {
    const error = validate();
    if (error) {
      return Alert.alert("Validation Error", error);
    }
    setStep('checkout');
  };
  
  const handleSubmit = async (finalPhotoUri?: string) => {
    setIsSubmitting(true);

    const dvrPayload = {
      userId: currentUser.id,
      reportDate, dealerType, dealerName, subDealerName,
      location: locationName,
      latitude: location?.coords.latitude,
      longitude: location?.coords.longitude,
      visitType, 
      dealerTotalPotential: Number(dealerTotalPotential) || 0,
      dealerBestPotential: Number(dealerBestPotential) || 0,
      brandSelling, contactPerson, contactPersonPhoneNo,
      todayOrderMt: Number(todayOrderMt) || 0,
      todayCollectionRupees: Number(todayCollectionRupees) || 0,
      overdueAmount: Number(overdueAmount) || 0,
      feedbacks, solutionBySalesperson, anyRemarks,
      checkInTime, checkOutTime,
      inTimeImageUrl: checkInPhotoUri, // Replace with uploaded URL in real app
      outTimeImageUrl: finalPhotoUri, // Replace with uploaded URL in real app
    };
    
    // Call the central API service function
    const result = await createDvr(dvrPayload) as { success: boolean };
    setIsSubmitting(false);

    if (result.success) {
      Alert.alert('Success', 'DVR has been submitted successfully.');
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Failed to submit DVR.');
    }
  };
  
  // --- UI Rendering ---
  const textInputTheme = {
    colors: {
      primary: theme.colors.primary, text: '#e5e7eb', placeholder: '#9ca3af',
      background: '#1e293b', outline: '#475569',
    },
  };
  
  const handleBrandToggle = (brand: string) => {
    setBrandSelling(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const renderContent = () => {
    if (step === 'loading' || !cameraPermission?.granted) {
      return <ActivityIndicator animating={true} size="large" />;
    }

    if (step === 'checkin' || step === 'checkout') {
      return (
        <View style={styles.cameraStepContainer}>
          <Text variant="headlineSmall" style={styles.title}>{step === 'checkin' ? 'Dealer Check-in' : 'Dealer Checkout'}</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>Take a selfie to {step === 'checkin' ? 'start' : 'complete'} the visit.</Text>
          <View style={styles.cameraContainer}>
            <CameraView ref={cameraRef} style={styles.camera} facing={'front'} />
          </View>
          <Button mode="contained" icon={step === 'checkout' ? 'camera-check' : 'camera'} onPress={handleCapture} style={styles.button} loading={isSubmitting} disabled={isSubmitting}>
             {step === 'checkin' ? 'Capture & Continue' : 'Capture & Submit DVR'}
          </Button>
        </View>
      );
    }

    if (step === 'form') {
      return (
        <>
        <Portal>
            <Modal visible={brandsModalVisible} onDismiss={() => setBrandsModalVisible(false)} contentContainerStyle={styles.modalContainer}>
                <Text variant="titleLarge" style={styles.modalTitle}>Select Brands</Text>
                {BRANDS.map(brand => (
                    <Checkbox.Item 
                        key={brand}
                        label={brand}
                        status={brandSelling.includes(brand) ? 'checked' : 'unchecked'}
                        onPress={() => handleBrandToggle(brand)}
                        labelStyle={{color: '#e5e7eb'}}
                        color={theme.colors.primary}
                        uncheckedColor='#9ca3af'
                    />
                ))}
                <Button onPress={() => setBrandsModalVisible(false)} style={{marginTop: 10}}>Done</Button>
            </Modal>
        </Portal>
        <ScrollView contentContainerStyle={styles.formContainer}>
            <Text variant="headlineSmall" style={styles.title}>Visit Details</Text>
            {checkInPhotoUri && <Image source={{uri: checkInPhotoUri}} style={styles.photoPreview} />}
            
            <Menu
              visible={dealerTypeMenuVisible}
              onDismiss={() => setDealerTypeMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setDealerTypeMenuVisible(true)}>
                  <TextInput label="Dealer Type *" mode="outlined" value={dealerType} editable={false} style={styles.input} theme={textInputTheme} />
                </TouchableOpacity>
              }>
              {DEALER_TYPES.map(type => <Menu.Item key={type} onPress={() => { setDealerType(type); setDealerTypeMenuVisible(false); }} title={type} />)}
            </Menu>

            <TextInput label="Dealer Name *" mode="outlined" value={dealerName} onChangeText={setDealerName} style={styles.input} theme={textInputTheme} />
            <TextInput label="Sub Dealer Name" mode="outlined" value={subDealerName} onChangeText={setSubDealerName} style={styles.input} theme={textInputTheme} />
            
            <View style={styles.locationContainer}>
                <TextInput label="Location *" mode="outlined" value={locationName} onChangeText={setLocationName} style={[styles.input, {flex: 1}]} theme={textInputTheme} />
                <Button icon="crosshairs-gps" mode="contained" onPress={useMyLocation} style={styles.locationButton} loading={geoBusy} disabled={geoBusy}>
                    Fetch
                </Button>
            </View>
            
            <TextInput label="Visit Type *" mode="outlined" value={visitType} onChangeText={setVisitType} style={styles.input} theme={textInputTheme} />
            <TextInput label="Dealer Total Potential (MT)" keyboardType="numeric" mode="outlined" value={dealerTotalPotential} onChangeText={setDealerTotalPotential} style={styles.input} theme={textInputTheme} />
            <TextInput label="Dealer Best Potential (MT)" keyboardType="numeric" mode="outlined" value={dealerBestPotential} onChangeText={setDealerBestPotential} style={styles.input} theme={textInputTheme} />
            
            <TouchableOpacity onPress={() => setBrandsModalVisible(true)}>
                <TextInput 
                    label="Brands Selling *" 
                    mode="outlined"
                    value={brandSelling.join(', ') || 'Select brands...'}
                    editable={false}
                    style={styles.input}
                    theme={textInputTheme} 
                />
            </TouchableOpacity>

            <TextInput label="Contact Person" mode="outlined" value={contactPerson} onChangeText={setContactPerson} style={styles.input} theme={textInputTheme} />
            <TextInput label="Contact Person Phone" keyboardType="phone-pad" mode="outlined" value={contactPersonPhoneNo} onChangeText={setContactPersonPhoneNo} style={styles.input} theme={textInputTheme} />
            <TextInput label="Today's Order (MT)" keyboardType="numeric" mode="outlined" value={todayOrderMt} onChangeText={setTodayOrderMt} style={styles.input} theme={textInputTheme} />
            <TextInput label="Today's Collection (₹)" keyboardType="numeric" mode="outlined" value={todayCollectionRupees} onChangeText={setTodayCollectionRupees} style={styles.input} theme={textInputTheme} />
            <TextInput label="Overdue Amount (₹)" keyboardType="numeric" mode="outlined" value={overdueAmount} onChangeText={setOverdueAmount} style={styles.input} theme={textInputTheme} />
            
            <Menu
              visible={feedbackMenuVisible}
              onDismiss={() => setFeedbackMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setFeedbackMenuVisible(true)}>
                  <TextInput label="Feedback *" mode="outlined" value={feedbacks} editable={false} style={styles.input} theme={textInputTheme} />
                </TouchableOpacity>
              }>
              {FEEDBACKS.map(fb => <Menu.Item key={fb} onPress={() => { setFeedbacks(fb); setFeedbackMenuVisible(false); }} title={fb} />)}
            </Menu>

            <TextInput label="Solution by Salesperson" mode="outlined" value={solutionBySalesperson} onChangeText={setSolutionBySalesperson} style={styles.input} multiline numberOfLines={3} theme={textInputTheme} />
            <TextInput label="Any Remarks" mode="outlined" value={anyRemarks} onChangeText={setAnyRemarks} style={styles.input} multiline numberOfLines={3} theme={textInputTheme} />
            
            <Button mode="contained" onPress={handleProceedToCheckout} style={styles.button}>
                Continue to Checkout Photo
            </Button>
        </ScrollView>
        </>
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['right', 'bottom', 'left']}>
      <AppHeader title="Daily Visit Report" />
      <View style={styles.container}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f172a" },
  container: { flex: 1, padding: 16 },
  cameraStepContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  formContainer: { paddingTop: 16, paddingBottom: 32 },
  title: { color: "#e5e7eb", marginBottom: 4, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { color: '#9ca3af', marginBottom: 24, textAlign: 'center' },
  cameraContainer: { width: 300, height: 300, borderRadius: 150, overflow: 'hidden', marginBottom: 24, borderWidth: 2, borderColor: '#334155' },
  camera: { flex: 1 },
  photoPreview: { width: 100, height: 100, alignSelf: 'center', borderRadius: 50, marginBottom: 24, borderWidth: 2, borderColor: '#334155' },
  input: { marginBottom: 16 },
  button: { marginTop: 8, paddingVertical: 4, width: '100%' },
  locationContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  locationButton: { height: 55, justifyContent: 'center', marginTop: -8 },
  modalContainer: { backgroundColor: '#1e293b', padding: 20, margin: 20, borderRadius: 8 },
  modalTitle: { color: '#e5e7eb', marginBottom: 10 }
});

