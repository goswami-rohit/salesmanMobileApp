// src/pages/AIChatInterface.tsx 
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, Card, ActivityIndicator, Avatar, IconButton } from 'react-native-paper';
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
  const { user, dealers, setData } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentFlow, setCurrentFlow] = useState<'dvr' | 'tvr' | 'dealer' | null>(null);
  const [formData, setFormData] = useState<any>({});

  const flatListRef = useRef<FlatList>(null);

  // FIX: Created a local fetchDealers function
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
    return (
      <View className={`flex-row items-end my-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && <Avatar.Icon size={32} icon="robot-outline" className="mr-2 bg-slate-700" />}
        <View className={`max-w-[80%] p-3 rounded-2xl ${isUser ? 'bg-blue-600 rounded-br-none' : 'bg-slate-700 rounded-bl-none'}`}>
          <Text className={isUser ? 'text-white' : 'text-slate-200'}>{item.content}</Text>
        </View>
        {isUser && <Avatar.Icon size={32} icon="account" className="ml-2 bg-slate-700" />}
      </View>
    );
  };

  // NOTE: Form rendering logic would be here (renderDVRForm, etc.)
  // For simplicity, we'll show a placeholder
  const renderCurrentFlow = () => {
    if (!currentFlow) return null;
    return (
      <Card className="m-4 bg-slate-800">
        <Card.Title
          title={`Creating ${currentFlow.toUpperCase()} Report`}
          titleStyle={{ color: 'white' }}
        />
        <Card.Content>
          <Text className="text-slate-300">Form UI for {currentFlow} would be here.</Text>
          <Button onPress={() => setCurrentFlow(null)} className="mt-4">Cancel</Button>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['right', 'bottom', 'left']}>
      <AppHeader title="AI Assistant" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListHeaderComponent={renderCurrentFlow}
          ListFooterComponent={isLoading ? <ActivityIndicator className="my-4" /> : null}
        />

        <View className="p-4 border-t border-slate-700 bg-slate-800">
          {/* Quick Actions would be here if needed */}
          <View className="flex-row items-center">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask me anything..."
              className="flex-1 bg-slate-700"
              disabled={isLoading || !!currentFlow}
              right={<TextInput.Icon icon="microphone" />}
            />
            <IconButton
              icon="send"
              mode="contained"
              size={24}
              onPress={handleSend}
              disabled={!input.trim() || isLoading || !!currentFlow}
              className="ml-2"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
