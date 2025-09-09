// src/pages/forms/SalesOrderForm.tsx
import React, { useEffect, useState } from 'react';
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

import { useAppStore, DEALER_TYPES, UNITS, REGIONS, AREAS } from '../../components/ReusableConstants';
import AppHeader from '../../components/AppHeader';
import Toast from 'react-native-toast-message';

// --- Zod Schema ---
const SalesOrderSchema = z.object({
  salesmanName: z.string().min(1, "Salesman name is required"),
  salesmanRole: z.string().min(1, "Salesman role is required"),
  dealerType: z.string().min(1, "Dealer type is required"),
  dealerName: z.string().min(1, "Dealer name is required"),
  dealerPhone: z.string().regex(/^\d{10}$/, "Must be a valid 10-digit phone number"),
  dealerAddress: z.string().min(1, "Dealer address is required"),
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

// --- Component ---
export default function SalesOrderForm() {
  const navigation = useNavigation();
  const { user } = useAppStore();

  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const { control, handleSubmit, setValue, watch, formState: { errors, isSubmitting, isValid } } = useForm<SalesOrderFormValues>({
    resolver: zodResolver(SalesOrderSchema) as unknown as Resolver<SalesOrderFormValues, any>,
    mode: 'onChange',
    defaultValues: {
      salesmanName: [user?.firstName, user?.lastName].filter(Boolean).join(" "),
      salesmanRole: user?.role ?? "",
      dealerType: '',
      dealerName: '',
      dealerPhone: '',
      dealerAddress: '',
      area: '',
      region: '',
      unit: '',
      estimatedDelivery: new Date(),
      remarks: '',
    },
  });

  const [orderTotal, advancePayment] = watch(['orderTotal', 'advancePayment']);
  const estimatedDelivery = watch('estimatedDelivery');

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
      // The payload structure from your web app is preserved
      const payload = {
        salesman: { name: values.salesmanName, role: values.salesmanRole, userId: user?.id ?? null },
        dealer: {
          type: values.dealerType, name: values.dealerName, phone: values.dealerPhone,
          address: values.dealerAddress, area: values.area, region: values.region,
        },
        details: {
          quantity: values.quantity, unit: values.unit,
          orderTotal: values.orderTotal, advancePayment: values.advancePayment,
          pendingPayment: values.pendingPayment,
          estimatedDelivery: format(values.estimatedDelivery, 'yyyy-MM-dd'),
          remarks: values.remarks || null,
        },
      };

      const response = await fetch('YOUR_API_ENDPOINT/api/sales-order/send', {
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
    <SafeAreaView className="flex-1 bg-slate-900" edges={['right', 'bottom', 'left']}>
      <AppHeader title="Create Sales Order" />
      {datePickerVisible && ( <DateTimePicker value={estimatedDelivery || new Date()} mode="date" display="default" onChange={onDateChange} /> )}

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text variant="headlineSmall" className="text-slate-200 font-bold text-center mb-6">Sales Order Details</Text>
        
        {/* Salesman Section */}
        <Text variant="titleMedium" className="text-slate-400 font-semibold mb-3">Salesman Details</Text>
        <View className="flex-row gap-4">
            <Controller name="salesmanName" control={control} render={({ field: { onChange, onBlur, value } }) => (
                <View className="flex-1 mb-4">
                    <TextInput label="Salesman Name *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.salesmanName} />
                    {/* FIX: Corrected JSX syntax */}
                    {errors.salesmanName && <HelperText type="error" visible>{errors.salesmanName.message}</HelperText>}
                </View>
            )} />
            <Controller name="salesmanRole" control={control} render={({ field: { onChange, onBlur, value } }) => (
                <View className="flex-1 mb-4">
                    <TextInput label="Role *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.salesmanRole} />
                    {/* FIX: Corrected JSX syntax */}
                    {errors.salesmanRole && <HelperText type="error" visible>{errors.salesmanRole.message}</HelperText>}
                </View>
            )} />
        </View>

        {/* Dealer Section */}
        <Text variant="titleMedium" className="text-slate-400 font-semibold mb-3">Dealer Details</Text>
        <Controller control={control} name="dealerType" render={({ field: { onChange, value } }) => (
            <View className="mb-4">
              <View className="p-3 bg-slate-800 rounded-lg border border-slate-600">
                  <RNPickerSelect onValueChange={onChange} value={value} items={DEALER_TYPES.map(t => ({ label: t, value: t }))} placeholder={{ label: "Select Dealer Type *", value: null }} style={{ inputIOS: { color: 'white' }, inputAndroid: { color: 'white' } }} useNativeAndroidPickerStyle={false} Icon={() => <Icon name="chevron-down" size={24} color="#94a3b8" />} />
              </View>
              {errors.dealerType && <HelperText type="error" visible>{errors.dealerType.message}</HelperText>}
            </View>
        )} />
        <Controller name="dealerName" control={control} render={({ field: { onChange, onBlur, value } }) => ( <View className="mb-4"><TextInput label="Dealer Name *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.dealerName} />{errors.dealerName && <HelperText type="error" visible>{errors.dealerName.message}</HelperText>}</View> )} />
        <Controller name="dealerPhone" control={control} render={({ field: { onChange, onBlur, value } }) => ( <View className="mb-4"><TextInput label="Dealer Phone No *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.dealerPhone} keyboardType="phone-pad" />{errors.dealerPhone && <HelperText type="error" visible>{errors.dealerPhone.message}</HelperText>}</View> )} />
        <Controller name="dealerAddress" control={control} render={({ field: { onChange, onBlur, value } }) => ( <View className="mb-4"><TextInput label="Dealer Address *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.dealerAddress} multiline />{errors.dealerAddress && <HelperText type="error" visible>{errors.dealerAddress.message}</HelperText>}</View> )} />

        <View className="flex-row gap-4">
            <Controller control={control} name="area" render={({ field: { onChange, value } }) => (
                <View className="flex-1 mb-4">
                    <View className="p-3 bg-slate-800 rounded-lg border border-slate-600"><RNPickerSelect onValueChange={onChange} value={value} items={AREAS.map(a => ({ label: a, value: a }))} placeholder={{ label: "Area *", value: null }} style={{ inputIOS: { color: 'white' }, inputAndroid: { color: 'white' } }} useNativeAndroidPickerStyle={false} Icon={() => <Icon name="chevron-down" size={24} color="#94a3b8" />} /></View>
                    {errors.area && <HelperText type="error" visible>{errors.area.message}</HelperText>}
                </View>
            )} />
            <Controller control={control} name="region" render={({ field: { onChange, value } }) => (
                <View className="flex-1 mb-4">
                    <View className="p-3 bg-slate-800 rounded-lg border border-slate-600"><RNPickerSelect onValueChange={onChange} value={value} items={REGIONS.map(r => ({ label: r, value: r }))} placeholder={{ label: "Region *", value: null }} style={{ inputIOS: { color: 'white' }, inputAndroid: { color: 'white' } }} useNativeAndroidPickerStyle={false} Icon={() => <Icon name="chevron-down" size={24} color="#94a3b8" />} /></View>
                    {errors.region && <HelperText type="error" visible>{errors.region.message}</HelperText>}
                </View>
            )} />
        </View>

        {/* Order Details Section */}
        <Text variant="titleMedium" className="text-slate-400 font-semibold mt-4 mb-3">Order Details</Text>
        <View className="flex-row gap-4">
            <Controller name="quantity" control={control} render={({ field: { onChange, onBlur, value } }) => ( <View className="flex-1 mb-4"><TextInput label="Quantity *" value={String(value || '')} onChangeText={onChange} onBlur={onBlur} error={!!errors.quantity} keyboardType="numeric" />{errors.quantity && <HelperText type="error" visible>{errors.quantity.message}</HelperText>}</View> )} />
            <Controller control={control} name="unit" render={({ field: { onChange, value } }) => (
                <View className="flex-1 mb-4">
                    <View className="p-3 bg-slate-800 rounded-lg border border-slate-600"><RNPickerSelect onValueChange={onChange} value={value} items={UNITS.map(u => ({ label: u, value: u }))} placeholder={{ label: "Unit *", value: null }} style={{ inputIOS: { color: 'white' }, inputAndroid: { color: 'white' } }} useNativeAndroidPickerStyle={false} Icon={() => <Icon name="chevron-down" size={24} color="#94a3b8" />} /></View>
                    {errors.unit && <HelperText type="error" visible>{errors.unit.message}</HelperText>}
                </View>
            )} />
        </View>
        <View className="flex-row gap-4">
             <Controller name="orderTotal" control={control} render={({ field: { onChange, onBlur, value } }) => ( <View className="flex-1 mb-4"><TextInput label="Order Total (₹) *" value={String(value || '')} onChangeText={onChange} onBlur={onBlur} error={!!errors.orderTotal} keyboardType="numeric" />{errors.orderTotal && <HelperText type="error" visible>{errors.orderTotal.message}</HelperText>}</View> )} />
             <Controller name="advancePayment" control={control} render={({ field: { onChange, onBlur, value } }) => ( <View className="flex-1 mb-4"><TextInput label="Advance (₹) *" value={String(value || '')} onChangeText={onChange} onBlur={onBlur} error={!!errors.advancePayment} keyboardType="numeric" />{errors.advancePayment && <HelperText type="error" visible>{errors.advancePayment.message}</HelperText>}</View> )} />
             <Controller name="pendingPayment" control={control} render={({ field: { value } }) => ( <View className="flex-1 mb-4"><TextInput label="Pending (₹)" value={String(value || '')} editable={false} /></View> )} />
        </View>

        <View className="mb-4">
            <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
                <TextInput label="Estimated Delivery *" value={format(estimatedDelivery, "PPP")} editable={false} right={<TextInput.Icon icon="calendar" />} error={!!errors.estimatedDelivery} />
            </TouchableOpacity>
            {errors.estimatedDelivery && <HelperText type="error" visible>{errors.estimatedDelivery.message as string}</HelperText>}
        </View>

        <Controller name="remarks" control={control} render={({ field: { onChange, onBlur, value } }) => ( <View className="mb-4"><TextInput label="Remarks (Optional)" value={value || ''} onChangeText={onChange} onBlur={onBlur} multiline /></View> )} />

        <Button mode="contained" onPress={handleSubmit(submit)} loading={isSubmitting} disabled={!isValid || isSubmitting} className="mt-4 p-1">
          Submit & Send Order
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}