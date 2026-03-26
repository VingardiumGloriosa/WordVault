import { Animated } from "react-native";

export function pulseAnimation(animValue: Animated.Value): Animated.CompositeAnimation {
  return Animated.sequence([
    Animated.timing(animValue, {
      toValue: 1.03,
      duration: 120,
      useNativeDriver: true,
    }),
    Animated.timing(animValue, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }),
  ]);
}

export function shakeAnimation(animValue: Animated.Value): Animated.CompositeAnimation {
  return Animated.sequence([
    Animated.timing(animValue, { toValue: 4, duration: 50, useNativeDriver: true }),
    Animated.timing(animValue, { toValue: -4, duration: 50, useNativeDriver: true }),
    Animated.timing(animValue, { toValue: 4, duration: 50, useNativeDriver: true }),
    Animated.timing(animValue, { toValue: -4, duration: 50, useNativeDriver: true }),
    Animated.timing(animValue, { toValue: 0, duration: 50, useNativeDriver: true }),
  ]);
}

export function popAnimation(animValue: Animated.Value): Animated.CompositeAnimation {
  return Animated.sequence([
    Animated.timing(animValue, {
      toValue: 1.05,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.timing(animValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }),
  ]);
}
