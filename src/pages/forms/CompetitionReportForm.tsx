// src/pages/forms/CompetitionReportForm.tsx
import React, { useState } from 'react';
import { ScrollView, View, TouchableOpacity, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, TextInput, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

import { useAppStore, BASE_URL} from '../../components/ReusableConstants';
import AppHeader from '../../components/AppHeader';
import Toast from 'react-native-toast-message';

// --- Zod Schema based on your DB Schema ---
const CompetitionReportSchema = z.object({
  userId: z.number(),
  reportDate: z.date(),
  brandName: z.string().min(1, "Brand name is required"),
  // DB schema is varchar, so we'll treat these as strings but validate for numeric input
  billing: z.string().min(1, "Billing is required").regex(/^[0-9.]+$/, "Must be a number"),
  nod: z.string().min(1, "NOD is required").regex(/^[0-9]+$/, "Must be a whole number"),
  retail: z.string().min(1, "Retail is required").regex(/^[0-9.]+$/, "Must be a number"),
  schemesYesNo: z.enum(['Yes', 'No']),
  avgSchemeCost: z.coerce.number().min(0, "Cannot be negative"),
  remarks: z.string().optional(),
});

type CompetitionReportFormValues = z.infer<typeof CompetitionReportSchema>;

// --- Component ---
export default function CompetitionReportForm() {
  const navigation = useNavigation();
  const { user } = useAppStore();

  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const { control, handleSubmit, setValue, watch, formState: { errors, isSubmitting, isValid } } = useForm<CompetitionReportFormValues>({
    resolver: zodResolver(CompetitionReportSchema) as unknown as Resolver<CompetitionReportFormValues, any>,
    mode: 'onChange',
    defaultValues: {
      userId: user?.id,
      reportDate: new Date(),
      brandName: '',
      billing: '',
      nod: '',
      retail: '',
      schemesYesNo: undefined, // Let the placeholder show
      avgSchemeCost: undefined,
      remarks: '',
    },
  });

  const reportDate = watch('reportDate');

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setDatePickerVisible(Platform.OS === 'ios');
    if (event.type === 'dismissed' || !selectedDate) {
      setDatePickerVisible(false);
      return;
    }
    setValue('reportDate', selectedDate, { shouldValidate: true });
    setDatePickerVisible(false);
  };

  const submit = async (values: CompetitionReportFormValues) => {
    try {
      const payload = {
        ...values,
        reportDate: format(values.reportDate, 'yyyy-MM-dd'),
        remarks: values.remarks || null,
      };

      const response = await fetch(`${BASE_URL}/api/competition-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to submit report');

      Toast.show({ type: 'success', text1: 'Report Submitted', text2: 'Competition report has been saved.' });
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Submission Failed', error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['right', 'bottom', 'left']}>
      <AppHeader title="Competition Report" />

      {datePickerVisible && (
        <DateTimePicker value={reportDate || new Date()} mode="date" display="default" onChange={onDateChange} />
      )}

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text variant="headlineSmall" className="text-slate-200 font-bold text-center mb-1">New Competition Report</Text>
        <Text variant="bodyMedium" className="text-slate-400 text-center mb-6">Log information about competitor activity.</Text>

        <View className="mb-4">
          <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
            <TextInput label="Report Date *" value={format(reportDate, "PPP")} editable={false} right={<TextInput.Icon icon="calendar" />} error={!!errors.reportDate} />
          </TouchableOpacity>
          {errors.reportDate && <HelperText type="error">{errors.reportDate.message as string}</HelperText>}
        </View>

        <Controller control={control} name="brandName" render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4">
            <TextInput label="Brand Name *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.brandName} />
            {errors.brandName && <HelperText type="error">{errors.brandName.message}</HelperText>}
          </View>
        )} />

        <Controller control={control} name="billing" render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4">
            <TextInput label="Billing *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.billing} keyboardType="numeric" />
            {errors.billing && <HelperText type="error">{errors.billing.message}</HelperText>}
          </View>
        )} />

        <Controller control={control} name="nod" render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4">
            <TextInput label="NOD (No. of Dealers) *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.nod} keyboardType="numeric" />
            {errors.nod && <HelperText type="error">{errors.nod.message}</HelperText>}
          </View>
        )} />

        <Controller control={control} name="retail" render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4">
            <TextInput label="Retail *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.retail} keyboardType="numeric" />
            {errors.retail && <HelperText type="error">{errors.retail.message}</HelperText>}
          </View>
        )} />

        <Controller control={control} name="schemesYesNo" render={({ field: { onChange, value } }) => (
          <View className="mb-4">
            <View className="p-3 bg-slate-800 rounded-lg border border-slate-600">
              <RNPickerSelect
                onValueChange={onChange}
                value={value}
                items={[{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }]}
                placeholder={{ label: "Are schemes active? *", value: null }}
                style={{ inputIOS: { color: 'white' }, inputAndroid: { color: 'white' } }}
                useNativeAndroidPickerStyle={false}
                Icon={() => <Icon name="chevron-down" size={24} color="#94a3b8" />}
              />
            </View>
            {errors.schemesYesNo && <HelperText type="error">{errors.schemesYesNo.message}</HelperText>}
          </View>
        )} />

        <Controller control={control} name="avgSchemeCost" render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4">
            <TextInput label="Average Scheme Cost (₹) *" value={String(value || '')} onChangeText={onChange} onBlur={onBlur} error={!!errors.avgSchemeCost} keyboardType="numeric" />
            {errors.avgSchemeCost && <HelperText type="error">{errors.avgSchemeCost.message}</HelperText>}
          </View>
        )} />

        <Controller control={control} name="remarks" render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4">
            <TextInput label="Remarks" value={value || ''} onChangeText={onChange} onBlur={onBlur} multiline numberOfLines={3} />
          </View>
        )} />

        <Button mode="contained" onPress={handleSubmit(submit)} loading={isSubmitting} disabled={!isValid || isSubmitting} className="mt-2 p-1">
          Submit Report
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
