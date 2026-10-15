import React from 'react';
import { View } from 'react-native';
import Text from './AppText';

/**
 * Sample Component demonstrating NativeWind & Custom Font utilities
 */
export default function FontVerificationSample() {
  return (
    <View className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 my-3 space-y-2">
      <Text className="font-montserrat-bold text-lg text-emerald-900">
        Montserrat Bold (font-montserrat-bold)
      </Text>
      <Text className="font-montserrat-semibold text-base text-emerald-800">
        Montserrat SemiBold (font-montserrat-semibold)
      </Text>
      <Text className="font-montserrat-medium text-sm text-emerald-700">
        Montserrat Medium (font-montserrat-medium)
      </Text>
      <Text className="font-montserrat text-xs text-emerald-600">
        Montserrat Regular (font-montserrat)
      </Text>
    </View>
  );
}
