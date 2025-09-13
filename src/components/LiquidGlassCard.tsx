// src/components/LiquidGlassCard.tsx
import React from 'react';
import { View, ViewStyle, TouchableOpacity } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming 
} from 'react-native-reanimated';
import { useTheme } from 'react-native-paper';

interface LiquidGlassCardProps {
  children: React.ReactNode;
  intensity?: number;
  animated?: boolean;
  className?: string;
  style?: ViewStyle;
  onPress?: () => void;
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function LiquidGlassCard({ 
  children, 
  intensity = 15,
  animated = true,
  className = '',
  style,
  onPress
}: LiquidGlassCardProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (animated) {
      scale.value = withSpring(0.96);
      opacity.value = withTiming(0.8, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    if (animated) {
      scale.value = withSpring(1);
      opacity.value = withTiming(1, { duration: 150 });
    }
  };

  const CardContainer = onPress ? AnimatedTouchable : Animated.View;

  return (
    <CardContainer
      className={`rounded-3xl overflow-hidden my-2 ${className}`}
      style={[animatedStyle, style]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <AnimatedBlurView
        blurType="light"
        blurAmount={intensity}
        className="flex-1"
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1"
        >
          <View 
            className="p-5 border border-white/20 bg-white/10"
            style={{
              shadowColor: theme.colors.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            {children}
          </View>
        </LinearGradient>
      </AnimatedBlurView>
    </CardContainer>
  );
}