// src/pages/forms/LeaveApplicationForm.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, TextInput, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import AppHeader from '../../components/AppHeader';
import { createLeaveApplication } from '../../backendConnections/apiServices'; // Import the service function

// Placeholder type for user data (in a real app, from context/global state)
type UserLite = { id: number; };

export default function LeaveApplicationForm() {
  const navigation = useNavigation();
  const theme = useTheme();

  // In a real app, user info would come from a global state/context.
  const [currentUser] = useState<UserLite>({ id: 1 });

  // --- State Management ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form Fields
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [reason, setReason] = useState("");

  // Date Picker State
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerField, setDatePickerField] = useState<'start' | 'end'>('start');


  // --- Form Submission ---
  const validate = (): string | null => {
    if (!leaveType.trim() || !startDate || !endDate || !reason.trim()) {
      return "Please fill all required fields.";
    }
    if (endDate < startDate) {
      return "End date cannot be earlier than the start date.";
    }
    return null;
  };
  
  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      return Alert.alert("Validation Error", error);
    }
    setIsSubmitting(true);

    const leavePayload = {
      userId: currentUser.id,
      leaveType,
      startDate: startDate?.toISOString().split('T')[0],
      endDate: endDate?.toISOString().split('T')[0],
      reason,
      status: 'pending'
    };
    
    // Call the central API service function
    const result = await createLeaveApplication(leavePayload) as { success: boolean };
    setIsSubmitting(false);

    if (result.success) {
      Alert.alert('Success', 'Your leave application has been submitted successfully.');
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Failed to submit your leave application.');
    }
  };
  
  // --- UI Helpers & Rendering ---
  const textInputTheme = { colors: { primary: theme.colors.primary, text: '#e5e7eb', placeholder: '#9ca3af', background: '#1e293b', outline: '#475569' } };
  
  const showDatePicker = (field: 'start' | 'end') => {
      setDatePickerField(field);
      setDatePickerVisible(true);
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
      setDatePickerVisible(Platform.OS === 'ios');
      if (event.type === 'dismissed') {
        setDatePickerVisible(false);
        return;
      }
      if (selectedDate) {
          if (datePickerField === 'start') {
              setStartDate(selectedDate);
              if (endDate && selectedDate > endDate) {
                  setEndDate(selectedDate);
              }
          } else {
              setEndDate(selectedDate);
          }
      }
      setDatePickerVisible(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['right', 'bottom', 'left']}>
      <AppHeader title="Leave Application" />

      {datePickerVisible && (
        <DateTimePicker
            value={ (datePickerField === 'start' ? startDate : endDate) || new Date() }
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={datePickerField === 'end' && startDate ? startDate : undefined}
        />
      )}

      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text variant="headlineSmall" style={styles.title}>Request Time Off</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>Fill in the details for your leave request.</Text>
        
        <TextInput 
            label="Leave Type (e.g., Sick, Personal) *" 
            value={leaveType} 
            onChangeText={setLeaveType} 
            style={styles.input} 
            theme={textInputTheme} 
        />
        
        <View style={styles.dateContainer}>
            <TouchableOpacity style={{flex: 1}} onPress={() => showDatePicker('start')}>
                <TextInput 
                    label="Start Date *" 
                    value={startDate ? startDate.toLocaleDateString() : ''} 
                    editable={false} 
                    style={styles.input} 
                    theme={textInputTheme}
                    right={<TextInput.Icon icon="calendar" />}
                />
            </TouchableOpacity>
            <TouchableOpacity style={{flex: 1}} onPress={() => showDatePicker('end')}>
                 <TextInput 
                    label="End Date *" 
                    value={endDate ? endDate.toLocaleDateString() : ''} 
                    editable={false} 
                    style={styles.input} 
                    theme={textInputTheme}
                    right={<TextInput.Icon icon="calendar" />}
                />
            </TouchableOpacity>
        </View>

        <TextInput 
            label="Reason *" 
            multiline 
            numberOfLines={4} 
            value={reason} 
            onChangeText={setReason} 
            style={styles.input} 
            theme={textInputTheme} 
        />

        <Button 
            mode="contained" 
            onPress={handleSubmit} 
            style={styles.button} 
            loading={isSubmitting} 
            disabled={isSubmitting}
        >
          Submit Application
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
  dateContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: { marginTop: 8, paddingVertical: 4, width: '100%' },
});

