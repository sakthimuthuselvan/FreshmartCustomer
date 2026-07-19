import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../src/context/ThemeContext';
import api from '../src/api/api';

export default function MaintenanceScreen({ route }) {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [checking, setChecking] = useState(false);

  const message = route?.params?.message || "We are currently doing some updates. Please check back later!";

  const handleRetry = async () => {
    setChecking(true);
    try {
      const res = await api.get('/settings');
      if (res.data.settings && !res.data.settings.isUnderMaintenance) {
        // Maintenance mode was disabled! Release back to home
        navigation.replace('Home');
      } else {
        alert("We are still updating our systems. Thank you for your patience!");
      }
    } catch (err) {
      alert("Unable to reach the server. Please check your internet connection and try again.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      <View className="flex-grow items-center justify-center px-8 py-12">
        <Image
          source={require("../assets/ecom_assets/maintanance_mode.png")}
          className="w-64 h-64 mb-8"
          resizeMode="contain"
        />
        <Text style={{ color: colors.textMain }} className="text-xl font-black text-center mb-2">
          We'll Be Right Back!
        </Text>
        <Text style={{ color: colors.textMuted }} className="text-xs font-bold text-center leading-relaxed px-4 mb-10">
          {message}
        </Text>
        
        <TouchableOpacity
          onPress={handleRetry}
          disabled={checking}
          style={{ backgroundColor: colors.primary }}
          className="w-full rounded-2xl py-5 items-center justify-center shadow-md shadow-emerald-700/20"
        >
          {checking ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-extrabold text-base">Check Status Again</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
