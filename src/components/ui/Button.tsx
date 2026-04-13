import React from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator,
  StyleSheet, ViewStyle, TextStyle, View,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadow } from '../../constants/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, icon, iconPosition = 'left',
  fullWidth = false, style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyle: ViewStyle[] = [
    styles.base,
    styles[`size_${size}`] as ViewStyle,
    styles[`variant_${variant}`] as ViewStyle,
    ...(fullWidth ? [styles.fullWidth as ViewStyle] : []),
    ...(isDisabled ? [styles.disabled as ViewStyle] : []),
    style as ViewStyle,
  ];

  const textStyle: TextStyle[] = [
    styles.label,
    styles[`label_${size}`],
    styles[`label_${variant}`],
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isDisabled}
      style={containerStyle}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'ghost' || variant === 'outline' ? Colors.primary : Colors.onPrimary}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={textStyle}>{label}</Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
    ...Shadow.md,
  } as ViewStyle,
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: { marginRight: 8 },
  iconRight: { marginLeft: 8 },

  // Sizes
  size_sm: { paddingVertical: 10, paddingHorizontal: 20 },
  size_md: { paddingVertical: 14, paddingHorizontal: 28 },
  size_lg: { paddingVertical: 18, paddingHorizontal: 32 },

  // Variants
  variant_primary: { backgroundColor: Colors.primary },
  variant_secondary: { backgroundColor: Colors.secondary },
  variant_danger: { backgroundColor: Colors.error },
  variant_ghost: { backgroundColor: 'transparent', shadowOpacity: 0, elevation: 0 },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    shadowOpacity: 0,
    elevation: 0,
  },

  // Labels
  label: { fontWeight: '700' },
  label_sm: { fontSize: 13 },
  label_md: { fontSize: 15 },
  label_lg: { fontSize: 17 },
  label_primary: { color: Colors.onPrimary },
  label_secondary: { color: Colors.onSecondary },
  label_danger: { color: Colors.onError },
  label_ghost: { color: Colors.primary },
  label_outline: { color: Colors.primary },

  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
});
