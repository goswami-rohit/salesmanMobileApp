import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Platform, Alert, StyleSheet } from 'react-native';
import { Text, Button, TextInput, HelperText, useTheme } from 'react-native-paper';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BASE_URL, LEAVE_TYPE, useAppStore } from '../../components/ReusableConstants';
import AppHeader from '../../components/AppHeader';

// --- Schema (Updated to only validate user input fields) ---
const LeaveSchema = z.object({
  leaveType: z.string().min(1, "Leave type is required"),
  startDate: z.date(),
  endDate: z.date(),
  reason: z.string().min(5, "Please provide a brief reason"),
}).refine((data) => data.endDate >= data.startDate, {
  message: "End date cannot be earlier than start date",
  path: ["endDate"],
});

export type LeaveFormValues = z.infer<typeof LeaveSchema>;

// --- Props ---
interface Props {
  onSubmitted?: (payload: LeaveFormValues) => void;
  onCancel?: () => void;
}

// --- Component ---
export default function LeaveApplicationForm({ onSubmitted, onCancel }: Props) {
  const theme = useTheme();
  const { user } = useAppStore(); // Use the user object from the store
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [datePicker, setDatePicker] = useState({ visible: false, field: 'startDate' as 'startDate' | 'endDate' });

  const { control, handleSubmit, setValue, watch, formState: { errors, isValid } } = useForm<LeaveFormValues>({
    resolver: zodResolver(LeaveSchema),
    mode: 'onChange',
    defaultValues: {
      leaveType: '',
      startDate: new Date(),
      endDate: new Date(),
      reason: '',
    },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const showDatePicker = (field: 'startDate' | 'endDate') => {
    setDatePicker({ visible: true, field });
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setDatePicker({ ...datePicker, visible: Platform.OS === 'ios' });
    if (event.type === 'dismissed' || !selectedDate) {
      setDatePicker({ ...datePicker, visible: false });
      return;
    }

    setValue(datePicker.field, selectedDate, { shouldValidate: true, shouldDirty: true });
    if (datePicker.field === 'startDate' && selectedDate > endDate) {
      setValue('endDate', selectedDate, { shouldValidate: true, shouldDirty: true });
    }
    setDatePicker({ ...datePicker, visible: false });
  };

  const submit = async (values: LeaveFormValues) => {
    setIsSubmitting(true);
    try {
      const leavePayload = {
        userId: user?.id, // Add userId here, not in the form state
        ...values,
        startDate: values.startDate.toISOString().split('T')[0],
        endDate: values.endDate.toISOString().split('T')[0],
        status: 'pending', // Add status here, as it's a fixed value
      };

      const response = await fetch(`${BASE_URL}/api/leave-applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leavePayload),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit leave application");
      }
      onSubmitted?.(values);
      Alert.alert("Success", "Your leave application has been submitted.");

    } catch (error: any) {
      console.error("Leave application submission error:", error);
      Alert.alert("Submission Failed", error.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppHeader title="Leave Application" />

      <Text variant="headlineSmall" style={styles.headerTitle}>Request Time Off</Text>
      <Text variant="bodyMedium" style={styles.headerSubtitle}>Fill in the details for your leave request.</Text>

      {datePicker.visible && (
        <DateTimePicker
          value={watch(datePicker.field)}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={datePicker.field === 'endDate' ? startDate : undefined}
        />
      )}

      {/* --- Form Fields using Controller --- */}
      <Controller
        control={control}
        name="leaveType"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <View style={[styles.pickerWrapper, { borderColor: errors.leaveType ? theme.colors.error : theme.colors.outline }]}>
              <RNPickerSelect
                onValueChange={onChange}
                value={value}
                items={LEAVE_TYPE.map(type => ({ label: type, value: type }))}
                placeholder={{ label: "Select Leave Type *", value: "" }}
                style={{ inputIOS: styles.pickerInput, inputAndroid: styles.pickerInput, iconContainer: styles.pickerIcon, placeholder: styles.pickerPlaceholder, }}
                useNativeAndroidPickerStyle={false}
                Icon={() => <Icon name="chevron-down" size={24} color={theme.colors.onSurface} />}
              />
            </View>
            {errors.leaveType && <HelperText type="error">{errors.leaveType.message}</HelperText>}
          </View>
        )}
      />

      <View style={styles.dateRow}>
        {/* Start Date */}
        <View style={styles.dateInputContainer}>
          <TouchableOpacity onPress={() => showDatePicker('startDate')}>
            <TextInput
              label="Start Date"
              value={format(startDate, "PPP")}
              editable={false}
              right={<TextInput.Icon icon="calendar-month" />}
              error={!!errors.startDate}
            />
          </TouchableOpacity>
          {errors.startDate && <HelperText type="error">{errors.startDate.message}</HelperText>}
        </View>

        {/* End Date */}
        <View style={styles.dateInputContainer}>
          <TouchableOpacity onPress={() => showDatePicker('endDate')}>
            <TextInput
              label="End Date"
              value={format(endDate, "PPP")}
              editable={false}
              right={<TextInput.Icon icon="calendar-month" />}
              error={!!errors.endDate}
            />
          </TouchableOpacity>
          {errors.endDate && <HelperText type="error">{errors.endDate.message}</HelperText>}
        </View>
      </View>

      <Controller
        control={control}
        name="reason"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputContainer}>
            <TextInput
              label="Reason"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              multiline
              numberOfLines={4}
              error={!!errors.reason}
            />
            {errors.reason && <HelperText type="error">{errors.reason.message}</HelperText>}
          </View>
        )}
      />

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <Button mode="outlined" onPress={onCancel} style={styles.button}>
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit(submit)}
          loading={isSubmitting}
          disabled={!isValid || isSubmitting}
          style={styles.button}
        >
          Submit
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  headerTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  dateInputContainer: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 4,
    borderRadius: 8,
  },
  // New styles for the picker component
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
});
