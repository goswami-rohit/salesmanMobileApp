import React, { useState, useEffect } from 'react';
import { ScrollView, View, TouchableOpacity, Platform, Alert, StyleSheet, ActivityIndicator, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, TextInput, HelperText, Modal, Portal, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

import { BASE_URL, useAppStore, DEALER_TYPES } from '../../components/ReusableConstants';
import AppHeader from '../../components/AppHeader';
import Toast from 'react-native-toast-message';

// --- Zod Schema ---
const DailyTaskSchema = z.object({
  userId: z.number(),
  assignedByUserId: z.number(),
  taskDate: z.date(),
  visitType: z.string().min(1, "Visit type is required"),
  relatedDealerId: z.string().optional().nullable(),
  siteName: z.string().optional(),
  description: z.string().optional(),
  pjpId: z.string().optional().nullable(),
});

type DailyTaskFormValues = z.infer<typeof DailyTaskSchema>;

interface Dealer {
  id: string;
  name: string;
}
interface PJP {
  id: string;
  planDate: string;
}

// --- Component ---
export default function DailyTasksForm() {
  const navigation = useNavigation();
  const theme = useTheme();
  const { user } = useAppStore();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dealersData, setDealersData] = useState<Dealer[]>([]);
  const [pjpsData, setPjpsData] = useState<PJP[]>([]);
  const [isDealersLoading, setIsDealersLoading] = useState(true);
  const [isPjpsLoading, setIsPjpsLoading] = useState(true);

  // Modal-related states
  const [dealerModalVisible, setDealerModalVisible] = useState(false);
  const [pjpModalVisible, setPjpModalVisible] = useState(false);
  const [dealerSearchQuery, setDealerSearchQuery] = useState('');
  const [pjpSearchQuery, setPjpSearchQuery] = useState('');

  // Fetch dealers on component mount
  useEffect(() => {
    const fetchDealers = async () => {
      try {
        setIsDealersLoading(true);
        const response = await fetch(`${BASE_URL}/api/dealers/user/${user?.id}`);
        const result = await response.json();
        if (response.ok && result.success) {
          setDealersData(result.data.map((d: any) => ({ id: d.id, name: d.name })));
        } else {
          Alert.alert('Error', 'Failed to load dealers.');
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to fetch dealers.');
      } finally {
        setIsDealersLoading(false);
      }
    };
    const fetchPjps = async () => {
      try {
        setIsPjpsLoading(true);
        const response = await fetch(`${BASE_URL}/api/pjp/user/${user?.id}`);
        const result = await response.json();
        if (response.ok && result.success) {
          setPjpsData(result.data.map((p: any) => ({ id: p.id, planDate: p.planDate })));
        } else {
          Alert.alert('Error', 'Failed to load PJPs.');
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to fetch PJPs.');
      } finally {
        setIsPjpsLoading(false);
      }
    };
    fetchDealers();
    fetchPjps();
  }, [user?.id]);

  const visitTypes = DEALER_TYPES;

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
      relatedDealerId: null,
      siteName: '',
      description: '',
      pjpId: null,
    },
  });

  const taskDate = watch('taskDate');
  const relatedDealerId = watch('relatedDealerId');
  const pjpId = watch('pjpId');

  const selectedDealerName = dealersData.find(d => d.id === relatedDealerId)?.name || '';
  const selectedPjpLabel = pjpsData.find(p => p.id === pjpId)?.planDate || '';

  const filteredDealers = dealersData.filter(d =>
    d.name.toLowerCase().includes(dealerSearchQuery.toLowerCase())
  );
  const filteredPjps = pjpsData.filter(p =>
    p.planDate.toLowerCase().includes(pjpSearchQuery.toLowerCase())
  );

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
        relatedDealerId: values.relatedDealerId || null,
        pjpId: values.pjpId || null,
      };

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
      <AppHeader title="Create Daily Task" />

      <Portal>
        {/* Dealer Selection Modal */}
        <Modal visible={dealerModalVisible} onDismiss={() => setDealerModalVisible(false)} contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleLarge" style={styles.modalTitle}>Select Related Dealer</Text>
          <TextInput
            label="Search"
            value={dealerSearchQuery}
            onChangeText={setDealerSearchQuery}
            mode="outlined"
            right={<TextInput.Icon icon="magnify" />}
            style={styles.searchBar}
          />
          {isDealersLoading ? (
            <ActivityIndicator style={styles.loadingIndicator} />
          ) : (
            <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={{ paddingBottom: 8 }}>
              {filteredDealers.length > 0 ? (
                filteredDealers.map(d => (
                  <TouchableOpacity
                    key={d.id}
                    onPress={() => {
                      setValue('relatedDealerId', d.id, { shouldValidate: true });
                      setDealerModalVisible(false);
                      setDealerSearchQuery('');
                    }}
                    style={styles.dealerListItem}
                  >
                    <Text style={styles.dealerListItemText}>{d.name}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noResultsText}>No dealers found.</Text>
              )}
            </ScrollView>
          )}
          <Button mode="contained" onPress={() => setDealerModalVisible(false)} style={styles.doneButton}>Done</Button>
        </Modal>

        {/* PJP Selection Modal */}
        <Modal visible={pjpModalVisible} onDismiss={() => setPjpModalVisible(false)} contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleLarge" style={styles.modalTitle}>Select PJP Reference</Text>
          <TextInput
            label="Search"
            value={pjpSearchQuery}
            onChangeText={setPjpSearchQuery}
            mode="outlined"
            right={<TextInput.Icon icon="magnify" />}
            style={styles.searchBar}
          />
          {isPjpsLoading ? (
            <ActivityIndicator style={styles.loadingIndicator} />
          ) : (
            <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={{ paddingBottom: 8 }}>
              {filteredPjps.length > 0 ? (
                filteredPjps.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => {
                      setValue('pjpId', p.id, { shouldValidate: true });
                      setPjpModalVisible(false);
                      setPjpSearchQuery('');
                    }}
                    style={styles.dealerListItem}
                  >
                    <Text style={styles.dealerListItemText}>{`PJP: ${p.planDate}`}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noResultsText}>No PJPs found.</Text>
              )}
            </ScrollView>
          )}
          <Button mode="contained" onPress={() => setPjpModalVisible(false)} style={styles.doneButton}>Done</Button>
        </Modal>
      </Portal>

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
          render={({ field: { value } }) => (
            <View style={styles.inputContainer}>
              <TouchableOpacity onPress={() => setDealerModalVisible(true)} activeOpacity={0.7}>
                <TextInput
                  label="Select Related Dealer (optional)"
                  value={selectedDealerName}
                  editable={false}
                  mode="outlined"
                  right={<TextInput.Icon icon="chevron-down" />}
                  error={!!errors.relatedDealerId}
                />
              </TouchableOpacity>
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
          render={({ field: { value } }) => (
            <View style={styles.inputContainer}>
              <TouchableOpacity onPress={() => setPjpModalVisible(true)} activeOpacity={0.7}>
                <TextInput
                  label="Select PJP Reference (optional)"
                  value={selectedPjpLabel}
                  editable={false}
                  mode="outlined"
                  right={<TextInput.Icon icon="chevron-down" />}
                  error={!!errors.pjpId}
                />
              </TouchableOpacity>
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
    paddingBottom: 40,
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
  // Modal styles
  modalContainer: {
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 8,
  },
  searchBar: {
    marginBottom: 12,
  },
  loadingIndicator: {
    paddingVertical: 20,
  },
  dealerListItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#6b7280',
  },
  dealerListItemText: {
    fontSize: 16,
    color: '#e5e7eb',
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#9ca3af',
  },
  doneButton: {
    marginTop: 16,
  },
});
