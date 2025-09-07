import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, useTheme } from "react-native-paper";
import AppHeader from "../../components/AppHeader"; // Make sure path is correct

export default function AddDealerForm() {
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

  return (
    <SafeAreaView style={styles.safe} edges={['right', 'bottom', 'left']}>
      <AppHeader title="Add New Dealer" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>Dealer Information</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Fill out the details below to register a new dealer.
        </Text>

        <TextInput 
          label="Dealer Name" 
          mode="outlined" 
          style={styles.input} 
          theme={textInputTheme} 
        />
        <TextInput 
          label="Phone Number" 
          mode="outlined" 
          style={styles.input} 
          keyboardType="phone-pad"
          theme={textInputTheme} 
        />
        <TextInput 
          label="Address" 
          mode="outlined" 
          style={styles.input} 
          multiline 
          numberOfLines={3} 
          theme={textInputTheme} 
        />

        <Button 
          mode="contained" 
          onPress={() => console.log('Submit Dealer')} 
          style={styles.button}
        >
          Submit Dealer
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
  input: { marginBottom: 16 }, // Increased spacing
  button: { marginTop: 8, paddingVertical: 4 } // Made button larger
});
