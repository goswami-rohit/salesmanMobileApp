// src/pages/forms/DailyTasksForm.tsx
import React, { useState } from 'react';
import { ScrollView, View, TouchableOpacity, Platform, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, TextInput, HelperText, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

import { BASE_URL, useAppStore } from '../../components/ReusableConstants';
import AppHeader from '../../components/AppHeader';
import Toast from 'react-native-toast-message';

// --- Zod Schema ---
const DailyTaskSchema = z.object({
  userId: z.number(),
  assignedByUserId: z.number(),
  taskDate: z.date(),
  visitType: z.string().min(1, "Visit type is required"),
  relatedDealerId: z.string().optional(),
  siteName: z.string().optional(),
  description: z.string().optional(),
  pjpId: z.string().optional(),
});

type DailyTaskFormValues = z.infer<typeof DailyTaskSchema>;

// --- Component ---
export default function DailyTasksForm() {
  const navigation = useNavigation();
  const theme = useTheme();
  const { user } = useAppStore();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dealers] = useState([]); // TODO: Fetch from API
  const [pjps] = useState([]); // TODO: Fetch from API

  const visitTypes = [
    'Site Visit',
    'Dealer Meeting',
    'Customer Visit',
    'Market Survey',
    'Training Session',
    'Installation',
    'Service Call',
    'Other',
  ];

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<DailyTaskFormValues>({
    resolver: zodResolver(DailyTaskSchema) as unknown as Resolver<DailyTaskFormValues, any>,
    mode: 'onChange',
    defaultValues: {
      userId: user?.id,
      assignedByUserId: user?.id,
      taskDate: new Date(),
      visitType: '',
      relatedDealerId: '',
      siteName: '',
      description: '',
      pjpId: '',
    },
  });

  const taskDate = watch('taskDate');

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (event.type === 'dismissed' || !selectedDate) {
      setShowDatePicker(false);
      return;
    }
    setValue('taskDate', selectedDate, { shouldValidate: true });
    setShowDatePicker(false);
  };

  const submit = async (values: DailyTaskFormValues) => {
    try {
      const payload = {
        ...values,
        taskDate: format(values.taskDate, 'yyyy-MM-dd'),
      };

      // TODO: API call to create daily task
      const response = await fetch(`${BASE_URL}/api/daily-tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create daily task');

      Toast.show({ type: 'success', text1: 'Task Created', text2: 'Daily task created successfully' });
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Submission Failed', error.message);
    }
  };

  return (
    <SafeAreaView style={[{ backgroundColor: theme.colors.background }, styles.container]} edges={['right', 'bottom', 'left']}>
      {/* Assuming AppHeader is a component that provides the back button and title */}
      <AppHeader title="Create Daily Task" />

      {showDatePicker && (
        <DateTimePicker
          value={taskDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text variant="headlineSmall" style={styles.headerTitle}>Daily Task Details</Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>Log your day-to-day work activities.</Text>

        {/* Task Date */}
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
            <TextInput
              label="Task Date *"
              value={format(taskDate, "PPP")}
              editable={false}
              right={<TextInput.Icon icon="calendar-month" />}
              error={!!errors.taskDate}
            />
          </TouchableOpacity>
          {errors.taskDate && <HelperText type="error">{errors.taskDate.message as string}</HelperText>}
        </View>

        {/* Visit Type */}
        <Controller
          control={control}
          name="visitType"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <View style={[styles.pickerWrapper, { borderColor: errors.visitType ? theme.colors.error : theme.colors.outline }]}>
                <RNPickerSelect
                  onValueChange={onChange}
                  value={value}
                  items={visitTypes.map(type => ({ label: type, value: type }))}
                  placeholder={{ label: "Select Visit Type *", value: "" }}
                  style={{ inputIOS: styles.pickerInput, inputAndroid: styles.pickerInput, iconContainer: styles.pickerIcon, placeholder: styles.pickerPlaceholder, }}
                  useNativeAndroidPickerStyle={false}
                  Icon={() => <Icon name="chevron-down" size={24} color={theme.colors.onSurface} />}
                />
              </View>
              {errors.visitType && <HelperText type="error">{errors.visitType.message}</HelperText>}
            </View>
          )}
        />

        {/* Related Dealer */}
        <Controller
          control={control}
          name="relatedDealerId"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <View style={[styles.pickerWrapper, { borderColor: errors.relatedDealerId ? theme.colors.error : theme.colors.outline }]}>
                <RNPickerSelect
                  onValueChange={onChange}
                  value={value}
                  items={(dealers || []).map((dealer: any) => ({ label: dealer.name, value: String(dealer.id) }))}
                  placeholder={{ label: "Select Related Dealer (optional)", value: "" }}
                  style={{ inputIOS: styles.pickerInput, inputAndroid: styles.pickerInput, iconContainer: styles.pickerIcon, placeholder: styles.pickerPlaceholder, }}
                  useNativeAndroidPickerStyle={false}
                  Icon={() => <Icon name="chevron-down" size={24} color={theme.colors.onSurface} />}
                />
              </View>
              {errors.relatedDealerId && <HelperText type="error">{errors.relatedDealerId.message}</HelperText>}
            </View>
          )}
        />

        {/* Site Name */}
        <Controller
          control={control}
          name="siteName"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.inputContainer}>
              <TextInput label="Site Name (Optional)" value={value || ''} onChangeText={onChange} onBlur={onBlur} error={!!errors.siteName} />
            </View>
          )}
        />

        {/* PJP Reference */}
        <Controller
          control={control}
          name="pjpId"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <View style={[styles.pickerWrapper, { borderColor: errors.pjpId ? theme.colors.error : theme.colors.outline }]}>
                <RNPickerSelect
                  onValueChange={onChange}
                  value={value}
                  items={(pjps || []).map((pjp: any) => ({ label: `PJP ${pjp.id}`, value: String(pjp.id) }))}
                  placeholder={{ label: "Select PJP Reference (optional)", value: "" }}
                  style={{ inputIOS: styles.pickerInput, inputAndroid: styles.pickerInput, iconContainer: styles.pickerIcon, placeholder: styles.pickerPlaceholder, }}
                  useNativeAndroidPickerStyle={false}
                  Icon={() => <Icon name="chevron-down" size={24} color={theme.colors.onSurface} />}
                />
              </View>
              {errors.pjpId && <HelperText type="error">{errors.pjpId.message}</HelperText>}
            </View>
          )}
        />

        {/* Description */}
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.inputContainer}>
              <TextInput
                label="Description (Optional)"
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={4}
              />
            </View>
          )}
        />

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit(submit)}
          loading={isSubmitting}
          disabled={!isValid || isSubmitting}
          style={styles.button}
        >
          Create Task
        </Button>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
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
  button: {
    marginTop: 16,
    padding: 4,
    borderRadius: 8,
  },
});