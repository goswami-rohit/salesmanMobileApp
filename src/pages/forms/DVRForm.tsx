// src/pages/forms/DVRForm.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, View, TouchableOpacity, Platform, Alert, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, TextInput, HelperText, ActivityIndicator, Modal, Portal, Checkbox, Avatar, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import RNPickerSelect from 'react-native-picker-select';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location'; // <-- Changed to expo-location
import Toast from 'react-native-toast-message';

import { useAppStore, DEALER_TYPES, BRANDS, FEEDBACKS, BASE_URL } from '../../components/ReusableConstants';
import AppHeader from '../../components/AppHeader';

// --- Type Definitions ---
type Step = 'checkin' | 'form' | 'checkout' | 'loading';

// --- Zod Schema ---
const DVReportSchema = z.object({
  userId: z.number(),
  reportDate: z.string(),
  dealerType: z.string().min(1, "Dealer type is required"),
  dealerName: z.string().min(1, "Dealer name is required"),
  subDealerName: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  latitude: z.number(),
  longitude: z.number(),
  visitType: z.string().min(1, "Visit type is required"),
  dealerTotalPotential: z.coerce.number().optional(),
  dealerBestPotential: z.coerce.number().optional(),
  brandSelling: z.string().array().min(1, "Select at least one brand"),
  contactPerson: z.string().optional(),
  contactPersonPhoneNo: z.string().optional(),
  todayOrderMt: z.coerce.number().optional(),
  todayCollectionRupees: z.coerce.number().optional(),
  overdueAmount: z.coerce.number().optional(),
  feedbacks: z.string().min(1, "Feedback is required"),
  solutionBySalesperson: z.string().optional(),
  anyRemarks: z.string().optional(),
});
type DVReportFormValues = z.infer<typeof DVReportSchema>;

// --- Component ---
export default function DVRForm() {
  const navigation = useNavigation();
  const theme = useTheme();
  const { user } = useAppStore();

  const [step, setStep] = useState<Step>('loading');
  const [checkInPhotoUri, setCheckInPhotoUri] = useState<string | null>(null);
  const [checkOutPhotoUri, setCheckOutPhotoUri] = useState<string | null>(null);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [brandsModalVisible, setBrandsModalVisible] = useState(false);
  const [isGeoBusy, setIsGeoBusy] = useState(false);

  const { control, handleSubmit, setValue, trigger, watch, formState: { errors, isSubmitting } } = useForm<DVReportFormValues>({
    resolver: zodResolver(DVReportSchema) as unknown as Resolver<DVReportFormValues, any>,
    mode: 'onChange',
    defaultValues: {
      userId: user?.id,
      reportDate: new Date().toISOString().slice(0, 10),
      brandSelling: [],
    },
  });

  const brandSelling = watch('brandSelling');

  useEffect(() => {
    const requestPerms = async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required.');
        navigation.goBack();
        return;
      }
      setStep('checkin');
    };
    requestPerms();
  }, [navigation]);

  const handleCapture = async () => {
    const currentStep = step;
    setStep('loading');
    try {
      const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
      if (result.canceled || !result.assets || result.assets.length === 0) {
        setStep(currentStep);
        return;
      }
      const pickedUri = result.assets[0].uri;

      if (currentStep === 'checkin') {
        setCheckInPhotoUri(pickedUri);
        setCheckInTime(new Date().toISOString());
        setStep('form');
      } else if (currentStep === 'checkout') {
        setCheckOutPhotoUri(pickedUri);
        await handleSubmit(submit)();
      }
    } catch (err) {
      console.error('handleCapture error', err);
      Alert.alert('Error', 'Could not capture photo.');
      setStep(currentStep);
    }
  };

  // FIX: Converted to use expo-location
  const useMyLocation = async () => {
    setIsGeoBusy(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') throw new Error('Location permission denied');

      const pos = await Location.getCurrentPositionAsync({});
      
      const { latitude, longitude } = pos.coords;
      setValue('latitude', latitude, { shouldValidate: true });
      setValue('longitude', longitude, { shouldValidate: true });
      setValue('location', `Lat ${latitude.toFixed(5)}, Lon ${longitude.toFixed(5)}`, { shouldValidate: true });
      Toast.show({ type: 'success', text1: 'Location Captured' });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not fetch location.');
    } finally {
      setIsGeoBusy(false);
    }
  };

  const handleProceedToCheckout = async () => {
    const isValid = await trigger();
    if (isValid) {
      setStep('checkout');
    } else {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please fill all required fields correctly.' });
    }
  };

  const submit = async (data: DVReportFormValues) => {
    if (!checkInPhotoUri || !checkOutPhotoUri) {
      Alert.alert('Error', 'Check-in or Check-out photo is missing.');
      setStep('checkout');
      return;
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, Array.isArray(value) ? JSON.stringify(value) : String(value));
      }
    });
    formData.append('checkInTime', checkInTime!);
    formData.append('checkOutTime', new Date().toISOString());
    formData.append('inTimeImage', { uri: checkInPhotoUri, name: 'checkin.jpg', type: 'image/jpeg' } as any);
    formData.append('outTimeImage', { uri: checkOutPhotoUri, name: 'checkout.jpg', type: 'image/jpeg' } as any);

    try {
      const response = await fetch(`${BASE_URL}/api/daily-visit-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to submit report.');
      Toast.show({ type: 'success', text1: 'DVR Submitted Successfully' });
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Submission Failed', error.message);
      setStep('checkout');
    }
  };

  const renderContent = () => {
    if (step === 'loading' || isSubmitting) {
      return (
        <View style={styles.centeredContent}>
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    if (step === 'checkin' || step === 'checkout') {
      const isCheckout = step === 'checkout';
      const photoUri = isCheckout ? checkOutPhotoUri : checkInPhotoUri;
      return (
        <View style={styles.centeredContent}>
          <Text variant="headlineSmall" style={styles.cameraTitle}>{isCheckout ? 'Dealer Checkout' : 'Dealer Check-in'}</Text>
          <Text variant="bodyMedium" style={styles.cameraSubtitle}>Take a selfie to {isCheckout ? 'complete' : 'start'} the visit.</Text>
          <View style={styles.photoFrame}>
            {photoUri ? <Image source={{ uri: photoUri }} style={styles.photo} /> : <Avatar.Icon size={96} icon="camera" style={styles.avatarIcon} />}
          </View>
          <Button mode="contained" icon="camera" onPress={handleCapture} style={styles.button}>
            Take your picture and continue
          </Button>
        </View>
      );
    }

    if (step === 'form') {
      return (
        <>
          <Portal>
            <Modal visible={brandsModalVisible} onDismiss={() => setBrandsModalVisible(false)} contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
              <Text variant="titleLarge" style={styles.modalTitle}>Select Brands</Text>
              <ScrollView>
                {BRANDS.map(brand => (
                  <Checkbox.Item
                    key={brand}
                    label={brand}
                    status={brandSelling.includes(brand) ? 'checked' : 'unchecked'}
                    onPress={() => {
                      const newBrands = brandSelling.includes(brand) ? brandSelling.filter(b => b !== brand) : [...brandSelling, brand];
                      setValue('brandSelling', newBrands, { shouldValidate: true });
                    }}
                    labelStyle={styles.checkboxLabel}
                  />
                ))}
              </ScrollView>
              <Button onPress={() => setBrandsModalVisible(false)} style={styles.modalButton}>Done</Button>
            </Modal>
          </Portal>

          <ScrollView contentContainerStyle={styles.formContainer}>
            <Text variant="headlineSmall" style={styles.formTitle}>Visit Details</Text>
            {checkInPhotoUri && <Image source={{ uri: checkInPhotoUri }} style={styles.formCheckInPhoto} />}

            <Controller control={control} name="dealerType" render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}><View style={[styles.pickerWrapper, { borderColor: errors.dealerType ? theme.colors.error : theme.colors.outline }]}>
                <RNPickerSelect onValueChange={onChange} value={value} items={DEALER_TYPES.map(t => ({ label: t, value: t }))} placeholder={{ label: "Select Dealer Type *", value: null }} style={{ inputIOS: styles.pickerInput, inputAndroid: styles.pickerInput, iconContainer: styles.pickerIcon, placeholder: styles.pickerPlaceholder, }} useNativeAndroidPickerStyle={false} Icon={() => <Icon name="chevron-down" size={24} color={theme.colors.onSurface} />} />
              </View>{errors.dealerType && <HelperText type="error">{errors.dealerType?.message}</HelperText>}</View>
            )} />
            <Controller name="dealerName" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputContainer}><TextInput label="Dealer Name *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.dealerName} /><HelperText type="error">{errors.dealerName?.message}</HelperText></View>)} />
            <Controller name="subDealerName" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputContainer}><TextInput label="Sub Dealer Name (Optional)" value={value} onChangeText={onChange} onBlur={onBlur} /></View>)} />

            <View style={[styles.row, styles.inputContainer]}>
              <Controller name="location" control={control} render={({ field: { onChange, onBlur, value } }) => (<TextInput label="Location *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.location} style={styles.flex1} />)} />
              <Button icon="crosshairs-gps" mode="contained-tonal" onPress={useMyLocation} loading={isGeoBusy} style={styles.fetchButton}>Fetch</Button>
            </View>
            {errors.location && <HelperText type="error" style={styles.errorText}>{errors.location?.message}</HelperText>}

            <Controller name="visitType" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputContainer}><TextInput label="Visit Type *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.visitType} /><HelperText type="error">{errors.visitType?.message}</HelperText></View>)} />
            <Controller name="dealerTotalPotential" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputContainer}><TextInput label="Dealer Total Potential (MT)" value={String(value || '')} onChangeText={onChange} onBlur={onBlur} keyboardType="numeric" /></View>)} />
            <Controller name="dealerBestPotential" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputContainer}><TextInput label="Dealer Best Potential (MT)" value={String(value || '')} onChangeText={onChange} onBlur={onBlur} keyboardType="numeric" /></View>)} />

            <TouchableOpacity onPress={() => setBrandsModalVisible(true)} style={styles.inputContainer}>
              <TextInput label="Brands Selling *" editable={false} value={brandSelling.join(', ') || 'Select brands...'} error={!!errors.brandSelling} right={<TextInput.Icon icon="chevron-down" />} />
              {errors.brandSelling && <HelperText type="error">{errors.brandSelling?.message}</HelperText>}
            </TouchableOpacity>

            <Controller name="contactPerson" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputContainer}><TextInput label="Contact Person" value={value} onChangeText={onChange} onBlur={onBlur} /></View>)} />
            <Controller name="contactPersonPhoneNo" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputContainer}><TextInput label="Contact Person Phone" value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="phone-pad" /></View>)} />
            <Controller name="todayOrderMt" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputContainer}><TextInput label="Today's Order (MT)" value={String(value || '')} onChangeText={onChange} onBlur={onBlur} keyboardType="numeric" /></View>)} />
            <Controller name="todayCollectionRupees" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputContainer}><TextInput label="Today's Collection (₹)" value={String(value || '')} onChangeText={onChange} onBlur={onBlur} keyboardType="numeric" /></View>)} />
            <Controller name="overdueAmount" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputContainer}><TextInput label="Overdue Amount (₹)" value={String(value || '')} onChangeText={onChange} onBlur={onBlur} keyboardType="numeric" /></View>)} />

            <Controller control={control} name="feedbacks" render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}><View style={[styles.pickerWrapper, { borderColor: errors.feedbacks ? theme.colors.error : theme.colors.outline }]}>
                <RNPickerSelect onValueChange={onChange} value={value} items={FEEDBACKS.map(f => ({ label: f, value: f }))} placeholder={{ label: "Select Feedback *", value: null }} style={{ inputIOS: styles.pickerInput, inputAndroid: styles.pickerInput, iconContainer: styles.pickerIcon, placeholder: styles.pickerPlaceholder, }} useNativeAndroidPickerStyle={false} Icon={() => <Icon name="chevron-down" size={24} color={theme.colors.onSurface} />} />
              </View>{errors.feedbacks && <HelperText type="error">{errors.feedbacks?.message}</HelperText>}</View>
            )} />

            <Controller name="solutionBySalesperson" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputContainer}><TextInput label="Solution by Salesperson" value={value} onChangeText={onChange} onBlur={onBlur} multiline /></View>)} />
            <Controller name="anyRemarks" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputContainer}><TextInput label="Any Remarks" value={value} onChangeText={onChange} onBlur={onBlur} multiline /></View>)} />

            <Button mode="contained" onPress={handleProceedToCheckout} style={styles.button}>Continue to Checkout</Button>
          </ScrollView>
        </>
      );
    }
  };

  return (
    <SafeAreaView style={[{ backgroundColor: theme.colors.background }, styles.fullScreenContainer]} edges={['right', 'bottom', 'left']}>
      <AppHeader title="Daily Visit Report" />
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 8,
  },
  cameraTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  cameraSubtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  photoFrame: {
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: '#374151',
    borderWidth: 2,
    borderColor: '#4b5563',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 24,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  avatarIcon: {
    backgroundColor: 'transparent',
  },
  button: {
    width: '100%',
    padding: 4,
    borderRadius: 8,
  },
  // Form styles
  formContainer: {
    padding: 16,
  },
  formTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  formCheckInPhoto: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#4b5563',
  },
  inputContainer: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  flex1: {
    flex: 1,
  },
  fetchButton: {
    alignSelf: 'flex-start',
  },
  errorText: {
    marginTop: -16,
    marginBottom: 16,
  },
  // Picker styles (reused from previous forms for consistency)
  pickerWrapper: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#374151',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  pickerInput: {
    fontSize: 16,
    paddingVertical: 12,
    paddingRight: 30,
    color: 'white',
  },
  pickerPlaceholder: {
    color: '#9ca3af',
  },
  pickerIcon: {
    top: 15,
    right: 15,
  },
  // Modal styles
  modalContainer: {
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 8,
  },
  checkboxLabel: {
    color: '#e5e7eb',
  },
  modalButton: {
    marginTop: 16,
  },
});