import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../src/context/ThemeContext';
import { Check } from 'lucide-react-native';

export default function OrderSuccessScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();

  const { orderId, orderNumber } = route.params || { orderId: '', orderNumber: '#FD12345678' };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      <View className="flex-1 items-center justify-center px-6 py-12">
        
        {/* Success Checkmark Circle (Mockup 12) */}
        <View 
          style={{ backgroundColor: colors.primaryLight }}
          className="w-24 h-24 rounded-full items-center justify-center mb-8 shadow-sm"
        >
          <View 
            style={{ backgroundColor: colors.primary }}
            className="w-16 h-16 rounded-full items-center justify-center shadow-md animate-pulse"
          >
            <Check size={32} color="white" className="stroke-[3.5]" />
          </View>
        </View>

        <View className="items-center w-full mb-8">
          <Text style={{ color: colors.textMain }} className="text-2xl font-black text-center mb-2">
            Order Placed!
          </Text>
          <Text style={{ color: colors.textMuted }} className="text-center text-xs font-bold leading-relaxed px-6">
            Thank you for your order
          </Text>
        </View>

        {/* Quick info card (Mockup 12) */}
        <View 
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
          className="border-2 rounded-2xl p-5 w-full flex-row justify-around items-center shadow-sm mb-12"
        >
          <View className="items-center">
            <Text style={{ color: colors.textMuted }} className="text-[10px] font-bold uppercase tracking-wider">Order ID</Text>
            <Text style={{ color: colors.textMain }} className="text-sm font-black mt-1">{orderNumber}</Text>
          </View>
          
          <View style={{ backgroundColor: colors.border }} className="w-px h-8" />
          
          <View className="items-center">
            <Text style={{ color: colors.textMuted }} className="text-[10px] font-bold uppercase tracking-wider">Delivery in</Text>
            <Text style={{ color: colors.primary }} className="text-sm font-black mt-1">10-20 mins</Text>
          </View>
        </View>

        <View className="w-full space-y-4 px-2">
          <TouchableOpacity
            onPress={() => navigation.replace('Tracking', { orderId })}
            style={{ backgroundColor: colors.primary }}
            className="rounded-2xl py-4 items-center justify-center shadow-md shadow-emerald-700/20"
          >
            <Text className="text-white font-extrabold text-sm">Track Order</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.replace('Home')}
            activeOpacity={0.7}
            className="py-2.5 items-center justify-center"
          >
            <Text style={{ color: colors.primary }} className="text-xs font-black">
              Continue Shopping
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
