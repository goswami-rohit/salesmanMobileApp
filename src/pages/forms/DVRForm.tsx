// src/pages/forms/DVRForm.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, View, TouchableOpacity, PermissionsAndroid, Platform, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, TextInput, HelperText, ActivityIndicator, Modal, Portal, Checkbox, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import RNPickerSelect from 'react-native-picker-select';
import * as ImagePicker from 'expo-image-picker';
import Geolocation from 'react-native-geolocation-service';
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
  const { user } = useAppStore();

  const [step, setStep] = useState<Step>('loading');
  const [checkInPhotoUri, setCheckInPhotoUri] = useState<string | null>(null);
  const [checkOutPhotoUri, setCheckOutPhotoUri] = useState<string | null>(null);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [brandsModalVisible, setBrandsModalVisible] = useState(false);
  const [isGeoBusy, setIsGeoBusy] = useState(false);

  // FIX: Added 'watch' to the destructuring
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

  const useMyLocation = async () => {
    setIsGeoBusy(true);
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (granted !== 'granted') throw new Error('Location permission denied');
      }
      Geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setValue('latitude', latitude, { shouldValidate: true });
          setValue('longitude', longitude, { shouldValidate: true });
          setValue('location', `Lat ${latitude.toFixed(5)}, Lon ${longitude.toFixed(5)}`, { shouldValidate: true });
          Toast.show({ type: 'success', text1: 'Location Captured' });
          setIsGeoBusy(false);
        },
        (error) => { throw error; },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not fetch location.');
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
      return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" /></View>;
    }

    if (step === 'checkin' || step === 'checkout') {
      const isCheckout = step === 'checkout';
      const photoUri = isCheckout ? checkOutPhotoUri : checkInPhotoUri;
      return (
        <View className="flex-1 justify-center items-center p-4">
          <Text variant="headlineSmall" className="text-slate-200 font-bold text-center mb-2">{isCheckout ? 'Dealer Checkout' : 'Dealer Check-in'}</Text>
          <Text variant="bodyMedium" className="text-slate-400 text-center mb-6">Take a selfie to {isCheckout ? 'complete' : 'start'} the visit.</Text>
          <View className="w-64 h-64 rounded-full bg-slate-800 border-2 border-slate-700 justify-center items-center overflow-hidden mb-6">
            {photoUri ? <Image source={{ uri: photoUri }} className="w-full h-full" /> : <Avatar.Icon size={96} icon="camera" className="bg-transparent" />}
          </View>
          <Button mode="contained" icon={isCheckout ? 'camera-check' : 'camera'} onPress={handleCapture} className="w-full p-1">
            {isCheckout ? 'Capture & Submit DVR' : 'Capture & Continue'}
          </Button>
        </View>
      );
    }

    if (step === 'form') {
      return (
        <>
          {/* FIX: Added children to the Modal */}
          <Portal>
            <Modal visible={brandsModalVisible} onDismiss={() => setBrandsModalVisible(false)} contentContainerStyle={{ backgroundColor: '#1e293b', padding: 20, margin: 20, borderRadius: 8 }}>
              <Text variant="titleLarge" className="text-slate-200 mb-2">Select Brands</Text>
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
                    labelStyle={{ color: '#e5e7eb' }}
                  />
                ))}
              </ScrollView>
              <Button onPress={() => setBrandsModalVisible(false)} className="mt-4">Done</Button>
            </Modal>
          </Portal>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text variant="headlineSmall" className="text-slate-200 font-bold text-center mb-6">Visit Details</Text>
            {checkInPhotoUri && <Image source={{ uri: checkInPhotoUri }} className="w-24 h-24 rounded-full self-center mb-6 border-2 border-slate-700" />}

            <Controller control={control} name="dealerType" render={({ field: { onChange, value } }) => (
              <View className="mb-4"><View className="p-3 bg-slate-800 rounded-lg border border-slate-600"><RNPickerSelect onValueChange={onChange} value={value} items={DEALER_TYPES.map(t => ({ label: t, value: t }))} placeholder={{ label: "Select Dealer Type *", value: null }} style={{ inputIOS: { color: 'white' }, inputAndroid: { color: 'white' } }} useNativeAndroidPickerStyle={false} Icon={() => <Icon name="chevron-down" size={24} color="#94a3b8" />} /></View>{errors.dealerType && <HelperText type="error" visible>{errors.dealerType?.message}</HelperText>}</View>
            )} />
            <Controller name="dealerName" control={control} render={({ field: { onChange, onBlur, value } }) => (<View className="mb-4"><TextInput label="Dealer Name *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.dealerName} /><HelperText type="error" visible={!!errors.dealerName}>{errors.dealerName?.message}</HelperText></View>)} />
            <Controller name="subDealerName" control={control} render={({ field: { onChange, onBlur, value } }) => (<View className="mb-4"><TextInput label="Sub Dealer Name (Optional)" value={value} onChangeText={onChange} onBlur={onBlur} /></View>)} />

            <View className="flex-row items-center gap-4 mb-4">
              <Controller name="location" control={control} render={({ field: { onChange, onBlur, value } }) => (<TextInput label="Location *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.location} className="flex-1" />)} />
              <Button icon="crosshairs-gps" mode="contained-tonal" onPress={useMyLocation} loading={isGeoBusy}>Fetch</Button>
            </View>
            {errors.location && <HelperText type="error" visible className="-mt-4 mb-4">{errors.location?.message}</HelperText>}

            <Controller name="visitType" control={control} render={({ field: { onChange, onBlur, value } }) => (<View className="mb-4"><TextInput label="Visit Type *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.visitType} /><HelperText type="error" visible={!!errors.visitType}>{errors.visitType?.message}</HelperText></View>)} />
            <Controller name="dealerTotalPotential" control={control} render={({ field: { onChange, onBlur, value } }) => (<View className="mb-4"><TextInput label="Dealer Total Potential (MT)" value={String(value || '')} onChangeText={onChange} onBlur={onBlur} keyboardType="numeric" /></View>)} />
            <Controller name="dealerBestPotential" control={control} render={({ field: { onChange, onBlur, value } }) => (<View className="mb-4"><TextInput label="Dealer Best Potential (MT)" value={String(value || '')} onChangeText={onChange} onBlur={onBlur} keyboardType="numeric" /></View>)} />

            <TouchableOpacity onPress={() => setBrandsModalVisible(true)} className="mb-4">
              <TextInput label="Brands Selling *" editable={false} value={brandSelling.join(', ') || 'Select brands...'} error={!!errors.brandSelling} right={<TextInput.Icon icon="chevron-down" />} />
              {errors.brandSelling && <HelperText type="error" visible>{errors.brandSelling?.message}</HelperText>}
            </TouchableOpacity>

            <Controller name="contactPerson" control={control} render={({ field: { onChange, onBlur, value } }) => (<View className="mb-4"><TextInput label="Contact Person" value={value} onChangeText={onChange} onBlur={onBlur} /></View>)} />
            <Controller name="contactPersonPhoneNo" control={control} render={({ field: { onChange, onBlur, value } }) => (<View className="mb-4"><TextInput label="Contact Person Phone" value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="phone-pad" /></View>)} />
            <Controller name="todayOrderMt" control={control} render={({ field: { onChange, onBlur, value } }) => (<View className="mb-4"><TextInput label="Today's Order (MT)" value={String(value || '')} onChangeText={onChange} onBlur={onBlur} keyboardType="numeric" /></View>)} />
            <Controller name="todayCollectionRupees" control={control} render={({ field: { onChange, onBlur, value } }) => (<View className="mb-4"><TextInput label="Today's Collection (₹)" value={String(value || '')} onChangeText={onChange} onBlur={onBlur} keyboardType="numeric" /></View>)} />
            <Controller name="overdueAmount" control={control} render={({ field: { onChange, onBlur, value } }) => (<View className="mb-4"><TextInput label="Overdue Amount (₹)" value={String(value || '')} onChangeText={onChange} onBlur={onBlur} keyboardType="numeric" /></View>)} />

            <Controller control={control} name="feedbacks" render={({ field: { onChange, value } }) => (
              <View className="mb-4"><View className="p-3 bg-slate-800 rounded-lg border border-slate-600"><RNPickerSelect onValueChange={onChange} value={value} items={FEEDBACKS.map(f => ({ label: f, value: f }))} placeholder={{ label: "Select Feedback *", value: null }} style={{ inputIOS: { color: 'white' }, inputAndroid: { color: 'white' } }} useNativeAndroidPickerStyle={false} Icon={() => <Icon name="chevron-down" size={24} color="#94a3b8" />} /></View>{errors.feedbacks && <HelperText type="error" visible>{errors.feedbacks?.message}</HelperText>}</View>
            )} />

            <Controller name="solutionBySalesperson" control={control} render={({ field: { onChange, onBlur, value } }) => (<View className="mb-4"><TextInput label="Solution by Salesperson" value={value} onChangeText={onChange} onBlur={onBlur} multiline /></View>)} />
            <Controller name="anyRemarks" control={control} render={({ field: { onChange, onBlur, value } }) => (<View className="mb-4"><TextInput label="Any Remarks" value={value} onChangeText={onChange} onBlur={onBlur} multiline /></View>)} />

            <Button mode="contained" onPress={handleProceedToCheckout} className="mt-4 p-1">Continue to Checkout</Button>
          </ScrollView>
        </>
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['right', 'bottom', 'left']}>
      <AppHeader title="Daily Visit Report" />
      {renderContent()}
    </SafeAreaView>
  );
}

