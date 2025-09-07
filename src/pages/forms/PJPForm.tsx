// src/pages/forms/PJPForm.tsx
import React from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";

export default function PJPForm() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text variant="titleLarge" style={styles.title}>Planned Journey Plan (PJP)</Text>

        <TextInput label="Date" mode="outlined" style={styles.input} />
        <TextInput label="Planned Stops" mode="outlined" style={styles.input} />
        <TextInput label="Notes" mode="outlined" style={styles.input} multiline />

        <Button mode="contained" onPress={() => {}} style={styles.button} buttonColor="#1d4ed8">
          Save PJP
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
