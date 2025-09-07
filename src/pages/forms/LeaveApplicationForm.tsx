// src/pages/forms/LeaveApplicationForm.tsx
import React from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";

export default function LeaveApplicationForm() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text variant="titleLarge" style={styles.title}>Leave Application</Text>

        <TextInput label="From Date" mode="outlined" style={styles.input} />
        <TextInput label="To Date" mode="outlined" style={styles.input} />
        <TextInput label="Reason" mode="outlined" style={styles.input} multiline />

        <Button mode="contained" onPress={() => {}} style={styles.button} buttonColor="#1d4ed8">
          Apply Leave
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
