import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Image,
  PermissionsAndroid,
  Platform,
  BackHandler
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../src/context/ThemeContext';
import { Navigation } from 'lucide-react-native';

export default function LocationPermissionScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const backAction = () => {
      // Prevent back navigation to Otp screen once authenticated
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const handleRequestLocation = async () => {
    setLoading(true);
    let hasPermission = false;

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "FreshMart Location Service",
            message: "FreshMart needs access to your location to find nearby stores and delivery areas.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        hasPermission = (granted === PermissionsAndroid.RESULTS.GRANTED);
      } catch (err) {
        console.warn('Native permission request failed:', err);
      }
    } else {
      // iOS Simulator fallback
      hasPermission = true;
    }

    setLoading(false);

    if (hasPermission) {
      // Set default Chennai coordinates on approval
      const coords = {
        latitude: 13.0406,
        longitude: 80.2337,
        addressText: 'Anna Nagar, Chennai'
      };
      navigation.replace('Home', { coords });
    } else {
      // Direct them to manual picker if permission is denied
      alert("Location permission denied. Please search and select your location manually.");
      navigation.replace('SelectLocation');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      <View className="flex-1 items-center justify-center px-6 py-12">
        {/* Large Decorative Radar & Pin Icon (Mockup 04) */}
        <Image
          source={require("../assets/ecom_assets/location_access.png")}
          className="w-72 h-72 mb-8"
          resizeMode="contain"
        />

        <View className="items-center w-full max-w-[90%] mb-12">
          <Text style={{ color: colors.textMain }} className="text-2xl font-black text-center mb-3">
            Enable Location Access
          </Text>
          <Text style={{ color: colors.textMuted }} className="text-center text-xs font-bold leading-relaxed px-4">
            Allow location access to check delivery availability in your area
          </Text>
        </View>

        <View className="w-full space-y-4 px-2">
          <TouchableOpacity
            onPress={handleRequestLocation}
            disabled={loading}
            activeOpacity={0.85}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 20,
              paddingVertical: 18,
              alignItems: 'center',
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center gap-2">
                <Navigation size={18} color="white" />
                <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>
                  Allow Location
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('SelectLocation')}
            activeOpacity={0.7}
            className="py-3 items-center"
          >
            <Text style={{ color: colors.textMuted }} className="text-xs font-black">
              Select Location Manually
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
