import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { theme } from '../../constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
}

export function Skeleton({ width = '100%', height = 20 }: SkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View style={[styles.skeleton, { width, height, opacity }]} />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.border,
  },
});