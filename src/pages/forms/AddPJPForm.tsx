// src/pages/forms/AddPJPForm.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, TextInput, useTheme, Menu, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import AppHeader from '../../components/AppHeader';
import { PJP_STATUS } from '../../components/ReusableConstants';
import { createPjp, getDealersForUser } from '../../backendConnections/apiServices'; // Import the service functions

// Placeholder types for data you would pass into this component or get from context/API
type UserLite = { id: number; firstName?: string; lastName?: string; role?: string };
type DealerLite = { id: string; name: string; address?: string };

export default function PJPForm() {
  const navigation = useNavigation();
  const theme = useTheme();

  // --- Data Management (replace with your app's state management/context) ---
  const [currentUser] = useState<UserLite | null>({ id: 1, firstName: 'John', lastName: 'Doe', role: 'Sales Executive' });
  const [availableDealers, setAvailableDealers] = useState<DealerLite[]>([]);
  const [isLoadingDealers, setIsLoadingDealers] = useState(true);

  // --- State Management ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form Fields
  const [planDate, setPlanDate] = useState<Date | null>(new Date());
  const [destinationDealerId, setDestinationDealerId] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<(typeof PJP_STATUS)[number]>("planned");

  // UI State
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [menus, setMenus] = useState({ dealer: false, status: false });

  // --- Data Fetching Logic ---
  useEffect(() => {
    const fetchDealers = async () => {
        if (!currentUser?.id) return;
        setIsLoadingDealers(true);
        const result = await getDealersForUser(currentUser.id) as { success: boolean, data: DealerLite[] };
        if (result.success) {
            setAvailableDealers(result.data);
        } else {
            Alert.alert("Error", "Could not load the list of dealers.");
        }
        setIsLoadingDealers(false);
    };
    fetchDealers();
  }, [currentUser]);


  // --- Form Submission ---
  const validate = (): string | null => {
    if (!currentUser?.id) return "User information is missing.";
    if (!planDate) return "Please select a plan date.";
    if (!destinationDealerId) return "Please select a destination dealer.";
    if (!status) return "Please select a status.";
    return null;
  };
  
  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      return Alert.alert("Validation Error", error);
    }
    setIsSubmitting(true);

    const pjpPayload = {
      userId: currentUser!.id,
      createdById: currentUser!.id,
      planDate: planDate?.toISOString().split('T')[0],
      areaToBeVisited: destinationDealerId, // Using dealer ID for the area
      description: description.trim() || null,
      status,
    };
    
    // Call the central API service function
    const result = await createPjp(pjpPayload) as { success: boolean };
    setIsSubmitting(false);

    if (result.success) {
      Alert.alert('Success', 'Your PJP has been saved successfully.');
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Failed to save your PJP.');
    }
  };
  
  // --- UI Helpers & Rendering ---
  const textInputTheme = { colors: { primary: theme.colors.primary, text: '#e5e7eb', placeholder: '#9ca3af', background: '#1e293b', outline: '#475569' } };
  const toggleMenu = (name: keyof typeof menus, visible: boolean) => setMenus(prev => ({ ...prev, [name]: visible }));

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
      setDatePickerVisible(false);
      if (event.type === 'set' && selectedDate) {
        setPlanDate(selectedDate);
      }
  };

  if (!currentUser || isLoadingDealers) {
      return (
          <SafeAreaView style={styles.safe}>
              <AppHeader title="Create Journey Plan" />
              <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                  <ActivityIndicator animating={true} size="large" />
              </View>
          </SafeAreaView>
      )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['right', 'bottom', 'left']}>
      <AppHeader title="Create Journey Plan" />

      {datePickerVisible && (
        <DateTimePicker
            value={planDate || new Date()}
            mode="date"
            display="default"
            onChange={onDateChange}
        />
      )}

      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text variant="headlineSmall" style={styles.title}>New Planned Journey</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>Plan a visit for yourself.</Text>
        
        <TextInput 
            label="Salesperson" 
            value={`${currentUser.firstName} ${currentUser.lastName} • ${currentUser.role}`}
            editable={false}
            style={styles.input} 
            theme={textInputTheme} 
        />
        
        <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
            <TextInput 
                label="Plan Date *" 
                value={planDate ? planDate.toLocaleDateString() : ''} 
                editable={false} 
                style={styles.input} 
                theme={textInputTheme}
                right={<TextInput.Icon icon="calendar" />}
            />
        </TouchableOpacity>

        <Menu visible={menus.dealer} onDismiss={() => toggleMenu('dealer', false)} anchor={<TouchableOpacity onPress={() => toggleMenu('dealer', true)}><TextInput label="Destination Dealer *" editable={false} value={availableDealers.find(d => d.id === destinationDealerId)?.name} style={styles.input} theme={textInputTheme} /></TouchableOpacity>}>
            {availableDealers.length > 0 ? (
                availableDealers.map(dealer => <Menu.Item key={dealer.id} onPress={() => { setDestinationDealerId(dealer.id); toggleMenu('dealer', false); }} title={`${dealer.name} - ${dealer.address}`} />)
            ) : (
                <Menu.Item title="No dealers found..." disabled />
            )}
        </Menu>

        <TextInput 
            label="Description (Optional)" 
            multiline 
            numberOfLines={4} 
            value={description} 
            onChangeText={setDescription} 
            style={styles.input} 
            theme={textInputTheme} 
        />

        <Menu visible={menus.status} onDismiss={() => toggleMenu('status', false)} anchor={<TouchableOpacity onPress={() => toggleMenu('status', true)}><TextInput label="Status *" editable={false} value={status} style={styles.input} theme={textInputTheme} /></TouchableOpacity>}>
            {PJP_STATUS.map(s => <Menu.Item key={s} onPress={() => { setStatus(s); toggleMenu('status', false); }} title={s.charAt(0).toUpperCase() + s.slice(1)} />)}
        </Menu>

        <Button 
            mode="contained" 
            onPress={handleSubmit} 
            style={styles.button} 
            loading={isSubmitting} 
            disabled={isSubmitting}
        >
          Save PJP
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
});

