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
import Toast from 'react-native-toast-message';

import { useAppStore, BASE_URL, BRANDS, INFLUENCERS, UNITS, QUALITY_COMPLAINT, PROMO_ACTIVITY, CHANNEL_PARTNER_VISIT } from '../../components/ReusableConstants';
import AppHeader from '../../components/AppHeader';
import { format } from 'date-fns';

// --- Type Definitions ---
type Step = 'checkin' | 'form' | 'checkout' | 'loading';

// --- Zod Schema (Updated to match DB schema) ---
const TVReportSchema = z.object({
  userId: z.number().int().positive(),
  reportDate: z.date(),
  visitType: z.string().min(1, "Visit type is required"),
  siteNameConcernedPerson: z.string().min(1, "Site/Person name is required"),
  phoneNo: z.string().regex(/^\d{10}$/, "Must be a valid 10-digit phone number"),
  emailId: z.string().email("Must be a valid email").optional().or(z.literal('')).nullable(),
  clientsRemarks: z.string().min(1, "Client remarks are required"),
  salespersonRemarks: z.string().min(1, "Your remarks are required"),
  siteVisitBrandInUse: z.string().array().min(1, "Select at least one brand"),
  // These fields are nullable in the DB schema, so they should be optional here.
  siteVisitStage: z.string().optional().nullable(),
  conversionFromBrand: z.string().optional().nullable(),
  // Use coerce to handle string to number conversion for optional fields
  conversionQuantityValue: z.coerce.number().positive().optional().nullable(),
  conversionQuantityUnit: z.string().optional().nullable(),
  associatedPartyName: z.string().optional().nullable(),
  influencerType: z.string().array().min(1, "Select at least one influencer"),
  serviceType: z.string().optional().nullable(),
  qualityComplaint: z.string().optional().nullable(),
  promotionalActivity: z.string().optional().nullable(),
  channelPartnerVisit: z.string().optional().nullable(),
});
type TVReportFormValues = z.infer<typeof TVReportSchema>;

// --- Component ---
export default function TVRForm() {
  const navigation = useNavigation();
  const theme = useTheme();
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
      reportDate: new Date(),
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
        // @ts-ignore
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
    
    // Convert date object to string for the payload
    const payload = {
      ...data,
      reportDate: format(data.reportDate, 'yyyy-MM-dd'),
    };

    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, Array.isArray(value) ? JSON.stringify(value) : String(value));
      }
    });
    formData.append('checkInTime', checkInTime!);
    formData.append('checkOutTime', new Date().toISOString());
    formData.append('inTimeImage', { uri: checkInPhotoUri, name: 'checkin.jpg', type: 'image/jpeg' } as any);
    formData.append('outTimeImage', { uri: checkOutPhotoUri, name: 'checkout.jpg', type: 'image/jpeg' } as any);

    try {
      const response = await fetch(`${BASE_URL}/api/technical-visit-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to submit report.');
      Toast.show({ type: 'success', text1: 'TVR Submitted Successfully' });
      // @ts-ignore
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Submission Failed', error.message);
      setStep('checkout');
    }
  };

  const renderCameraStep = (isCheckin: boolean) => (
    <View style={styles.centeredContent}>
      <Text variant="headlineSmall" style={styles.cameraTitle}>{isCheckin ? 'Site Check-in' : 'Site Checkout'}</Text>
      <Text variant="bodyMedium" style={styles.cameraSubtitle}>Take a selfie to {isCheckin ? 'begin' : 'complete'} the technical visit.</Text>
      <View style={styles.photoFrame}>
        {(isCheckin ? checkInPhotoUri : checkOutPhotoUri) ?
          <Image source={{ uri: isCheckin ? checkInPhotoUri! : checkOutPhotoUri! }} style={styles.photo} /> :
          <Avatar.Icon size={96} icon="camera" style={styles.avatarIcon} />
        }
      </View>
      <Button mode="contained" icon="camera" onPress={handleCapture} style={styles.button} loading={step === 'loading'}>
        Take your picture and continue
      </Button>
    </View>
  );

  const renderFormStep = () => (
    <>
      <Portal>
        <Modal visible={modals.brands} onDismiss={() => setModals({ ...modals, brands: false })} contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleLarge" style={styles.modalTitle}>Select Brands in Use</Text>
          <ScrollView>{BRANDS.map(brand => <Checkbox.Item key={brand} label={brand} status={siteVisitBrandInUse?.includes(brand) ? 'checked' : 'unchecked'} onPress={() => { const newBrands = siteVisitBrandInUse?.includes(brand) ? siteVisitBrandInUse.filter(b => b !== brand) : [...(siteVisitBrandInUse || []), brand]; setValue('siteVisitBrandInUse', newBrands, { shouldValidate: true }); }} labelStyle={styles.checkboxLabel} />)}</ScrollView>
          <Button onPress={() => setModals({ ...modals, brands: false })} style={styles.modalButton}>Done</Button>
        </Modal>
        <Modal visible={modals.influencers} onDismiss={() => setModals({ ...modals, influencers: false })} contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleLarge" style={styles.modalTitle}>Select Influencer Type</Text>
          <ScrollView>{INFLUENCERS.map(inf => <Checkbox.Item key={inf} label={inf} status={influencerType?.includes(inf) ? 'checked' : 'unchecked'} onPress={() => { const newInfluencers = influencerType?.includes(inf) ? influencerType.filter(i => i !== inf) : [...(influencerType || []), inf]; setValue('influencerType', newInfluencers, { shouldValidate: true }); }} labelStyle={styles.checkboxLabel} />)}</ScrollView>
          <Button onPress={() => setModals({ ...modals, influencers: false })} style={styles.modalButton}>Done</Button>
        </Modal>
      </Portal>

      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text variant="headlineSmall" style={styles.formTitle}>Technical Visit Details</Text>
        {checkInPhotoUri && <Image source={{ uri: checkInPhotoUri }} style={styles.formCheckInPhoto} />}

        <Controller name="visitType" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputContainer}><TextInput label="Visit Type *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.visitType} /><HelperText type="error">{errors.visitType?.message}</HelperText></View>)} />
        <Controller name="siteNameConcernedPerson" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputContainer}><TextInput label="Site Name / Concerned Person *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.siteNameConcernedPerson} /><HelperText type="error">{errors.siteNameConcernedPerson?.message}</HelperText></View>)} />
        <Controller name="phoneNo" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputContainer}><TextInput label="Phone No *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.phoneNo} keyboardType="phone-pad" /><HelperText type="error">{errors.phoneNo?.message}</HelperText></View>)} />
        <Controller name="emailId" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputContainer}><TextInput label="Email ID" value={value || ''} onChangeText={onChange} onBlur={onBlur} error={!!errors.emailId} keyboardType="email-address" /><HelperText type="error">{errors.emailId?.message}</HelperText></View>)} />
        <Controller name="clientsRemarks" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputContainer}><TextInput label="Client's Remarks *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.clientsRemarks} multiline /><HelperText type="error">{errors.clientsRemarks?.message}</HelperText></View>)} />
        <Controller name="salespersonRemarks" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputContainer}><TextInput label="Salesperson Remarks *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.salespersonRemarks} multiline /><HelperText type="error">{errors.salespersonRemarks?.message}</HelperText></View>)} />

        <TouchableOpacity onPress={() => setModals({ ...modals, brands: true })} style={styles.inputContainer}>
          <TextInput label="Site Visit - Brand in Use *" editable={false} value={siteVisitBrandInUse?.join(', ') || 'Select brands...'} error={!!errors.siteVisitBrandInUse} right={<TextInput.Icon icon="chevron-down" />} />
          <HelperText type="error">{errors.siteVisitBrandInUse?.message}</HelperText>
        </TouchableOpacity>

        <Controller name="siteVisitStage" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputContainer}><TextInput label="Site Visit - Stage (Optional)" value={value || ''} onChangeText={onChange} onBlur={onBlur} /><HelperText type="error">{errors.siteVisitStage?.message}</HelperText></View>)} />

        <View style={styles.row}>
          <Controller control={control} name="conversionFromBrand" render={({ field: { onChange, value } }) => (<View style={styles.inputFlex}><View style={[styles.pickerWrapper, { borderColor: errors.conversionFromBrand ? theme.colors.error : theme.colors.outline }]}><RNPickerSelect onValueChange={onChange} value={value} items={BRANDS.map(b => ({ label: b, value: b }))} placeholder={{ label: "From Brand (Optional)", value: null }} style={{ inputIOS: styles.pickerInput, inputAndroid: styles.pickerInput }} /></View><HelperText type="error">{errors.conversionFromBrand?.message}</HelperText></View>)} />
          <Controller name="conversionQuantityValue" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputFlex}><TextInput label="Qty (Optional)" value={String(value || '')} onChangeText={(text) => onChange(parseFloat(text))} onBlur={onBlur} keyboardType="numeric" /><HelperText type="error">{errors.conversionQuantityValue?.message}</HelperText></View>)} />
          <Controller control={control} name="conversionQuantityUnit" render={({ field: { onChange, value } }) => (<View style={styles.pickerUnit}><View style={[styles.pickerWrapper, { borderColor: errors.conversionQuantityUnit ? theme.colors.error : theme.colors.outline }]}><RNPickerSelect onValueChange={onChange} value={value} items={UNITS.map(u => ({ label: u, value: u }))} placeholder={{ label: "Unit", value: null }} style={{ inputIOS: styles.pickerInput, inputAndroid: styles.pickerInput }} /></View><HelperText type="error">{errors.conversionQuantityUnit?.message}</HelperText></View>)} />
        </View>

        <Controller name="associatedPartyName" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputContainer}><TextInput label="Associated Party Name (Optional)" value={value || ''} onChangeText={onChange} onBlur={onBlur} /><HelperText type="error">{errors.associatedPartyName?.message}</HelperText></View>)} />

        <TouchableOpacity onPress={() => setModals({ ...modals, influencers: true })} style={styles.inputContainer}>
          <TextInput label="Influencer Type *" editable={false} value={influencerType?.join(', ') || 'Select influencers...'} error={!!errors.influencerType} right={<TextInput.Icon icon="chevron-down" />} />
          <HelperText type="error">{errors.influencerType?.message}</HelperText>
        </TouchableOpacity>

        <Controller name="serviceType" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputContainer}><TextInput label="Service Type (Optional)" value={value || ''} onChangeText={onChange} onBlur={onBlur} /><HelperText type="error">{errors.serviceType?.message}</HelperText></View>)} />
        <Controller control={control} name="qualityComplaint" render={({ field: { onChange, value } }) => (<View style={styles.inputContainer}><View style={[styles.pickerWrapper, { borderColor: errors.qualityComplaint ? theme.colors.error : theme.colors.outline }]}><RNPickerSelect onValueChange={onChange} value={value} items={QUALITY_COMPLAINT.map(v => ({ label: v, value: v }))} placeholder={{ label: "Quality Complaint (Optional)", value: null }} style={{ inputIOS: styles.pickerInput, inputAndroid: styles.pickerInput, iconContainer: styles.pickerIcon, placeholder: styles.pickerPlaceholder, }} useNativeAndroidPickerStyle={false} Icon={() => <Icon name="chevron-down" size={24} color={theme.colors.onSurface} />} /></View><HelperText type="error">{errors.qualityComplaint?.message}</HelperText></View>)} />
        <Controller control={control} name="promotionalActivity" render={({ field: { onChange, value } }) => (<View style={styles.inputContainer}><View style={[styles.pickerWrapper, { borderColor: errors.promotionalActivity ? theme.colors.error : theme.colors.outline }]}><RNPickerSelect onValueChange={onChange} value={value} items={PROMO_ACTIVITY.map(v => ({ label: v, value: v }))} placeholder={{ label: "Promotional Activity (Optional)", value: null }} style={{ inputIOS: styles.pickerInput, inputAndroid: styles.pickerInput, iconContainer: styles.pickerIcon, placeholder: styles.pickerPlaceholder, }} useNativeAndroidPickerStyle={false} Icon={() => <Icon name="chevron-down" size={24} color={theme.colors.onSurface} />} /></View><HelperText type="error">{errors.promotionalActivity?.message}</HelperText></View>)} />
        <Controller control={control} name="channelPartnerVisit" render={({ field: { onChange, value } }) => (<View style={styles.inputContainer}><View style={[styles.pickerWrapper, { borderColor: errors.channelPartnerVisit ? theme.colors.error : theme.colors.outline }]}><RNPickerSelect onValueChange={onChange} value={value} items={CHANNEL_PARTNER_VISIT.map(v => ({ label: v, value: v }))} placeholder={{ label: "Channel Partner Visit (Optional)", value: null }} style={{ inputIOS: styles.pickerInput, inputAndroid: styles.pickerInput, iconContainer: styles.pickerIcon, placeholder: styles.pickerPlaceholder, }} useNativeAndroidPickerStyle={false} Icon={() => <Icon name="chevron-down" size={24} color={theme.colors.onSurface} />} /></View><HelperText type="error">{errors.channelPartnerVisit?.message}</HelperText></View>)} />

        <Button mode="contained" onPress={handleProceedToCheckout} style={styles.button}>Continue to Checkout</Button>
      </ScrollView>
    </>
  );

  const renderContent = () => {
    switch (step) {
      case 'checkin': return renderCameraStep(true);
      case 'form': return renderFormStep();
      case 'checkout': return renderCameraStep(false);
      default: return <ActivityIndicator animating={true} size="large" style={styles.loadingIndicator} />;
    }
  };

  return (
    <SafeAreaView style={[{ backgroundColor: theme.colors.background }, styles.fullScreenContainer]} edges={['right', 'bottom', 'left']}>
      <AppHeader title="Technical Visit Report" />
      <View style={styles.contentWrapper}>{renderContent()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
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
    gap: 16,
  },
  inputFlex: {
    flex: 1,
    marginBottom: 16,
  },
  pickerUnit: {
    width: 96,
    marginBottom: 16,
  },
  // Picker styles
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
