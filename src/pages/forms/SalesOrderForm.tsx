// src/pages/forms/SalesOrderForm.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, TextInput, useTheme, Menu } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import AppHeader from '../../components/AppHeader';
import { DEALER_TYPES, UNITS, REGIONS, AREAS } from '../../components/ReusableConstants';
import { createSalesOrder } from '../../backendConnections/apiServices'; // Import the service function

// Placeholder type for user data (in a real app, from context/global state)
type UserLite = { id?: number; firstName?: string; lastName?: string; role?: string; };

export default function SalesOrderForm() {
  const navigation = useNavigation();
  const theme = useTheme();

  // In a real app, user info would come from a global state/context, not hardcoded.
  const [currentUser] = useState<UserLite>({ id: 1, firstName: 'John', lastName: 'Doe', role: 'Sales Executive' });

  // --- State Management ---
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [salesmanName, setSalesmanName] = useState(`${currentUser.firstName} ${currentUser.lastName}`);
  const [salesmanRole, setSalesmanRole] = useState(currentUser.role || "");
  const [dealerType, setDealerType] = useState("");
  const [dealerName, setDealerName] = useState("");
  const [dealerPhone, setDealerPhone] = useState("");
  const [dealerAddress, setDealerAddress] = useState("");
  const [area, setArea] = useState("");
  const [region, setRegion] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [orderTotal, setOrderTotal] = useState("");
  const [advancePayment, setAdvancePayment] = useState("");
  const [pendingPayment, setPendingPayment] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState<Date | null>(new Date());
  const [remarks, setRemarks] = useState("");

  // UI State
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [menus, setMenus] = useState({ type: false, area: false, region: false, unit: false });

  // Auto-calculate pending payment
  useEffect(() => {
    const total = Number(orderTotal) || 0;
    const advance = Number(advancePayment) || 0;
    const pending = Math.max(0, total - advance);
    setPendingPayment(pending.toString());
  }, [orderTotal, advancePayment]);

  // --- Form Submission ---
  const validate = (): string | null => {
    if (!salesmanName.trim() || !salesmanRole.trim() || !dealerType || !dealerName.trim() || !dealerPhone.trim() || !dealerAddress.trim() || !area || !region || !quantity || !unit || !orderTotal || advancePayment === '' || !estimatedDelivery) {
        return "Please fill all required fields.";
    }
    if (isNaN(Number(quantity)) || isNaN(Number(orderTotal)) || isNaN(Number(advancePayment))) {
        return "Quantity and payment fields must be numbers.";
    }
    return null;
  };
  
  const handleSubmit = async () => {
    const error = validate();
    if (error) return Alert.alert("Validation Error", error);
    
    setIsSubmitting(true);

    // This payload should match the `insertSalesOrderSchema` from your backend
    const payload = {
      salesmanId: currentUser.id ?? null,
      // NOTE: In a real app, you would fetch dealers and use a dealerId here.
      // For now, we are sending the name as a placeholder for the foreign key.
      dealerId: dealerName, 
      quantity: Number(quantity),
      unit,
      orderTotal: Number(orderTotal),
      advancePayment: Number(advancePayment),
      pendingPayment: Number(pendingPayment),
      estimatedDelivery: estimatedDelivery?.toISOString().split('T')[0],
      remarks: remarks || null,
    };
    
    // Call the central API service function
    const result = await createSalesOrder(payload) as { success: boolean };
    setIsSubmitting(false);
    
    if (result.success) {
      Alert.alert('Success', 'Sales order has been created successfully.');
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Failed to create the sales order.');
    }
  };
  
  // --- UI Helpers & Rendering ---
  const textInputTheme = { colors: { primary: theme.colors.primary, text: '#e5e7eb', placeholder: '#9ca3af', background: '#1e293b', outline: '#475569' } };
  const toggleMenu = (name: keyof typeof menus, visible: boolean) => setMenus(prev => ({ ...prev, [name]: visible }));

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
      setDatePickerVisible(false);
      if (event.type === 'set' && selectedDate) {
        setEstimatedDelivery(selectedDate);
      }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['right', 'bottom', 'left']}>
      <AppHeader title="Create Sales Order" />

      {datePickerVisible && (
        <DateTimePicker value={estimatedDelivery || new Date()} mode="date" display="default" onChange={onDateChange} />
      )}

      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text variant="headlineSmall" style={styles.title}>New Sales Order</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>Fill in the details for the new order.</Text>
        
        <TextInput label="Salesman Name *" value={salesmanName} onChangeText={setSalesmanName} style={styles.input} theme={textInputTheme} />
        <TextInput label="Salesman Role *" value={salesmanRole} onChangeText={setSalesmanRole} style={styles.input} theme={textInputTheme} />

        <Menu visible={menus.type} onDismiss={() => toggleMenu('type', false)} anchor={<TouchableOpacity onPress={() => toggleMenu('type', true)}><TextInput label="Dealer Type *" editable={false} value={dealerType} style={styles.input} theme={textInputTheme} /></TouchableOpacity>}>
            {DEALER_TYPES.map(t => <Menu.Item key={t} onPress={() => { setDealerType(t); toggleMenu('type', false); }} title={t} />)}
        </Menu>
        
        <TextInput label="Dealer Name *" value={dealerName} onChangeText={setDealerName} style={styles.input} theme={textInputTheme} />
        <TextInput label="Dealer Phone *" keyboardType="phone-pad" value={dealerPhone} onChangeText={setDealerPhone} style={styles.input} theme={textInputTheme} />
        <TextInput label="Dealer Address *" multiline numberOfLines={3} value={dealerAddress} onChangeText={setDealerAddress} style={styles.input} theme={textInputTheme} />

        <View style={styles.row}>
            <Menu visible={menus.area} onDismiss={() => toggleMenu('area', false)} anchor={<TouchableOpacity style={{flex: 1}} onPress={() => toggleMenu('area', true)}><TextInput label="Area *" editable={false} value={area} style={styles.input} theme={textInputTheme} /></TouchableOpacity>}>{AREAS.map(a => <Menu.Item key={a} onPress={() => { setArea(a); toggleMenu('area', false); }} title={a} />)}</Menu>
            <Menu visible={menus.region} onDismiss={() => toggleMenu('region', false)} anchor={<TouchableOpacity style={{flex: 1}} onPress={() => toggleMenu('region', true)}><TextInput label="Region *" editable={false} value={region} style={styles.input} theme={textInputTheme} /></TouchableOpacity>}>{REGIONS.map(r => <Menu.Item key={r} onPress={() => { setRegion(r); toggleMenu('region', false); }} title={r} />)}</Menu>
        </View>

        <View style={styles.row}>
            <TextInput label="Order Quantity *" keyboardType="numeric" value={quantity} onChangeText={setQuantity} style={[styles.input, {flex: 1}]} theme={textInputTheme} />
            <Menu visible={menus.unit} onDismiss={() => toggleMenu('unit', false)} anchor={<TouchableOpacity style={{flex: 1}} onPress={() => toggleMenu('unit', true)}><TextInput label="Unit *" editable={false} value={unit} style={styles.input} theme={textInputTheme} /></TouchableOpacity>}>{UNITS.map(u => <Menu.Item key={u} onPress={() => { setUnit(u); toggleMenu('unit', false); }} title={u} />)}</Menu>
        </View>

        <View style={styles.row}>
            <TextInput label="Order Total (₹) *" keyboardType="numeric" value={orderTotal} onChangeText={setOrderTotal} style={[styles.input, {flex: 1}]} theme={textInputTheme} />
            <TextInput label="Advance (₹) *" keyboardType="numeric" value={advancePayment} onChangeText={setAdvancePayment} style={[styles.input, {flex: 1}]} theme={textInputTheme} />
            <TextInput label="Pending (₹) *" editable={false} value={pendingPayment} style={[styles.input, {flex: 1}]} theme={textInputTheme} />
        </View>

        <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
            <TextInput label="Estimated Delivery Date *" value={estimatedDelivery ? estimatedDelivery.toLocaleDateString() : ''} editable={false} style={styles.input} theme={textInputTheme} right={<TextInput.Icon icon="calendar" />} />
        </TouchableOpacity>

        <TextInput label="Remarks" multiline numberOfLines={3} value={remarks} onChangeText={setRemarks} style={styles.input} theme={textInputTheme} />

        <Button mode="contained" onPress={handleSubmit} style={styles.button} loading={isSubmitting} disabled={isSubmitting}>
          Submit Order
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f172a" },
  formContainer: { padding: 16, paddingBottom: 32 },
  title: { color: "#e5e7eb", marginBottom: 4, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { color: '#9ca3af', marginBottom: 24, textAlign: 'center' },
  input: { marginBottom: 16 },
  row: { flexDirection: 'row', gap: 8 },
  button: { marginTop: 8, paddingVertical: 4, width: '100%' },
});

