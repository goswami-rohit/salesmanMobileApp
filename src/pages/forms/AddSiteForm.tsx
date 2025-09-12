// src/pages/forms/AddSiteHeader.tsx
import React, { useState } from 'react';
import {
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Button,
  TextInput,
  HelperText,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import RNPickerSelect from 'react-native-picker-select';

import AppHeader from '../../components/AppHeader';

// --- Zod Schema ---
const SiteSchema = z.object({
  name: z.string().min(1, 'Site name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Valid 6-digit pincode is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  contactPhone: z.string().regex(/^\d{10}$/, 'Valid 10-digit phone number is required'),
  contactEmail: z.string().email('Must be a valid email').optional().or(z.literal('')),
  siteType: z.string().min(1, 'Site type is required'),
  description: z.string().optional(),
});

type SiteFormValues = z.infer<typeof SiteSchema>;

// --- Constants ---
const SITE_TYPES = [
  'Industrial', 'Commercial', 'Residential', 'Construction', 'Manufacturing',
  'Warehouse', 'Office Complex', 'Retail', 'Other',
];

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry',
];

// --- Component ---
export default function AddSiteForm({ navigation }: any) {
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SiteFormValues>({
    resolver: zodResolver(SiteSchema) as unknown as Resolver<SiteFormValues, any>,
    mode: 'onChange',
    defaultValues: {
      name: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
      siteType: '',
      description: '',
    },
  });

  const submit = async (values: SiteFormValues) => {
    try {
      // TODO: API call to create site
      console.log('Creating site:', values);
      Alert.alert('Success', 'Site added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add site. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader title="Add New Site" />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.form}>
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>Site Details</Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>Enter the information for the new site.</Text>

          <Controller control={control} name="name" render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.fieldContainer}>
              <TextInput label="Site Name *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.name} mode="outlined" />
              {errors.name && <HelperText type="error">{errors.name.message}</HelperText>}
            </View>
          )} />

          <Controller control={control} name="address" render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.fieldContainer}>
              <TextInput label="Address *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.address} mode="outlined" multiline numberOfLines={3} />
              {errors.address && <HelperText type="error">{errors.address.message}</HelperText>}
            </View>
          )} />

          <View style={styles.row}>
            <Controller control={control} name="city" render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.halfWidth}>
                <TextInput label="City *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.city} mode="outlined" />
                {errors.city && <HelperText type="error">{errors.city.message}</HelperText>}
              </View>
            )} />

            <Controller control={control} name="state" render={({ field: { onChange, value } }) => (
              <View style={styles.halfWidth}>
                <View style={[styles.pickerWrapper, { backgroundColor: theme.colors.surface, borderColor: errors.state ? theme.colors.error : theme.colors.outlineVariant }]}>
                  <RNPickerSelect
                    onValueChange={onChange}
                    value={value}
                    items={STATES.map((s) => ({ label: s, value: s }))}
                    placeholder={{ label: "Select State *", value: "" }}
                    style={pickerSelectStyles(theme)}
                    Icon={() => <Icon name="chevron-down" size={24} color={theme.colors.onSurface} />}
                  />
                </View>
                {errors.state && <HelperText type="error">{errors.state.message}</HelperText>}
              </View>
            )} />
          </View>

          <View style={styles.row}>
            <Controller control={control} name="pincode" render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.halfWidth}>
                <TextInput label="Pincode *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.pincode} keyboardType="numeric" maxLength={6} mode="outlined" />
                {errors.pincode && <HelperText type="error">{errors.pincode.message}</HelperText>}
              </View>
            )} />
            <Controller control={control} name="siteType" render={({ field: { onChange, value } }) => (
              <View style={styles.halfWidth}>
                <View style={[styles.pickerWrapper, { backgroundColor: theme.colors.surface, borderColor: errors.siteType ? theme.colors.error : theme.colors.outlineVariant }]}>
                  <RNPickerSelect
                    onValueChange={onChange}
                    value={value}
                    items={SITE_TYPES.map((type) => ({ label: type, value: type }))}
                    placeholder={{ label: "Select Site Type *", value: "" }}
                    style={pickerSelectStyles(theme)}
                    Icon={() => <Icon name="chevron-down" size={24} color={theme.colors.onSurface} />}
                  />
                </View>
                {errors.siteType && <HelperText type="error">{errors.siteType.message}</HelperText>}
              </View>
            )} />
          </View>

          <Controller control={control} name="contactPerson" render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.fieldContainer}>
              <TextInput label="Contact Person *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.contactPerson} mode="outlined" />
              {errors.contactPerson && <HelperText type="error">{errors.contactPerson.message}</HelperText>}
            </View>
          )} />

          <View style={styles.row}>
            <Controller control={control} name="contactPhone" render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.halfWidth}>
                <TextInput label="Phone Number *" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.contactPhone} keyboardType="phone-pad" maxLength={10} mode="outlined" />
                {errors.contactPhone && <HelperText type="error">{errors.contactPhone.message}</HelperText>}
              </View>
            )} />
            <Controller control={control} name="contactEmail" render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.halfWidth}>
                <TextInput label="Email (Optional)" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.contactEmail} keyboardType="email-address" autoCapitalize="none" mode="outlined" />
                {errors.contactEmail && <HelperText type="error">{errors.contactEmail.message}</HelperText>}
              </View>
            )} />
          </View>

          <Controller control={control} name="description" render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.fieldContainer}>
              <TextInput label="Description (Optional)" value={value || ''} onChangeText={onChange} onBlur={onBlur} mode="outlined" multiline numberOfLines={3} />
            </View>
          )} />

          <Button
            mode="contained"
            onPress={handleSubmit(submit)}
            loading={isSubmitting}
            disabled={!isValid || isSubmitting}
            style={styles.submitButton}
          >
            Add Site
          </Button>
        </View>
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
  form: {
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  pickerWrapper: {
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  submitButton: {
    marginTop: 20,
    padding: 4,
    borderRadius: 8,
  },
});

const pickerSelectStyles = (theme: any) => ({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: theme.colors.onSurface,
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: theme.colors.onSurface,
  },
  placeholder: {
    color: theme.colors.onSurfaceVariant,
  },
  iconContainer: {
    top: 15,
    right: 15,
  },
});