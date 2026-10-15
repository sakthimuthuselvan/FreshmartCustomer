import React, { useState, useRef, useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';

import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import Text from '../components/AppText';
import TextInput from '../components/AppTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../src/context/ThemeContext';
import api, { setAuthToken } from '../src/api/api';
import { ChevronLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getIdToken } from '@react-native-firebase/auth';

export default function OtpScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();

  const { phone, confirmation } = route.params || { phone: '98765 43210', confirmation: null };

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  // Countdown timer for Resend OTP (Mockup 03)
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer(timer - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const codeString = otp.join('');
    if (codeString.length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      let res;
      if (confirmation) {
        console.log('[Firebase Auth] Confirming OTP with Firebase...');
        const userCredential = await confirmation.confirm(codeString);
        const firebaseToken = await getIdToken(userCredential.user);
        console.log("firebaseToken ", firebaseToken);

        console.log('[Firebase Auth] Exchanging Firebase token with Backend...');
        res = await api.post('/customer/verify-otp', {
          firebaseToken,
          phone,
          otp: codeString
        });
      } else {
        console.log('[Mock Auth] Verifying mock OTP with Backend...');
        res = await api.post('/customer/verify-otp', {
          phone,
          otp: codeString,
        });
      }

      setAuthToken(res.data.token);
      await AsyncStorage.setItem('token', res.data.token);
      if (res.data.user) {
        await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
      }

      // Auto-register device FCM token for push notifications
      try {
        const token = await messaging().getToken();
        if (token) {
          await api.patch('/customer/profile', { fcmToken: token });
          console.log('📣 [FCM Device Token auto-registered on login]:', token);
        }
      } catch (fcmErr) {
        console.log('FCM token auto-registration notice:', fcmErr.message);
      }

      navigation.replace('LocationPermission');

    } catch (err) {
      console.log('OTP Verification error:', err.response?.data || err.message || err);
      setError(err.response?.data?.error || 'Invalid verification code. Use default code 123456.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: 'padding' })}
        className="flex-1 bg-white"
      >
        <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

        {/* Header Back Button */}
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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 pb-12 items-center">
            <View className="items-center mt-6 w-full">
              <Text style={{ color: colors.textMain }} className="text-2xl font-black text-center mb-3">
                Enter OTP
              </Text>

              <Text style={{ color: colors.textMuted }} className="text-xs font-semibold text-center leading-relaxed">
                We've sent a 6-digit code to
              </Text>
              <Text style={{ color: colors.textMain }} className="text-sm font-extrabold text-center mt-1">
                +91 {phone}
              </Text>

              {/* OTP Grid (Mockup 03 cell layout style) */}
              <View className="flex-row justify-between w-full mt-12 px-2">
                {otp.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={inputRefs[idx]}
                    value={digit}
                    onChangeText={(val) => handleOtpChange(val.replace(/[^0-9]/g, ''), idx)}
                    onKeyPress={(e) => handleKeyPress(e, idx)}
                    keyboardType="number-pad"
                    maxLength={1}
                    style={{
                      borderColor: otp[idx] ? colors.primary : colors.border,
                      backgroundColor: '#f8fafc',
                      color: colors.textMain,
                    }}
                    className="w-[13%] aspect-square text-center text-xl font-black border-2 rounded-2xl shadow-sm"
                  />
                ))}
              </View>

              {error ? (
                <Text className="text-red-500 text-xs font-semibold mt-4 text-center">{error}</Text>
              ) : null}

              {/* Resend Timer indicators */}
              <View className="items-center mt-8">
                {timer > 0 ? (
                  <Text style={{ color: colors.textMuted }} className="text-xs font-bold">
                    Resend OTP in{' '}
                    <Text style={{ color: colors.primary }} className="font-extrabold">
                      00:{timer < 10 ? `0${timer}` : timer}
                    </Text>
                  </Text>
                ) : (
                  <View className="flex-row items-center">
                    <Text style={{ color: colors.textMuted }} className="text-xs font-bold mr-1">Didn't receive code?</Text>
                    <TouchableOpacity onPress={() => setTimer(30)} activeOpacity={0.7}>
                      <Text style={{ color: colors.primary }} className="text-xs font-black">Resend OTP</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* Action Trigger Button */}
            <View className="w-full mt-10">
              <TouchableOpacity
                onPress={handleVerifyOtp}
                disabled={loading}
                activeOpacity={0.85}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 20,
                  paddingVertical: 18,
                  alignItems: 'center',
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
                    Verify OTP
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
