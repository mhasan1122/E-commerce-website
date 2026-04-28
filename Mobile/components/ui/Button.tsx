import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  style,
}: ButtonProps) {
  const variantStyles: Record<string, ViewStyle> = {
    primary: { backgroundColor: theme.colors.primary },
    secondary: { backgroundColor: theme.colors.secondary },
    outline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: theme.colors.primary },
  };

  const sizeStyles: Record<string, ViewStyle> = {
    sm: { paddingVertical: 6, paddingHorizontal: 12 },
    md: { paddingVertical: 10, paddingHorizontal: 16 },
    lg: { paddingVertical: 14, paddingHorizontal: 24 },
  };

  const textColors = {
    primary: theme.colors.white,
    secondary: theme.colors.white,
    outline: theme.colors.primary,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        variantStyles[variant],
        sizeStyles[size],
        disabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} size="small" />
      ) : (
        <Text style={[styles.text, { color: textColors[variant] }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: theme.fontWeight.semibold,
    fontSize: theme.fontSize.lg,
  },
  disabled: {
    opacity: 0.5,
  },
});