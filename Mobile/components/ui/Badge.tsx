import { View, Text, ViewStyle } from 'react-native';
import { theme } from '../../constants/theme';

interface BadgeProps {
  title: string;
  variant?: 'primary' | 'success' | 'warning' | 'error';
}

export function Badge({ title, variant = 'primary' }: BadgeProps) {
  const variantStyles = {
    primary: { backgroundColor: theme.colors.primary },
    success: { backgroundColor: theme.colors.success },
    warning: { backgroundColor: theme.colors.warning },
    error: { backgroundColor: theme.colors.error },
  };

  return (
    <View style={[styles.badge, variantStyles[variant]]}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
}

const styles = {
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  } as ViewStyle,
  text: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
    textTransform: 'uppercase',
  },
};