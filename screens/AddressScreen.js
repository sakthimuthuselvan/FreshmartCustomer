import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../src/context/ThemeContext';
import { ChevronLeft, MapPin, Plus, Check } from 'lucide-react-native';

export default function AddressScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const [selectedAddress, setSelectedAddress] = useState('Home');

  const addresses = [
    {
      id: 'Home',
      title: 'Home',
      details: 'Anna Nagar, Chennai - 600040',
      phone: '98765 43210',
    },
    {
      id: 'Office',
      title: 'Office',
      details: 'No. 45, T.T. Nagar, Chennai - 600017',
      phone: '98765 43210',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

      {/* Header (Mockup 10) */}
      <View 
        style={{ borderBottomColor: colors.border }}
        className="px-5 py-4 border-b flex-row items-center justify-between bg-white"
      >
        <View className="flex-row items-center gap-3">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="p-1 rounded-full hover:bg-slate-100"
          >
            <ChevronLeft size={24} color={colors.textMain} />
          </TouchableOpacity>
          <Text style={{ color: colors.textMain }} className="text-lg font-extrabold">My Addresses</Text>
        </View>

        <TouchableOpacity className="flex-row items-center gap-1.5">
          <Plus size={16} color={colors.primary} className="stroke-[3]" />
          <Text style={{ color: colors.primary }} className="text-sm font-extrabold">Add New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-5">
        <View className="space-y-4">
          {addresses.map((addr) => {
            const isSelected = selectedAddress === addr.id;
            return (
              <TouchableOpacity
                key={addr.id}
                onPress={() => setSelectedAddress(addr.id)}
                style={{
                  borderColor: isSelected ? colors.primary : colors.border,
                  backgroundColor: colors.card
                }}
                className="border-2 rounded-2xl p-4 flex-row items-start justify-between shadow-sm cursor-pointer"
              >
                <View className="flex-row gap-3.5 flex-1 mr-4">
                  <View 
                    style={{ backgroundColor: colors.primaryLight }}
                    className="p-3 rounded-full mt-0.5"
                  >
                    <MapPin size={20} color={colors.primary} />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: colors.textMain }} className="text-sm font-black">{addr.title}</Text>
                    <Text style={{ color: colors.textMuted }} className="text-xs font-semibold mt-1.5 leading-relaxed">{addr.details}</Text>
                    {addr.phone && (
                      <Text style={{ color: colors.textMuted }} className="text-[10px] font-bold mt-1 tracking-wide">{addr.phone}</Text>
                    )}
                  </View>
                </View>

                <View 
                  style={{
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.primary : 'transparent'
                  }}
                  className="w-5 h-5 rounded-full border-2 items-center justify-center self-center"
                >
                  {isSelected && <Check size={10} color="white" className="stroke-[3]" />}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Add a new delivery address placeholder option (Mockup 10) */}
          <TouchableOpacity
            style={{ borderColor: colors.border, backgroundColor: colors.card }}
            className="border-2 border-dashed rounded-2xl p-6 items-center justify-center shadow-sm gap-2"
          >
            <View 
              style={{ backgroundColor: colors.primaryLight }}
              className="p-3 rounded-full"
            >
              <Plus size={20} color={colors.primary} className="stroke-[3]" />
            </View>
            <Text style={{ color: colors.textMain }} className="text-xs font-extrabold">Add a new delivery address</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
