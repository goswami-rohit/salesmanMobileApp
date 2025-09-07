import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, useTheme } from "react-native-paper";
import AppHeader from "../../components/AppHeader"; // Make sure path is correct

export default function LeaveApplicationForm() {
  const theme = useTheme();

  // Define custom theme for the text inputs for better dark mode appearance
  const textInputTheme = {
    colors: {
      primary: theme.colors.primary,
      text: '#e5e7eb', // Input text color
      placeholder: '#9ca3af', // Placeholder color
      background: '#1e293b', // Input background color
      outline: '#475569', // Border color
    },
  };

  // Placeholder function for opening a date picker
  const showDatePicker = (field: string) => {
    console.log(`Open date picker for ${field}`);
    // In a real app, you would integrate a date picker library here
  };

  return (
    <SafeAreaView style={styles.safe} edges={['right', 'bottom', 'left']}>
      <AppHeader title="Leave Application" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>Request Time Off</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Please fill in the dates and reason for your leave request.
        </Text>

        <TouchableOpacity onPress={() => showDatePicker('From Date')}>
          <TextInput
            label="From Date"
            mode="outlined"
            style={styles.input}
            theme={textInputTheme}
            editable={false} // Make it not directly editable
            right={<TextInput.Icon icon="calendar" />}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => showDatePicker('To Date')}>
          <TextInput
            label="To Date"
            mode="outlined"
            style={styles.input}
            theme={textInputTheme}
            editable={false}
            right={<TextInput.Icon icon="calendar" />}
          />
        </TouchableOpacity>

        <TextInput
          label="Reason for Leave"
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={4}
          theme={textInputTheme}
        />

        <Button
          mode="contained"
          onPress={() => console.log('Apply Leave')}
          style={styles.button}
        >
          Apply for Leave
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f172a" },
  container: { padding: 16 },
  title: { color: "#e5e7eb", marginBottom: 4, fontWeight: 'bold' },
  subtitle: { color: '#9ca3af', marginBottom: 24 },
  input: { marginBottom: 16 },
  button: { marginTop: 8, paddingVertical: 4 }
});
