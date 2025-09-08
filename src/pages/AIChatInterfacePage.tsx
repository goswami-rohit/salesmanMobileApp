// src/pages/AIChatInterface.tsx 
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, IconButton } from 'react-native-paper';
import AppHeader from '../components/AppHeader';

export default function AIChatInterface() {
  const [text, setText] = React.useState('');

  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
      <AppHeader title="AI Assistant" />
      <View style={styles.container}>
        <View style={styles.chatArea}>
            <Text style={styles.placeholderText}>Chat history will appear here.</Text>
        </View>
        <View style={styles.inputArea}>
            <TextInput
                style={styles.textInput}
                label="Ask something..."
                value={text}
                onChangeText={setText}
                mode="outlined"
            />
            <IconButton
                icon="send"
                size={24}
                onPress={() => console.log('Send message')}
                mode="contained"
            />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1 },
  chatArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#9ca3af' },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#1e293b',
  },
  textInput: {
    flex: 1,
    marginRight: 8,
  },
});
