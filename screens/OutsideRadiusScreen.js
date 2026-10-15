import React from 'react';
import { View, TouchableOpacity, Image, StatusBar } from 'react-native';
import Text from '../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../src/context/ThemeContext';

export default function OutsideRadiusScreen({ route }) {
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  const message = route?.params?.message || "We currently deliver only within a 5 KM radius from our store.";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      <View className="flex-grow items-center justify-center px-8 py-12">
        <Image
          source={require("../assets/ecom_assets/outside_devlivery_redius.png")}
          className="w-64 h-64 mb-8"
          resizeMode="contain"
        />
        <Text style={{ color: colors.textMain }} className="text-xl font-black text-center mb-2">
          Outside Delivery Radius
        </Text>
        <Text style={{ color: colors.textMuted }} className="text-xs font-bold text-center leading-relaxed px-4 mb-10">
          {message}
        </Text>
        
        <TouchableOpacity
          onPress={() => navigation.navigate('SelectLocation')}
          style={{ backgroundColor: colors.primary }}
          className="w-full rounded-2xl py-5 items-center justify-center shadow-md shadow-emerald-700/20"
        >
          <Text className="text-white font-extrabold text-base">Change Location</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
