// src/pages/forms/AddPJPForm.tsx
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

import { useAppStore, PJP_STATUS, BASE_URL } from '../../components/ReusableConstants';
import AppHeader from '../../components/AppHeader';
import Toast from 'react-native-toast-message';

// --- Zod Schema ---
const PJPSchema = z.object({
  userId: z.number(),
  createdById: z.number(),
  planDate: z.date(),
  areaToBeVisited: z.string().min(1, "Destination dealer is required"),
  description: z.string().optional(),
  status: z.enum(PJP_STATUS),
});

type PJPFormValues = z.infer<typeof PJPSchema>;

// --- Component ---
export default function AddPJPForm() {
  const navigation = useNavigation();
  const { user, dealers } = useAppStore();

  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const { control, handleSubmit, setValue, watch, formState: { errors, isSubmitting, isValid } } = useForm<PJPFormValues>({
    resolver: zodResolver(PJPSchema) as unknown as Resolver<PJPFormValues, any>,
    mode: 'onChange',
    defaultValues: {
      userId: user?.id,
      createdById: user?.id,
      planDate: new Date(),
      areaToBeVisited: '',
      description: '',
      status: 'planned',
    },
  });

  const planDate = watch('planDate');
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setDatePickerVisible(Platform.OS === 'ios');
    if (event.type === 'dismissed' || !selectedDate) {
      setDatePickerVisible(false);
      return;
    }
    setValue('planDate', selectedDate, { shouldValidate: true });
    setDatePickerVisible(false);
  };

  const submit = async (values: PJPFormValues) => {
    try {
      const payload = {
        ...values,
        planDate: values.planDate.toISOString().slice(0, 10), // Format date to YYYY-MM-DD
      };

      const response = await fetch(`${BASE_URL}/api/permanent-journey-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create PJP');

      Toast.show({ type: 'success', text1: 'PJP Created', text2: 'The new journey plan has been saved.' });
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Submission Failed', error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['right', 'bottom', 'left']}>
      <AppHeader title="Plan New Journey (PJP)" />

      {datePickerVisible && (
        <DateTimePicker
          value={planDate || new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text variant="headlineSmall" className="text-slate-200 font-bold text-center mb-1">Journey Details</Text>
        <Text variant="bodyMedium" className="text-slate-400 text-center mb-6">Plan a visit for yourself.</Text>

        <View className="mb-4">
          <TextInput label="Salesperson" value={fullName} disabled />
        </View>

        <View className="mb-4">
          <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
            <TextInput
              label="Plan Date *"
              value={format(planDate, "PPP")}
              editable={false}
              right={<TextInput.Icon icon="calendar" />}
              error={!!errors.planDate}
            />
          </TouchableOpacity>
          {errors.planDate && <HelperText type="error">{errors.planDate.message}</HelperText>}
        </View>

        <Controller control={control} name="areaToBeVisited" render={({ field: { onChange, value } }) => (
          <View className="mb-4">
            <View className="p-3 bg-slate-800 rounded-lg border border-slate-600">
              <RNPickerSelect
                onValueChange={onChange}
                value={value}
                items={(dealers || []).map(d => ({
                  label: `${d.name} - ${d.address || ''}`,
                  value: String(d.name)
                }))}
                placeholder={{ label: "Select Destination Dealer *", value: "" }}
                style={{ inputIOS: { color: 'white' }, inputAndroid: { color: 'white' } }}
                useNativeAndroidPickerStyle={false}
                Icon={() => <Icon name="chevron-down" size={24} color="#94a3b8" />}
              />
            </View>
            {errors.areaToBeVisited && <HelperText type="error">{errors.areaToBeVisited.message}</HelperText>}
          </View>
        )} />

        <Controller control={control} name="description" render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4">
            <TextInput label="Description (Optional)" value={value || ''} onChangeText={onChange} onBlur={onBlur} multiline numberOfLines={3} />
          </View>
        )} />

        <Controller control={control} name="status" render={({ field: { onChange, value } }) => (
          <View className="mb-4">
            <View className="p-3 bg-slate-800 rounded-lg border border-slate-600">
              <RNPickerSelect
                onValueChange={onChange}
                value={value}
                items={PJP_STATUS.map(s => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s }))}
                placeholder={{}}
                style={{ inputIOS: { color: 'white' }, inputAndroid: { color: 'white' } }}
                useNativeAndroidPickerStyle={false}
                Icon={() => <Icon name="chevron-down" size={24} color="#94a3b8" />}
              />
            </View>
          </View>
        )} />

        <Button mode="contained" onPress={handleSubmit(submit)} loading={isSubmitting} disabled={!isValid || isSubmitting} className="mt-2 p-1">
          Save Journey Plan
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
