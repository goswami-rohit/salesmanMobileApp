// src/pages/forms/TVRForm.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, View, TouchableOpacity, Platform, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, TextInput, HelperText, ActivityIndicator, Modal, Portal, Checkbox, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import RNPickerSelect from 'react-native-picker-select';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

import { useAppStore, BRANDS, INFLUENCERS, UNITS, QUALITY_COMPLAINT, PROMO_ACTIVITY, CHANNEL_PARTNER_VISIT } from '../../components/ReusableConstants';
import AppHeader from '../../components/AppHeader';

// --- Type Definitions ---
type Step = 'checkin' | 'form' | 'checkout' | 'loading';

// --- Zod Schema ---
const TVReportSchema = z.object({
  userId: z.number(),
  reportDate: z.string(),
  visitType: z.string().min(1, "Visit type is required"),
  siteNameConcernedPerson: z.string().min(1, "Site/Person name is required"),
  phoneNo: z.string().regex(/^\d{10}$/, "Must be a valid 10-digit phone number"),
  emailId: z.string().email("Must be a valid email").optional().or(z.literal('')),
  clientsRemarks: z.string().min(1, "Client remarks are required"),
  salespersonRemarks: z.string().min(1, "Your remarks are required"),
  siteVisitBrandInUse: z.string().array().min(1, "Select at least one brand"),
  siteVisitStage: z.string().min(1, "Site visit stage is required"),
  conversionFromBrand: z.string().min(1, "Conversion brand is required"),
  conversionQuantityValue: z.coerce.number().positive(),
  conversionQuantityUnit: z.string().min(1, "Unit is required"),
  associatedPartyName: z.string().min(1, "Associated party is required"),
  influencerType: z.string().array().min(1, "Select at least one influencer"),
  serviceType: z.string().min(1, "Service type is required"),
  qualityComplaint: z.string().min(1, "Quality complaint info is required"),
  promotionalActivity: z.string().min(1, "Promotional activity is required"),
  channelPartnerVisit: z.string().min(1, "Channel partner info is required"),
});
type TVReportFormValues = z.infer<typeof TVReportSchema>;

// --- Component ---
export default function TVRForm() {
  const navigation = useNavigation();
  const { user } = useAppStore();

  const [step, setStep] = useState<Step>('loading');
  const [checkInPhotoUri, setCheckInPhotoUri] = useState<string | null>(null);
  const [checkOutPhotoUri, setCheckOutPhotoUri] = useState<string | null>(null);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [modals, setModals] = useState({ brands: false, influencers: false });

  const { control, handleSubmit, setValue, trigger, watch, formState: { errors, isSubmitting } } = useForm<TVReportFormValues>({
    resolver: zodResolver(TVReportSchema) as unknown as Resolver<TVReportFormValues, any>,
    mode: 'onChange',
    defaultValues: {
      userId: user?.id,
      reportDate: new Date().toISOString().slice(0, 10),
      siteVisitBrandInUse: [],
      influencerType: [],
    },
  });

  const siteVisitBrandInUse = watch('siteVisitBrandInUse');
  const influencerType = watch('influencerType');

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

  const handleProceedToCheckout = async () => {
    const isValid = await trigger();
    if (isValid) {
      setStep('checkout');
    } else {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please fill all required fields correctly.' });
    }
  };
  
  const submit = async (data: TVReportFormValues) => {
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
        const response = await fetch('YOUR_API_ENDPOINT/api/tvr', {
            method: 'POST',
            headers: { 'Content-Type': 'multipart/form-data' },
            body: formData,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to submit report.');
        Toast.show({ type: 'success', text1: 'TVR Submitted Successfully' });
        navigation.goBack();
    } catch (error: any) {
        Alert.alert('Submission Failed', error.message);
        setStep('checkout');
    }
  };

  const renderCameraStep = (isCheckin: boolean) => (
    <View className="flex-1 justify-center items-center p-4">
        <Text variant="headlineSmall" className="text-slate-200 font-bold text-center mb-2">{isCheckin ? 'Site Check-in' : 'Site Checkout'}</Text>
        <Text variant="bodyMedium" className="text-slate-400 text-center mb-6">Take a selfie to {isCheckin ? 'begin' : 'complete'} the technical visit.</Text>
        <View className="w-64 h-64 rounded-full bg-slate-800 border-2 border-slate-700 justify-center items-center overflow-hidden mb-6">
            {(isCheckin ? checkInPhotoUri : checkOutPhotoUri) ? 
                <Image source={{ uri: isCheckin ? checkInPhotoUri! : checkOutPhotoUri! }} className="w-full h-full" /> : 
                <Avatar.Icon size={96} icon="camera" className="bg-transparent" />
            }
        </View>
        <Button mode="contained" icon={isCheckin ? 'camera' : 'camera-check'} onPress={handleCapture} className="w-full p-1" loading={step === 'loading'}>
            {isCheckin ? 'Capture & Continue' : 'Capture & Submit TVR'}
        </Button>
    </View>
  );

  const renderFormStep = () => (
    <>
        <Portal>
            <Modal visible={modals.brands} onDismiss={() => setModals({ ...modals, brands: false })} contentContainerStyle={{backgroundColor: '#1e293b', padding: 20, margin: 20, borderRadius: 8}}>
                <Text variant="titleLarge" className="text-slate-200 mb-2">Select Brands in Use</Text>
                <ScrollView>{BRANDS.map(brand => <Checkbox.Item key={brand} label={brand} status={siteVisitBrandInUse.includes(brand) ? 'checked' : 'unchecked'} onPress={() => { const newBrands = siteVisitBrandInUse.includes(brand) ? siteVisitBrandInUse.filter(b => b !== brand) : [...siteVisitBrandInUse, brand]; setValue('siteVisitBrandInUse', newBrands, { shouldValidate: true }); }} labelStyle={{ color: '#e5e7eb' }} />)}</ScrollView>
                <Button onPress={() => setModals({ ...modals, brands: false })} className="mt-4">Done</Button>
            </Modal>
            <Modal visible={modals.influencers} onDismiss={() => setModals({ ...modals, influencers: false })} contentContainerStyle={{backgroundColor: '#1e293b', padding: 20, margin: 20, borderRadius: 8}}>
                <Text variant="titleLarge" className="text-slate-200 mb-2">Select Influencer Type</Text>
                <ScrollView>{INFLUENCERS.map(inf => <Checkbox.Item key={inf} label={inf} status={influencerType.includes(inf) ? 'checked' : 'unchecked'} onPress={() => { const newInfluencers = influencerType.includes(inf) ? influencerType.filter(i => i !== inf) : [...influencerType, inf]; setValue('influencerType', newInfluencers, { shouldValidate: true }); }} labelStyle={{ color: '#e5e7eb' }} />)}</ScrollView>
                <Button onPress={() => setModals({ ...modals, influencers: false })} className="mt-4">Done</Button>
            </Modal>
        </Portal>

        <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text variant="headlineSmall" className="text-slate-200 font-bold text-center mb-6">Technical Visit Details</Text>
            {checkInPhotoUri && <Image source={{ uri: checkInPhotoUri }} className="w-24 h-24 rounded-full self-center mb-6 border-2 border-slate-700" />}

            {/* All form fields are now Controllers */}
            <Controller name="visitType" control={control} render={({ field: { onChange, onBlur, value } }) => ( <View className="mb-4"><TextInput label="Visit Type *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.visitType} /><HelperText type="error" visible={!!errors.visitType}>{errors.visitType?.message}</HelperText></View> )} />
            <Controller name="siteNameConcernedPerson" control={control} render={({ field: { onChange, onBlur, value } }) => ( <View className="mb-4"><TextInput label="Site Name / Concerned Person *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.siteNameConcernedPerson} /><HelperText type="error" visible={!!errors.siteNameConcernedPerson}>{errors.siteNameConcernedPerson?.message}</HelperText></View> )} />
            <Controller name="phoneNo" control={control} render={({ field: { onChange, onBlur, value } }) => ( <View className="mb-4"><TextInput label="Phone No *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.phoneNo} keyboardType="phone-pad" /><HelperText type="error" visible={!!errors.phoneNo}>{errors.phoneNo?.message}</HelperText></View> )} />
            <Controller name="emailId" control={control} render={({ field: { onChange, onBlur, value } }) => ( <View className="mb-4"><TextInput label="Email ID" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.emailId} keyboardType="email-address" /><HelperText type="error" visible={!!errors.emailId}>{errors.emailId?.message}</HelperText></View> )} />
            <Controller name="clientsRemarks" control={control} render={({ field: { onChange, onBlur, value } }) => ( <View className="mb-4"><TextInput label="Client's Remarks *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.clientsRemarks} multiline /><HelperText type="error" visible={!!errors.clientsRemarks}>{errors.clientsRemarks?.message}</HelperText></View> )} />
            <Controller name="salespersonRemarks" control={control} render={({ field: { onChange, onBlur, value } }) => ( <View className="mb-4"><TextInput label="Salesperson Remarks *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.salespersonRemarks} multiline /><HelperText type="error" visible={!!errors.salespersonRemarks}>{errors.salespersonRemarks?.message}</HelperText></View> )} />
            
            <TouchableOpacity onPress={() => setModals({ ...modals, brands: true })} className="mb-4">
                <TextInput label="Site Visit - Brand in Use *" editable={false} value={siteVisitBrandInUse.join(', ') || 'Select brands...'} error={!!errors.siteVisitBrandInUse} right={<TextInput.Icon icon="chevron-down" />} />
                <HelperText type="error" visible={!!errors.siteVisitBrandInUse}>{errors.siteVisitBrandInUse?.message}</HelperText>
            </TouchableOpacity>

            <Controller name="siteVisitStage" control={control} render={({ field: { onChange, onBlur, value } }) => ( <View className="mb-4"><TextInput label="Site Visit - Stage *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.siteVisitStage} /><HelperText type="error" visible={!!errors.siteVisitStage}>{errors.siteVisitStage?.message}</HelperText></View> )} />

            <View className="flex-row gap-4">
                <Controller control={control} name="conversionFromBrand" render={({ field: { onChange, value } }) => (<View className="flex-1 mb-4"><View className="p-3 bg-slate-800 rounded-lg border border-slate-600"><RNPickerSelect onValueChange={onChange} value={value} items={BRANDS.map(b => ({ label: b, value: b }))} placeholder={{ label: "From Brand *", value: null }} style={{ inputIOS: { color: 'white' }, inputAndroid: { color: 'white' } }} /></View><HelperText type="error" visible={!!errors.conversionFromBrand}>{errors.conversionFromBrand?.message}</HelperText></View>)} />
                <Controller name="conversionQuantityValue" control={control} render={({ field: { onChange, onBlur, value } }) => ( <View className="flex-1 mb-4"><TextInput label="Qty *" value={String(value || '')} onChangeText={onChange} onBlur={onBlur} error={!!errors.conversionQuantityValue} keyboardType="numeric" /><HelperText type="error" visible={!!errors.conversionQuantityValue}>{errors.conversionQuantityValue?.message}</HelperText></View> )} />
                <Controller control={control} name="conversionQuantityUnit" render={({ field: { onChange, value } }) => (<View className="w-24 mb-4"><View className="p-3 bg-slate-800 rounded-lg border border-slate-600"><RNPickerSelect onValueChange={onChange} value={value} items={UNITS.map(u => ({ label: u, value: u }))} placeholder={{ label: "Unit", value: null }} style={{ inputIOS: { color: 'white' }, inputAndroid: { color: 'white' } }} /></View><HelperText type="error" visible={!!errors.conversionQuantityUnit}>{errors.conversionQuantityUnit?.message}</HelperText></View>)} />
            </View>

            <Controller name="associatedPartyName" control={control} render={({ field: { onChange, onBlur, value } }) => ( <View className="mb-4"><TextInput label="Associated Party Name *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.associatedPartyName} /><HelperText type="error" visible={!!errors.associatedPartyName}>{errors.associatedPartyName?.message}</HelperText></View> )} />

            <TouchableOpacity onPress={() => setModals({ ...modals, influencers: true })} className="mb-4">
                <TextInput label="Influencer Type *" editable={false} value={influencerType.join(', ') || 'Select influencers...'} error={!!errors.influencerType} right={<TextInput.Icon icon="chevron-down" />} />
                <HelperText type="error" visible={!!errors.influencerType}>{errors.influencerType?.message}</HelperText>
            </TouchableOpacity>

            <Controller name="serviceType" control={control} render={({ field: { onChange, onBlur, value } }) => ( <View className="mb-4"><TextInput label="Service Type *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.serviceType} /><HelperText type="error" visible={!!errors.serviceType}>{errors.serviceType?.message}</HelperText></View> )} />
            <Controller control={control} name="qualityComplaint" render={({ field: { onChange, value } }) => (<View className="mb-4"><View className="p-3 bg-slate-800 rounded-lg border border-slate-600"><RNPickerSelect onValueChange={onChange} value={value} items={QUALITY_COMPLAINT.map(v => ({ label: v, value: v }))} placeholder={{ label: "Quality Complaint *", value: null }} style={{ inputIOS: { color: 'white' }, inputAndroid: { color: 'white' } }} /></View><HelperText type="error" visible={!!errors.qualityComplaint}>{errors.qualityComplaint?.message}</HelperText></View>)} />
            <Controller control={control} name="promotionalActivity" render={({ field: { onChange, value } }) => (<View className="mb-4"><View className="p-3 bg-slate-800 rounded-lg border border-slate-600"><RNPickerSelect onValueChange={onChange} value={value} items={PROMO_ACTIVITY.map(v => ({ label: v, value: v }))} placeholder={{ label: "Promotional Activity *", value: null }} style={{ inputIOS: { color: 'white' }, inputAndroid: { color: 'white' } }} /></View><HelperText type="error" visible={!!errors.promotionalActivity}>{errors.promotionalActivity?.message}</HelperText></View>)} />
            <Controller control={control} name="channelPartnerVisit" render={({ field: { onChange, value } }) => (<View className="mb-4"><View className="p-3 bg-slate-800 rounded-lg border border-slate-600"><RNPickerSelect onValueChange={onChange} value={value} items={CHANNEL_PARTNER_VISIT.map(v => ({ label: v, value: v }))} placeholder={{ label: "Channel Partner Visit *", value: null }} style={{ inputIOS: { color: 'white' }, inputAndroid: { color: 'white' } }} /></View><HelperText type="error" visible={!!errors.channelPartnerVisit}>{errors.channelPartnerVisit?.message}</HelperText></View>)} />

            <Button mode="contained" onPress={handleProceedToCheckout} className="mt-4 p-1">Continue to Checkout</Button>
        </ScrollView>
    </>
  );

  const renderContent = () => {
    switch (step) {
      case 'checkin': return renderCameraStep(true);
      case 'form': return renderFormStep();
      case 'checkout': return renderCameraStep(false);
      default: return <ActivityIndicator animating={true} size="large" className="flex-1" />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['right', 'bottom', 'left']}>
      <AppHeader title="Technical Visit Report" />
      <View className="flex-1">{renderContent()}</View>
    </SafeAreaView>
  );
}
