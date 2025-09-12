// src/pages/AIChatInterface.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, Card, ActivityIndicator, Avatar, IconButton, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import RNPickerSelect from 'react-native-picker-select';

import { useAppStore } from '../components/ReusableConstants';
import AppHeader from '../components/AppHeader';

// --- Type Definitions (from web version) ---
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'message' | 'action' | 'error' | 'form' | 'success';
  metadata?: any;
}

// --- Main Component ---
export default function AIChatInterface() {
  const theme = useTheme();
  const { user, dealers, setData } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentFlow, setCurrentFlow] = useState<'dvr' | 'tvr' | 'dealer' | null>(null);
  const [formData, setFormData] = useState<any>({});

  const flatListRef = useRef<FlatList>(null);

  const fetchDealers = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`YOUR_API_ENDPOINT/api/dealers/user/${user.id}`);
      const data = await response.json();
      if (data.success) {
        setData('dealers', data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch dealers:', error);
      Toast.show({ type: 'error', text1: 'Failed to load dealers.' });
    }
  }, [user, setData]);

  useEffect(() => {
    if (user?.id && dealers.length === 0) {
      // Assuming fetchDealers is now part of your Zustand store
      // fetchDealers(user.id); 
    }
  }, [user, dealers, fetchDealers]);

  // --- API Calls ---
  const callVectorRAGChat = useCallback(async (userInput: string): Promise<any> => {
    const response = await fetch('YOUR_API_ENDPOINT/api/rag/vector-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userInput, userId: user?.id }),
    });
    if (!response.ok) throw new Error(`Vector RAG failed: ${response.status}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Vector RAG failed');
    return data;
  }, [user]);

  const submitFormData = useCallback(async (endpoint: string, data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('YOUR_API_ENDPOINT/api/rag/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint, data, userId: user?.id }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Submission failed');

      const successMessage: Message = {
        id: Date.now().toString(),
        content: `✅ Successfully created ${endpoint.replace('/api/', '').toUpperCase()} record!`,
        sender: 'ai', timestamp: new Date(), type: 'success',
      };
      setMessages(prev => [...prev, successMessage]);
      setCurrentFlow(null);
      setFormData({});
      if (endpoint === '/api/dealers' && user?.id) {
        // fetchDealers(user.id);
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: Date.now().toString(), content: `❌ Error: ${error.message}`,
        sender: 'ai', timestamp: new Date(), type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // --- Handlers ---
  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const userInput = input.trim();
    setInput('');

    const userMessage: Message = {
      id: Date.now().toString(), content: userInput,
      sender: 'user', timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const result = await callVectorRAGChat(userInput);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(), content: result.message,
        sender: 'ai', timestamp: new Date(), metadata: result
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(), content: 'I encountered an error. Please try again.',
        sender: 'ai', timestamp: new Date(), type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, callVectorRAGChat]);

  // --- UI Components ---
  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    const messageContainerStyle = isUser ? styles.userMessageContainer : styles.aiMessageContainer;
    const bubbleStyle = isUser ? styles.userBubble : styles.aiBubble;
    const textStyle = isUser ? styles.userText : styles.aiText;

    return (
      <View style={[styles.messageRow, messageContainerStyle]}>
        {!isUser && <Avatar.Icon size={32} icon="robot-outline" style={styles.avatar} />}
        <View style={bubbleStyle}>
          <Text style={textStyle}>{item.content}</Text>
        </View>
        {isUser && <Avatar.Icon size={32} icon="account" style={styles.avatar} />}
      </View>
    );
  };

  const renderCurrentFlow = () => {
    if (!currentFlow) return null;
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
        <Card.Title
          title={`Creating ${currentFlow.toUpperCase()} Report`}
          titleStyle={{ color: theme.colors.onSurface }}
        />
        <Card.Content>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>Form UI for {currentFlow} would be here.</Text>
          <Button onPress={() => setCurrentFlow(null)} style={styles.formButton}>Cancel</Button>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['right', 'bottom', 'left']}>
      <AppHeader title="AI Chat" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.flatListContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListHeaderComponent={renderCurrentFlow}
          ListFooterComponent={isLoading ? <ActivityIndicator style={styles.loadingIndicator} /> : null}
        />

        <View style={[styles.inputBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
          {/* Quick Actions would be here if needed */}
          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask me anything..."
              style={styles.textInput}
              disabled={isLoading || !!currentFlow}
              right={<TextInput.Icon icon="microphone" />}
            />
            <IconButton
              icon="send"
              mode="contained"
              size={24}
              onPress={handleSend}
              disabled={!input.trim() || isLoading || !!currentFlow}
              style={styles.sendButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  userBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    backgroundColor: '#1d4ed8', // blue-700
  },
  aiBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    backgroundColor: '#374151', // gray-700
  },
  userText: {
    color: 'white',
  },
  aiText: {
    color: '#e5e7eb', // gray-200
  },
  avatar: {
    backgroundColor: '#374151',
    marginHorizontal: 8,
  },
  loadingIndicator: {
    marginVertical: 16,
  },
  inputBar: {
    padding: 16,
    borderTopWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#4b5563',
  },
  sendButton: {
    marginLeft: 8,
  },
  card: {
    margin: 16,
    borderRadius: 16,
  },
  formButton: {
    marginTop: 16,
  },
});