import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  TouchableOpacity,
  Platform,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { SubmitHandler, Resolver } from 'react-hook-form';
import { Text, Button, TextInput, Switch, Modal, Portal, Checkbox, HelperText, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import RNPickerSelect from 'react-native-picker-select';
import * as Location from 'expo-location';

import { useAppStore, DEALER_TYPES, BRANDS, FEEDBACKS, BASE_URL } from '../../components/ReusableConstants';
import AppHeader from '../../components/AppHeader';
import Toast from 'react-native-toast-message';

// --- Zod Schema to match the database table ---
const DealerSchema = z.object({
  userId: z.number(),
  type: z.string().min(1, "Dealer type is required"),
  isSubDealer: z.boolean(),
  parentDealerId: z.string().optional().nullable(),
  name: z.string().min(3, "Name must be at least 3 characters"),
  region: z.string().min(1, "Region is required"),
  area: z.string().min(2, "Area is required"),
  phoneNo: z.string().regex(/^\d{10}$/, "Must be a valid 10-digit phone number"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  pinCode: z.string().optional().nullable().refine(val => !val || /^\d{6}$/.test(val), {
    message: "Must be a 6-digit PIN code",
  }),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  dateOfBirth: z.string().optional().nullable().refine(val => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
    message: "Date must be in YYYY-MM-DD format",
  }),
  anniversaryDate: z.string().optional().nullable().refine(val => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
    message: "Date must be in YYYY-MM-DD format",
  }),
  totalPotential: z.coerce.number().min(0, "Must be a non-negative number"),
  bestPotential: z.coerce.number().min(0, "Must be a non-negative number"),
  brandSelling: z.array(z.string()).min(1, "Select at least one brand"),
  feedbacks: z.string().min(1, "Feedback is required"),
  remarks: z.string().optional(),
}).refine(data => !data.isSubDealer || (data.isSubDealer && data.parentDealerId), {
  message: "Parent dealer is required for sub-dealers",
  path: ["parentDealerId"],
});

type DealerFormValues = z.infer<typeof DealerSchema>;

export default function AddDealerForm() {
  const navigation = useNavigation();
  const { user } = useAppStore();
  const theme = useTheme();

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [brandsModalVisible, setBrandsModalVisible] = useState(false);
  const [dealersData, setDealersData] = useState<any[]>([]);
  const [isDealersLoading, setIsDealersLoading] = useState(true);
  const [dealerModalVisible, setDealerModalVisible] = useState(false);
  const [dealerSearchQuery, setDealerSearchQuery] = useState('');

  const { control, handleSubmit, setValue, watch, formState: { errors, isSubmitting, isValid } } = useForm<DealerFormValues>({
    resolver: zodResolver(DealerSchema) as unknown as Resolver<DealerFormValues, any>,
    mode: 'onChange',
    defaultValues: {
      userId: user?.id ?? 0,
      type: '',
      isSubDealer: false,
      parentDealerId: null,
      name: '',
      region: '',
      area: '',
      phoneNo: '',
      address: '',
      pinCode: null,
      latitude: null,
      longitude: null,
      dateOfBirth: null,
      anniversaryDate: null,
      totalPotential: 0,
      bestPotential: 0,
      brandSelling: [] as string[],
      feedbacks: '',
      remarks: '',
    },
  });

  const isSubDealer = watch('isSubDealer');
  const brandSelling = watch('brandSelling');
  const parentDealerId = watch('parentDealerId');

  const selectedParentDealerName = dealersData.find(d => d.id === parentDealerId)?.name || '';

  const filteredDealers = dealersData.filter(d =>
    d.name.toLowerCase().includes(dealerSearchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchDealers = async () => {
      try {
        setIsDealersLoading(true);
        const response = await fetch(`${BASE_URL}/api/dealers`);
        const result = await response.json();
        if (response.ok && result.success) {
          setDealersData(result.data);
        } else {
          Alert.alert('Error', 'Failed to load dealers.');
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to fetch dealers.');
      } finally {
        setIsDealersLoading(false);
      }
    };
    fetchDealers();
  }, [user?.id]);


  const useMyLocation = async () => {
    setIsLoadingLocation(true);
    try {
      if (Platform.OS === 'android') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location access is required.');
          setIsLoadingLocation(false);
          return;
        }
      }
      const position = await Location.getCurrentPositionAsync({});

      setValue('latitude', position.coords.latitude, { shouldValidate: true });
      setValue('longitude', position.coords.longitude, { shouldValidate: true });
      Toast.show({ type: 'success', text1: 'Location Captured' });
    } catch (err: any) {
      console.warn(err);
      Alert.alert('Error', err.message || 'Could not fetch location');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const submit: SubmitHandler<DealerFormValues> = async (values) => {
    try {
      const payload = {
        userId: values.userId,
        type: values.type,
        parentDealerId: values.isSubDealer ? values.parentDealerId || null : null,
        name: values.name,
        region: values.region,
        area: values.area,
        phoneNo: values.phoneNo,
        address: values.address,
        pinCode: values.pinCode || null,
        latitude: values.latitude !== null && values.latitude !== undefined ? String(values.latitude) : null,
        longitude: values.longitude !== null && values.longitude !== undefined ? String(values.longitude) : null,
        dateOfBirth: values.dateOfBirth || null,
        anniversaryDate: values.anniversaryDate || null,
        totalPotential: String(values.totalPotential),
        bestPotential: String(values.bestPotential),
        brandSelling: values.brandSelling,
        feedbacks: values.feedbacks,
        remarks: values.remarks || null,
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
      // @ts-ignore
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Submission Failed', error?.message || String(error));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['right', 'bottom', 'left']}>
      <AppHeader title="Add New Dealer" />
      <Portal>
        {/* Brands Modal */}
        <Modal visible={brandsModalVisible} onDismiss={() => setBrandsModalVisible(false)} contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Select Brands</Text>
          <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={{ paddingBottom: 8 }}>
            {BRANDS.map(brand => (
              <Checkbox.Item
                key={brand}
                label={brand}
                status={brandSelling?.includes(brand) ? 'checked' : 'unchecked'}
                onPress={() => {
                  const newBrands = brandSelling?.includes(brand) ? brandSelling.filter((b: string) => b !== brand) : [...(brandSelling || []), brand];
                  setValue('brandSelling', newBrands, { shouldValidate: true });
                }}
                labelStyle={[styles.checkboxLabel, { color: theme.colors.onSurface }]}
                position="leading"
                style={styles.checkboxItem}
                color={theme.colors.primary}
              />
            ))}
          </ScrollView>
          <Button mode="contained" onPress={() => setBrandsModalVisible(false)} style={styles.doneButton}>Done</Button>
        </Modal>

        {/* Dealer Selection Modal for Parent Dealer */}
        <Modal visible={dealerModalVisible} onDismiss={() => setDealerModalVisible(false)} contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleLarge" style={styles.modalTitle}>Select Parent Dealer</Text>
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
                      setValue('parentDealerId', d.id, { shouldValidate: true });
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
      </Portal>

      <ScrollView contentContainerStyle={styles.formWrapper} keyboardShouldPersistTaps="handled">
        <Text variant="headlineSmall" style={[styles.heading, { color: theme.colors.onSurface }]}>Dealer Information</Text>
        <Text variant="bodyMedium" style={[styles.subHeading, { color: theme.colors.onSurfaceVariant }]}>Fill in the details for the new dealer.</Text>

        <Controller control={control} name="isSubDealer" render={({ field: { onChange, value } }) => (
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>Is this a Sub-Dealer?</Text>
            <Switch value={value} onValueChange={onChange} color={theme.colors.primary} />
          </View>
        )} />

        {isSubDealer && (
          <Controller control={control} name="parentDealerId" render={({ field: { value } }) => (
            <View style={styles.field}>
              <TouchableOpacity onPress={() => setDealerModalVisible(true)} activeOpacity={0.7}>
                <TextInput
                  label="Select Parent Dealer *"
                  value={selectedParentDealerName}
                  editable={false}
                  mode="outlined"
                  right={<TextInput.Icon icon="chevron-down" />}
                  error={!!errors.parentDealerId}
                />
              </TouchableOpacity>
              {errors.parentDealerId && <HelperText type="error">{errors.parentDealerId.message}</HelperText>}
            </View>
          )} />
        )}

        <Controller control={control} name="type" render={({ field: { onChange, value } }) => (
          <View style={styles.field}>
            <View style={[styles.pickerWrapper, { backgroundColor: theme.colors.surface, borderColor: errors.type ? theme.colors.error : theme.colors.outlineVariant }]}>
              <RNPickerSelect
                onValueChange={onChange}
                value={value}
                items={DEALER_TYPES.map(t => ({ label: t, value: t }))}
                placeholder={{ label: "Select Dealer Type *", value: null }}
                style={pickerSelectStyles(theme)}
                useNativeAndroidPickerStyle={false}
                Icon={() => <Icon name="chevron-down" size={24} color={theme.colors.onSurface} />}
              />
            </View>
            {errors.type && <HelperText type="error">{errors.type.message}</HelperText>}
          </View>
        )} />

        <Controller control={control} name="name" render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.field}>
            <TextInput label="Dealer Name *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.name} mode="outlined" />
            {errors.name && <HelperText type="error">{errors.name.message}</HelperText>}
          </View>
        )} />

        <View style={styles.row}>
          <Controller control={control} name="region" render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.halfField}>
              <TextInput label="Region *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.region} mode="outlined" />
              {errors.region && <HelperText type="error">{errors.region.message}</HelperText>}
            </View>
          )} />
          <Controller control={control} name="area" render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.halfField}>
              <TextInput label="Area *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.area} mode="outlined" />
              {errors.area && <HelperText type="error">{errors.area.message}</HelperText>}
            </View>
          )} />
        </View>

        <Controller control={control} name="address" render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.field}>
            <TextInput label="Address *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.address} mode="outlined" multiline numberOfLines={3} />
            {errors.address && <HelperText type="error">{errors.address.message}</HelperText>}
          </View>
        )} />

        <Controller control={control} name="phoneNo" render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.field}>
            <TextInput label="Phone No *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.phoneNo} keyboardType="phone-pad" mode="outlined" />
            {errors.phoneNo && <HelperText type="error">{errors.phoneNo.message}</HelperText>}
          </View>
        )} />

        <Controller control={control} name="pinCode" render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.field}>
            <TextInput label="PIN Code" value={value || ''} onChangeText={onChange} onBlur={onBlur} error={!!errors.pinCode} keyboardType="numeric" mode="outlined" />
            {errors.pinCode && <HelperText type="error">{errors.pinCode.message}</HelperText>}
          </View>
        )} />

        <View style={styles.row}>
          <Controller control={control} name="latitude" render={({ field: { value } }) => (
            <TextInput label="Latitude" value={value !== null && value !== undefined ? String(value) : ''} editable={false} style={styles.flexInput} mode="outlined" />
          )} />
          <Controller control={control} name="longitude" render={({ field: { value } }) => (
            <TextInput label="Longitude" value={value !== null && value !== undefined ? String(value) : ''} editable={false} style={styles.flexInput} mode="outlined" />
          )} />
        </View>
        <Button icon="crosshairs-gps" mode="outlined" onPress={useMyLocation} loading={isLoadingLocation} disabled={isLoadingLocation} style={styles.locButton}>
          {isLoadingLocation ? 'Fetching Location...' : 'Use My Current Location'}
        </Button>

        <View style={styles.row}>
          <Controller control={control} name="dateOfBirth" render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.halfField}>
              <TextInput label="Date of Birth (YYYY-MM-DD)" value={value || ''} onChangeText={onChange} onBlur={onBlur} error={!!errors.dateOfBirth} mode="outlined" />
              {errors.dateOfBirth && <HelperText type="error">{errors.dateOfBirth.message}</HelperText>}
            </View>
          )} />
          <Controller control={control} name="anniversaryDate" render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.halfField}>
              <TextInput label="Anniversary Date (YYYY-MM-DD)" value={value || ''} onChangeText={onChange} onBlur={onBlur} error={!!errors.anniversaryDate} mode="outlined" />
              {errors.anniversaryDate && <HelperText type="error">{errors.anniversaryDate.message}</HelperText>}
            </View>
          )} />
        </View>

        <View style={styles.row}>
          <Controller control={control} name="totalPotential" render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.halfField}>
              <TextInput
                label="Total Potential *"
                value={value !== undefined && value !== null ? String(value) : ''}
                onChangeText={(text) => {
                  const num = parseFloat(text.replace(/[^0-9.]/g, ''));
                  onChange(isNaN(num) ? undefined : num);
                }}
                onBlur={onBlur}
                error={!!errors.totalPotential}
                keyboardType="numeric"
                mode="outlined"
              />
              {errors.totalPotential && <HelperText type="error">{errors.totalPotential.message}</HelperText>}
            </View>
          )} />
          <Controller control={control} name="bestPotential" render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.halfField}>
              <TextInput
                label="Best Potential *"
                value={value !== undefined && value !== null ? String(value) : ''}
                onChangeText={(text) => {
                  const num = parseFloat(text.replace(/[^0-9.]/g, ''));
                  onChange(isNaN(num) ? undefined : num);
                }}
                onBlur={onBlur}
                error={!!errors.bestPotential}
                keyboardType="numeric"
                mode="outlined"
              />
              {errors.bestPotential && <HelperText type="error">{errors.bestPotential.message}</HelperText>}
            </View>
          )} />
        </View>

        <TouchableOpacity onPress={() => setBrandsModalVisible(true)}>
          <TextInput label="Brands Selling *" editable={false} value={brandSelling?.join(', ') || 'Select brands...'} mode="outlined" right={<TextInput.Icon icon="chevron-down" />} />
        </TouchableOpacity>
        {errors.brandSelling && <HelperText type="error">{errors.brandSelling.message}</HelperText>}

        <Controller control={control} name="feedbacks" render={({ field: { onChange, value } }) => (
          <View style={styles.field}>
            <View style={[styles.pickerWrapper, { backgroundColor: theme.colors.surface, borderColor: errors.feedbacks ? theme.colors.error : theme.colors.outlineVariant }]}>
              <RNPickerSelect
                onValueChange={onChange}
                value={value}
                items={FEEDBACKS.map(f => ({ label: f, value: f }))}
                placeholder={{ label: "Select Feedback *", value: null }}
                style={pickerSelectStyles(theme)}
                useNativeAndroidPickerStyle={false}
                Icon={() => <Icon name="chevron-down" size={24} color={theme.colors.onSurface} />}
              />
            </View>
            {errors.feedbacks && <HelperText type="error">{errors.feedbacks.message}</HelperText>}
          </View>
        )} />

        <Controller control={control} name="remarks" render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.field}>
            <TextInput label="Remarks" value={value || ''} onChangeText={onChange} onBlur={onBlur} multiline numberOfLines={3} mode="outlined" />
            {errors.remarks && <HelperText type="error">{errors.remarks.message}</HelperText>}
          </View>
        )} />

        <Button mode="contained" onPress={handleSubmit(submit)} loading={isSubmitting} disabled={!isValid || isSubmitting} style={styles.saveButton}>
          Save Dealer
        </Button>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formWrapper: {
    padding: 16,
    paddingBottom: 40,
  },
  heading: {
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 4,
  },
  subHeading: {
    textAlign: 'center',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  field: {
    marginBottom: 12,
  },
  halfField: {
    flex: 1,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
  },
  pickerWrapper: {
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: Platform.OS === 'android' ? 6 : 8,
    paddingHorizontal: 12,
  },
  modalContainer: {
    padding: 18,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 8,
  },
  doneButton: {
    marginTop: 12,
  },
  checkboxLabel: {
    fontSize: 14,
  },
  checkboxItem: {
    borderRadius: 6,
    marginVertical: 2,
  },
  locButton: {
    marginBottom: 12,
  },
  flexInput: {
    flex: 1,
  },
  saveButton: {
    marginTop: 8,
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
});

const pickerSelectStyles = (theme: any) => ({
  inputIOS: {
    color: theme.colors.onSurface,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  inputAndroid: {
    color: theme.colors.onSurface,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  placeholder: {
    color: theme.colors.onSurfaceVariant,
  },
  iconContainer: {
    top: 10,
    right: 12,
  },
});
