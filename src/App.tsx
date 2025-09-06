import "./global.css";
import React from "react";
import { SafeAreaView, View, Text, TouchableOpacity } from "react-native";

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background justify-center items-center">
      <View className="bg-card p-6 rounded-2xl w-11/12 max-w-md items-center">
        <Text className="text-white text-2xl font-bold text-center">Hello World 👋</Text>
        <Text className="text-gray-300 mt-3 text-center">
          Expo + Nativewind dark mode.
        </Text>
        <TouchableOpacity className="bg-primary rounded-xl mt-6 py-3 px-6">
          <Text className="text-white font-semibold text-center">Press Me</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
