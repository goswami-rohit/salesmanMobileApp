// src/pages/forms/SalesOrderForm.tsx
import React from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";

export default function SalesOrderForm() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text variant="titleLarge" style={styles.title}>Sales Order</Text>

        <TextInput label="Order ID" mode="outlined" style={styles.input} />
        <TextInput label="Customer / Dealer" mode="outlined" style={styles.input} />
        <TextInput label="Order Details" mode="outlined" style={styles.input} multiline />

        <Button mode="contained" onPress={() => {}} style={styles.button} buttonColor="#1d4ed8">
          Submit Order
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
