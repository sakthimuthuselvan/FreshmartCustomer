import React, { useEffect } from "react";
import { Image, View, StatusBar } from "react-native";
import Text from "../components/AppText";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../src/context/ThemeContext";
import { Leaf } from "lucide-react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userStr = await AsyncStorage.getItem('user');
        if (token && userStr) {
          navigation.replace("Home");
        } else {
          navigation.replace("Login");
        }
      } catch (e) {
        navigation.replace("Login");
      }
    };

    const t = setTimeout(checkSession, 2200);
    return () => clearTimeout(t);
  }, [navigation]);

  // Smooth View-based gradient (100% robust, no native SVG crash risks)
  const renderGradientBackground = () => {
    const steps = 40;
    const startColor = [232, 245, 233]; // #e8f5e9 (Soft Mint Green)
    const endColor = [255, 255, 255];   // #ffffff (White)

    return (
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'column' }}>
        {Array.from({ length: steps }).map((_, i) => {
          const ratio = i / (steps - 1);
          const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * ratio);
          const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * ratio);
          const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * ratio);
          return (
            <View
              key={i}
              style={{
                flex: 1,
                backgroundColor: `rgb(${r}, ${g}, ${b})`,
              }}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      
      {/* Background Gradient */}
      {renderGradientBackground()}

      <View className="flex-1 items-center justify-between px-6 pt-10 pb-12">
        {/* Top Brand Logo matching Screen 01 */}
        <View className="items-center mt-6">
          <View className="w-14 h-14 bg-white rounded-2xl items-center justify-center shadow-sm mb-3 border border-[#e8f0eb]">
            <Leaf size={28} color={colors.primary} fill={colors.primary} />
          </View>
          <Text style={{ color: colors.textMain }} className="text-2xl font-black tracking-tight">
            Fresh<Text style={{ color: colors.primary }}>Day</Text>
          </Text>
          <Text style={{ color: colors.primary }} className="text-[10px] font-black tracking-[6px] uppercase mt-1">
            G R O C E R Y
          </Text>
        </View>

        {/* Main Illustration Section */}
        <View className="items-center w-full">
          <Image
            source={require("../assets/ecom_assets/splash_screen_veg.png")}
            className="w-80 h-80"
            resizeMode="contain"
          />
          <Text style={{ color: colors.textMain }} className="text-xl font-extrabold text-center mt-6 leading-tight">
            Fresh groceries
          </Text>
          <Text style={{ color: colors.textMain }} className="text-xl font-extrabold text-center leading-tight">
            delivered in minutes
          </Text>
        </View>

        {/* Slider indicators */}
        <View className="flex-row gap-1.5 justify-center items-center">
          <View style={{ backgroundColor: colors.primary }} className="w-6 h-1.5 rounded-full" />
          <View style={{ backgroundColor: '#cbd5e1' }} className="w-1.5 h-1.5 rounded-full" />
          <View style={{ backgroundColor: '#cbd5e1' }} className="w-1.5 h-1.5 rounded-full" />
          <View style={{ backgroundColor: '#cbd5e1' }} className="w-1.5 h-1.5 rounded-full" />
        </View>
      </View>
    </SafeAreaView>
  );
}
