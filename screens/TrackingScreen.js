import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  StatusBar,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../src/context/ThemeContext';
import api from '../src/api/api';
import {
  ChevronLeft,
  Phone,
  MessageSquare,
  Clock,
  Check,
  MapPin,
  Home,
  Truck,
  Package
} from 'lucide-react-native';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const MAP_HEIGHT = 240;

// Coordinates along our bezier road path d="M 60 170 Q 180 220 200 120 T 330 70"
const WAYPOINTS = [
  { x: 60, y: 170 },
  { x: 100, y: 185 },
  { x: 140, y: 195 },
  { x: 180, y: 185 },
  { x: 195, y: 140 },
  { x: 215, y: 110 },
  { x: 250, y: 92 },
  { x: 290, y: 80 },
  { x: 330, y: 70 }
];

export default function TrackingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();

  const { orderId } = route.params || { orderId: '' };

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Animated values for Rider progress (0 to 1)
  const riderProgress = useSharedValue(0);
  // Pulsing ring scale for pins
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    fetchOrderDetails();

    // Poll the backend for live status updates every 5 seconds
    const interval = setInterval(fetchOrderDetails, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  // Set up looping animations for rider and pins
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1000, easing: Easing.ease }),
        withTiming(1, { duration: 1000, easing: Easing.ease })
      ),
      -1,
      true
    );
  }, []);

  const fetchOrderDetails = async () => {
    if (!orderId) {
      // Setup default mock tracking for presentation
      const mockOrder = {
        orderNumber: '#FD12345678',
        orderStatus: 'DELIVERING',
        finalTotal: 150,
        deliveryPartnerId: {
          name: 'Ravi Kumar',
          phone: '9876543210'
        }
      };
      setOrder(mockOrder);
      updateRiderPosition(mockOrder.orderStatus);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(`/orders/${orderId}`);
      const fetchedOrder = res.data.order;
      setOrder(fetchedOrder);
      updateRiderPosition(fetchedOrder.orderStatus);
    } catch (err) {
      console.log('Error fetching tracking status:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateRiderPosition = (status) => {
    // Placed/Confirmed -> Start of path
    if (['PENDING', 'CONFIRMED', 'ASSIGNED'].includes(status)) {
      riderProgress.value = withTiming(0, { duration: 1500 });
    }
    // Preparing/Packed -> Left warehouse (25%)
    else if (['PREPARING', 'PACKED'].includes(status)) {
      riderProgress.value = withTiming(0.25, { duration: 1500 });
    }
    // Delivering -> Moves along path (loops between 40% and 80% to represent on the way!)
    else if (status === 'DELIVERING' || status === 'PICKED_UP') {
      // Loop rider on the road path to show motion
      riderProgress.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 2500, easing: Easing.linear }),
          withTiming(0.8, { duration: 4000, easing: Easing.linear })
        ),
        -1,
        true
      );
    }
    // Delivered -> Home (100%)
    else if (status === 'DELIVERED') {
      riderProgress.value = withTiming(1, { duration: 2000 });
    }
  };

  const handleCallPartner = (phone) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  // Reanimated style to position the rider motor bike along the waypoints path
  const riderAnimatedStyle = useAnimatedStyle(() => {
    // Clamp progress between 0 and 1 to prevent overshoot index out-of-bounds errors
    const t = Math.max(0, Math.min(riderProgress.value, 1));

    // Find segment
    const segmentCount = WAYPOINTS.length - 1;
    const index = Math.max(0, Math.min(Math.floor(t * segmentCount), segmentCount - 1));
    const segmentProgress = (t * segmentCount) - index;

    const p0 = WAYPOINTS[index] || WAYPOINTS[0];
    const p1 = WAYPOINTS[index + 1] || WAYPOINTS[WAYPOINTS.length - 1];

    // Linearly interpolate between waypoints
    const x = p0.x + (p1.x - p0.x) * segmentProgress;
    const y = p0.y + (p1.y - p0.y) * segmentProgress;

    // Scale coordinates from design viewbox (400x240) to screen width
    const scaleX = width / 400;
    const scaleY = MAP_HEIGHT / 240;

    return {
      transform: [
        { translateX: x * scaleX },
        { translateY: y * scaleY }
      ]
    };
  });

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const status = order ? order.orderStatus : 'PLACED';

  const isStepActive = (stepIndex) => {
    switch (stepIndex) {
      case 0: // Placed
        return true;
      case 1: // Preparing
        return ['ASSIGNED', 'PREPARING', 'PICKED_UP', 'DELIVERING', 'DELIVERED'].includes(status);
      case 2: // Packed
        return ['PICKED_UP', 'DELIVERING', 'DELIVERED'].includes(status);
      case 3: // Out for Delivery
        return ['DELIVERING', 'DELIVERED'].includes(status);
      case 4: // Delivered
        return status === 'DELIVERED';
      default:
        return false;
    }
  };

  const steps = [
    { label: 'Order Placed', desc: 'Your order has been registered.', time: '10:30 AM' },
    { label: 'Preparing', desc: 'Your order is being prepared', time: '10:35 AM' },
    { label: 'Packed', desc: 'Your order is packed', time: '10:46 AM' },
    { label: 'Out for Delivery', desc: 'Our courier is on the way', time: '10:55 AM' },
    { label: 'Delivered', desc: 'Enjoy your order 🍃', time: '11:10 AM' }
  ];

  // Scale map markers to fit window width dynamically
  const scaleX = width / 400;
  const scaleY = MAP_HEIGHT / 240;

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Top half: Custom SVG stylized vector map */}
      <View style={{ width: '100%', height: MAP_HEIGHT, backgroundColor: '#f1f5f9' }} className="relative">
        <Svg width="100%" height={MAP_HEIGHT} viewBox={`0 0 ${width} ${MAP_HEIGHT}`}>
          {/* Background Blocks representing parks & waterways */}
          <Rect x={0} y={0} width={width} height={MAP_HEIGHT} fill="#f1f5f9" />
          {/* Green park shape */}
          <Path d={`M 0 0 Q ${width * 0.3} ${MAP_HEIGHT * 0.3} ${width * 0.2} ${MAP_HEIGHT} L 0 ${MAP_HEIGHT} Z`} fill="#e2f0d9" opacity={0.6} />
          {/* River waterway path */}
          <Path d={`M ${width} 0 Q ${width * 0.75} ${MAP_HEIGHT * 0.5} ${width * 0.9} ${MAP_HEIGHT} L ${width} ${MAP_HEIGHT} Z`} fill="#dceefb" opacity={0.7} />

          {/* Road Network Lines (Base Grid) */}
          <Path d={`M 0 ${MAP_HEIGHT * 0.4} H ${width}`} stroke="#e2e8f0" strokeWidth={10} />
          <Path d={`M ${width * 0.5} 0 V ${MAP_HEIGHT}`} stroke="#e2e8f0" strokeWidth={10} />
          <Path d={`M 0 ${MAP_HEIGHT * 0.8} Q ${width * 0.4} ${MAP_HEIGHT * 0.9} ${width} ${MAP_HEIGHT * 0.7}`} stroke="#e2e8f0" strokeWidth={6} />
          <Path d={`M ${width * 0.15} 0 L ${width * 0.8} ${MAP_HEIGHT}`} stroke="#e2e8f0" strokeWidth={6} />

          {/* Core Trace Path (Bezier Route - Green dashed line) */}
          <Path
            d={`M ${60 * scaleX} ${170 * scaleY} Q ${180 * scaleX} ${220 * scaleY} ${200 * scaleX} ${120 * scaleY} T ${330 * scaleX} ${70 * scaleY}`}
            stroke={colors.primary}
            strokeWidth={4.5}
            strokeDasharray="6, 6"
            fill="none"
          />

          {/* Store Pin Base Pulse */}
          <Circle cx={60 * scaleX} cy={170 * scaleY} r={18} fill={colors.primary + '30'} />
          <Circle cx={60 * scaleX} cy={170 * scaleY} r={6} fill={colors.primary} />

          {/* Home Pin Base Pulse */}
          <Circle cx={330 * scaleX} cy={70 * scaleY} r={18} fill="#3b82f630" />
          <Circle cx={330 * scaleX} cy={70 * scaleY} r={6} fill="#3b82f6" />
        </Svg>

        {/* Store Pin Icon Badge */}
        <View
          style={{
            position: 'absolute',
            left: 60 * scaleX - 16,
            top: 170 * scaleY - 36,
            alignItems: 'center'
          }}
        >
          <View className="bg-emerald-600 rounded-lg p-1.5 shadow-md border border-white">
            <Package size={14} color="white" />
          </View>
          <View className="w-2 h-2 bg-emerald-600 rotate-45 -mt-1 shadow-sm border border-white" />
        </View>

        {/* User Home Pin Icon Badge */}
        <View
          style={{
            position: 'absolute',
            left: 330 * scaleX - 16,
            top: 70 * scaleY - 36,
            alignItems: 'center'
          }}
        >
          <View className="bg-blue-600 rounded-lg p-1.5 shadow-md border border-white">
            <Home size={14} color="white" />
          </View>
          <View className="w-2 h-2 bg-blue-600 rotate-45 -mt-1 shadow-sm border border-white" />
        </View>

        {/* Animated Rider Motorcycle Badge */}
        <Animated.View
          style={[
            riderAnimatedStyle,
            {
              position: 'absolute',
              width: 38,
              height: 38,
              marginLeft: -19,
              marginTop: -19,
              backgroundColor: colors.primary,
              borderRadius: 19,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 6,
              borderWidth: 2,
              borderColor: 'white'
            }
          ]}
        >
          <Truck size={16} color="white" />
        </Animated.View>

        {/* Translucent Floating Back Header (Premium UX) */}
        <SafeAreaView
          edges={['top']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
        >
          <View className="flex-row items-center gap-3 px-5 py-3">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2 rounded-full bg-white/90 shadow-md border border-slate-100"
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <ChevronLeft size={20} color={colors.textMain} />
            </TouchableOpacity>
            <View className="bg-white/90 px-4 py-1.5 rounded-full shadow-md border border-slate-100">
              <Text style={{ color: colors.textMain }} className="text-xs font-black">Live Tracking</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Bottom half: Scrollable Bottom Sheet Details */}
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-white border-t border-slate-100 rounded-t-3xl -mt-4 pt-5 px-5 shadow-lg">
        <View className="space-y-5 pb-16">
          {/* Order ID & Timing Row (Mockup 13) */}
          <View className="flex-row justify-between items-center bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl shadow-sm">
            <View>
              <Text style={{ color: colors.textMuted }} className="text-[10px] font-black uppercase">Order ID</Text>
              <Text style={{ color: colors.textMain }} className="text-sm font-black mt-0.5">{order?.orderNumber || '#FD12345678'}</Text>
            </View>
            <View className="items-end">
              <Text style={{ color: colors.primary }} className="text-sm font-black">10-20 mins</Text>
              <Text style={{ color: colors.textMuted }} className="text-[9px] font-bold mt-0.5">EST. ARRIVAL</Text>
            </View>
          </View>

          {/* Stepper Timeline (Mockup 13) */}
          <View className="space-y-0.5 px-1 mt-2">
            {steps.map((step, idx) => {
              const active = isStepActive(idx);
              const isLast = idx === steps.length - 1;
              return (
                <View key={idx} className="flex-row items-start min-h-[75px]">
                  {/* Left bullet marker and connector line */}
                  <View className="items-center mr-4">
                    <View
                      style={{
                        backgroundColor: active ? colors.primary : colors.card,
                        borderColor: active ? colors.primary : colors.border
                      }}
                      className="w-7 h-7 rounded-full border-2 items-center justify-center z-10 shadow-sm"
                    >
                      {active ? (
                        <Check size={12} color="white" className="stroke-[3.5]" />
                      ) : (
                        <View className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      )}
                    </View>
                    {!isLast && (
                      <View
                        style={{ backgroundColor: active ? colors.primary : colors.border }}
                        className="w-0.5 flex-grow h-14 -my-0.5 z-0"
                      />
                    )}
                  </View>

                  {/* Description column */}
                  <View className="flex-1 pt-0.5 flex-row justify-between items-start">
                    <View className="flex-1 mr-4">
                      <Text
                        style={{ color: active ? colors.textMain : colors.textMuted }}
                        className={`text-sm font-black ${active ? '' : 'opacity-55'}`}
                      >
                        {step.label}
                      </Text>
                      <Text
                        style={{ color: colors.textMuted }}
                        className="text-xs mt-1 font-semibold leading-relaxed"
                        numberOfLines={2}
                      >
                        {step.desc}
                      </Text>
                    </View>

                    <Text style={{ color: colors.textMuted }} className="text-[10px] font-bold mt-1">
                      {step.time}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Courier Details Card (Mockup 13) */}
          <View className="space-y-2.5 mt-2">
            <Text style={{ color: colors.textMain }} className="text-xs font-black uppercase tracking-wider">Delivery Partner</Text>

            <View
              style={{ borderColor: colors.border, backgroundColor: colors.card }}
              className="border-2 rounded-2xl p-4 flex-row items-center justify-between shadow-sm"
            >
              <View className="flex-row items-center gap-3.5 flex-1 mr-4">
                <View
                  style={{ backgroundColor: colors.primaryLight }}
                  className="w-12 h-12 rounded-full items-center justify-center border-2 border-white"
                >
                  <Text style={{ color: colors.primary }} className="text-base font-black">RK</Text>
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.textMain }} className="text-sm font-black">
                    {order?.deliveryPartnerId?.name || 'Ravi Kumar'}
                  </Text>
                  <Text style={{ color: colors.textMuted }} className="text-[10px] font-semibold mt-1">
                    ★ 4.8 Rating • Your Delivery Partner
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => handleCallPartner(order?.deliveryPartnerId?.phone || '9876543210')}
                  style={{ backgroundColor: colors.primaryLight }}
                  className="p-3.5 rounded-full shadow-sm"
                >
                  <Phone size={16} color={colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ backgroundColor: colors.primaryLight }}
                  className="p-3.5 rounded-full shadow-sm"
                >
                  <MessageSquare size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
