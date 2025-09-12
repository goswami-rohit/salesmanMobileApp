// src/pages/forms/SalesOrderForm.tsx
import React, { useEffect, useState } from 'react';
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

import { useAppStore, DEALER_TYPES, UNITS, fetchRegions, fetchAreas, BASE_URL } from '../../components/ReusableConstants';
import AppHeader from '../../components/AppHeader';
import Toast from 'react-native-toast-message';

// --- Zod Schema (Updated) ---
const SalesOrderSchema = z.object({
  salesmanName: z.string().min(1, "Salesman name is required"),
  salesmanRole: z.string().min(1, "Salesman role is required"),
  dealerType: z.string().min(1, "Dealer type is required"),
  // FIX: dealerName is now dynamic, so we just need its ID
  dealerId: z.string().min(1, "Dealer is required"),
  dealerName: z.string().optional(),
  // FIX: Dealer phone and address are removed from user input and made optional in the form
  dealerPhone: z.string().optional(),
  dealerAddress: z.string().optional(),
  area: z.string().min(1, "Area is required"),
  region: z.string().min(1, "Region is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  orderTotal: z.coerce.number().positive("Order total must be positive"),
  advancePayment: z.coerce.number().min(0, "Advance cannot be negative"),
  pendingPayment: z.coerce.number().min(0),
  estimatedDelivery: z.date(),
  remarks: z.string().optional(),
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
  // FIX: Fetch dealers from API
  const [dealers, setDealers] = useState<Dealer[]>([]);
  // FIX: Use separate state for selected dealer to populate fields
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);

  const { control, handleSubmit, setValue, watch, formState: { errors, isSubmitting, isValid } } = useForm<SalesOrderFormValues>({
    resolver: zodResolver(SalesOrderSchema) as unknown as Resolver<SalesOrderFormValues, any>,
    mode: 'onChange',
    defaultValues: {
      salesmanName: [user?.firstName, user?.lastName].filter(Boolean).join(" "),
      salesmanRole: user?.role ?? "",
      dealerType: '',
      dealerId: '',
      area: '',
      region: '',
      unit: '',
      estimatedDelivery: new Date(),
      remarks: '',
    },
  });

  const [orderTotal, advancePayment] = watch(['orderTotal', 'advancePayment']);
  const estimatedDelivery = watch('estimatedDelivery');

  // FIX: Fetch all dealers on component mount
  useEffect(() => {
    const fetchAllDealers = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/dealers`);
        const result = await response.json();
        if (response.ok && result.success) {
          setDealers(result.data);
        } else {
          console.error("Failed to fetch dealers:", result.error);
        }
      } catch (err) {
        console.error("Failed to fetch dealers:", err);
      }
    };
    fetchAllDealers();
  }, []);

  // Automatically populate dealer details when a dealer is selected
  useEffect(() => {
    if (selectedDealer) {
      setValue('dealerType', selectedDealer.type, { shouldValidate: true });
      setValue('area', selectedDealer.area, { shouldValidate: true });
      setValue('region', selectedDealer.region, { shouldValidate: true });
      setValue('dealerPhone', selectedDealer.phoneNo);
      setValue('dealerAddress', selectedDealer.address);
    }
  }, [selectedDealer, setValue]);

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
      // The payload structure is updated for the new form fields
      const payload = {
        salesmanName: values.salesmanName,
        salesmanRole: values.salesmanRole,
        dealerType: values.dealerType,
        dealerName: selectedDealer?.name,
        dealerPhone: selectedDealer?.phoneNo,
        dealerAddress: selectedDealer?.address,
        area: values.area,
        region: values.region,
        quantity: values.quantity,
        unit: values.unit,
        orderTotal: values.orderTotal,
        advancePayment: values.advancePayment,
        pendingPayment: values.pendingPayment,
        estimatedDelivery: format(values.estimatedDelivery, 'yyyy-MM-dd'),
        remarks: values.remarks || null,
        userId: user?.id ?? null,
      };

      const response = await fetch(`${BASE_URL}/api/sales-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to submit sales order');

      Toast.show({ type: 'success', text1: 'Order Submitted', text2: 'The sales order has been sent.' });
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Submission Failed', error.message);
    }
  };

  return (
    <SafeAreaView style={[{ backgroundColor: theme.colors.background }, styles.container]} edges={['right', 'bottom', 'left']}>
      <AppHeader title="Create Sales Order" />
      {datePickerVisible && (<DateTimePicker value={estimatedDelivery || new Date()} mode="date" display="default" onChange={onDateChange} />)}

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text variant="headlineSmall" style={styles.title}>Sales Order Details</Text>

        {/* Salesman Section */}
        <Text variant="titleMedium" style={styles.sectionHeader}>Salesman Details</Text>
        <View style={styles.row}>
          <Controller name="salesmanName" control={control} render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.inputFlex}>
              <TextInput label="Salesman Name *" value={value} disabled />
              {errors.salesmanName && <HelperText type="error">{errors.salesmanName.message}</HelperText>}
            </View>
          )} />
          <Controller name="salesmanRole" control={control} render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.inputFlex}>
              <TextInput label="Role *" value={value} disabled />
              {errors.salesmanRole && <HelperText type="error">{errors.salesmanRole.message}</HelperText>}
            </View>
          )} />
        </View>

        {/* Dealer Section */}
        <Text variant="titleMedium" style={styles.sectionHeader}>Dealer Details</Text>
        <Controller control={control} name="dealerId" render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <View style={[styles.pickerWrapper, { borderColor: errors.dealerId ? theme.colors.error : theme.colors.outline }]}>
              <RNPickerSelect 
                onValueChange={(dealerId) => {
                  onChange(dealerId);
                  const dealer = dealers.find(d => d.id === dealerId) || null;
                  setSelectedDealer(dealer);
                }} 
                value={value} 
                items={dealers.map(d => ({ label: d.name, value: d.id }))} 
                placeholder={{ label: "Select Dealer *", value: null }} 
                style={{ inputIOS: styles.pickerInput, inputAndroid: styles.pickerInput, iconContainer: styles.pickerIcon, placeholder: styles.pickerPlaceholder, }} 
                useNativeAndroidPickerStyle={false} 
                Icon={() => <Icon name="chevron-down" size={24} color={theme.colors.onSurface} />} 
              />
            </View>
            {errors.dealerId && <HelperText type="error">{errors.dealerId.message}</HelperText>}
          </View>
        )} />
        
        {/* FIX: These fields are now read-only */}
        <Controller name="dealerType" control={control} render={({ field: { value } }) => (
          <View style={styles.inputContainer}>
            <TextInput label="Dealer Type *" value={value} disabled />
          </View>
        )} />
        <Controller name="dealerPhone" control={control} render={({ field: { value } }) => (
          <View style={styles.inputContainer}>
            <TextInput label="Dealer Phone No" value={value} disabled />
          </View>
        )} />
        <Controller name="dealerAddress" control={control} render={({ field: { value } }) => (
          <View style={styles.inputContainer}>
            <TextInput label="Dealer Address" value={value} disabled multiline />
          </View>
        )} />

        <View style={styles.row}>
          <Controller control={control} name="area" render={({ field: { value } }) => (
            <View style={styles.inputFlex}>
              <TextInput label="Area *" value={value} disabled />
              {errors.area && <HelperText type="error">{errors.area.message}</HelperText>}
            </View>
          )} />
          <Controller control={control} name="region" render={({ field: { value } }) => (
            <View style={styles.inputFlex}>
              <TextInput label="Region *" value={value} disabled />
              {errors.region && <HelperText type="error">{errors.region.message}</HelperText>}
            </View>
          )} />
        </View>

        {/* Order Details Section */}
        <Text variant="titleMedium" style={styles.sectionHeader}>Order Details</Text>
        <View style={styles.row}>
          <Controller name="quantity" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputFlex}><TextInput label="Quantity *" value={String(value || '')} onChangeText={onChange} onBlur={onBlur} error={!!errors.quantity} keyboardType="numeric" />{errors.quantity && <HelperText type="error">{errors.quantity.message}</HelperText>}</View>)} />
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
          <Controller name="orderTotal" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputFlex}><TextInput label="Order Total (₹) *" value={String(value || '')} onChangeText={onChange} onBlur={onBlur} error={!!errors.orderTotal} keyboardType="numeric" />{errors.orderTotal && <HelperText type="error">{errors.orderTotal.message}</HelperText>}</View>)} />
          <Controller name="advancePayment" control={control} render={({ field: { onChange, onBlur, value } }) => (<View style={styles.inputFlex}><TextInput label="Advance (₹) *" value={String(value || '')} onChangeText={onChange} onBlur={onBlur} error={!!errors.advancePayment} keyboardType="numeric" />{errors.advancePayment && <HelperText type="error">{errors.advancePayment.message}</HelperText>}</View>)} />
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
});