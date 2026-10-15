import React from "react";
import { Image, TouchableOpacity, View, StatusBar } from "react-native";
import Text from "../components/AppText";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../src/context/ThemeContext";

export default function GetStartedScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      <View className="flex-1 items-center justify-center px-6">
        {/* Top Decorative Gradient */}
        <View
          style={{ backgroundColor: colors.primaryLight, opacity: 0.15 }}
          className="absolute top-0 left-0 right-0 h-40"
        />

        <View className="items-center w-full">
          {/* Circular Background Accent */}
          <View
            style={{ backgroundColor: colors.primary, opacity: 0.08 }}
            className="w-64 h-64 rounded-full absolute top-12"
          />

          {/* Featured Image */}
          <View
            style={{ borderColor: colors.primary }}
            className="w-56 h-56 rounded-full bg-white shadow-xl items-center justify-center mb-8 border-4 overflow-hidden"
          >
            <Image
              source={require("../assets/Gemini_Generated_Image_q4dzjyq4dzjyq4dz.png")}
              className="w-52 h-52 rounded-full"
              resizeMode="cover"
            />
          </View>

          {/* Branding Headers */}
          <Text
            style={{ color: colors.primary }}
            className="text-4xl font-extrabold text-center"
          >
            FreshMart
          </Text>
          <Text
            style={{ color: colors.textMain }}
            className="text-2xl font-bold text-center mt-2"
          >
            Grocery Delivered in Minutes
          </Text>
          <Text
            style={{ color: colors.textMuted }}
            className="text-center mt-3 px-6 text-sm font-medium leading-relaxed"
          >
            Fresh vegetables, fruits, dairy, and grocery items dispatched to your door in 30 minutes!
          </Text>

          {/* Features Pills */}
          <View className="flex-row gap-2 mt-8 justify-center flex-wrap">
            <View
              style={{ backgroundColor: colors.primaryLight, borderColor: colors.primary + '30' }}
              className="rounded-full px-3.5 py-1.5 border"
            >
              <Text style={{ color: colors.primary }} className="font-bold text-xs">🚚 Fast Delivery</Text>
            </View>
            <View
              style={{ backgroundColor: colors.primaryLight, borderColor: colors.primary + '30' }}
              className="rounded-full px-3.5 py-1.5 border"
            >
              <Text style={{ color: colors.primary }} className="font-bold text-xs">✓ Fresh Quality</Text>
            </View>
            <View
              style={{ backgroundColor: colors.primaryLight, borderColor: colors.primary + '30' }}
              className="rounded-full px-3.5 py-1.5 border"
            >
              <Text style={{ color: colors.primary }} className="font-bold text-xs">💰 Best Price</Text>
            </View>
          </View>

          {/* CTA Trigger */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.85}
            style={{
              marginTop: 48,
              borderRadius: 30,
              paddingVertical: 18,
              paddingHorizontal: 64,
              backgroundColor: colors.primary,
              alignItems: "center",
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 8,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16, letterSpacing: 0.5 }}>
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
