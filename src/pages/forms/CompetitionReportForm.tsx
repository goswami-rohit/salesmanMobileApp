// src/pages/forms/CompetitionReportForm.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, TextInput, useTheme, Menu } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import AppHeader from '../../components/AppHeader';
import { createCompetitionReport } from '../../backendConnections/apiServices'; // Import the service function

// Placeholder type for user data (in a real app, from context/global state)
type UserLite = { id?: number; };

export default function CompetitionReportForm() {
  const navigation = useNavigation();
  const theme = useTheme();

  // In a real app, user info would come from a global state/context.
  const [currentUser] = useState<UserLite>({ id: 1 });

  // --- State Management ---
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields based on Drizzle Schema
  const [reportDate, setReportDate] = useState<Date | null>(new Date());
  const [brandName, setBrandName] = useState("");
  const [billing, setBilling] = useState("");
  const [nod, setNod] = useState("");
  const [retail, setRetail] = useState("");
  const [schemesYesNo, setSchemesYesNo] = useState<"Yes" | "No" | "">("");
  const [avgSchemeCost, setAvgSchemeCost] = useState("");
  const [remarks, setRemarks] = useState("");

  // UI State
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [schemesMenuVisible, setSchemesMenuVisible] = useState(false);

  // --- Form Submission ---
  const validate = (): string | null => {
    if (!reportDate || !brandName.trim() || !billing.trim() || !nod.trim() || !retail.trim() || !schemesYesNo) {
        return "Please fill all required fields.";
    }
    if (isNaN(Number(billing)) || isNaN(Number(nod)) || isNaN(Number(retail)) || isNaN(Number(avgSchemeCost))) {
        return "Billing, NOD, Retail, and Scheme Cost fields must be numbers.";
    }
    return null;
  };
  
  const handleSubmit = async () => {
    const error = validate();
    if (error) return Alert.alert("Validation Error", error);
    
    setIsSubmitting(true);

    const payload = {
      userId: currentUser.id,
      reportDate: reportDate?.toISOString().split('T')[0],
      brandName: brandName.trim(),
      billing,
      nod,
      retail,
      schemesYesNo,
      avgSchemeCost: Number(avgSchemeCost),
      remarks: remarks.trim() || null,
    };
    
    // Call the central API service function
    const result = await createCompetitionReport(payload) as { success: boolean };
    setIsSubmitting(false);

    if (result.success) {
      Alert.alert('Success', 'Competition report has been submitted successfully.');
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Failed to submit competition report.');
    }
  };
  
  // --- UI Helpers & Rendering ---
  const textInputTheme = { colors: { primary: theme.colors.primary, text: '#e5e7eb', placeholder: '#9ca3af', background: '#1e293b', outline: '#475569' } };
  
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
      setDatePickerVisible(false);
      if (event.type === 'set' && selectedDate) {
        setReportDate(selectedDate);
      }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['right', 'bottom', 'left']}>
      <AppHeader title="Competition Report" />

      {datePickerVisible && (
        <DateTimePicker value={reportDate || new Date()} mode="date" display="default" onChange={onDateChange} />
      )}

      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text variant="headlineSmall" style={styles.title}>New Competition Report</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>Log information about competitor activity.</Text>
        
        <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
            <TextInput label="Report Date *" value={reportDate ? reportDate.toLocaleDateString() : ''} editable={false} style={styles.input} theme={textInputTheme} right={<TextInput.Icon icon="calendar" />} />
        </TouchableOpacity>
        
        <TextInput label="Brand Name *" value={brandName} onChangeText={setBrandName} style={styles.input} theme={textInputTheme} />
        <TextInput label="Billing *" keyboardType="numeric" value={billing} onChangeText={setBilling} style={styles.input} theme={textInputTheme} />
        <TextInput label="NOD (No. of Dealers) *" keyboardType="numeric" value={nod} onChangeText={setNod} style={styles.input} theme={textInputTheme} />
        <TextInput label="Retail *" keyboardType="numeric" value={retail} onChangeText={setRetail} style={styles.input} theme={textInputTheme} />

        <Menu visible={schemesMenuVisible} onDismiss={() => setSchemesMenuVisible(false)} anchor={<TouchableOpacity onPress={() => setSchemesMenuVisible(true)}><TextInput label="Schemes Active? *" editable={false} value={schemesYesNo} style={styles.input} theme={textInputTheme} /></TouchableOpacity>}>
            <Menu.Item onPress={() => { setSchemesYesNo("Yes"); setSchemesMenuVisible(false); }} title="Yes" />
            <Menu.Item onPress={() => { setSchemesYesNo("No"); setSchemesMenuVisible(false); }} title="No" />
        </Menu>

        <TextInput label="Average Scheme Cost (₹) *" keyboardType="numeric" value={avgSchemeCost} onChangeText={setAvgSchemeCost} style={styles.input} theme={textInputTheme} />
        <TextInput label="Remarks" multiline numberOfLines={4} value={remarks} onChangeText={setRemarks} style={styles.input} theme={textInputTheme} />

        <Button mode="contained" onPress={handleSubmit} style={styles.button} loading={isSubmitting} disabled={isSubmitting}>
          Submit Report
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

