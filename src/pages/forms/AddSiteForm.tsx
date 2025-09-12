import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

interface SiteFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  siteType: string;
  description: string;
}

export default function AddSiteForm({ navigation }: any) {
  const [formData, setFormData] = useState<SiteFormData>({
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
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<SiteFormData>>({});

  const siteTypes = [
    'Industrial',
    'Commercial',
    'Residential',
    'Construction',
    'Manufacturing',
    'Warehouse',
    'Office Complex',
    'Retail',
    'Other',
  ];

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry',
  ];

  const updateFormData = (field: keyof SiteFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const validateForm = () => {
    const newErrors: Partial<SiteFormData> = {};

    if (!formData.name.trim()) newErrors.name = 'Site name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.pincode.trim() || formData.pincode.length < 6) {
      newErrors.pincode = 'Valid pincode is required';
    }
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
    if (!formData.contactPhone.trim() || formData.contactPhone.length < 10) {
      newErrors.contactPhone = 'Valid phone number is required';
    }
    if (!formData.siteType) newErrors.siteType = 'Site type is required';
    
    if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Valid email is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fix the errors and try again');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: API call to create site
      console.log('Creating site:', formData);
      Alert.alert('Success', 'Site added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add site. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    field: keyof SiteFormData,
    placeholder: string,
    options?: {
      multiline?: boolean;
      keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'email-address';
      autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
      maxLength?: number;
    }
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>
        {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
        {['name', 'address', 'city', 'state', 'pincode', 'contactPerson', 'contactPhone', 'siteType'].includes(field) && ' *'}
      </Text>
      <TextInput
        style={[
          styles.textInput,
          options?.multiline && styles.textArea,
          errors[field] && styles.inputError
        ]}
        placeholder={placeholder}
        value={formData[field]}
        onChangeText={(text) => updateFormData(field, text)}
        placeholderTextColor="#94a3b8"
        multiline={options?.multiline}
        numberOfLines={options?.multiline ? 3 : 1}
        keyboardType={options?.keyboardType || 'default'}
        autoCapitalize={options?.autoCapitalize || 'sentences'}
        maxLength={options?.maxLength}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  const renderPicker = (field: keyof SiteFormData, items: string[], placeholder: string) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>
        {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} *
      </Text>
      <View style={[styles.pickerContainer, errors[field] && styles.inputError]}>
        <Picker
          selectedValue={formData[field]}
          onValueChange={(value) => updateFormData(field, value)}
          style={styles.picker}
        >
          <Picker.Item label={placeholder} value="" />
          {items.map((item) => (
            <Picker.Item key={item} label={item} value={item} />
          ))}
        </Picker>
      </View>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#06b6d4" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Ionicons name="location" size={24} color="#06b6d4" />
          <Text style={styles.title}>Add New Site</Text>
        </View>
      </View>

      <View style={styles.form}>
        {renderInput('name', 'Enter site name')}
        
        {renderInput('address', 'Enter complete address', { multiline: true })}
        
        <View style={styles.row}>
          <View style={styles.halfWidth}>
            {renderInput('city', 'Enter city')}
          </View>
          <View style={styles.halfWidth}>
            {renderPicker('state', states, 'Select state')}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            {renderInput('pincode', 'Enter pincode', { 
              keyboardType: 'numeric', 
              maxLength: 6 
            })}
          </View>
          <View style={styles.halfWidth}>
            {renderPicker('siteType', siteTypes, 'Select site type')}
          </View>
        </View>

        {renderInput('contactPerson', 'Enter contact person name')}

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            {renderInput('contactPhone', 'Enter phone number', { 
              keyboardType: 'phone-pad' 
            })}
          </View>
          <View style={styles.halfWidth}>
            {renderInput('contactEmail', 'Enter email address', { 
              keyboardType: 'email-address',
              autoCapitalize: 'none'
            })}
          </View>
        </View>

        {renderInput('description', 'Enter site description (optional)', { 
          multiline: true 
        })}

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
              <Text style={styles.submitButtonText}>Add Site</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(6, 182, 212, 0.2)',
  },
  backButton: {
    marginRight: 15,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  form: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  halfWidth: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    borderRadius: 12,
    padding: 15,
    color: '#ffffff',
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    color: '#ffffff',
    backgroundColor: 'transparent',
  },
  inputError: {
    borderColor: 'rgba(239, 68, 68, 0.8)',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#06b6d4',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});