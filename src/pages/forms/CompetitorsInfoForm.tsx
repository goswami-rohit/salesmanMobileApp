// src/pages/forms/CompetitorsInfoForm.tsx
import React from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";

export default function CompetitorsInfoForm() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text variant="titleLarge" style={styles.title}>Competitor Info</Text>

        <TextInput label="Competitor Name" mode="outlined" style={styles.input} />
        <TextInput label="Product Observed" mode="outlined" style={styles.input} />
        <TextInput label="Notes" mode="outlined" style={styles.input} multiline />

        <Button mode="contained" onPress={() => {}} style={styles.button} buttonColor="#1d4ed8">
          Submit
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f172a" },
  container: { padding: 16 },
  title: { color: "#fff", marginBottom: 12 },
  input: { marginBottom: 12, backgroundColor: "#374151" },
  button: { marginTop: 6 }
});
