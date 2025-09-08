// src/pages/forms/AddDealerForm.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, ActivityIndicator, TextInput, useTheme, Menu, Modal, Portal, Checkbox, Switch } from 'react-native-paper';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';
import { DEALER_TYPES, REGIONS, BRANDS, FEEDBACKS } from '../../components/ReusableConstants';
import { createDealer, getDealersForUser } from '../../backendConnections/apiServices'; // Import the service functions

// Placeholder types for data
type UserLite = { id: number };
type DealerLite = { id: string; name: string };

export default function AddDealerForm() {
  const navigation = useNavigation();
  const theme = useTheme();

  // In a real app, user would come from a global state/context
  const [currentUser] = useState<UserLite>({ id: 1 });

  // --- State Management ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDealers, setIsLoadingDealers] = useState(false);
  
  // Form Fields
  const [type, setType] = useState("");
  const [isSubDealer, setIsSubDealer] = useState(false);
  const [parentDealerId, setParentDealerId] = useState<string>("");
  const [parentDealers, setParentDealers] = useState<DealerLite[]>([]);
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [area, setArea] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [address, setAddress] = useState("");
  const [totalPotential, setTotalPotential] = useState("");
  const [bestPotential, setBestPotential] = useState("");
  const [brandSelling, setBrandSelling] = useState<string[]>([]);
  const [feedbacks, setFeedbacks] = useState("");
  const [remarks, setRemarks] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // UI State
  const [menus, setMenus] = useState({ type: false, region: false, feedback: false, parentDealer: false });
  const [brandsModalVisible, setBrandsModalVisible] = useState(false);

  // --- Data Fetching & Geocoding ---
  useEffect(() => {
    const fetchParentDealers = async () => {
      if (isSubDealer) {
        setIsLoadingDealers(true);
        // Call the central API service to fetch dealers
        const result = await getDealersForUser(currentUser.id) as { success: boolean, data: DealerLite[] };
        if (result.success) {
          setParentDealers(result.data);
        }
        // In a real app, you might show an error if the fetch fails.
        setIsLoadingDealers(false);
      }
    };
    fetchParentDealers();
  }, [isSubDealer, currentUser.id]);
  
  const useMyLocation = async () => {
    setIsSubmitting(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location access is required.');
      setIsSubmitting(false);
      return;
    }
    try {
      const loc = await Location.getCurrentPositionAsync({});
      setLatitude(String(loc.coords.latitude));
      setLongitude(String(loc.coords.longitude));
    } catch (error) {
       Alert.alert('Error', 'Could not fetch location.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Form Submission ---
  const validate = (): string | null => {
    if (!type || !name || !region || !area || !phoneNo || !address || !totalPotential || !bestPotential || !feedbacks || !latitude || !longitude) {
      return "Please fill all required fields.";
    }
    if (isSubDealer && !parentDealerId) return "Please select a parent dealer.";
    if (brandSelling.length === 0) return "Please select at least one brand.";
    return null;
  };
  
  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      return Alert.alert("Validation Error", error);
    }
    setIsSubmitting(true);

    const dealerPayload = {
      userId: currentUser.id,
      type,
      parentDealerId: isSubDealer ? parentDealerId : null,
      name, region, area, phoneNo, address,
      totalPotential: Number(totalPotential),
      bestPotential: Number(bestPotential),
      brandSelling, feedbacks, remarks,
      latitude: Number(latitude), longitude: Number(longitude)
    };
    
    // Call the central API service function
    const result = await createDealer(dealerPayload);
    setIsSubmitting(false);

    if (result.success) {
      Alert.alert('Success', 'New dealer has been created successfully.');
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Failed to create the new dealer.');
    }
  };
  
  // --- UI Helpers & Rendering ---
  const textInputTheme = { colors: { primary: theme.colors.primary, text: '#e5e7eb', placeholder: '#9ca3af', background: '#1e293b', outline: '#475569' } };
  const toggleMenu = (name: keyof typeof menus, visible: boolean) => setMenus(prev => ({ ...prev, [name]: visible }));
  const handleBrandToggle = (brand: string) => {
    setBrandSelling(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['right', 'bottom', 'left']}>
      <AppHeader title="Add New Dealer" />
      <Portal>
        <Modal visible={brandsModalVisible} onDismiss={() => setBrandsModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          <Text variant="titleLarge" style={styles.modalTitle}>Select Brands</Text>
          {BRANDS.map(brand => <Checkbox.Item key={brand} label={brand} status={brandSelling.includes(brand) ? 'checked' : 'unchecked'} onPress={() => handleBrandToggle(brand)} labelStyle={{ color: '#e5e7eb' }} color={theme.colors.primary} uncheckedColor='#9ca3af' />)}
          <Button onPress={() => setBrandsModalVisible(false)} style={{ marginTop: 10 }}>Done</Button>
        </Modal>
      </Portal>

      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text variant="headlineSmall" style={styles.title}>Dealer Information</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>Fill in the details for the new dealer.</Text>
        
        <View style={styles.switchContainer}>
            <Text style={{color: '#e5e7eb'}}>Is this a Sub-Dealer?</Text>
            <Switch value={isSubDealer} onValueChange={setIsSubDealer} />
        </View>

        {isSubDealer && (
            <Menu 
              visible={menus.parentDealer} 
              onDismiss={() => toggleMenu('parentDealer', false)} 
              anchor={
                <TouchableOpacity onPress={() => toggleMenu('parentDealer', true)} disabled={isLoadingDealers}>
                  <TextInput 
                    label="Parent Dealer *" 
                    editable={false} 
                    value={isLoadingDealers ? 'Loading...' : parentDealers.find(d => d.id === parentDealerId)?.name} 
                    style={styles.input} 
                    theme={textInputTheme} 
                    right={isLoadingDealers && <TextInput.Icon icon="loading" />}
                  />
                </TouchableOpacity>
              }>
              {parentDealers.map(d => <Menu.Item key={d.id} onPress={() => { setParentDealerId(d.id); toggleMenu('parentDealer', false); }} title={d.name} />)}
            </Menu>
        )}

        <Menu visible={menus.type} onDismiss={() => toggleMenu('type', false)} anchor={<TouchableOpacity onPress={() => toggleMenu('type', true)}><TextInput label="Type *" editable={false} value={type} style={styles.input} theme={textInputTheme} /></TouchableOpacity>}>{DEALER_TYPES.map(t => <Menu.Item key={t} onPress={() => { setType(t); toggleMenu('type', false); }} title={t} />)}</Menu>
        
        <TextInput label="Dealer/Sub-Dealer Name *" value={name} onChangeText={setName} style={styles.input} theme={textInputTheme} />
        <View style={{flexDirection: 'row', gap: 8}}>
            <Menu visible={menus.region} onDismiss={() => toggleMenu('region', false)} anchor={<TouchableOpacity style={{flex: 1}} onPress={() => toggleMenu('region', true)}><TextInput label="Region *" editable={false} value={region} style={styles.input} theme={textInputTheme} /></TouchableOpacity>}>{REGIONS.map(r => <Menu.Item key={r} onPress={() => { setRegion(r); toggleMenu('region', false); }} title={r} />)}</Menu>
            <TextInput label="Area *" value={area} onChangeText={setArea} style={[styles.input, {flex: 1}]} theme={textInputTheme} />
        </View>

        <TextInput label="Address *" multiline numberOfLines={3} value={address} onChangeText={setAddress} style={styles.input} theme={textInputTheme} />
        <TextInput label="Phone No *" keyboardType="phone-pad" value={phoneNo} onChangeText={setPhoneNo} style={styles.input} theme={textInputTheme} />

        <Button icon="crosshairs-gps" mode="outlined" onPress={useMyLocation} style={styles.input}>
             Use My Current Location
        </Button>
        <View style={{flexDirection: 'row', gap: 8}}>
            <TextInput label="Latitude *" editable={false} value={latitude} style={[styles.input, {flex: 1}]} theme={textInputTheme} />
            <TextInput label="Longitude *" editable={false} value={longitude} style={[styles.input, {flex: 1}]} theme={textInputTheme} />
        </View>

        <View style={{flexDirection: 'row', gap: 8}}>
            <TextInput label="Total Potential *" keyboardType="numeric" value={totalPotential} onChangeText={setTotalPotential} style={[styles.input, {flex: 1}]} theme={textInputTheme} />
            <TextInput label="Best Potential *" keyboardType="numeric" value={bestPotential} onChangeText={setBestPotential} style={[styles.input, {flex: 1}]} theme={textInputTheme} />
        </View>

        <TouchableOpacity onPress={() => setBrandsModalVisible(true)}><TextInput label="Brands Selling *" editable={false} value={brandSelling.join(', ') || 'Select brands...'} style={styles.input} theme={textInputTheme} /></TouchableOpacity>
        <Menu visible={menus.feedback} onDismiss={() => toggleMenu('feedback', false)} anchor={<TouchableOpacity onPress={() => toggleMenu('feedback', true)}><TextInput label="Feedbacks *" editable={false} value={feedbacks} style={styles.input} theme={textInputTheme} /></TouchableOpacity>}>{FEEDBACKS.map(fb => <Menu.Item key={fb} onPress={() => { setFeedbacks(fb); toggleMenu('feedback', false); }} title={fb} />)}</Menu>
        <TextInput label="Remarks" multiline numberOfLines={3} value={remarks} onChangeText={setRemarks} style={styles.input} theme={textInputTheme} />

        <Button mode="contained" onPress={handleSubmit} style={styles.button} loading={isSubmitting} disabled={isSubmitting}>
          Save Dealer
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f172a" },
  formContainer: { padding: 16, paddingBottom: 32 },
  title: { color: "#e5e7eb", marginBottom: 4, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { color: '#9ca3af', marginBottom: 24, textAlign: 'center' },
  input: { marginBottom: 16 },
  button: { marginTop: 8, paddingVertical: 4, width: '100%' },
  switchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, backgroundColor: '#1e293b', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 4 },
  modalContainer: { backgroundColor: '#1e293b', padding: 20, margin: 20, borderRadius: 8 },
  modalTitle: { color: '#e5e7eb', marginBottom: 10 },
});

