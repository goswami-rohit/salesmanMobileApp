// src/pages/forms/TVRForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, ActivityIndicator, TextInput, useTheme, Menu, Modal, Portal, Checkbox } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';
import { BRANDS, INFLUENCERS, UNITS, QUALITY_COMPLAINT, PROMO_ACTIVITY, CHANNEL_PARTNER_VISIT } from '../../components/ReusableConstants';
import { createTvr } from '../../backendConnections/apiServices'; // Import the service function

type Step = 'checkin' | 'form' | 'checkout' | 'loading';
type UserLite = { id: number };

export default function TVRForm() {
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

  // Form Fields
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));
  const [visitType, setVisitType] = useState("");
  const [siteNameConcernedPerson, setSiteNameConcernedPerson] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [emailId, setEmailId] = useState("");
  const [clientsRemarks, setClientsRemarks] = useState("");
  const [salespersonRemarks, setSalespersonRemarks] = useState("");
  const [siteVisitStage, setSiteVisitStage] = useState("");
  const [conversionFromBrand, setConversionFromBrand] = useState("");
  const [conversionQuantityValue, setConversionQuantityValue] = useState("");
  const [conversionQuantityUnit, setConversionQuantityUnit] = useState("");
  const [associatedPartyName, setAssociatedPartyName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [qualityComplaint, setQualityComplaint] = useState("");
  const [promotionalActivity, setPromotionalActivity] = useState("");
  const [channelPartnerVisit, setChannelPartnerVisit] = useState("");
  const [siteVisitBrandInUse, setSiteVisitBrandInUse] = useState<string[]>([]);
  const [influencerType, setInfluencerType] = useState<string[]>([]);

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menus, setMenus] = useState({ brand: false, unit: false, complaint: false, promo: false, partner: false });
  const [modals, setModals] = useState({ brands: false, influencers: false });

  // --- Permission & Core Logic ---
  useEffect(() => {
    (async () => {
      const { status } = await requestCameraPermission();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required.');
        navigation.goBack();
      } else {
        setStep('checkin');
      }
    })();
  }, []);

  const handleCapture = async () => {
    if (cameraRef.current) {
      setStep('loading');
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (step === 'checkin') {
        setCheckInPhotoUri(photo?.uri || null);
        setCheckInTime(new Date().toISOString());
        setStep('form');
      } else if (step === 'checkout') {
        setCheckOutPhotoUri(photo?.uri || null);
        setCheckOutTime(new Date().toISOString());
        await handleSubmit(photo?.uri);
      }
    }
  };

  const validate = (): string | null => {
    if (!visitType || !siteNameConcernedPerson || !phoneNo || !clientsRemarks || !salespersonRemarks || !siteVisitStage || !conversionFromBrand || !conversionQuantityValue || !conversionQuantityUnit || !associatedPartyName || !serviceType || !qualityComplaint || !promotionalActivity || !channelPartnerVisit) {
      return "Please fill all required text fields.";
    }
    if (siteVisitBrandInUse.length === 0) return "Please select at least one 'Brand in Use'.";
    if (influencerType.length === 0) return "Please select at least one 'Influencer Type'.";
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
    const tvrPayload = {
      userId: currentUser.id,
      reportDate, visitType, siteNameConcernedPerson, phoneNo, emailId, clientsRemarks, salespersonRemarks, siteVisitStage, conversionFromBrand, 
      conversionQuantityValue: Number(conversionQuantityValue) || null,
      conversionQuantityUnit, associatedPartyName, serviceType, qualityComplaint, promotionalActivity, channelPartnerVisit, siteVisitBrandInUse, influencerType,
      checkInTime, checkOutTime, 
      inTimeImageUrl: checkInPhotoUri, // Replace with uploaded URL in real app
      outTimeImageUrl: finalPhotoUri // Replace with uploaded URL in real app
    };

    // Call the central API service function
    const result = await createTvr(tvrPayload) as { success: boolean };
    setIsSubmitting(false);

    if (result.success) {
      Alert.alert('Success', 'TVR has been submitted successfully.');
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Failed to submit TVR.');
    }
  };

  // --- UI Helpers & Rendering ---
  const textInputTheme = { colors: { primary: theme.colors.primary, text: '#e5e7eb', placeholder: '#9ca3af', background: '#1e293b', outline: '#475569' } };
  const toggleMenu = (name: keyof typeof menus, visible: boolean) => setMenus(prev => ({ ...prev, [name]: visible }));
  const toggleModal = (name: keyof typeof modals, visible: boolean) => setModals(prev => ({ ...prev, [name]: visible }));
  const handleMultiSelectToggle = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setList(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const renderCameraStep = (isCheckin: boolean) => (
    <View style={styles.cameraStepContainer}>
      <Text variant="headlineSmall" style={styles.title}>{isCheckin ? 'Site Check-in' : 'Site Checkout'}</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>Take a selfie to {isCheckin ? 'begin' : 'complete'} the technical visit.</Text>
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing={'front'} />
      </View>
      <Button mode="contained" icon={isCheckin ? 'camera' : 'camera-check'} onPress={handleCapture} style={styles.button} loading={isSubmitting} disabled={isSubmitting}>
        {isCheckin ? 'Capture & Continue' : 'Capture & Submit TVR'}
      </Button>
    </View>
  );

  const renderFormStep = () => (
    <>
      <Portal>
        {/* Brands Multi-select Modal */}
        <Modal visible={modals.brands} onDismiss={() => toggleModal('brands', false)} contentContainerStyle={styles.modalContainer}>
          <Text variant="titleLarge" style={styles.modalTitle}>Select Brands in Use</Text>
          {BRANDS.map(brand => <Checkbox.Item key={brand} label={brand} status={siteVisitBrandInUse.includes(brand) ? 'checked' : 'unchecked'} onPress={() => handleMultiSelectToggle(brand, siteVisitBrandInUse, setSiteVisitBrandInUse)} labelStyle={styles.checkboxLabel} color={theme.colors.primary} uncheckedColor='#9ca3af' />)}
          <Button onPress={() => toggleModal('brands', false)} style={{ marginTop: 10 }}>Done</Button>
        </Modal>
        {/* Influencers Multi-select Modal */}
        <Modal visible={modals.influencers} onDismiss={() => toggleModal('influencers', false)} contentContainerStyle={styles.modalContainer}>
          <Text variant="titleLarge" style={styles.modalTitle}>Select Influencer Type</Text>
          {INFLUENCERS.map(inf => <Checkbox.Item key={inf} label={inf} status={influencerType.includes(inf) ? 'checked' : 'unchecked'} onPress={() => handleMultiSelectToggle(inf, influencerType, setInfluencerType)} labelStyle={styles.checkboxLabel} color={theme.colors.primary} uncheckedColor='#9ca3af' />)}
          <Button onPress={() => toggleModal('influencers', false)} style={{ marginTop: 10 }}>Done</Button>
        </Modal>
      </Portal>

      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text variant="headlineSmall" style={styles.title}>Technical Visit Details</Text>
        {checkInPhotoUri && <Image source={{ uri: checkInPhotoUri }} style={styles.photoPreview} />}
        
        {/* --- FORM FIELDS --- */}
        <TextInput label="Visit Type *" value={visitType} onChangeText={setVisitType} style={styles.input} theme={textInputTheme} />
        <TextInput label="Site Name / Concerned Person *" value={siteNameConcernedPerson} onChangeText={setSiteNameConcernedPerson} style={styles.input} theme={textInputTheme} />
        <TextInput label="Phone No *" keyboardType="phone-pad" value={phoneNo} onChangeText={setPhoneNo} style={styles.input} theme={textInputTheme} />
        <TextInput label="Email ID" keyboardType="email-address" value={emailId} onChangeText={setEmailId} style={styles.input} theme={textInputTheme} />
        <TextInput label="Client's Remarks *" multiline numberOfLines={3} value={clientsRemarks} onChangeText={setClientsRemarks} style={styles.input} theme={textInputTheme} />
        <TextInput label="Salesperson Remarks *" multiline numberOfLines={3} value={salespersonRemarks} onChangeText={setSalespersonRemarks} style={styles.input} theme={textInputTheme} />
        <TouchableOpacity onPress={() => toggleModal('brands', true)}><TextInput label="Site Visit - Brand in Use *" editable={false} value={siteVisitBrandInUse.join(', ') || 'Select brands...'} style={styles.input} theme={textInputTheme} /></TouchableOpacity>
        <TextInput label="Site Visit - Stage *" value={siteVisitStage} onChangeText={setSiteVisitStage} style={styles.input} theme={textInputTheme} />
        
        {/* Dropdown Menus */}
        <Menu visible={menus.brand} onDismiss={() => toggleMenu('brand', false)} anchor={<TouchableOpacity onPress={() => toggleMenu('brand', true)}><TextInput label="Conversion From Brand *" editable={false} value={conversionFromBrand} style={styles.input} theme={textInputTheme} /></TouchableOpacity>}>{BRANDS.map(b => <Menu.Item key={b} onPress={() => { setConversionFromBrand(b); toggleMenu('brand', false); }} title={b} />)}</Menu>
        <View style={{flexDirection: 'row', gap: 8}}>
            <TextInput label="Conversion Qty *" keyboardType="numeric" value={conversionQuantityValue} onChangeText={setConversionQuantityValue} style={[styles.input, {flex: 1}]} theme={textInputTheme} />
            <Menu visible={menus.unit} onDismiss={() => toggleMenu('unit', false)} anchor={<TouchableOpacity onPress={() => toggleMenu('unit', true)} style={{flex: 1}}><TextInput label="Unit *" editable={false} value={conversionQuantityUnit} style={styles.input} theme={textInputTheme} /></TouchableOpacity>}>{UNITS.map(u => <Menu.Item key={u} onPress={() => { setConversionQuantityUnit(u); toggleMenu('unit', false); }} title={u} />)}</Menu>
        </View>

        <TextInput label="Associated Party Name *" value={associatedPartyName} onChangeText={setAssociatedPartyName} style={styles.input} theme={textInputTheme} />
        <TouchableOpacity onPress={() => toggleModal('influencers', true)}><TextInput label="Influencer Type *" editable={false} value={influencerType.join(', ') || 'Select influencers...'} style={styles.input} theme={textInputTheme} /></TouchableOpacity>
        <TextInput label="Service Type *" value={serviceType} onChangeText={setServiceType} style={styles.input} theme={textInputTheme} />

        <Menu visible={menus.complaint} onDismiss={() => toggleMenu('complaint', false)} anchor={<TouchableOpacity onPress={() => toggleMenu('complaint', true)}><TextInput label="Quality Complaint *" editable={false} value={qualityComplaint} style={styles.input} theme={textInputTheme} /></TouchableOpacity>}>{QUALITY_COMPLAINT.map(c => <Menu.Item key={c} onPress={() => { setQualityComplaint(c); toggleMenu('complaint', false); }} title={c} />)}</Menu>
        <Menu visible={menus.promo} onDismiss={() => toggleMenu('promo', false)} anchor={<TouchableOpacity onPress={() => toggleMenu('promo', true)}><TextInput label="Promotional Activity *" editable={false} value={promotionalActivity} style={styles.input} theme={textInputTheme} /></TouchableOpacity>}>{PROMO_ACTIVITY.map(p => <Menu.Item key={p} onPress={() => { setPromotionalActivity(p); toggleMenu('promo', false); }} title={p} />)}</Menu>
        <Menu visible={menus.partner} onDismiss={() => toggleMenu('partner', false)} anchor={<TouchableOpacity onPress={() => toggleMenu('partner', true)}><TextInput label="Channel Partner Visit *" editable={false} value={channelPartnerVisit} style={styles.input} theme={textInputTheme} /></TouchableOpacity>}>{CHANNEL_PARTNER_VISIT.map(v => <Menu.Item key={v} onPress={() => { setChannelPartnerVisit(v); toggleMenu('partner', false); }} title={v} />)}</Menu>

        <Button mode="contained" onPress={handleProceedToCheckout} style={styles.button}>
          Continue to Checkout Photo
        </Button>
      </ScrollView>
    </>
  );

  const renderContent = () => {
    switch (step) {
      case 'checkin': return renderCameraStep(true);
      case 'form': return renderFormStep();
      case 'checkout': return renderCameraStep(false);
      default: return <ActivityIndicator animating={true} size="large" />;
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['right', 'bottom', 'left']}>
      <AppHeader title="Technical Visit Report" />
      <View style={styles.container}>{renderContent()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f172a" },
  container: { flex: 1, paddingHorizontal: 16 },
  cameraStepContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  formContainer: { paddingTop: 16, paddingBottom: 32 },
  title: { color: "#e5e7eb", marginBottom: 4, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { color: '#9ca3af', marginBottom: 24, textAlign: 'center' },
  cameraContainer: { width: 300, height: 300, borderRadius: 150, overflow: 'hidden', marginBottom: 24, borderWidth: 2, borderColor: '#334155' },
  camera: { flex: 1 },
  photoPreview: { width: 100, height: 100, alignSelf: 'center', borderRadius: 50, marginBottom: 24, borderWidth: 2, borderColor: '#334155' },
  input: { marginBottom: 16 },
  button: { marginTop: 8, paddingVertical: 4, width: '100%' },
  modalContainer: { backgroundColor: '#1e293b', padding: 20, margin: 20, borderRadius: 8 },
  modalTitle: { color: '#e5e7eb', marginBottom: 10 },
  checkboxLabel: { color: '#e5e7eb' }
});

