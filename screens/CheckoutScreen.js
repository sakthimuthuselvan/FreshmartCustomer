import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../src/context/ThemeContext';
import { useCart } from '../src/context/CartContext';
import api from '../src/api/api';
import { ChevronLeft, MapPin, CreditCard, Check, Zap } from 'lucide-react-native';

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { cart, getCartTotal, clearCart, getCartCount } = useCart();

  const coords = route.params?.coords || {
    latitude: 13.0406,
    longitude: 80.2337,
    addressText: 'Home - 12, Anna Nagar, Chennai'
  };

  const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI or COD (Mockup 11 has UPI active)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const appliedCoupon = route.params?.appliedCoupon || null;

  const getCouponDiscount = () => {
    if (!appliedCoupon) return 0;
    const total = getCartTotal();
    if (appliedCoupon === 'FRESH50') {
      return total >= 150 ? 50 : 0;
    }
    if (appliedCoupon === 'WELCOME20') {
      if (total >= 100) {
        const discount = Math.round(total * 0.2);
        return discount > 100 ? 100 : discount;
      }
      return 0;
    }
    return 0;
  };

  const deliveryCharge = appliedCoupon === 'FREESHIP' ? 0 : 15;
  const discountAmount = getCouponDiscount();
  const finalTotal = Math.max(0, getCartTotal() + deliveryCharge - discountAmount);

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    // Format cart items
    const orderItems = cart.map((item) => ({
      productId: item.product._id,
      quantity: item.quantity,
    }));

    const orderPayload = {
      items: orderItems,
      address: {
        addressName: 'Home',
        phone: '9876543210',
        houseNo: '12',
        street: 'Anna Nagar',
        landmark: 'Near Park',
        latitude: coords.latitude,
        longitude: coords.longitude,
      },
      specialInstructions: 'Leave at front gate',
      couponCode: appliedCoupon || undefined
    };

    try {
      const res = await api.post('/orders', orderPayload);
      const newOrder = res.data.order;
      
      // Reset the local cart state
      clearCart();

      // Navigate to order success screen
      navigation.replace('OrderSuccess', {
        orderId: newOrder._id,
        orderNumber: newOrder.orderNumber,
      });
    } catch (err) {
      console.log('Error placing order:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to place order. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

      {/* Header bar (Mockup 11) */}
      <View 
        style={{ borderBottomColor: colors.border }}
        className="px-5 py-4 border-b flex-row items-center gap-3 bg-white"
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="p-1 rounded-full hover:bg-slate-100"
        >
          <ChevronLeft size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={{ color: colors.textMain }} className="text-lg font-black">Checkout</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-5">
        <View className="space-y-6 pb-12">
          {/* Deliver Address Details Card (Mockup 11) */}
          <View className="space-y-2.5">
            <View className="flex-row items-center justify-between">
              <Text style={{ color: colors.textMain }} className="text-xs font-black uppercase tracking-wider">Deliver to</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Address')}>
                <Text style={{ color: colors.primary }} className="text-xs font-extrabold">Change</Text>
              </TouchableOpacity>
            </View>
            
            <View 
              style={{ borderColor: colors.border, backgroundColor: colors.card }}
              className="border-2 rounded-2xl p-4 flex-row items-center gap-3.5 shadow-sm"
            >
              <View 
                style={{ backgroundColor: colors.primaryLight }}
                className="p-2.5 rounded-full"
              >
                <MapPin size={20} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.textMain }} className="text-xs font-black">{coords.addressText}</Text>
              </View>
            </View>
          </View>

          {/* Pricing Summary card (Mockup 11) */}
          <View className="space-y-2.5">
            <Text style={{ color: colors.textMain }} className="text-xs font-black uppercase tracking-wider">Order Summary</Text>
            <View 
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
              className="rounded-2xl p-4 border-2 space-y-3 shadow-sm"
            >
              <View className="flex-row justify-between">
                <Text style={{ color: colors.textMuted }} className="text-xs font-semibold">Items ({getCartCount()})</Text>
                <Text style={{ color: colors.textMain }} className="text-xs font-black">₹{getCartTotal()}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text style={{ color: colors.textMuted }} className="text-xs font-semibold">Delivery Fee</Text>
                <Text style={{ color: colors.textMain }} className="text-xs font-black">₹{deliveryCharge}</Text>
              </View>
              {appliedCoupon ? (
                <View className="flex-row justify-between">
                  <Text className="text-emerald-600 text-xs font-semibold">Discount ({appliedCoupon})</Text>
                  <Text className="text-emerald-600 text-xs font-black">-₹{discountAmount}</Text>
                </View>
              ) : null}
              <View style={{ backgroundColor: colors.border }} className="w-full h-px my-1" />
              <View className="flex-row justify-between">
                <Text style={{ color: colors.textMain }} className="text-xs font-black">To Pay</Text>
                <Text style={{ color: colors.primary }} className="text-sm font-black">₹{finalTotal}</Text>
              </View>
            </View>
          </View>

          {/* Payment Method Selector (Mockup 11) */}
          <View className="space-y-2.5">
            <Text style={{ color: colors.textMain }} className="text-xs font-black uppercase tracking-wider">Payment Method</Text>
            <View className="space-y-3">
              {/* UPI option */}
              <TouchableOpacity
                onPress={() => setPaymentMethod('UPI')}
                style={{ borderColor: paymentMethod === 'UPI' ? colors.primary : colors.border, backgroundColor: colors.card }}
                className="border-2 rounded-2xl p-4 flex-row items-center justify-between shadow-sm cursor-pointer"
              >
                <View className="flex-row items-center gap-3">
                  <CreditCard size={18} color={paymentMethod === 'UPI' ? colors.primary : colors.textMuted} />
                  <Text style={{ color: colors.textMain }} className="text-xs font-black">UPI / Online Payment</Text>
                </View>
                <View 
                  style={{ 
                    borderColor: paymentMethod === 'UPI' ? colors.primary : colors.border,
                    backgroundColor: paymentMethod === 'UPI' ? colors.primary : 'transparent'
                  }}
                  className="w-5 h-5 rounded-full border-2 items-center justify-center"
                >
                  {paymentMethod === 'UPI' && <Check size={10} color="white" className="stroke-[3]" />}
                </View>
              </TouchableOpacity>

              {/* Cash on Delivery option */}
              <TouchableOpacity
                onPress={() => setPaymentMethod('COD')}
                style={{ borderColor: paymentMethod === 'COD' ? colors.primary : colors.border, backgroundColor: colors.card }}
                className="border-2 rounded-2xl p-4 flex-row items-center justify-between shadow-sm cursor-pointer"
              >
                <View className="flex-row items-center gap-3">
                  <CreditCard size={18} color={paymentMethod === 'COD' ? colors.primary : colors.textMuted} />
                  <Text style={{ color: colors.textMain }} className="text-xs font-black">Cash on Delivery</Text>
                </View>
                <View 
                  style={{ 
                    borderColor: paymentMethod === 'COD' ? colors.primary : colors.border,
                    backgroundColor: paymentMethod === 'COD' ? colors.primary : 'transparent'
                  }}
                  className="w-5 h-5 rounded-full border-2 items-center justify-center"
                >
                  {paymentMethod === 'COD' && <Check size={10} color="white" className="stroke-[3]" />}
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {error ? (
            <Text className="text-red-500 text-xs font-semibold text-center mt-2">{error}</Text>
          ) : null}
        </View>
      </ScrollView>

      {/* Place Order CTA Card (Mockup 11) */}
      <View 
        style={{ borderTopColor: colors.border }}
        className="px-6 py-4 border-t bg-white items-center gap-3"
      >
        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={loading}
          activeOpacity={0.85}
          style={{ backgroundColor: colors.primary }}
          className="rounded-2xl py-5 w-full items-center justify-center shadow-md shadow-emerald-700/20"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-extrabold text-base">Place Order • ₹{finalTotal}</Text>
          )}
        </TouchableOpacity>

        {/* 10-20 min banner under button */}
        <View className="flex-row items-center gap-1.5 mt-1.5">
          <Zap size={14} color={colors.primary} fill={colors.primary} />
          <Text style={{ color: colors.primary }} className="text-xs font-extrabold">Delivery in 10-20 Mins</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
