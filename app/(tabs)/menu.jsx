import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Menu() {
  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-white">
      <Text>Menu Screen</Text>
    </SafeAreaView>
  );
}
