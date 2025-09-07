import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, useTheme } from "react-native-paper";
import AppHeader from "../../components/AppHeader"; // Make sure path is correct

export default function PJPForm() {
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
  const showDatePicker = () => {
    console.log(`Open date picker for PJP Date`);
    // In a real app, you would integrate a date picker library here
  };

  return (
    <SafeAreaView style={styles.safe} edges={['right', 'bottom', 'left']}>
      <AppHeader title="Planned Journey Plan" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>Create New PJP</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Outline your journey plan for the upcoming date.
        </Text>

        <TouchableOpacity onPress={showDatePicker}>
          <TextInput
            label="Date of Journey"
            mode="outlined"
            style={styles.input}
            theme={textInputTheme}
            editable={false}
            right={<TextInput.Icon icon="calendar" />}
          />
        </TouchableOpacity>

        <TextInput
          label="Planned Stops (e.g., Dealer A, Dealer B)"
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={4}
          theme={textInputTheme}
        />
        <TextInput
          label="Notes or Objectives"
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={3}
          theme={textInputTheme}
        />

        <Button
          mode="contained"
          onPress={() => console.log('Save PJP')}
          style={styles.button}
        >
          Save Journey Plan
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
