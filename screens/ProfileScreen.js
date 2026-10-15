import React from 'react';
import { View, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import Text from '../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../src/context/ThemeContext';
import { User, Check, Clipboard, MapPin, Wallet, Bell, HelpCircle, Settings, LogOut, ChevronRight } from 'lucide-react-native';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-white">
        <View className="px-5 pt-8 pb-10 justify-between flex-1">
          <View>
            {/* Centered Circular Avatar Header */}
            <View className="items-center justify-center mb-8">
              <View 
                style={{ borderColor: colors.primary + '40', backgroundColor: colors.primaryLight }}
                className="w-24 h-24 rounded-full border-4 items-center justify-center shadow-lg shadow-emerald-500/20 relative"
              >
                <View 
                  style={{ backgroundColor: colors.primary }}
                  className="w-20 h-20 rounded-full items-center justify-center shadow-md"
                >
                  <User size={40} color="white" />
                </View>
                <View className="absolute bottom-0 right-0 bg-emerald-500 border-2 border-white w-6 h-6 rounded-full items-center justify-center">
                  <Check size={12} color="white" strokeWidth={3} />
                </View>
              </View>

              <View className="items-center mt-2">
                <Text style={{ color: colors.textMain }} className="text-lg font-black tracking-tight">
                  Karthik Kumar
                </Text>
                <Text style={{ color: colors.textMuted }} className="text-xs font-semibold mt-0.5">
                  +91 98765 43210
                </Text>
                <View 
                  style={{ backgroundColor: colors.primaryLight, borderColor: colors.primary + '30' }} 
                  className="px-3 py-1 rounded-full border mt-2 flex-row items-center gap-1.5"
                >
                  <Text style={{ color: colors.primary }} className="text-[10px] font-black uppercase tracking-wider">
                    ⚡ FreshMart Member
                  </Text>
                </View>
              </View>
            </View>

            {/* Menu routes settings list */}
            <View style={{ borderColor: colors.border }} className="border rounded-3xl overflow-hidden bg-white shadow-sm mb-6">
              <TouchableOpacity
                onPress={() => navigation.navigate('Home')}
                style={{ borderBottomColor: colors.border }}
                className="flex-row items-center justify-between px-5 py-4 border-b hover:bg-slate-50"
              >
                <View className="flex-row items-center gap-3.5">
                  <View className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <Clipboard size={18} color={colors.primary} />
                  </View>
                  <Text style={{ color: colors.textMain }} className="text-xs font-extrabold">My Orders</Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Address')}
                style={{ borderBottomColor: colors.border }}
                className="flex-row items-center justify-between px-5 py-4 border-b hover:bg-slate-50"
              >
                <View className="flex-row items-center gap-3.5">
                  <View className="p-2.5 rounded-2xl bg-blue-50 border border-blue-100">
                    <MapPin size={18} color="#3b82f6" />
                  </View>
                  <Text style={{ color: colors.textMain }} className="text-xs font-extrabold">Saved Addresses</Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Alert.alert('Wallet Balance', 'Your current active wallet balance is ₹150. Cashback is automatically applied at checkout.')}
                style={{ borderBottomColor: colors.border }}
                className="flex-row items-center justify-between px-5 py-4 border-b hover:bg-slate-50"
              >
                <View className="flex-row items-center gap-3.5">
                  <View className="p-2.5 rounded-2xl bg-amber-50 border border-amber-100">
                    <Wallet size={18} color="#d97706" />
                  </View>
                  <Text style={{ color: colors.textMain }} className="text-xs font-extrabold">Wallet & Cashback</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text style={{ color: colors.primary }} className="text-xs font-black">₹150</Text>
                  <ChevronRight size={18} color={colors.textMuted} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Alert.alert('Notifications', 'No new unread notification updates.')}
                style={{ borderBottomColor: colors.border }}
                className="flex-row items-center justify-between px-5 py-4 border-b hover:bg-slate-50"
              >
                <View className="flex-row items-center gap-3.5">
                  <View className="p-2.5 rounded-2xl bg-purple-50 border border-purple-100">
                    <Bell size={18} color="#a855f7" />
                  </View>
                  <Text style={{ color: colors.textMain }} className="text-xs font-extrabold">Notifications</Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Alert.alert('Customer Support', '⚡ FreshMart Customer Helpline:\n\n📞 Toll-Free: 1800-FRESHMART\n📧 Email: support@freshmart.com\n⏰ 24/7 Live Express Support')}
                style={{ borderBottomColor: colors.border }}
                className="flex-row items-center justify-between px-5 py-4 border-b hover:bg-slate-50"
              >
                <View className="flex-row items-center gap-3.5">
                  <View className="p-2.5 rounded-2xl bg-cyan-50 border border-cyan-100">
                    <HelpCircle size={18} color="#06b6d4" />
                  </View>
                  <Text style={{ color: colors.textMain }} className="text-xs font-extrabold">Help & Support</Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Alert.alert('App Settings', 'FreshMart Customer App v1.0.0 (Latest)\n\n• Theme: Light / Auto\n• Location GPS: Enabled\n• Push Notifications: Active')}
                className="flex-row items-center justify-between px-5 py-4 hover:bg-slate-50"
              >
                <View className="flex-row items-center gap-3.5">
                  <View className="p-2.5 rounded-2xl bg-slate-100 border border-slate-200">
                    <Settings size={18} color="#64748b" />
                  </View>
                  <Text style={{ color: colors.textMain }} className="text-xs font-extrabold">Settings</Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout button */}
          <View className="pt-2">
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              className="flex-row items-center justify-center border border-red-200 rounded-2xl py-4 gap-2 bg-red-50 hover:bg-red-100"
            >
              <LogOut size={18} color="#ef4444" />
              <Text className="text-red-500 font-extrabold text-xs tracking-wider uppercase">Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
