// src/pages/forms/LeaveApplicationForm.tsx
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { Text, Button, TextInput, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// --- Schema (Corrected) ---
const LeaveSchema = z.object({
    userId: z.number().int().positive(),
    leaveType: z.string().min(1, "Leave type is required"),
    startDate: z.date(),
    endDate: z.date(),
    reason: z.string().min(5, "Please provide a brief reason"),
    status: z.literal("pending").optional(),
  }).refine((data) => data.endDate >= data.startDate, {
    message: "End date cannot be earlier than start date",
    path: ["endDate"],
  });

export type LeaveFormValues = z.infer<typeof LeaveSchema>;

// --- Props ---
interface Props {
  userId?: number | null;
  onSubmitted?: (payload: LeaveFormValues) => void;
  onCancel?: () => void;
}

// --- Component ---
export default function LeaveApplicationForm({ userId, onSubmitted, onCancel }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [datePicker, setDatePicker] = useState({ visible: false, field: 'startDate' as 'startDate' | 'endDate' });

  const { control, handleSubmit, setValue, watch, formState: { errors, isValid } } = useForm<LeaveFormValues>({
    resolver: zodResolver(LeaveSchema),
    mode: 'onChange',
    defaultValues: {
      userId: userId ?? 0,
      leaveType: '',
      startDate: new Date(),
      endDate: new Date(),
      reason: '',
      status: 'pending',
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
        ...values,
        startDate: values.startDate.toISOString().split('T')[0],
        endDate: values.endDate.toISOString().split('T')[0],
      };
      
      const response = await fetch("YOUR_API_ENDPOINT/api/leave-applications", { // <-- Make sure to use your actual API endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leavePayload),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit leave application");
      }
      onSubmitted?.(values);

    } catch (error: any) {
      console.error("Leave application submission error:", error);
      Alert.alert("Submission Failed", error.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text variant="headlineSmall" className="font-bold text-center mb-1">Request Time Off</Text>
      <Text variant="bodyMedium" className="text-gray-500 text-center mb-6">Fill in the details for your leave request.</Text>

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
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4">
            <TextInput
              label="Leave Type (e.g., Sick, Personal)"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.leaveType}
            />
            {errors.leaveType && <HelperText type="error">{errors.leaveType.message}</HelperText>}
          </View>
        )}
      />

      <View className="flex-row gap-4 mb-4">
        {/* Start Date */}
        <View className="flex-1">
          <TouchableOpacity onPress={() => showDatePicker('startDate')}>
            <TextInput
              label="Start Date"
              value={format(startDate, "PPP")}
              editable={false}
              right={<TextInput.Icon icon="calendar" />}
              error={!!errors.startDate}
            />
          </TouchableOpacity>
          {errors.startDate && <HelperText type="error">{errors.startDate.message}</HelperText>}
        </View>

        {/* End Date */}
        <View className="flex-1">
          <TouchableOpacity onPress={() => showDatePicker('endDate')}>
            <TextInput
              label="End Date"
              value={format(endDate, "PPP")}
              editable={false}
              right={<TextInput.Icon icon="calendar" />}
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
          <View className="mb-4">
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
      <View className="flex-row gap-4 mt-4">
        <Button mode="outlined" onPress={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit(submit)}
          loading={isSubmitting}
          disabled={!isValid || isSubmitting}
          className="flex-1"
        >
          Submit
        </Button>
      </View>
    </ScrollView>
  );
}