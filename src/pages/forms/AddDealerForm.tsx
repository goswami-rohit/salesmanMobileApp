// src/pages/forms/AddDealer.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, View, TouchableOpacity, PermissionsAndroid, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { SubmitHandler, Resolver } from 'react-hook-form';
import { Text, Button, TextInput, Switch, Modal, Portal, Checkbox, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import RNPickerSelect from 'react-native-picker-select';
import Geolocation from 'react-native-geolocation-service';

import { useAppStore, DEALER_TYPES, BRANDS, FEEDBACKS, BASE_URL } from '../../components/ReusableConstants';
import AppHeader from '../../components/AppHeader';
import Toast from 'react-native-toast-message';

// --- Zod Schema for Validation (Corrected) ---
const DealerSchema = z.object({
  userId: z.number(),
  type: z.string().min(1, "Dealer type is required"),
  isSubDealer: z.boolean(),               // required boolean (use defaultValues to set false)
  parentDealerId: z.string().optional(),
  name: z.string().min(3, "Name must be at least 3 characters"),
  region: z.string().min(1, "Region is required"),
  area: z.string().min(2, "Area is required"),
  phoneNo: z.string().regex(/^\d{10}$/, "Must be a valid 10-digit phone number"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  totalPotential: z.coerce.number().positive("Must be a positive number"),
  bestPotential: z.coerce.number().positive("Must be a positive number"),
  brandSelling: z.array(z.string()).min(1, "Select at least one brand"),
  feedbacks: z.string().min(1, "Feedback is required"),
  remarks: z.string().optional(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
}).refine(data => !data.isSubDealer || (data.isSubDealer && data.parentDealerId), {
  message: "Parent dealer is required for sub-dealers",
  path: ["parentDealerId"],
});

type DealerFormValues = z.infer<typeof DealerSchema>;

// --- Component ---
export default function AddDealerForm() {
  const navigation = useNavigation();
  const { user, dealers } = useAppStore();

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [brandsModalVisible, setBrandsModalVisible] = useState(false);

  const { control, handleSubmit, setValue, watch, formState: { errors, isSubmitting, isValid } } = useForm<DealerFormValues>({
    resolver: zodResolver(DealerSchema) as unknown as Resolver<DealerFormValues, any>,
    mode: 'onChange',
    defaultValues: {
      userId: user?.id ?? 0,
      type: '',
      isSubDealer: false,
      parentDealerId: '',
      name: '',
      region: '',
      area: '',
      phoneNo: '',
      address: '',
      totalPotential: 0,
      bestPotential: 0,
      brandSelling: [] as string[],
      feedbacks: '',
      remarks: '',
      latitude: null,
      longitude: null,
    },
  });

  const isSubDealer = watch('isSubDealer');
  const brandSelling = watch('brandSelling');

  const useMyLocation = async () => {
    setIsLoadingLocation(true);
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Location access is required.');
          return;
        }
      }
      Geolocation.getCurrentPosition(
        (position) => {
          setValue('latitude', position.coords.latitude, { shouldValidate: true });
          setValue('longitude', position.coords.longitude, { shouldValidate: true });
          Toast.show({ type: 'success', text1: 'Location Captured' });
        },
        (error) => Alert.alert('Error', error.message),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (err) {
      console.warn(err);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const submit: SubmitHandler<DealerFormValues> = async (values) => {
    try {
      const payload = {
        ...values,
        parentDealerId: values.isSubDealer ? values.parentDealerId : null,
      };

      const response = await fetch(`${BASE_URL}/api/dealers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create dealer');

      Toast.show({
        type: 'success',
        text1: 'Dealer Created',
        text2: 'The new dealer has been saved.'
      });
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Submission Failed', error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['right', 'bottom', 'left']}>
      <AppHeader title="Add New Dealer" />
      <Portal>
        <Modal visible={brandsModalVisible} onDismiss={() => setBrandsModalVisible(false)} contentContainerStyle={{ backgroundColor: '#1e293b', padding: 20, margin: 20, borderRadius: 8 }}>
          <Text variant="titleLarge" className="text-slate-200 mb-2">Select Brands</Text>
          <ScrollView>
            {BRANDS.map(brand => (
              <Checkbox.Item
                key={brand}
                label={brand}
                status={brandSelling.includes(brand) ? 'checked' : 'unchecked'}
                onPress={() => {
                  const newBrands = brandSelling.includes(brand) ? brandSelling.filter(b => b !== brand) : [...brandSelling, brand];
                  setValue('brandSelling', newBrands, { shouldValidate: true });
                }}
                labelStyle={{ color: '#e5e7eb' }}
              />
            ))}
          </ScrollView>
          <Button onPress={() => setBrandsModalVisible(false)} className="mt-4">Done</Button>
        </Modal>
      </Portal>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text variant="headlineSmall" className="text-slate-200 font-bold text-center mb-1">Dealer Information</Text>
        <Text variant="bodyMedium" className="text-slate-400 text-center mb-6">Fill in the details for the new dealer.</Text>

        <Controller control={control} name="isSubDealer" render={({ field: { onChange, value } }) => (
          <View className="flex-row items-center justify-between p-3 bg-slate-800 rounded-lg mb-4">
            <Text className="text-slate-200">Is this a Sub-Dealer?</Text>
            <Switch value={value} onValueChange={onChange} />
          </View>
        )} />

        {isSubDealer && (
          <Controller control={control} name="parentDealerId" render={({ field: { onChange, value } }) => (
            <View className="mb-4">
              <View className="p-3 bg-slate-800 rounded-lg border border-slate-600">
                <RNPickerSelect
                  onValueChange={onChange}
                  value={value}
                  items={dealers.map(d => ({ label: d.name, value: String(d.id) }))}
                  placeholder={{ label: "Select Parent Dealer *", value: null }}
                  style={{ inputIOS: { color: 'white' }, inputAndroid: { color: 'white' } }}
                  useNativeAndroidPickerStyle={false}
                  Icon={() => <Icon name="chevron-down" size={24} color="#94a3b8" />}
                />
              </View>
              {errors.parentDealerId && <HelperText type="error">{errors.parentDealerId.message}</HelperText>}
            </View>
          )} />
        )}

        <Controller control={control} name="type" render={({ field: { onChange, value } }) => (
          <View className="mb-4">
            <View className="p-3 bg-slate-800 rounded-lg border border-slate-600">
              <RNPickerSelect onValueChange={onChange} value={value} items={DEALER_TYPES.map(t => ({ label: t, value: t }))} placeholder={{ label: "Select Dealer Type *", value: null }} style={{ inputIOS: { color: 'white' }, inputAndroid: { color: 'white' } }} useNativeAndroidPickerStyle={false} Icon={() => <Icon name="chevron-down" size={24} color="#94a3b8" />} />
            </View>
            {errors.type && <HelperText type="error">{errors.type.message}</HelperText>}
          </View>
        )} />

        <Controller control={control} name="name" render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4">
            <TextInput label="Dealer Name *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.name} />
            {errors.name && <HelperText type="error">{errors.name.message}</HelperText>}
          </View>
        )} />

        <View className="flex-row gap-4">
          <Controller
            control={control}
            name="region"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="flex-1 mb-4">
                <TextInput
                  label="Region *"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.region}
                />
                {errors.region && <HelperText type="error">{errors.region.message}</HelperText>}
              </View>
            )} />
          <Controller
            control={control}
            name="area"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="flex-1 mb-4">
                <TextInput
                  label="Area *"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.area}
                />
                {errors.area && <HelperText type="error">{errors.area.message}</HelperText>}
              </View>
            )} />
        </View>

        <Controller control={control} name="address" render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4">
            <TextInput label="Address *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.address} multiline numberOfLines={3} />
            {errors.address && <HelperText type="error">{errors.address.message}</HelperText>}
          </View>
        )} />

        <Controller control={control} name="phoneNo" render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4">
            <TextInput label="Phone No *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.phoneNo} keyboardType="phone-pad" />
            {errors.phoneNo && <HelperText type="error">{errors.phoneNo.message}</HelperText>}
          </View>
        )} />

        {/* --- Updated Geolocation Section --- */}
        <View className="flex-row gap-4">
          <Controller control={control} name="latitude" render={({ field: { value } }) => (<TextInput label="Latitude" value={value ? String(value) : ''} editable={false} className="flex-1 mb-4" />)} />
          <Controller control={control} name="longitude" render={({ field: { value } }) => (<TextInput label="Longitude" value={value ? String(value) : ''} editable={false} className="flex-1 mb-4" />)} />
        </View>
        <Button icon="crosshairs-gps" mode="outlined" onPress={useMyLocation} loading={isLoadingLocation} disabled={isLoadingLocation} className="mb-4">
          {isLoadingLocation ? 'Fetching Location...' : 'Use My Current Location'}
        </Button>
        {/* --- End Updated Section --- */}

        <View className="flex-row gap-4">
          <Controller control={control} name="totalPotential" render={({ field: { onChange, onBlur, value } }) => (
            <View className="flex-1 mb-4">
              <TextInput
                label="Total Potential *"
                value={String(value || '')}
                onChangeText={(text) => {
                  const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
                  onChange(isNaN(num) ? undefined : num);
                }}
                onBlur={onBlur}
                error={!!errors.totalPotential}
                keyboardType="numeric"
              />
              {errors.totalPotential && <HelperText type="error">{errors.totalPotential.message}</HelperText>}
            </View>
          )} />
          <Controller control={control} name="bestPotential" render={({ field: { onChange, onBlur, value } }) => (
            <View className="flex-1 mb-4">
              <TextInput
                label="Best Potential *"
                value={String(value || '')}
                onChangeText={(text) => {
                  const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
                  onChange(isNaN(num) ? undefined : num);
                }}
                onBlur={onBlur}
                error={!!errors.bestPotential}
                keyboardType="numeric"
              />
              {errors.bestPotential && <HelperText type="error">{errors.bestPotential.message}</HelperText>}
            </View>
          )} />
        </View>

        <TouchableOpacity onPress={() => setBrandsModalVisible(true)} className="mb-4">
          <TextInput label="Brands Selling *" editable={false} value={brandSelling.join(', ') || 'Select brands...'} error={!!errors.brandSelling} right={<TextInput.Icon icon="chevron-down" />} />
          {errors.brandSelling && <HelperText type="error">{errors.brandSelling.message}</HelperText>}
        </TouchableOpacity>

        <Controller control={control} name="feedbacks" render={({ field: { onChange, value } }) => (
          <View className="mb-4">
            <View className="p-3 bg-slate-800 rounded-lg border border-slate-600">
              <RNPickerSelect onValueChange={onChange} value={value} items={FEEDBACKS.map(f => ({ label: f, value: f }))} placeholder={{ label: "Select Feedback *", value: null }} style={{ inputIOS: { color: 'white' }, inputAndroid: { color: 'white' } }} useNativeAndroidPickerStyle={false} Icon={() => <Icon name="chevron-down" size={24} color="#94a3b8" />} />
            </View>
            {errors.feedbacks && <HelperText type="error">{errors.feedbacks.message}</HelperText>}
          </View>
        )} />

        <Controller control={control} name="remarks" render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4">
            <TextInput label="Remarks" value={value || ''} onChangeText={onChange} onBlur={onBlur} multiline numberOfLines={3} />
            {errors.remarks && <HelperText type="error">{errors.remarks.message}</HelperText>}
          </View>
        )} />

        <Button mode="contained" onPress={handleSubmit(submit)} loading={isSubmitting} disabled={!isValid || isSubmitting} className="mt-2 p-1">
          Save Dealer
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

