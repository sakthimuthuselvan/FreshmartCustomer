import React from 'react';
import { View, TouchableOpacity, Image, StatusBar } from 'react-native';
import Text from '../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../src/context/ThemeContext';

export default function ShopClosedScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      <View className="flex-grow items-center justify-center px-8 py-12">
        <Image
          source={require("../assets/ecom_assets/closed_shop.png")}
          className="w-64 h-64 mb-8"
          resizeMode="contain"
        />
        <Text style={{ color: colors.textMain }} className="text-xl font-black text-center mb-2">
          Shop Closed
        </Text>
        <Text style={{ color: colors.textMuted }} className="text-xs font-bold text-center leading-relaxed px-4 mb-10">
          Shop is Closed. We are currently closed. Please visit us during our working hours.
        </Text>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ backgroundColor: colors.primary }}
          className="w-full rounded-2xl py-5 items-center justify-center shadow-md shadow-emerald-700/20"
        >
          <Text className="text-white font-extrabold text-base">View Timings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
