import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  ActivityIndicator,
  Animated
} from 'react-native';
import Text from '../components/AppText';
import TextInput from '../components/AppTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../src/context/ThemeContext';
import { useCart } from '../src/context/CartContext';
import api from '../src/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  MapPin,
  ChevronRight,
  Tag,
  Sparkles,
  Clock,
  ShieldCheck,
  ArrowRight,
  Gift,
  CheckCircle2,
  ChevronLeft,
  Navigation,
  Compass,
  AlertTriangle
} from 'lucide-react-native';

export default function CartScreen({
  embedded = false,
  onNavigateHome,
  navigation: propNavigation,
  route: propRoute
}) {
  const hookNavigation = useNavigation();
  const hookRoute = useRoute();

  const navigation = propNavigation || hookNavigation;
  const route = propRoute || hookRoute || { params: {} };

  const { colors } = useTheme();
  const { cart, addToCart, removeFromCart, clearCart, removeOutOfStockItems, syncCartStock, getCartTotal, getCartCount } = useCart();

  // Dynamic coupon states
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Delivery Location states
  const [deliveryAddress, setDeliveryAddress] = useState('Anna Nagar, Chennai - 600040');
  const [detectingLocation, setDetectingLocation] = useState(false);

  useEffect(() => {
    const loadDefaultAddress = async () => {
      try {
        if (route.params?.selectedAddress) {
          const def = route.params.selectedAddress;
          setDeliveryAddress(`${def.houseNo ? def.houseNo + ', ' : ''}${def.street}, ${def.city} - ${def.pincode}`);
          return;
        } else if (route.params?.coords?.addressText) {
          setDeliveryAddress(route.params.coords.addressText);
          return;
        }

        const stored = await AsyncStorage.getItem('savedAddresses');
        if (stored) {
          const parsed = JSON.parse(stored);
          const def = parsed.find(a => a.isDefault) || parsed[0];
          if (def) {
            setDeliveryAddress(`${def.houseNo ? def.houseNo + ', ' : ''}${def.street}, ${def.city} - ${def.pincode}`);
          }
        }
      } catch (err) {
        console.log('Error loading saved address:', err);
      }
    };
    loadDefaultAddress();
  }, [route.params?.selectedAddress, route.params?.coords]);

  const handleUseCurrentLocation = async () => {
    setDetectingLocation(true);
    try {
      const lat = 13.0406;
      const lon = 80.2337;

      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        { headers: { 'User-Agent': 'FreshMartCustomerApp/1.0' } }
      );

      const addressData = res.data?.address || {};
      const road = addressData.road || addressData.suburb || 'Anna Nagar 3rd Main Rd';
      const city = addressData.city || addressData.county || 'Chennai';
      const postcode = addressData.postcode || '600040';

      const detectedAddr = `Door 12/A, ${road}, ${city} - ${postcode}`;
      setDeliveryAddress(detectedAddr);
      await AsyncStorage.setItem('currentCartAddress', detectedAddr);
    } catch (err) {
      setDeliveryAddress('Door 12/A, Anna Nagar West 2nd St, Chennai - 600040');
    } finally {
      setDetectingLocation(false);
    }
  };

  const subtotal = getCartTotal();

  // Fetch available coupons & sync latest product stock from API on mount
  useEffect(() => {
    const fetchDataAndSyncStock = async () => {
      try {
        const [couponRes, prodRes] = await Promise.all([
          api.get('/coupons').catch(() => ({ data: {} })),
          api.get('/products').catch(() => ({ data: {} }))
        ]);

        if (couponRes.data?.coupons) {
          setAvailableCoupons(couponRes.data.coupons);
        }

        if (prodRes.data?.products && Array.isArray(prodRes.data.products)) {
          syncCartStock(prodRes.data.products);
        }
      } catch (err) {
        console.log('Error syncing stock in cart:', err.message);
      }
    };
    fetchDataAndSyncStock();
  }, []);

  // Re-evaluate applied coupon if cart subtotal changes
  useEffect(() => {
    if (appliedCoupon) {
      if (subtotal < (appliedCoupon.minOrderValue || 0)) {
        setAppliedCoupon(null);
        setCouponSuccess('');
        setCouponError(`Coupon ${appliedCoupon.code} removed: minimum order value of ₹${appliedCoupon.minOrderValue} required.`);
      } else if (appliedCoupon.discountType === 'PERCENTAGE') {
        let newDiscount = Math.round(subtotal * (appliedCoupon.discountValue / 100));
        if (appliedCoupon.maxDiscount && newDiscount > appliedCoupon.maxDiscount) {
          newDiscount = appliedCoupon.maxDiscount;
        }
        setAppliedCoupon(prev => (prev ? { ...prev, discountAmount: newDiscount } : null));
      }
    }
  }, [subtotal]);

  // Dynamic Coupon Validation via API
  const handleApplyCoupon = async (codeToApply = null) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    setCouponError('');
    setCouponSuccess('');

    if (!code) {
      setCouponError('Please enter a valid coupon code.');
      return;
    }

    setValidatingCoupon(true);
    try {
      const res = await api.post('/coupons/validate', {
        code,
        cartTotal: subtotal
      });

      if (res.data?.valid && res.data?.coupon) {
        setAppliedCoupon(res.data.coupon);
        setCouponSuccess(res.data.message || `🎉 Coupon ${code} applied successfully!`);
        setCouponInput('');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid or inapplicable coupon code.';
      setCouponError(msg);
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponError('');
  };

  const discount = appliedCoupon?.discountAmount || 0;
  const deliveryFee = subtotal >= 199 || appliedCoupon?.discountType === 'FREESHIP' ? 0 : 15;
  const finalTotal = Math.max(0, subtotal + deliveryFee - discount);

  // Free shipping progress calculation (Free delivery threshold = ₹199)
  const freeShipThreshold = 199;
  const freeShipProgress = Math.min(1, subtotal / freeShipThreshold);
  const amountNeededForFreeShip = Math.max(0, freeShipThreshold - subtotal);

  const applyQuickCoupon = (code) => {
    setCouponInput(code);
    setCouponError('');
    setCouponSuccess('');
  };

  const handleGoBack = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8faf9' }}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

      {/* Header bar */}
      <View className="px-5 py-4 bg-white border-b border-slate-100 flex-row items-center justify-between shadow-xs">
        <View className="flex-row items-center gap-3">
          {!embedded && navigation.canGoBack() && (
            <TouchableOpacity onPress={handleGoBack} className="p-1 rounded-full bg-slate-100">
              <ChevronLeft size={22} color={colors.textMain} />
            </TouchableOpacity>
          )}
          <View>
            <Text style={{ color: colors.textMain }} className="text-xl font-black tracking-tight">
              My Fresh Cart
            </Text>
            <Text style={{ color: colors.textMuted }} className="text-xs font-bold">
              {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
            </Text>
          </View>
        </View>

        {cart.length > 0 && (
          <TouchableOpacity
            onPress={clearCart}
            activeOpacity={0.7}
            className="flex-row items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded-xl border border-red-100"
          >
            <Trash2 size={14} color="#ef4444" />
            <Text className="text-red-500 text-xs font-black">Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {cart.length === 0 ? (
        /* Empty Cart View */
        <View className="flex-1 items-center justify-center px-6 py-12 bg-white">
          <View className="w-40 h-40 rounded-full bg-emerald-50 items-center justify-center mb-6 shadow-inner">
            <Image
              source={require("../assets/ecom_assets/empty_cart.png")}
              className="w-32 h-32"
              resizeMode="contain"
            />
          </View>
          <Text style={{ color: colors.textMain }} className="text-xl font-black text-center">
            Your Cart is Empty!
          </Text>
          <Text style={{ color: colors.textMuted }} className="text-xs font-semibold text-center mt-2 px-6 leading-relaxed">
            Fill your basket with fresh fruits, farm veggies, and organic groceries from FreshMart store.
          </Text>
          <TouchableOpacity
            onPress={() => (onNavigateHome ? onNavigateHome() : navigation.navigate('Home'))}
            style={{ backgroundColor: colors.primary }}
            className="mt-8 rounded-2xl px-8 py-4 shadow-lg shadow-emerald-700/25 flex-row items-center gap-2"
          >
            <ShoppingBag size={18} color="white" />
            <Text className="text-white font-black text-sm">Start Shopping Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-1">
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5 pt-4 space-y-4">
            {/* Free Delivery Goal Banner */}
            <View className="bg-emerald-950 p-4 rounded-3xl border border-emerald-800 shadow-md mb-2 overflow-hidden relative">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <View className="w-7 h-7 rounded-full bg-emerald-500/20 items-center justify-center">
                    <Sparkles size={16} color="#34d399" />
                  </View>
                  <Text className="text-emerald-100 text-xs font-black">
                    {amountNeededForFreeShip === 0
                      ? '🎉 FREE Express Delivery Unlocked!'
                      : `Add ₹${amountNeededForFreeShip} more for FREE Delivery`}
                  </Text>
                </View>
                <Text className="text-emerald-400 text-[10px] font-black">
                  {Math.round(freeShipProgress * 100)}%
                </Text>
              </View>

              {/* Progress bar line */}
              <View className="w-full h-2 bg-emerald-900 rounded-full overflow-hidden">
                <View
                  style={{ width: `${freeShipProgress * 100}%` }}
                  className="h-full bg-emerald-400 rounded-full"
                />
              </View>
            </View>

            {/* Out of Stock Warning Banner */}
            {(() => {
              const outOfStockCount = cart.filter(
                (item) =>
                  item.product.stock !== undefined
                    ? item.product.stock <= 0
                    : item.product.isAvailable === false || item.product.isActive === false
              ).length;
              if (outOfStockCount === 0) return null;
              return (
                <View className="bg-red-50/90 border border-red-200 p-4 rounded-3xl flex-row items-center justify-between mb-2 shadow-xs">
                  <View className="flex-row items-center gap-3 flex-1 pr-2">
                    <View className="w-9 h-9 rounded-2xl bg-red-100 items-center justify-center">
                      <AlertTriangle size={20} color="#dc2626" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-red-900 text-xs font-black">
                        {outOfStockCount} {outOfStockCount === 1 ? 'item is' : 'items are'} Currently Not Orderable
                      </Text>
                      <Text className="text-red-700 text-[10px] font-semibold mt-0.5">
                        These items are out of stock and excluded from your total bill.
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={removeOutOfStockItems}
                    className="bg-red-600 px-3.5 py-2 rounded-2xl shadow-xs"
                  >
                    <Text className="text-white text-[10px] font-black uppercase">Remove All</Text>
                  </TouchableOpacity>
                </View>
              );
            })()}

            {/* Cart Items List */}
            <View className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3 mb-2">
              <Text style={{ color: colors.textMain }} className="text-xs font-black uppercase tracking-wider mb-1">
                Items ({cart.length})
              </Text>

              {cart.map((item, index) => {
                const isOutOfStock =
                  item.product.stock !== undefined
                    ? item.product.stock <= 0
                    : item.product.isAvailable === false || item.product.isActive === false;
                const maxStock = item.product.stock !== undefined && item.product.stock !== null ? item.product.stock : Infinity;
                const isExceedingStock = !isOutOfStock && item.quantity > maxStock;

                return (
                  <View
                    key={item.product._id}
                    className={`flex-row items-center justify-between py-3 px-2 rounded-2xl ${index !== cart.length - 1 ? 'border-b border-slate-100' : ''
                      } ${isOutOfStock ? 'bg-slate-50/80 opacity-80' : ''}`}
                  >
                    <View className="flex-row items-center gap-3 flex-1 pr-2">
                      <Image
                        source={{ uri: item.product.image }}
                        className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100"
                        resizeMode="contain"
                        style={{ opacity: isOutOfStock ? 0.35 : 1 }}
                      />
                      <View className="flex-1">
                        <View className="flex-row items-center gap-1.5 flex-wrap">
                          <Text
                            style={{ color: isOutOfStock ? colors.textMuted : colors.textMain }}
                            className={`text-xs font-black leading-snug ${isOutOfStock ? 'line-through opacity-70' : ''}`}
                            numberOfLines={2}
                          >
                            {item.product.name}
                          </Text>
                          {isOutOfStock ? (
                            <View className="bg-red-100 border border-red-300 rounded-lg px-2 py-0.5 flex-row items-center gap-1">
                              <Text className="text-[8px] text-red-700 font-extrabold uppercase tracking-wider">
                                SOLD OUT • 0 AVAILABLE
                              </Text>
                            </View>
                          ) : isExceedingStock ? (
                            <View className="bg-amber-100 border border-amber-200 rounded px-1.5 py-0.5">
                              <Text className="text-[8px] text-amber-800 font-extrabold uppercase">
                                MAX {maxStock} IN STOCK
                              </Text>
                            </View>
                          ) : item.product.stock !== undefined && item.product.stock > 0 && item.product.stock <= 3 ? (
                            <View className="bg-amber-100 border border-amber-200 rounded px-1.5 py-0.5">
                              <Text className="text-[8px] text-amber-700 font-extrabold uppercase">
                                ONLY {item.product.stock} LEFT
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        <View className="flex-row items-center gap-1.5 mt-1 flex-wrap">
                          <Text
                            style={{ color: isOutOfStock ? colors.textMuted : colors.primary }}
                            className={`text-xs font-black ${isOutOfStock ? 'line-through opacity-60' : ''}`}
                          >
                            ₹{item.product.price}
                          </Text>
                          <Text className="text-slate-400 text-[10px] font-semibold">
                            / {item.product.unit || '1 kg'}
                          </Text>
                          {isOutOfStock ? (
                            <Text className="text-red-600 text-[9px] font-extrabold">
                              (Sold Out — Added: {item.quantity} | Billed: ₹0)
                            </Text>
                          ) : isExceedingStock ? (
                            <Text className="text-amber-600 text-[9px] font-extrabold">
                              (Billed for {maxStock} items)
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    </View>

                    {/* Stepper controls */}
                    <View className="flex-row items-center bg-slate-100 rounded-2xl px-2 py-1.5 border border-slate-200">
                      <TouchableOpacity
                        onPress={() => removeFromCart(item.product._id)}
                        className="w-7 h-7 rounded-xl bg-white items-center justify-center shadow-xs"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        {isOutOfStock && item.quantity <= 1 ? (
                          <Trash2 size={13} color="#ef4444" />
                        ) : (
                          <Minus size={14} color="#0f172a" />
                        )}
                      </TouchableOpacity>
                      <Text className={`text-xs font-black px-3 ${isOutOfStock ? 'text-slate-400' : 'text-slate-900'}`}>
                        {item.quantity}
                      </Text>
                      <TouchableOpacity
                        onPress={() => addToCart(item.product)}
                        disabled={isOutOfStock || (maxStock !== Infinity && item.quantity >= maxStock)}
                        style={{
                          backgroundColor:
                            isOutOfStock || (maxStock !== Infinity && item.quantity >= maxStock)
                              ? '#cbd5e1'
                              : colors.primary
                        }}
                        className="w-7 h-7 rounded-xl items-center justify-center shadow-xs"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Plus size={14} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Coupons & Offers Section */}
            <View className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3 mb-2">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="p-2 bg-amber-50 rounded-xl">
                    <Tag size={18} color="#f59e0b" />
                  </View>
                  <Text style={{ color: colors.textMain }} className="text-xs font-black uppercase tracking-wider">
                    Coupons & Offers
                  </Text>
                </View>
                {appliedCoupon && (
                  <View className="bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex-row items-center gap-1">
                    <CheckCircle2 size={12} color={colors.primary} />
                    <Text style={{ color: colors.primary }} className="text-[10px] font-black">
                      {appliedCoupon.code} Applied
                    </Text>
                  </View>
                )}
              </View>

              {/* Coupon input field */}
              <View className="flex-row items-center gap-2 mt-1">
                <View className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1 flex-row items-center">
                  <TextInput
                    placeholder="Enter Coupon Code (e.g. FRESH50)"
                    placeholderTextColor="#94a3b8"
                    value={couponInput}
                    onChangeText={(val) => {
                      setCouponInput(val);
                      setCouponError('');
                    }}
                    autoCapitalize="characters"
                    className="flex-1 text-xs font-bold text-slate-800 py-2"
                    editable={!appliedCoupon}
                  />
                </View>

                {appliedCoupon ? (
                  <TouchableOpacity
                    onPress={handleRemoveCoupon}
                    className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3"
                  >
                    <Text className="text-red-500 text-xs font-black">Remove</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleApplyCoupon()}
                    disabled={validatingCoupon}
                    style={{ backgroundColor: colors.primary }}
                    className="rounded-2xl px-5 py-3 shadow-sm min-w-[70px] items-center justify-center"
                  >
                    {validatingCoupon ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text className="text-white text-xs font-black">Apply</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {couponError ? (
                <Text className="text-red-500 text-[11px] font-semibold mt-1 pl-1">
                  ⚠️ {couponError}
                </Text>
              ) : null}

              {couponSuccess ? (
                <Text className="text-emerald-600 text-[11px] font-semibold mt-1 pl-1">
                  {couponSuccess}
                </Text>
              ) : null}

              {/* Dynamic Quick Promo Badges from API */}
              {!appliedCoupon && availableCoupons.length > 0 && (
                <View className="pt-2 border-t border-slate-100">
                  <Text className="text-slate-400 text-[10px] font-bold mb-2">Available Store Coupons:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                    {availableCoupons.map((promo) => (
                      <TouchableOpacity
                        key={promo._id || promo.code}
                        onPress={() => handleApplyCoupon(promo.code)}
                        className="bg-amber-50/80 border border-amber-200/90 rounded-xl px-3 py-1.5 flex-row items-center gap-1.5 mr-2 shadow-xs"
                      >
                        <Gift size={12} color="#d97706" />
                        <Text className="text-amber-800 text-[10px] font-extrabold">{promo.code}</Text>
                        <Text className="text-amber-600 text-[9px] font-medium">• {promo.description || `Min order ₹${promo.minOrderValue}`}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Delivery Address & GPS Location Card */}
            <View className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm mb-3 space-y-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="w-9 h-9 rounded-2xl bg-emerald-50 items-center justify-center">
                    <MapPin size={18} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={{ color: colors.textMain }} className="text-xs font-black">
                      Delivery Location
                    </Text>
                    <Text className="text-emerald-600 text-[10px] font-extrabold">⚡ 15-Min Express Delivery</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => navigation.navigate('Address', { fromCart: true, returnScreen: 'Home' })}
                  className="px-3 py-1 bg-slate-100 rounded-xl flex-row items-center gap-1"
                >
                  <Text className="text-slate-600 text-[11px] font-bold">Change</Text>
                  <ChevronRight size={14} color="#64748b" />
                </TouchableOpacity>
              </View>

              {/* Current Address Text */}
              <View className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <Text style={{ color: colors.textMain }} className="text-xs font-bold leading-relaxed" numberOfLines={2}>
                  {deliveryAddress}
                </Text>
              </View>

              {/* Simple Approach: Use Current Location GPS Button */}
              <TouchableOpacity
                onPress={handleUseCurrentLocation}
                disabled={detectingLocation}
                className="bg-emerald-950 p-3 rounded-2xl border border-emerald-800 flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                  <View className="w-7 h-7 rounded-xl bg-emerald-500/20 items-center justify-center">
                    {detectingLocation ? (
                      <ActivityIndicator size="small" color="#34d399" />
                    ) : (
                      <Navigation size={15} color="#34d399" />
                    )}
                  </View>
                  <Text className="text-emerald-100 text-xs font-black">
                    {detectingLocation ? 'Detecting GPS coordinates...' : 'Use Current Location'}
                  </Text>
                </View>

                <View className="bg-emerald-500 px-2.5 py-1 rounded-xl flex-row items-center gap-1">
                  <Compass size={12} color="white" />
                  <Text className="text-white text-[10px] font-black">AUTO GPS</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Billing Summary Card */}
            <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-8">
              <Text style={{ color: colors.textMain }} className="text-xs font-black uppercase tracking-wider pb-3 border-b border-slate-100 mb-2">
                Bill Details
              </Text>

              <View style={{ paddingVertical: 6 }} className="flex-row justify-between items-center">
                <Text className="text-slate-500 text-xs font-semibold">Items Subtotal</Text>
                <Text className="text-slate-800 text-xs font-black">₹{subtotal}</Text>
              </View>

              <View style={{ paddingVertical: 6 }} className="flex-row justify-between items-center">
                <Text className="text-slate-500 text-xs font-semibold">Delivery Charge</Text>
                {deliveryFee === 0 ? (
                  <Text style={{ color: colors.primary }} className="text-xs font-black uppercase">
                    FREE
                  </Text>
                ) : (
                  <Text className="text-slate-800 text-xs font-black">₹{deliveryFee}</Text>
                )}
              </View>

              {discount > 0 && (
                <View style={{ paddingVertical: 6 }} className="flex-row justify-between items-center">
                  <Text className="text-emerald-600 text-xs font-semibold">
                    Discount ({appliedCoupon?.code})
                  </Text>
                  <Text className="text-emerald-600 text-xs font-black">-₹{discount}</Text>
                </View>
              )}

              <View className="w-full h-px bg-slate-100 my-3" />

              <View style={{ paddingTop: 4 }} className="flex-row justify-between items-center">
                <View>
                  <Text style={{ color: colors.textMain }} className="text-sm font-black">
                    Grand Total
                  </Text>
                  <Text className="text-slate-400 text-[10px] font-medium mt-0.5">Taxes included</Text>
                </View>
                <Text style={{ color: colors.primary }} className="text-xl font-black">
                  ₹{finalTotal}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Sticky Bottom Checkout Action Bar */}
          <View className="bg-white px-6 py-4 border-t border-slate-100 flex-row items-center justify-between shadow-2xl">
            <View>
              <Text className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">Total Amount</Text>
              <Text style={{ color: colors.textMain }} className="text-xl font-black mt-0.5">
                ₹{finalTotal}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                if (subtotal === 0) return;
                navigation.navigate('Checkout', {
                  appliedCoupon: appliedCoupon ? appliedCoupon.code : null
                });
              }}
              disabled={subtotal === 0}
              style={{ backgroundColor: subtotal === 0 ? '#94a3b8' : colors.primary }}
              className="rounded-2xl px-7 py-4 items-center justify-center flex-row gap-2.5 shadow-lg shadow-emerald-700/25"
            >
              <Text className="text-white font-extrabold text-sm">
                {subtotal === 0 ? 'No In-Stock Items' : 'Proceed to Checkout'}
              </Text>
              {subtotal > 0 && <ArrowRight size={18} color="white" />}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
