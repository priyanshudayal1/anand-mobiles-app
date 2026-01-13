import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { useTheme } from '../store/useTheme';

const CustomButton = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline
  isLoading = false,
  fullWidth = true,
  disabled = false,
  size = 'md', // sm, md, lg
  icon,
}) => {
  const { colors } = useTheme();
  
  // Base container styles
  const getContainerStyles = () => {
    let styles = {
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled || isLoading ? 0.6 : 1,
    };
    
    // Size styles
    switch (size) {
      case 'sm':
        styles.paddingVertical = 8;
        styles.paddingHorizontal = 12;
        break;
      case 'lg':
        styles.paddingVertical = 14;
        styles.paddingHorizontal = 24;
        break;
      case 'md':
      default:
        styles.paddingVertical = 12;
        styles.paddingHorizontal = 16;
        break;
    }
    
    // Variant styles
    switch (variant) {
      case 'secondary':
        styles.backgroundColor = colors.background;
        styles.borderWidth = 1;
        styles.borderColor = colors.primary;
        break;
      case 'outline':
        styles.backgroundColor = 'transparent';
        styles.borderWidth = 1;
        styles.borderColor = colors.border;
        break;
      case 'primary':
      default:
        styles.backgroundColor = colors.primary;
        break;
    }
    
    return styles;
  };
  
  // Text styles based on variant
  const getTextStyles = () => {
    const baseStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };
    
    switch (size) {
      case 'sm': baseStyle.fontSize = 12; break;
      case 'lg': baseStyle.fontSize = 16; break;
      default: baseStyle.fontSize = 14; break;
    }
    
    switch (variant) {
      case 'secondary':
        baseStyle.color = colors.primary;
        break;
      case 'outline':
        baseStyle.color = colors.text;
        break;
      case 'primary':
      default:
        baseStyle.color = colors.white;
        break;
    }
    
    return baseStyle;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        getContainerStyles(),
        fullWidth ? { width: '100%' } : { alignSelf: 'flex-start' }
      ]}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? colors.white : colors.primary} 
        />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text style={getTextStyles()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
