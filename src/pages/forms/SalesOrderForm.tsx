import React, { useEffect, useState } from 'react';
import { ScrollView, View, TouchableOpacity, Platform, Alert, StyleSheet, ActivityIndicator } from 'react-native';
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

import { useAppStore, UNITS, BASE_URL } from '../../components/ReusableConstants';
import AppHeader from '../../components/AppHeader';
import Toast from 'react-native-toast-message';

// --- Zod Schema (Updated to match DB) ---
const SalesOrderSchema = z.object({
  dealerId: z.string().min(1, "Dealer is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  orderTotal: z.coerce.number().positive("Order total must be positive"),
  advancePayment: z.coerce.number().min(0, "Advance cannot be negative"),
  pendingPayment: z.coerce.number().min(0),
  estimatedDelivery: z.date(),
  remarks: z.string().optional().nullable(),
});

type SalesOrderFormValues = z.infer<typeof SalesOrderSchema>;

interface Dealer {
  id: string;
  name: string;
  address: string;
  phoneNo: string;
  region: string;
  area: string;
  type: string;
}

// --- Component ---
export default function SalesOrderForm() {
  const navigation = useNavigation();
  const theme = useTheme();
  const { user } = useAppStore();

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [isDealersLoading, setIsDealersLoading] = useState(true);
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [dealerModalVisible, setDealerModalVisible] = useState(false);
  const [dealerSearchQuery, setDealerSearchQuery] = useState('');

  const { control, handleSubmit, setValue, watch, formState: { errors, isSubmitting, isValid } } = useForm<SalesOrderFormValues>({
    resolver: zodResolver(SalesOrderSchema) as unknown as Resolver<SalesOrderFormValues, any>,
    mode: 'onChange',
    defaultValues: {
      dealerId: '',
      quantity: 0,
      unit: '',
      orderTotal: 0,
      advancePayment: 0,
      pendingPayment: 0,
      estimatedDelivery: new Date(),
      remarks: null,
    },
  });

  const [orderTotal, advancePayment, dealerId] = watch(['orderTotal', 'advancePayment', 'dealerId']);
  const estimatedDelivery = watch('estimatedDelivery');

  const filteredDealers = dealers.filter(d =>
    d.name.toLowerCase().includes(dealerSearchQuery.toLowerCase())
  );

  // Fetch all dealers on component mount
  useEffect(() => {
    const fetchAllDealers = async () => {
      try {
        setIsDealersLoading(true);
        const response = await fetch(`${BASE_URL}/api/dealers`);
        const result = await response.json();
        if (response.ok && result.success) {
          setDealers(result.data);
        } else {
          Alert.alert('Error', 'Failed to load dealers.');
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to fetch dealers.');
      } finally {
        setIsDealersLoading(false);
      }
    };
    fetchAllDealers();
  }, []);

  // Update selectedDealer and dependent fields when dealerId changes
  useEffect(() => {
    const dealer = dealers.find(d => d.id === dealerId) || null;
    setSelectedDealer(dealer);
  }, [dealerId, dealers]);

  // Automatically calculate pending payment
  useEffect(() => {
    const total = Number(orderTotal || 0);
    const advance = Number(advancePayment || 0);
    const pending = Math.max(0, total - advance);
    setValue('pendingPayment', pending);
  }, [orderTotal, advancePayment, setValue]);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setDatePickerVisible(Platform.OS === 'ios');
    if (event.type === 'dismissed' || !selectedDate) {
      setDatePickerVisible(false);
      return;
    }
    setValue('estimatedDelivery', selectedDate, { shouldValidate: true });
    setDatePickerVisible(false);
  };

  const submit = async (values: SalesOrderFormValues) => {
    try {
      const payload = {
        salesmanId: user?.id,
        dealerId: values.dealerId,
        quantity: String(values.quantity),
        unit: values.unit,
        orderTotal: String(values.orderTotal),
        advancePayment: String(values.advancePayment),
        pendingPayment: String(values.pendingPayment),
        estimatedDelivery: format(values.estimatedDelivery, 'yyyy-MM-dd'),
        remarks: values.remarks,
      };

      const response = await fetch(`${BASE_URL}/api/sales-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to submit sales order');

      Toast.show({ type: 'success', text1: 'Order Submitted', text2: 'The sales order has been sent.' });
      // @ts-ignore
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Submission Failed', error.message);
    }
  };

  return (
    <SafeAreaView style={[{ backgroundColor: theme.colors.background }, styles.container]} edges={['right', 'bottom', 'left']}>
      <AppHeader title="Create Sales Order" />
      <Portal>
        {/* Dealer Selection Modal */}
        <Modal visible={dealerModalVisible} onDismiss={() => setDealerModalVisible(false)} contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleLarge" style={styles.modalTitle}>Select Dealer</Text>
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
                      setValue('dealerId', d.id, { shouldValidate: true });
                      setDealerModalVisible(false);
                      setDealerSearchQuery('');
                    }}
                    style={styles.dealerListItem}
                  >
                    <Text style={styles.dealerListItemText}>{d.name} - {d.address}</Text>
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
      {datePickerVisible && (<DateTimePicker value={estimatedDelivery || new Date()} mode="date" display="default" onChange={onDateChange} />)}

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text variant="headlineSmall" style={styles.title}>Sales Order Details</Text>

        {/* Salesman Section (Display Only) */}
        <Text variant="titleMedium" style={styles.sectionHeader}>Salesman Details</Text>
        <View style={styles.row}>
          <View style={styles.inputFlex}>
            <TextInput label="Salesman Name" value={[user?.firstName, user?.lastName].filter(Boolean).join(" ")} disabled />
          </View>
          <View style={styles.inputFlex}>
            <TextInput label="Role" value={user?.role ?? ""} disabled />
          </View>
        </View>

        {/* Dealer Section */}
        <Text variant="titleMedium" style={styles.sectionHeader}>Dealer Details</Text>
        <Controller control={control} name="dealerId" render={({ field: { value } }) => (
          <View style={styles.inputContainer}>
            <TouchableOpacity onPress={() => setDealerModalVisible(true)} activeOpacity={0.7}>
              <TextInput
                label="Select Dealer *"
                value={selectedDealer?.name || ''}
                editable={false}
                mode="outlined"
                right={<TextInput.Icon icon="chevron-down" />}
                error={!!errors.dealerId}
              />
            </TouchableOpacity>
            {errors.dealerId && <HelperText type="error">{errors.dealerId.message}</HelperText>}
          </View>
        )} />

        <View style={styles.row}>
          <View style={styles.inputFlex}>
            <TextInput label="Dealer Type" value={selectedDealer?.type || ''} disabled />
          </View>
          <View style={styles.inputFlex}>
            <TextInput label="Dealer Phone" value={selectedDealer?.phoneNo || ''} disabled />
          </View>
        </View>
        <View style={styles.inputContainer}>
          <TextInput label="Dealer Address" value={selectedDealer?.address || ''} disabled multiline />
        </View>

        <View style={styles.row}>
          <View style={styles.inputFlex}>
            <TextInput label="Area" value={selectedDealer?.area || ''} disabled />
          </View>
          <View style={styles.inputFlex}>
            <TextInput label="Region" value={selectedDealer?.region || ''} disabled />
          </View>
        </View>

        {/* Order Details Section */}
        <Text variant="titleMedium" style={styles.sectionHeader}>Order Details</Text>
        <View style={styles.row}>
          <Controller name="quantity" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputFlex}><TextInput label="Quantity *" value={String(value || '')} onChangeText={(text) => onChange(parseFloat(text.replace(/[^0-9.]/g, '')) || 0)} onBlur={onBlur} error={!!errors.quantity} keyboardType="numeric" />{errors.quantity && <HelperText type="error">{errors.quantity.message}</HelperText>}</View>)} />
          <Controller control={control} name="unit" render={({ field: { onChange, value } }) => (
            <View style={styles.inputFlex}>
              <View style={[styles.pickerWrapper, { borderColor: errors.unit ? theme.colors.error : theme.colors.outline }]}>
                <RNPickerSelect onValueChange={onChange} value={value} items={UNITS.map(u => ({ label: u, value: u }))} placeholder={{ label: "Unit *", value: null }} style={{ inputIOS: styles.pickerInput, inputAndroid: styles.pickerInput, iconContainer: styles.pickerIcon, placeholder: styles.pickerPlaceholder, }} useNativeAndroidPickerStyle={false} Icon={() => <Icon name="chevron-down" size={24} color={theme.colors.onSurface} />} />
              </View>
              {errors.unit && <HelperText type="error">{errors.unit.message}</HelperText>}
            </View>
          )} />
        </View>
        <View style={styles.row}>
          <Controller name="orderTotal" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputFlex}><TextInput label="Order Total (₹) *" value={String(value || '')} onChangeText={(text) => onChange(parseFloat(text.replace(/[^0-9.]/g, '')) || 0)} onBlur={onBlur} error={!!errors.orderTotal} keyboardType="numeric" />{errors.orderTotal && <HelperText type="error">{errors.orderTotal.message}</HelperText>}</View>)} />
          <Controller name="advancePayment" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputFlex}><TextInput label="Advance (₹) *" value={String(value || '')} onChangeText={(text) => onChange(parseFloat(text.replace(/[^0-9.]/g, '')) || 0)} onBlur={onBlur} error={!!errors.advancePayment} keyboardType="numeric" />{errors.advancePayment && <HelperText type="error">{errors.advancePayment.message}</HelperText>}</View>)} />
          <Controller name="pendingPayment" control={control} render={({ field: { value } }) => (<View style={styles.inputFlex}><TextInput label="Pending (₹)" value={String(value || '')} disabled /></View>)} />
        </View>

        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
            <TextInput label="Estimated Delivery *" value={format(estimatedDelivery, "PPP")} editable={false} right={<TextInput.Icon icon="calendar-month" />} error={!!errors.estimatedDelivery} />
          </TouchableOpacity>
          {errors.estimatedDelivery && <HelperText type="error">{errors.estimatedDelivery.message as string}</HelperText>}
        </View>

        <Controller name="remarks" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputContainer}><TextInput label="Remarks (Optional)" value={value || ''} onChangeText={onChange} onBlur={onBlur} multiline /></View>)} />

        <Button mode="contained" onPress={handleSubmit(submit)} loading={isSubmitting} disabled={!isValid || isSubmitting} style={styles.button}>
          Submit & Send Order
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
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionHeader: {
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputFlex: {
    flex: 1,
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
