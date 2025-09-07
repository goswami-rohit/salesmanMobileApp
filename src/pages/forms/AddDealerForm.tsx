// src/pages/forms/AddDealerForm.tsx
import React from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";

export default function AddDealerForm() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text variant="titleLarge" style={styles.title}>Add Dealer</Text>

        <TextInput label="Dealer Name" mode="outlined" style={styles.input} />
        <TextInput label="Phone" mode="outlined" style={styles.input} />
        <TextInput label="Address" mode="outlined" style={styles.input} multiline numberOfLines={2} />

        <Button mode="contained" onPress={() => {}} style={styles.button} buttonColor="#1d4ed8">
          Submit Dealer
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
