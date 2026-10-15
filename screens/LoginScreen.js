import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  StatusBar,
  ActivityIndicator
} from "react-native";
import Text from "../components/AppText";
import TextInput from "../components/AppTextInput";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../src/context/ThemeContext";
import api from "../src/api/api";
import { ChevronLeft } from "lucide-react-native";

export default function LoginScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    const trimmedPhone = phoneNumber.trim();
    if (!trimmedPhone) {
      setError("Please enter your phone number.");
      return;
    }
    if (!/^\d{10}$/.test(trimmedPhone)) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const fullPhone = `+91${trimmedPhone}`;
      console.log(`[Firebase Phone Auth] Sending SMS to ${fullPhone}`);
      const auth = require('@react-native-firebase/auth').default;
      const confirmation = await auth().signInWithPhoneNumber(fullPhone);
      navigation.navigate("Otp", { phone: trimmedPhone, confirmation });
    } catch (firebaseErr) {
      console.warn('[Firebase Phone Auth] Not configured or failed. Falling back to Mock OTP:', firebaseErr.message);
      try {
        console.log('[API Request] URL:', api.defaults.baseURL + "/customer/send-otp");
        await api.post("/customer/send-otp", { phone: trimmedPhone });
        navigation.navigate("Otp", { phone: trimmedPhone, confirmation: null });
      } catch (err) {
        console.log('[API Error] Details:', err.message);
        setError(err.response?.data?.error || "Failed to request OTP. Make sure server is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: "padding" })}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        className="flex-1 bg-white"
      >
        <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

        {/* Top Header Row with Back Chevron (Mockup 02) */}
        <View className="px-5 py-4 bg-white flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-1 rounded-full hover:bg-slate-100"
          >
            <ChevronLeft size={24} color={colors.textMain} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-6 pb-12 items-center">
            {/* Top Illustration (Mockup 02) */}
            <Image
              source={require("../assets/ecom_assets/login_screen_bag.png")}
              className="w-56 h-56 rounded-3xl mt-2"
              resizeMode="contain"
            />

            <View className="items-center mt-6 w-full">
              <Text style={{ color: colors.textMain }} className="text-2xl font-black text-center">
                Welcome to FreshDay 🍃
              </Text>
              <Text style={{ color: colors.textMuted }} className="text-xs font-bold text-center mt-1">
                Your groceries, delivered fast
              </Text>
            </View>

            {/* Inputs Section */}
            <View className="w-full mt-8">
              <View
                style={{ borderColor: colors.border, backgroundColor: '#f8fafc' }}
                className="flex-row items-center border-2 rounded-2xl px-4 py-3.5 shadow-sm"
              >
                <Text className="text-xl mr-2">🇮🇳</Text>
                <Text style={{ color: colors.textMain }} className="text-base font-extrabold mr-2">+91</Text>
                <View style={{ backgroundColor: colors.border }} className="w-px h-6" />
                <TextInput
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setPhoneNumber(text.replace(/[^0-9]/g, ''));
                    if (error) setError("");
                  }}
                  keyboardType="phone-pad"
                  placeholder="98765 43210"
                  placeholderTextColor="#94a3b8"
                  maxLength={10}
                  editable={!loading}
                  style={{ color: colors.textMain }}
                  className="flex-1 text-base font-bold ml-3 p-0"
                />
              </View>

              {error ? (
                <Text className="text-red-500 text-xs font-semibold mt-2 ml-1">{error}</Text>
              ) : null}
            </View>

            {/* Action Trigger Box */}
            <View className="w-full mt-10">
              <TouchableOpacity
                onPress={handleSendOtp}
                disabled={loading}
                activeOpacity={0.85}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 20,
                  paddingVertical: 18,
                  alignItems: "center",
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 4,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-extrabold text-base">
                    Continue
                  </Text>
                )}
              </TouchableOpacity>

              {/* Terms and Privacy policy summary (Mockup 02) */}
              <Text style={{ color: colors.textMuted }} className="text-[10px] text-center mt-5 px-6 font-semibold leading-relaxed">
                By continuing, you agree to our{' '}
                <Text style={{ color: colors.primary }} className="underline">Terms & Conditions</Text> and{' '}
                <Text style={{ color: colors.primary }} className="underline">Privacy Policy</Text>
              </Text>

              <View className="flex-row justify-center items-center mt-8">
                <Text style={{ color: colors.textMuted }} className="text-xs font-bold mr-1">New here?</Text>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={{ color: colors.primary }} className="text-xs font-black">Create an account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
