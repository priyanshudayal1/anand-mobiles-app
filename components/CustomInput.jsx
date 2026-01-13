import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../store/useTheme';
import { Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle } from 'lucide-react-native';

const CustomInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  icon,
  keyboardType = 'default',
  required = false,
  onBlur,
  autoCapitalize = 'none',
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  
  // Toggle password visibility if it's a secure text entry
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Determine which icon to render
  const renderIcon = () => {
    const iconProps = {
      size: 20,
      color: colors.textSecondary,
    };

    switch (icon) {
      case 'mail': return <Mail {...iconProps} />;
      case 'lock': return <Lock {...iconProps} />;
      case 'user': return <User {...iconProps} />;
      case 'phone': return <Phone {...iconProps} />;
      default: return null;
    }
  };

  return (
    <View className="mb-4">
      {label && (
        <Text 
          className="text-sm font-medium mb-1.5"
          style={{ color: colors.text }}
        >
          {label} {required && <Text style={{ color: colors.error }}>*</Text>}
        </Text>
      )}
      
      <View 
        className="flex-row items-center border rounded-lg px-3 overflow-hidden"
        style={{
          backgroundColor: colors.inputBg,
          borderColor: error ? colors.error : (isFocused ? colors.primary : colors.border),
          borderWidth: 1,
          height: 50,
        }}
      >
        {icon && (
          <View className="mr-3">
            {renderIcon()}
          </View>
        )}
        
        <TextInput
          className="flex-1 text-base h-full"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          autoCapitalize={autoCapitalize}
          style={{ color: colors.text }}
        />
        
        {secureTextEntry && (
          <TouchableOpacity onPress={togglePasswordVisibility} className="p-2">
            {isPasswordVisible ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <View className="flex-row items-center mt-1">
          <AlertCircle size={14} color={colors.error} />
          <Text 
            className="text-xs ml-1" 
            style={{ color: colors.error }}
          >
            {error}
          </Text>
        </View>
      )}
    </View>
  );
};

export default CustomInput;
