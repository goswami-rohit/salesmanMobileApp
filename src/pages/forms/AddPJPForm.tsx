import React, { useState, useEffect } from 'react';
import { ScrollView, View, TouchableOpacity, Platform, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, TextInput, HelperText, Modal, Portal, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
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

interface Dealer {
  name: string;
  address: string;
}

// --- Component ---
export default function AddPJPForm() {
  const navigation = useNavigation();
  const theme = useTheme();
  const { user } = useAppStore();

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [dealerModalVisible, setDealerModalVisible] = useState(false);
  const [dealersData, setDealersData] = useState<Dealer[]>([]);
  const [isDealersLoading, setIsDealersLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const abortControllerRef = React.useRef(new AbortController());

  // Effect to fetch dealers on component mount or user change
  useEffect(() => {
    const fetchDealers = async () => {
      if (!user?.id) {
        setIsDealersLoading(false);
        return;
      }

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      try {
        setIsDealersLoading(true);
        const response = await fetch(`${BASE_URL}/api/dealers/user/${user.id}`, { signal });
        const result = await response.json();

        if (response.ok && result.success) {
          setDealersData(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch dealers');
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted');
          return;
        }
        console.error('Failed to fetch dealers:', err.message);
        Alert.alert('Data Fetch Failed', 'Could not load dealer list.');
      } finally {
        setIsDealersLoading(false);
      }
    };

    fetchDealers();

    return () => {
      abortControllerRef.current.abort();
    };
  }, [user?.id]);

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
  const selectedDealerName = watch('areaToBeVisited');
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  const filteredDealers = dealersData.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.address || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        planDate: values.planDate.toISOString().slice(0, 10),
      };

      const response = await fetch(`${BASE_URL}/api/pjp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create PJP');

      Toast.show({ type: 'success', text1: 'PJP Created', text2: 'The new journey plan has been saved.' });
      // @ts-ignore
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Submission Failed', error.message);
    }
  };

  return (
    <SafeAreaView style={[{ backgroundColor: theme.colors.background }, styles.container]} edges={['right', 'bottom', 'left']}>
      <AppHeader title="Plan New Journey (PJP)" />

      <Portal>
        {/* Dealer Selection Modal */}
        <Modal visible={dealerModalVisible} onDismiss={() => setDealerModalVisible(false)} contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleLarge" style={styles.modalTitle}>Select Destination Dealer</Text>
          <TextInput
            label="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
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
                    key={d.name} // Using name as key, assuming it's unique
                    onPress={() => {
                      setValue('areaToBeVisited', `${d.name} - ${d.address || ''}`, { shouldValidate: true });
                      setDealerModalVisible(false);
                      setSearchQuery(''); // Reset search
                    }}
                    style={styles.dealerListItem}
                  >
                    <Text style={styles.dealerListItemText}>{d.name} - {d.address || ''}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noResultsText}>No dealers found.</Text>
              )}
            </ScrollView>
          )}
          <Button mode="contained" onPress={() => setDealerModalVisible(false)} style={styles.doneButton}>Done</Button>
        </Modal>
      </Portal>

      {datePickerVisible && (
        <DateTimePicker
          value={planDate || new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text variant="headlineSmall" style={styles.headerTitle}>Journey Details</Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>Plan a visit for yourself.</Text>

        <View style={styles.inputContainer}>
          <TextInput label="Salesperson" value={fullName} disabled />
        </View>

        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={() => setDatePickerVisible(true)} activeOpacity={0.7}>
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

        <Controller
          control={control}
          name="areaToBeVisited"
          render={({ field: { value } }) => (
            <View style={styles.inputContainer}>
              <TouchableOpacity onPress={() => setDealerModalVisible(true)} activeOpacity={0.7}>
                <TextInput
                  label="Select Destination Dealer *"
                  value={value}
                  editable={false}
                  mode="outlined"
                  right={<TextInput.Icon icon="chevron-down" />}
                  error={!!errors.areaToBeVisited}
                />
              </TouchableOpacity>
              {errors.areaToBeVisited && <HelperText type="error">{errors.areaToBeVisited.message}</HelperText>}
            </View>
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.inputContainer}>
              <TextInput label="Description (Optional)" value={value || ''} onChangeText={onChange} onBlur={onBlur} multiline numberOfLines={3} />
            </View>
          )}
        />

        <Controller
          control={control}
          name="status"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <View style={[styles.pickerWrapper, { borderColor: errors.status ? theme.colors.error : theme.colors.outline }]}>
                <RNPickerSelect
                  onValueChange={onChange}
                  value={value}
                  items={PJP_STATUS.map(s => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s }))}
                  placeholder={{}}
                  style={{
                    inputIOS: styles.pickerInput,
                    inputAndroid: styles.pickerInput,
                    iconContainer: styles.pickerIcon,
                  }}
                  useNativeAndroidPickerStyle={false}
                  Icon={() => <Icon name="chevron-down" size={24} color={theme.colors.onSurface} />}
                />
              </View>
              {errors.status && <HelperText type="error">{errors.status.message}</HelperText>}
            </View>
          )}
        />

        <Button
          mode="contained"
          onPress={handleSubmit(submit)}
          loading={isSubmitting}
          disabled={!isValid || isSubmitting}
          style={styles.button}
        >
          Save Journey Plan
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
