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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface DailyTaskFormData {
  userId: number;
  assignedByUserId: number;
  taskDate: string;
  visitType: string;
  relatedDealerId?: string;
  siteName?: string;
  description?: string;
  pjpId?: string;
}

export default function DailyTasksForm({ navigation }: any) {
  const [formData, setFormData] = useState<DailyTaskFormData>({
    userId: 1,
    assignedByUserId: 1,
    taskDate: new Date().toISOString().split('T')[0],
    visitType: '',
    relatedDealerId: '',
    siteName: '',
    description: '',
    pjpId: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({
        ...formData,
        taskDate: selectedDate.toISOString().split('T')[0],
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.taskDate || !formData.visitType) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: API call to create daily task
      console.log('Creating daily task:', formData);
      Alert.alert('Success', 'Daily task created successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create daily task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#06b6d4" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Daily Task</Text>
      </View>

      <View style={styles.form}>
        {/* Task Date */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Task Date *</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {new Date(formData.taskDate).toLocaleDateString()}
            </Text>
            <Ionicons name="calendar" size={20} color="#06b6d4" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={new Date(formData.taskDate)}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

        {/* Visit Type */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Visit Type *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.visitType}
              onValueChange={(value) =>
                setFormData({ ...formData, visitType: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="Select visit type" value="" />
              {visitTypes.map((type) => (
                <Picker.Item key={type} label={type} value={type} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Related Dealer */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Related Dealer</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.relatedDealerId}
              onValueChange={(value) =>
                setFormData({ ...formData, relatedDealerId: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="Select dealer (optional)" value="" />
              {dealers.map((dealer: any) => (
                <Picker.Item key={dealer.id} label={dealer.name} value={dealer.id} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Site Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Site Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter site name"
            value={formData.siteName}
            onChangeText={(text) => setFormData({ ...formData, siteName: text })}
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* PJP Reference */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>PJP Reference</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.pjpId}
              onValueChange={(value) =>
                setFormData({ ...formData, pjpId: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="Select PJP (optional)" value="" />
              {pjps.map((pjp: any) => (
                <Picker.Item key={pjp.id} label={pjp.name} value={pjp.id} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Description */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Enter task description"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* Submit Button */}
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
              <Text style={styles.submitButtonText}>Create Task</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  form: {
    padding: 20,
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
    height: 100,
    textAlignVertical: 'top',
  },
  dateInput: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    color: '#ffffff',
    fontSize: 16,
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