import React, { useState, useEffect, useRef } from 'react';
import messaging from '@react-native-firebase/messaging';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  FlatList,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  PermissionsAndroid,
  Platform,
  Animated,
  PanResponder,
  BackHandler,
  Modal,
  Alert,
  RefreshControl
} from 'react-native';
import Text from '../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../src/context/ThemeContext';
import { useCart } from '../src/context/CartContext';
import api, { setAuthToken } from '../src/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Home,
  Grid,
  ShoppingCart,
  Clipboard,
  User,
  Search,
  Heart,
  MapPin,
  Plus,
  Minus,
  LogOut,
  ShoppingBag,
  Folder,
  ChevronRight,
  ChevronDown,
  Bell,
  SlidersHorizontal,
  Wallet,
  Clock,
  HelpCircle,
  Info,
  Settings,
  X,
  Tag,
  Check
} from 'lucide-react-native';
import CartScreen from './CartScreen';
import DynamicFeedSection from '../components/DynamicFeedSection';
import ProductCard from '../components/ProductCard';

const { width } = Dimensions.get('window');

// Local High-definition Fallbacks for Unsplash Mockup produce shots
const FALLBACK_CATEGORIES = [
  { _id: '1', name: 'Veggies', image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=250&auto=format&fit=crop&q=80' },
  { _id: '2', name: 'Fruits', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=250&auto=format&fit=crop&q=80' },
  { _id: '3', name: 'Dairy & Eggs', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=250&auto=format&fit=crop&q=80' },
  { _id: '4', name: 'Snacks', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bc087?w=250&auto=format&fit=crop&q=80' },
  { _id: '5', name: 'Bakery', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=250&auto=format&fit=crop&q=80' },
  { _id: '6', name: 'Beverages', image: 'https://images.unsplash.com/photo-1527960656-2679934385f9?w=250&auto=format&fit=crop&q=80' },
  { _id: '7', name: 'Rice & Grains', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=250&auto=format&fit=crop&q=80' },
  { _id: '8', name: 'Household', image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=250&auto=format&fit=crop&q=80' },
];

const FALLBACK_PRODUCTS = [
  { _id: 'p1', name: 'Tomato', unit: '1 kg', price: 29, image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=250&auto=format&fit=crop&q=80' },
  { _id: 'p2', name: 'Banana', unit: '1 kg', price: 45, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=250&auto=format&fit=crop&q=80' },
  { _id: 'p3', name: 'Potato', unit: '1 kg', price: 25, image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=250&auto=format&fit=crop&q=80' },
  { _id: 'p4', name: 'Carrot', unit: '500 g', price: 20, image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=250&auto=format&fit=crop&q=80' },
  { _id: 'p5', name: 'Capsicum', unit: '250 g', price: 30, image: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=250&auto=format&fit=crop&q=80' },
  { _id: 'p6', name: 'Cucumber', unit: '1 kg', price: 25, image: 'https://images.unsplash.com/photo-1604977042946-1eeccd3428a4?w=250&auto=format&fit=crop&q=80' },
];

const CAMPAIGN_BANNERS = [
  {
    id: '1',
    title: 'Fresh Vegetables Deals',
    subtitle: 'UP TO 50% OFF',
    buttonText: 'Shop Now',
    color: '#10b981', // Emerald green
    image: require("../assets/Gemini_Generated_Image_ohi6lvohi6lvohi6.png"),
    targetCategoryName: 'Veggies',
    isFullImage: false
  },
  {
    id: '2',
    title: 'Farm Fresh Fruits',
    subtitle: 'WEEKEND SPECIAL',
    buttonText: 'Grab Offer',
    color: '#f59e0b', // Amber orange
    image: require("../assets/ecom_assets/splash_screen_veg.png"),
    targetCategoryName: 'Fruits',
    isFullImage: false
  },
  {
    id: '3',
    isFullImage: true, // Displays full-bleed designed banner graphic
    color: '#ffffff',
    image: require("../assets/ecom_assets/splash_screen_veg1.png"),
    targetCategoryName: 'Veggies'
  },
  {
    id: '4',
    title: 'Baked Goods & Sweets',
    subtitle: 'FRESH DAILY',
    buttonText: 'Order Now',
    color: '#6366f1', // Indigo blue
    image: require("../assets/ecom_assets/login_screen_bag.png"),
    targetCategoryName: 'Bakery',
    isFullImage: false
  }
];

// Haversine formula to compute distance in KM
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Ray-casting Point-in-Polygon (PIP) check
function isPointInPolygon(point, polygon) {
  if (!polygon || polygon.length < 3) return false;
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    const intersect = ((yi > y) !== (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { cart, addToCart, removeFromCart, getCartTotal, getCartCount } = useCart();

  const [activeTab, setActiveTab] = useState('Home');
  const [tabHistory, setTabHistory] = useState(['Home']);
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);

  const handleTabSwitch = (newTab) => {
    if (newTab === activeTab) return;
    setActiveTab(newTab);
    setTabHistory((prev) => {
      const filtered = prev.filter((t) => t !== newTab);
      return [...filtered, newTab];
    });
  };

  // Android hardware back button listener: navigate back through visited tabs history stack
  useEffect(() => {
    const backAction = () => {
      if (tabHistory.length > 1) {
        const updatedHistory = [...tabHistory];
        updatedHistory.pop(); // Pop current active tab
        const previousTab = updatedHistory[updatedHistory.length - 1];
        setTabHistory(updatedHistory);
        setActiveTab(previousTab);
        return true; // Intercept & block default OS app minimization/exit
      } else if (activeTab !== 'Home') {
        setActiveTab('Home');
        setTabHistory(['Home']);
        return true; // Intercept & block default OS app minimization/exit
      }
      return false; // Exit app when on Home tab with no prior history
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [tabHistory, activeTab]);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [orders, setOrders] = useState([]);
  const [currentOrdersTab, setCurrentOrdersTab] = useState('Current'); // Current or Past (Mockup 14)
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dynamicFeedSections, setDynamicFeedSections] = useState([]);

  // Coupon promo states
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const coords = route.params?.coords || {
    latitude: 13.0406,
    longitude: 80.2337,
    addressText: 'Anna Nagar, Chennai'
  };

  // Foreground toast notification states
  const [toastTitle, setToastTitle] = useState('');
  const [toastBody, setToastBody] = useState('');
  const [toastImage, setToastImage] = useState(null);
  const [toastIsFullImage, setToastIsFullImage] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [serverNotifications, setServerNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState([]);
  const slideAnim = useRef(new Animated.Value(-150)).current;
  const pan = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    const loadReadNotificationIds = async () => {
      try {
        const stored = await AsyncStorage.getItem('readNotificationIds');
        if (stored) {
          setReadNotificationIds(JSON.parse(stored));
        }
      } catch (err) {
        console.log('Error loading read notification IDs:', err);
      }
    };
    loadReadNotificationIds();
  }, []);

  const markNotificationsAsRead = async (idsToMark) => {
    if (!idsToMark || idsToMark.length === 0) return;
    try {
      const updatedIds = Array.from(new Set([...readNotificationIds, ...idsToMark]));
      setReadNotificationIds(updatedIds);
      await AsyncStorage.setItem('readNotificationIds', JSON.stringify(updatedIds));

      setServerNotifications(prev =>
        prev.map(item => (idsToMark.includes(item.id) ? { ...item, read: true } : item))
      );
      setUnreadCount(prev => Math.max(0, prev - idsToMark.length));
    } catch (err) {
      console.log('Error saving read notification IDs:', err);
    }
  };

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const res = await api.get('/customer/notifications');
      if (res.data?.notifications) {
        let storedIds = readNotificationIds;
        try {
          const stored = await AsyncStorage.getItem('readNotificationIds');
          if (stored) storedIds = JSON.parse(stored);
        } catch (e) { }

        const processed = res.data.notifications.map(item => ({
          ...item,
          read: item.read || storedIds.includes(item.id)
        }));

        setServerNotifications(processed);
        setUnreadCount(processed.filter(n => !n.read).length);
      }
    } catch (err) {
      console.log('Error fetching notifications:', err.message);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Just now';
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Banner Carousel States
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerRef = useRef(null);

  useEffect(() => {
    if (CAMPAIGN_BANNERS.length <= 1) return;
    const interval = setInterval(() => {
      const nextIndex = (currentBannerIndex + 1) % CAMPAIGN_BANNERS.length;
      setCurrentBannerIndex(nextIndex);
      bannerRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [currentBannerIndex]);

  const handleBannerScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    if (slideSize <= 0) return;
    const offset = event.nativeEvent.contentOffset.x;
    const activeIndex = Math.round(offset / slideSize);
    if (activeIndex !== currentBannerIndex && activeIndex >= 0 && activeIndex < CAMPAIGN_BANNERS.length) {
      setCurrentBannerIndex(activeIndex);
    }
  };

  const getItemLayout = (data, index) => ({
    length: Dimensions.get('window').width - 40,
    offset: (Dimensions.get('window').width - 30) * index,
    index
  });

  // Swipe-to-dismiss gesture setup for Toast notification banner
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderMove: (evt, gestureState) => {
        pan.setValue({ x: gestureState.dx, y: 0 });
      },
      onPanResponderRelease: (evt, gestureState) => {
        // If swiped more than 120px horizontally, dismiss the toast
        if (Math.abs(gestureState.dx) > 120) {
          Animated.timing(pan, {
            toValue: { x: gestureState.dx > 0 ? 500 : -500, y: 0 },
            duration: 200,
            useNativeDriver: true
          }).start(() => {
            setToastVisible(false);
            pan.setValue({ x: 0, y: 0 });
          });
        } else {
          // Snap back to center
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true
          }).start();
        }
      }
    })
  ).current;

  const triggerToast = (title, body, imageUrl = null, isFullImage = false) => {
    pan.setValue({ x: 0, y: 0 }); // Reset swipe offsets
    setToastTitle(title);
    setToastBody(body);
    setToastImage(imageUrl);
    setToastIsFullImage(isFullImage);
    setToastVisible(true);

    // Slide down
    Animated.spring(slideAnim, {
      toValue: 40, // offset from top, cleared status bar safe-zone
      tension: 40,
      friction: 8,
      useNativeDriver: true
    }).start();

    // Slide up after 4.5 seconds
    setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: 350,
        useNativeDriver: true
      }).start(() => {
        setToastVisible(false);
      });
    }, 4500);
  };

  const handleNotificationRedirect = (remoteMessage) => {
    if (remoteMessage?.data?.targetCategory) {
      const targetCat = remoteMessage.data.targetCategory;
      const match = categories.find(c => c.name.toLowerCase() === targetCat.toLowerCase());
      if (match) {
        navigation.navigate('ProductListing', { categoryId: match._id, categoryName: match.name });
      }
    }
  };

  useEffect(() => {
    // Listen for foreground push notifications
    try {
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        console.log('📣 [FCM Foreground] Push received:', remoteMessage);
        if (remoteMessage.notification) {
          const imageUrl = remoteMessage.notification.android?.imageUrl ||
            remoteMessage.notification.imageUrl ||
            remoteMessage.data?.imageUrl || null;
          const isFullImage = remoteMessage.data?.isFullImage === 'true';
          triggerToast(
            remoteMessage.notification.title,
            remoteMessage.notification.body,
            imageUrl,
            isFullImage
          );
        }
      });

      // Handle notification click when app is running in background
      const onNotificationOpenUnsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('📣 [FCM Background] App opened from notification:', remoteMessage);
        handleNotificationRedirect(remoteMessage);
      });

      // Check if app was launched from a completely terminated/closed state via notification
      messaging().getInitialNotification().then(remoteMessage => {
        if (remoteMessage) {
          console.log('📣 [FCM Closed State] App launched from notification:', remoteMessage);
          setTimeout(() => {
            handleNotificationRedirect(remoteMessage);
          }, 1000);
        }
      });

      return () => {
        unsubscribe();
        onNotificationOpenUnsubscribe();
      };
    } catch (e) {
      console.log('FCM listeners setup failed:', e.message);
    }
  }, [categories]);

  const getCouponDiscount = () => {
    if (!appliedCoupon) return 0;
    const total = getCartTotal();
    if (appliedCoupon.code === 'FRESH50') {
      return total >= 150 ? 50 : 0;
    }
    if (appliedCoupon.code === 'WELCOME20') {
      if (total >= 100) {
        const discount = Math.round(total * 0.2);
        return discount > 100 ? 100 : discount;
      }
      return 0;
    }
    if (appliedCoupon.code === 'FREESHIP') {
      return total >= 200 ? 15 : 0; // standard delivery fee is 15
    }
    return 0;
  };

  useEffect(() => {
    if (appliedCoupon) {
      const total = getCartTotal();
      if (appliedCoupon.code === 'FRESH50' && total < 150) {
        setAppliedCoupon(null);
        setCouponSuccess('');
        setCouponError('FRESH50 removed: minimum order value of ₹150 required.');
      } else if (appliedCoupon.code === 'WELCOME20' && total < 100) {
        setAppliedCoupon(null);
        setCouponSuccess('');
        setCouponError('WELCOME20 removed: minimum order value of ₹100 required.');
      } else if (appliedCoupon.code === 'FREESHIP' && total < 200) {
        setAppliedCoupon(null);
        setCouponSuccess('');
        setCouponError('FREESHIP removed: minimum order value of ₹200 required.');
      }
    }
  }, [cart]);

  const handleApplyCoupon = () => {
    console.log('[Coupon] handleApplyCoupon called. Input:', couponInput);
    setCouponError('');
    setCouponSuccess('');
    const code = couponInput.trim().toUpperCase();
    const total = getCartTotal();
    console.log('[Coupon] Sanitized Code:', code, 'Cart Total:', total);

    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    if (code === 'FRESH50') {
      if (total >= 150) {
        setAppliedCoupon({ code, value: 50, type: 'fixed' });
        setCouponSuccess('FRESH50 applied! Flat ₹50 off.');
        setCouponInput('');
        console.log('[Coupon] FRESH50 applied successfully.');
      } else {
        setCouponError('FRESH50 requires a minimum order value of ₹150.');
        console.log('[Coupon] FRESH50 threshold not met.');
      }
    } else if (code === 'WELCOME20') {
      if (total >= 100) {
        const discount = Math.round(total * 0.2);
        const finalDiscount = discount > 100 ? 100 : discount;
        setAppliedCoupon({ code, value: finalDiscount, type: 'percentage' });
        setCouponSuccess(`WELCOME20 applied! 20% off (₹${finalDiscount}).`);
        setCouponInput('');
        console.log('[Coupon] WELCOME20 applied successfully.');
      } else {
        setCouponError('WELCOME20 requires a minimum order value of ₹100.');
        console.log('[Coupon] WELCOME20 threshold not met.');
      }
    } else if (code === 'FREESHIP') {
      if (total >= 200) {
        setAppliedCoupon({ code, value: 15, type: 'freeship' });
        setCouponSuccess('FREESHIP applied! Free Delivery.');
        setCouponInput('');
        console.log('[Coupon] FREESHIP applied successfully.');
      } else {
        setCouponError('FREESHIP requires a minimum order value of ₹200.');
        console.log('[Coupon] FREESHIP threshold not met.');
      }
    } else {
      setCouponError('Invalid code. Try FRESH50, WELCOME20, or FREESHIP.');
      console.log('[Coupon] Invalid code entered.');
    }
  };

  const handleRemoveCoupon = () => {
    console.log('[Coupon] handleRemoveCoupon called.');
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponError('');
  };

  useEffect(() => {
    fetchInitialData();
  }, [coords.latitude, coords.longitude]);

  const registerFCM = async () => {
    try {
      // Request native OS notification permission on Android 13+ (API 33+)
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (!hasPermission) {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: "FreshMart Notifications Access",
              message: "FreshMart needs notification permissions to send you real-time order tracking updates.",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK"
            }
          );
        }
      }

      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        const token = await messaging().getToken();
        console.log('📣 [FCM Device Token]:', token);
        if (token) {
          await api.patch('/customer/profile', { fcmToken: token });
        }
      }
    } catch (err) {
      console.log('FCM Token registration skipped/failed:', err.message);
    }
  };

  const fetchInitialData = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    fetchNotifications();

    // Validate delivery zones and operational status
    try {
      const settingsRes = await api.get('/settings');
      if (settingsRes.data.settings) {
        const settings = settingsRes.data.settings;
        if (settings.isUnderMaintenance) {
          navigation.replace('Maintenance', {
            message: settings.maintenanceMessage || 'We are doing some updates. Please try again later.'
          });
          return;
        }

        if (!settings.isStoreOpen) {
          navigation.replace('ShopClosed');
          return;
        }

        const customerLat = coords.latitude || 13.0406;
        const customerLng = coords.longitude || 80.2337;

        if (settings.zoneType === 'CIRCLE') {
          const distance = calculateDistance(
            settings.storeLatitude,
            settings.storeLongitude,
            customerLat,
            customerLng
          );
          if (distance > settings.deliveryRadius) {
            navigation.replace('OutsideRadius', {
              message: `We currently deliver only within a ${settings.deliveryRadius} KM radius from our store. Your address is ${distance.toFixed(1)} KM away.`
            });
            return;
          }
        } else if (settings.zoneType === 'POLYGON') {
          const inside = isPointInPolygon([customerLat, customerLng], settings.deliveryPolygon);
          if (!inside) {
            navigation.replace('OutsideRadius', {
              message: 'Your address falls outside our custom delivery polygon zone.'
            });
            return;
          }
        }
      }
    } catch (err) {
      console.log('Failed to check operational bounds, continuing with mock parameters:', err.message);
    }

    try {
      const [prodRes, catRes, feedRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/feed/layout')
      ]);
      if (prodRes.data.products?.length > 0) setProducts(prodRes.data.products);
      if (catRes.data.categories?.length > 0) setCategories(catRes.data.categories);
      if (feedRes.data.sections?.length > 0) setDynamicFeedSections(feedRes.data.sections);
    } catch (err) {
      console.log('Error fetching store data, falling back to mock files:', err.message);
    } finally {
      if (!isRefresh) setLoading(false);
    }

    // Register push notification token
    registerFCM();
  };

  const fetchOrders = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const res = await api.get('/orders/my');
      const orderData = Array.isArray(res.data)
        ? res.data
        : (Array.isArray(res.data?.orders) ? res.data.orders : []);
      setOrders(orderData);
    } catch (err) {
      console.log('Error fetching customer orders:', err.message);
      try {
        const fallbackRes = await api.get('/orders');
        const fallbackData = Array.isArray(fallbackRes.data)
          ? fallbackRes.data
          : (Array.isArray(fallbackRes.data?.orders) ? fallbackRes.data.orders : []);
        setOrders(fallbackData);
      } catch (e) {
        setOrders([]);
      }
    } finally {
      if (!isRefresh) setLoading(false);
    }
  };

  // Pull-to-refresh action handler for home screen and tabs
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchInitialData(true),
        fetchNotifications(),
        fetchOrders(true)
      ]);
    } catch (err) {
      console.log('Error refreshing data:', err?.message || err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (e) {
      console.log('Error clearing session from AsyncStorage:', e);
    }
    setAuthToken('');
    navigation.replace('Login');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Home':
        return renderHomeTab();
      case 'Categories':
        return renderCategoriesTab();
      case 'Cart':
        return renderCartTab();
      case 'Orders':
        return renderOrdersTab();
      case 'Profile':
        return renderProfileTab();
      default:
        return renderHomeTab();
    }
  };

  // MOCKUP 05: HOME SCREEN TAB
  const renderHomeTab = () => {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-white"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary, '#10b981', '#059669']}
            tintColor={colors.primary}
            title="Refreshing FreshMart..."
            titleColor={colors.textMuted}
            progressBackgroundColor="#ffffff"
          />
        }
      >
        {/* Header (Mockup 05) */}
        <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <MapPin size={24} color={colors.primary} />
            <View>
              <View className="flex-row items-center gap-1">
                <Text style={{ color: colors.textMuted }} className="text-[10px] font-bold">Deliver to</Text>
                <ChevronDown size={14} color={colors.textMuted} />
              </View>
              <Text style={{ color: colors.textMain }} className="text-xs font-black">{coords.addressText}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              fetchNotifications();
              setShowNotificationModal(true);
            }}
            activeOpacity={0.7}
            className="p-2.5 bg-slate-100 rounded-full relative"
          >
            <Bell size={24} color={colors.textMain} />
            {unreadCount > 0 && (
              <View className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full items-center justify-center border-2 border-white shadow-sm">
                <Text className="text-[9px] text-white font-black">{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar with Filter option (Mockup 05) */}
        <View className="px-5 py-3">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => navigation.navigate('Search')}
              activeOpacity={0.9}
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
              className="flex-1 flex-row items-center border rounded-2xl px-4 py-3 shadow-sm"
            >
              <Search size={20} color={colors.textMuted} />
              <Text className="text-slate-400 font-bold ml-3 text-sm flex-1">
                Search fresh products...
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: colors.primary }}
              className="p-4 rounded-2xl items-center justify-center shadow-sm"
            >
              <SlidersHorizontal size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dynamic SDUI Feed Sections or Fallback Static Feed */}
        {dynamicFeedSections && dynamicFeedSections.length > 0 ? (
          <View className="pb-8">
            {dynamicFeedSections.map((sec, idx) => (
              <DynamicFeedSection
                key={sec._id || `sec-${idx}`}
                section={sec}
                navigation={navigation}
                cart={cart}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
                colors={colors}
              />
            ))}
          </View>
        ) : (
          <>
            {/* Premium Auto-Playing Banner Carousel Slider */}
            <View className="py-2.5 relative">
              <FlatList
                ref={bannerRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                data={CAMPAIGN_BANNERS}
                keyExtractor={(item) => item.id}
                getItemLayout={getItemLayout}
                onScroll={handleBannerScroll}
                snapToInterval={Dimensions.get('window').width - 30}
                decelerationRate="fast"
                snapToAlignment="start"
                contentContainerStyle={{ paddingHorizontal: 20 }}
                renderItem={({ item }) => {
                  const cardWidth = Dimensions.get('window').width - 40;
                  const cardHeight = Math.round(cardWidth * 0.5); // 2:1 Aspect Ratio (matches 1200x600 recommended size)
                  return (
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => {
                        const match = categories.find(c => c.name.toLowerCase() === item.targetCategoryName.toLowerCase());
                        if (match) {
                          navigation.navigate('ProductListing', { categoryId: match._id, categoryName: match.name });
                        } else {
                          handleTabSwitch('Categories');
                        }
                      }}
                      style={{
                        width: cardWidth,
                        height: cardHeight,
                        backgroundColor: item.color,
                        marginRight: 10
                      }}
                      className="rounded-2xl relative overflow-hidden shadow-lg"
                    >
                      {item.isFullImage ? (
                        // Render custom designed graphic image covering the whole card
                        <Image
                          source={item.image}
                          style={{ width: '100%', height: '100%' }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        // Render dynamic template layout card
                        <View className="flex-1 p-5 flex-row justify-between items-center">
                          <View className="z-10 max-w-[62%] space-y-1">
                            <View className="bg-white/20 border border-white/30 rounded-full px-2.5 py-0.5 self-start">
                              <Text className="text-[9px] font-extrabold text-white uppercase tracking-wider">
                                {item.subtitle}
                              </Text>
                            </View>
                            <Text className="text-base font-black text-white leading-tight">
                              {item.title}
                            </Text>
                            <View className="bg-white rounded-full px-3.5 py-1.5 self-start mt-2">
                              <Text style={{ color: item.color }} className="text-[9px] font-black">
                                {item.buttonText}
                              </Text>
                            </View>
                          </View>
                          <Image
                            source={item.image}
                            className="w-24 h-24 rounded-2xl absolute right-3 bottom-3"
                            resizeMode="contain"
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                }}
              />

              {/* Pagination Indicators */}
              <View className="flex-row justify-center items-center mt-3 gap-1.5">
                {CAMPAIGN_BANNERS.map((_, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: currentBannerIndex === index ? colors.primary : '#cbd5e1',
                      width: currentBannerIndex === index ? 16 : 6,
                      height: 6,
                      borderRadius: 3
                    }}
                    className="transition-all duration-300"
                  />
                ))}
              </View>
            </View>

            {/* Multi-Row Big Category Grid Showcase */}
            <View className="py-4">
              <View className="px-5 flex-row items-center justify-between mb-3.5">
                <View>
                  <Text style={{ color: colors.textMain }} className="text-base font-black tracking-tight">
                    Shop by Category
                  </Text>
                  <Text style={{ color: colors.textMuted }} className="text-[10px] font-bold mt-0.5">
                    Explore {categories.length || 8}+ Fresh Departments
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setActiveTab('Categories')}
                  style={{ backgroundColor: colors.primaryLight, borderColor: colors.primary + '30' }}
                  className="flex-row items-center gap-1 px-3 py-1.5 rounded-full border"
                >
                  <Text style={{ color: colors.primary }} className="text-xs font-black">
                    See All
                  </Text>
                  <ChevronRight size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {/* 4-Column Clean Category Grid with Cover Image & Text Below */}
              <View className="px-4 flex-row flex-wrap justify-between">
                {categories.slice(0, 8).map((item, idx) => {
                  const catCardWidth = (width - 32 - 24) / 4;

                  return (
                    <TouchableOpacity
                      key={item._id || `cat-${idx}`}
                      onPress={() => navigation.navigate('ProductListing', { categoryId: item._id, categoryName: item.name })}
                      style={{ width: catCardWidth }}
                      className="mb-4 items-center"
                      activeOpacity={0.85}
                    >
                      {/* Rounded Cover Image Box (No Border) */}
                      <View
                        style={{ width: catCardWidth, height: Math.round(catCardWidth * 0.9) }}
                        className="rounded-2xl overflow-hidden bg-slate-100"
                      >
                        <Image
                          source={{ uri: item.image }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      </View>

                      {/* Category Name Directly Below Image */}
                      <Text
                        style={{ color: colors.textMain }}
                        className="text-[11px] font-bold text-center tracking-tight leading-tight mt-1.5 px-0.5"
                        numberOfLines={2}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Products Grid layout cards (Mockup 05) */}
            <View className="px-5 pb-8">
              <View className="flex-row items-center justify-between mb-4">
                <Text style={{ color: colors.textMain }} className="text-base font-extrabold">Today's Deals</Text>
                <TouchableOpacity>
                  <Text style={{ color: colors.primary }} className="text-xs font-extrabold">See All</Text>
                </TouchableOpacity>
              </View>

              {loading ? (
                <ActivityIndicator color={colors.primary} className="my-8" />
              ) : filteredProducts.length === 0 ? (
                <Text style={{ color: colors.textMuted }} className="text-center text-xs py-8">No products found.</Text>
              ) : (
                <View className="flex-row flex-wrap justify-between">
                  {filteredProducts.map((product) => {
                    const cartItem = cart.find(c => c.product._id === product._id);

                    return (
                      <ProductCard
                        key={product._id}
                        product={product}
                        cartItem={cartItem}
                        cardWidth={(width - 40 - 16) / 3}
                        onPress={() => navigation.navigate('ProductDetails', { product })}
                        onAddToCart={() => addToCart(product)}
                        onRemoveFromCart={() => removeFromCart(product._id)}
                        colors={colors}
                      />
                    );
                  })}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    );
  };

  // MOCKUP 06: CATEGORIES GRID PANEL
  const renderCategoriesTab = () => {
    const groceryKitchenGroup = [
      {
        title: 'Fruits & Vegetables',
        image: 'https://images.unsplash.com/photo-1610348725531-843dff147e2c?w=300',
        dbName: 'Vegetables',
        isDouble: true
      },
      {
        title: 'Dairy, Bread & Eggs',
        image: 'https://images.unsplash.com/photo-1528498033973-3c12544c6c0b?w=300',
        dbName: 'Dairy & Eggs',
        isDouble: false
      },
      {
        title: 'Atta, Rice, Oil & Dals',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300',
        dbName: 'Bakery',
        isDouble: false
      },
      {
        title: 'Meat, Fish & Eggs',
        image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300',
        dbName: 'Vegetables',
        isDouble: false
      },
      {
        title: 'Masala & Dry Fruits',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300',
        dbName: 'Vegetables',
        isDouble: false
      },
      {
        title: 'Breakfast & Sauces',
        image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=300',
        dbName: 'Dairy & Eggs',
        isDouble: false
      },
      {
        title: 'Packaged Food',
        image: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=300',
        dbName: 'Bakery',
        isDouble: false
      }
    ];

    const snacksDrinksGroup = [
      {
        title: 'Zepto Cafe',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300',
        dbName: 'Snacks & Sweets',
        isDouble: false
      },
      {
        title: 'Tea, Coffee & More',
        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300',
        dbName: 'Snacks & Sweets',
        isDouble: false
      },
      {
        title: 'Ice Creams & More',
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300',
        dbName: 'Snacks & Sweets',
        isDouble: false
      },
      {
        title: 'Frozen Food',
        image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300',
        dbName: 'Snacks & Sweets',
        isDouble: false
      }
    ];

    const singleWidth = (width - 64) / 4;
    const doubleWidth = singleWidth * 2 + 8;

    return (
      <View className="flex-1 px-5 pt-4 bg-white">
        {/* Header Bar */}
        <View className="flex-row items-center justify-between mb-5">
          <View className="w-10" />
          <Text style={{ color: colors.textMain }} className="text-lg font-black text-center flex-1">All Categories</Text>
          <View className="flex-row items-center gap-3.5">
            <TouchableOpacity className="p-1">
              <Heart size={20} color={colors.textMain} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Search')}
              className="p-1"
            >
              <Search size={20} color={colors.textMain} />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} className="my-8" />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 60 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary, '#10b981']}
                tintColor={colors.primary}
                progressBackgroundColor="#ffffff"
              />
            }
          >
            {/* Group 1: Grocery & Kitchen */}
            <Text style={{ color: colors.textMain }} className="text-base font-black mb-3 mt-1">Grocery & Kitchen</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 }}>
              {groceryKitchenGroup.map((item, index) => {
                const cardWidth = item.isDouble ? doubleWidth : singleWidth;
                return (
                  <View key={index} style={{ width: cardWidth, marginHorizontal: 4, marginBottom: 16 }}>
                    <TouchableOpacity
                      onPress={() => {
                        const dbCat = categories.find(c => c.name.toLowerCase().includes(item.dbName.split(' ')[0].toLowerCase()));
                        if (dbCat) {
                          navigation.navigate('ProductListing', { categoryId: dbCat._id, categoryName: item.title });
                        }
                      }}
                      activeOpacity={0.85}
                      style={{
                        width: '100%',
                        height: 75,
                        backgroundColor: '#f3f4f6',
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}
                    >
                      <Image
                        source={{ uri: item.image }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                    <Text
                      style={{ color: colors.textMain }}
                      className="text-[9.5px] font-bold text-center mt-1.5 leading-tight px-0.5"
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Group 2: Snacks & Drinks */}
            <Text style={{ color: colors.textMain }} className="text-base font-black mb-3 mt-4">Snacks & Drinks</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 }}>
              {snacksDrinksGroup.map((item, index) => {
                const cardWidth = item.isDouble ? doubleWidth : singleWidth;
                return (
                  <View key={index} style={{ width: cardWidth, marginHorizontal: 4, marginBottom: 16 }}>
                    <TouchableOpacity
                      onPress={() => {
                        const dbCat = categories.find(c => c.name.toLowerCase().includes(item.dbName.split(' ')[0].toLowerCase()));
                        if (dbCat) {
                          navigation.navigate('ProductListing', { categoryId: dbCat._id, categoryName: item.title });
                        }
                      }}
                      activeOpacity={0.85}
                      style={{
                        width: '100%',
                        height: 75,
                        backgroundColor: '#f3f4f6',
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}
                    >
                      <Image
                        source={{ uri: item.image }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                    <Text
                      style={{ color: colors.textMain }}
                      className="text-[9.5px] font-bold text-center mt-1.5 leading-tight px-0.5"
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}
      </View>
    );
  };

  // MOCKUP 09: MY CART BASKET VIEW
  const renderCartTab = () => {
    return (
      <CartScreen
        embedded={true}
        onNavigateHome={() => handleTabSwitch('Home')}
        navigation={navigation}
        route={route}
      />
    );
  };

  // MOCKUP 14: ORDERS TRACKING TABS LIST
  const renderOrdersTab = () => {
    const safeOrders = Array.isArray(orders) ? orders : [];
    const currentOrders = safeOrders.filter(o => o && o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED');
    const pastOrders = safeOrders.filter(o => o && (o.orderStatus === 'DELIVERED' || o.orderStatus === 'CANCELLED'));
    const listToRender = currentOrdersTab === 'Current' ? currentOrders : pastOrders;

    const getStatusStyle = (status) => {
      switch (status) {
        case 'PLACED':
          return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe', label: '📦 Order Placed' };
        case 'CONFIRMED':
        case 'PREPARING':
          return { bg: '#fffbeb', text: '#d97706', border: '#fde68a', label: '👨‍🍳 Preparing' };
        case 'OUT_FOR_DELIVERY':
          return { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0', label: '🛵 Out for Delivery' };
        case 'DELIVERED':
          return { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0', label: '✅ Delivered' };
        case 'CANCELLED':
          return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', label: '✕ Cancelled' };
        default:
          return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0', label: status || 'Order Placed' };
      }
    };

    return (
      <View className="flex-1 px-5 pt-4 bg-slate-50/50">
        {/* Top Header Bar */}
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text style={{ color: colors.textMain }} className="text-xl font-black tracking-tight">
              My Orders
            </Text>
            <Text style={{ color: colors.textMuted }} className="text-xs font-semibold mt-0.5">
              {safeOrders.length} total orders placed
            </Text>
          </View>
          <TouchableOpacity
            onPress={fetchOrders}
            className="p-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm flex-row items-center gap-1.5"
          >
            <Clock size={16} color={colors.primary} />
            <Text style={{ color: colors.primary }} className="text-xs font-black">Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Header Selector */}
        <View className="flex-row bg-slate-200/70 p-1.5 rounded-2xl mb-5 border border-slate-200">
          <TouchableOpacity
            onPress={() => setCurrentOrdersTab('Current')}
            style={{
              backgroundColor: currentOrdersTab === 'Current' ? colors.primary : 'transparent',
            }}
            className="flex-1 py-2.5 rounded-xl items-center flex-row justify-center gap-2 shadow-sm"
          >
            <Text
              style={{ color: currentOrdersTab === 'Current' ? '#ffffff' : colors.textMuted }}
              className="text-xs font-black"
            >
              Active Orders
            </Text>
            {currentOrders.length > 0 && (
              <View
                style={{
                  backgroundColor: currentOrdersTab === 'Current' ? '#ffffff' : colors.primary,
                }}
                className="px-2 py-0.5 rounded-full"
              >
                <Text
                  style={{ color: currentOrdersTab === 'Current' ? colors.primary : '#ffffff' }}
                  className="text-[9px] font-black"
                >
                  {currentOrders.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCurrentOrdersTab('Past')}
            style={{
              backgroundColor: currentOrdersTab === 'Past' ? colors.primary : 'transparent',
            }}
            className="flex-1 py-2.5 rounded-xl items-center flex-row justify-center gap-2 shadow-sm"
          >
            <Text
              style={{ color: currentOrdersTab === 'Past' ? '#ffffff' : colors.textMuted }}
              className="text-xs font-black"
            >
              Past Orders
            </Text>
            {pastOrders.length > 0 && (
              <View
                style={{
                  backgroundColor: currentOrdersTab === 'Past' ? '#ffffff' : '#94a3b8',
                }}
                className="px-2 py-0.5 rounded-full"
              >
                <Text
                  style={{ color: currentOrdersTab === 'Past' ? colors.primary : '#ffffff' }}
                  className="text-[9px] font-black"
                >
                  {pastOrders.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" className="my-12" />
        ) : listToRender.length === 0 ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={fetchOrders}
                colors={[colors.primary]}
                tintColor={colors.primary}
                progressBackgroundColor="#ffffff"
              />
            }
          >
            <View className="flex-1 items-center justify-center pb-20 px-6">
              <View className="w-40 h-40 bg-emerald-50 rounded-full items-center justify-center mb-4 border border-emerald-100 shadow-sm">
                <Image
                  source={require("../assets/ecom_assets/no_orders.png")}
                  className="w-32 h-32"
                  resizeMode="contain"
                />
              </View>
              <Text style={{ color: colors.textMain }} className="text-lg font-black text-center">
                No {currentOrdersTab.toLowerCase()} orders
              </Text>
              <Text style={{ color: colors.textMuted }} className="text-xs mt-1.5 text-center font-medium leading-relaxed px-4">
                {currentOrdersTab === 'Current'
                  ? "You don't have any active deliveries right now. Fresh groceries dispatched in 10 mins!"
                  : "No past order history found. Start exploring our fresh products catalog."}
              </Text>
              <TouchableOpacity
                onPress={() => handleTabSwitch('Home')}
                style={{ backgroundColor: colors.primary }}
                className="mt-6 rounded-2xl px-8 py-3.5 shadow-lg shadow-emerald-700/20"
              >
                <Text className="text-white font-extrabold text-xs tracking-wide">
                  Start Shopping 🛒
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <FlatList
            data={listToRender}
            keyExtractor={(item, idx) => (item?._id ? String(item._id) : `order-${idx}`)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={fetchOrders}
                colors={[colors.primary]}
                tintColor={colors.primary}
                progressBackgroundColor="#ffffff"
              />
            }
            renderItem={({ item, index }) => {
              if (!item) return null;
              const statusStyle = getStatusStyle(item.orderStatus);
              const rawId = item._id ? String(item._id) : (item.id ? String(item.id) : `ORD-${index}`);
              const orderNum = item.orderNumber || (rawId.length >= 6 ? rawId.slice(-6).toUpperCase() : rawId);

              let formattedDate = 'Recently';
              if (item.createdAt) {
                try {
                  const d = new Date(item.createdAt);
                  if (!isNaN(d.getTime())) {
                    formattedDate = d.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                  }
                } catch (e) { }
              }

              return (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Tracking', { orderId: item._id || rawId })}
                  activeOpacity={0.9}
                  style={{ borderColor: colors.border }}
                  className="bg-white border rounded-3xl p-4 mb-4 shadow-sm relative overflow-hidden"
                >
                  {/* Top Row: Order ID & Status Badge */}
                  <View className="flex-row items-center justify-between border-b border-slate-100 pb-3 mb-3">
                    <View className="flex-row items-center gap-2.5">
                      <View className="w-9 h-9 rounded-xl bg-emerald-50 items-center justify-center border border-emerald-100">
                        <ShoppingBag size={18} color={colors.primary} />
                      </View>
                      <View>
                        <Text style={{ color: colors.textMain }} className="text-xs font-black tracking-tight">
                          #{orderNum}
                        </Text>
                        <Text style={{ color: colors.textMuted }} className="text-[10px] font-semibold mt-0.5">
                          {formattedDate}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={{
                        backgroundColor: statusStyle.bg,
                        borderColor: statusStyle.border
                      }}
                      className="border px-3 py-1 rounded-full shadow-2xs"
                    >
                      <Text
                        style={{ color: statusStyle.text }}
                        className="text-[10px] font-black uppercase tracking-wider"
                      >
                        {statusStyle.label}
                      </Text>
                    </View>
                  </View>

                  {/* Items Preview Row */}
                  <View className="bg-slate-50/70 rounded-2xl p-3 mb-3 flex-row items-center justify-between">
                    <View className="flex-1 mr-3">
                      <Text style={{ color: colors.textMain }} className="text-xs font-bold" numberOfLines={1}>
                        {item.items?.map(i => `${i.name || i.product?.name || 'Item'} (${i.quantity})`).join(', ')}
                      </Text>
                      <Text style={{ color: colors.textMuted }} className="text-[10px] font-semibold mt-0.5">
                        {item.items?.length || 1} item{item.items?.length > 1 ? 's' : ''} in package
                      </Text>
                    </View>

                    <View className="bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      <Text style={{ color: colors.textMain }} className="text-[10px] font-black">
                        COD
                      </Text>
                    </View>
                  </View>

                  {/* Card Bottom: Total Amount & Action Button */}
                  <View className="flex-row items-center justify-between pt-1">
                    <View>
                      <Text style={{ color: colors.textMuted }} className="text-[10px] font-bold">Total Amount</Text>
                      <Text style={{ color: colors.textMain }} className="text-base font-black">
                        ₹{item.finalTotal || item.totalAmount || 0}
                      </Text>
                    </View>

                    {item.orderStatus !== 'DELIVERED' && item.orderStatus !== 'CANCELLED' ? (
                      <View
                        style={{ backgroundColor: colors.primary }}
                        className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-2xl shadow-md shadow-emerald-700/20"
                      >
                        <Text className="text-white text-xs font-black">Track Order</Text>
                        <ChevronRight size={15} color="white" />
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          if (item.items && item.items.length > 0) {
                            item.items.forEach(i => {
                              if (i.product) addToCart(i.product);
                            });
                            handleTabSwitch('Cart');
                          }
                        }}
                        style={{ backgroundColor: colors.primaryLight, borderColor: colors.primary + '30' }}
                        className="flex-row items-center gap-1.5 px-4 py-2 rounded-2xl border"
                      >
                        <Text style={{ color: colors.primary }} className="text-xs font-black">Reorder Items</Text>
                        <ChevronRight size={14} color={colors.primary} />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    );
  };

  // MOCKUP 15: MINIMAL & AWESOME PROFILE VIEW
  const renderProfileTab = () => {
    return (
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-white" contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}>
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
                onPress={() => handleTabSwitch('Orders')}
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
                onPress={() => setShowNotificationModal(true)}
                style={{ borderBottomColor: colors.border }}
                className="flex-row items-center justify-between px-5 py-4 border-b hover:bg-slate-50"
              >
                <View className="flex-row items-center gap-3.5">
                  <View className="p-2.5 rounded-2xl bg-purple-50 border border-purple-100">
                    <Bell size={18} color="#a855f7" />
                  </View>
                  <Text style={{ color: colors.textMain }} className="text-xs font-extrabold">Notifications</Text>
                </View>
                {unreadCount > 0 && (
                  <View className="bg-red-500 rounded-full px-2 py-0.5">
                    <Text className="text-white text-[9px] font-black">{unreadCount}</Text>
                  </View>
                )}
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
              onPress={handleLogout}
              className="flex-row items-center justify-center border border-red-200 rounded-2xl py-4 gap-2 bg-red-50 hover:bg-red-100"
            >
              <LogOut size={18} color="#ef4444" />
              <Text className="text-red-500 font-extrabold text-xs tracking-wider uppercase">Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

      {/* Dynamic Tab Panel */}
      <View className="flex-1">
        {renderTabContent()}
      </View>

      {/* Sleek Floating Quick-Cart Action Bar */}
      {getCartCount() > 0 && activeTab !== 'Cart' && (
        <TouchableOpacity
          onPress={() => handleTabSwitch('Cart')}
          activeOpacity={0.92}
          style={{
            backgroundColor: '#16221e',
            borderColor: '#22c55e30',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 10,
          }}
          className="mx-4 mb-2.5 px-4 py-2.5 rounded-2xl border flex-row items-center justify-between"
        >
          {/* Left: Neon Green Badge + Items & Total Price */}
          <View className="flex-row items-center gap-3">
            <View
              style={{ backgroundColor: colors.primary }}
              className="w-10 h-10 rounded-xl items-center justify-center shadow-sm shadow-emerald-500/40"
            >
              <ShoppingBag size={20} color="white" />
            </View>
            <View>
              <View className="flex-row items-center gap-1.5">
                <Text className="text-slate-300 text-[11px] font-bold">
                  {getCartCount()} {getCartCount() === 1 ? 'ITEM' : 'ITEMS'}
                </Text>
                <Text className="text-slate-500 text-[10px]">•</Text>
                <Text className="text-white text-sm font-black">
                  ₹{getCartTotal()}
                </Text>
              </View>
              <Text style={{ color: colors.primary }} className="text-[10px] font-extrabold mt-0.5">
                ⚡ 10-15 Min Express Delivery
              </Text>
            </View>
          </View>

          {/* Right: Vibrant View Cart Pill Button */}
          <View
            style={{ backgroundColor: colors.primary }}
            className="flex-row items-center px-4 py-2 rounded-xl gap-1 shadow-sm shadow-emerald-600/30"
          >
            <Text className="text-white text-xs font-black">View Cart</Text>
            <ChevronRight size={15} color="white" className="stroke-[3]" />
          </View>
        </TouchableOpacity>
      )}

      {/* Docked Bottom Tab Navigation Menu Bar */}
      <View
        style={{
          borderTopColor: '#f1f5f9',
          shadowColor: '#64748b',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 10,
        }}
        className="h-16 border-t flex-row justify-around items-center bg-white px-1 z-50"
      >
        {[
          { id: 'Home', label: 'Home', icon: Home },
          { id: 'Categories', label: 'Category', icon: Grid },
          { id: 'Cart', label: 'Cart', icon: ShoppingCart, badge: getCartCount() },
          { id: 'Orders', label: 'Orders', icon: Clipboard },
          { id: 'Profile', label: 'Profile', icon: User },
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => handleTabSwitch(tab.id)}
              activeOpacity={0.75}
              className="items-center justify-center flex-1 py-1"
            >
              <View
                style={{
                  backgroundColor: isActive ? colors.primaryLight : 'transparent',
                }}
                className="px-3 py-1.5 rounded-2xl items-center justify-center relative"
              >
                <IconComponent
                  size={20}
                  color={isActive ? colors.primary : '#64748b'}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <Text
                  style={{ color: isActive ? colors.primary : '#64748b' }}
                  numberOfLines={1}
                  className={`text-[10px] ${isActive ? 'font-black' : 'font-semibold'} mt-0.5 text-center`}
                >
                  {tab.label}
                </Text>

                {/* Cart Badge Overlay */}
                {tab.id === 'Cart' && tab.badge > 0 && (
                  <View
                    className="absolute -top-1 -right-1 bg-red-500 px-1.5 py-0.5 rounded-full border-2 border-white items-center justify-center min-w-[16px] min-h-[16px]"
                  >
                    <Text className="text-[7.5px] text-white font-extrabold leading-none">
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Premium Foreground Sliding Toast Notification Banner */}
      {toastVisible && (
        <Animated.View
          {...panResponder.panHandlers}
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            transform: [{ translateY: slideAnim }, { translateX: pan.x }],
            zIndex: 9999,
            backgroundColor: 'white',
            borderRadius: 20,
            padding: toastIsFullImage && toastImage ? 0 : 16,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 10,
            borderWidth: 1,
            borderColor: '#f1f5f9',
            height: toastIsFullImage && toastImage ? 110 : 'auto',
            overflow: 'hidden'
          }}
        >
          {toastIsFullImage && toastImage ? (
            <Image
              source={{ uri: toastImage }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <>
              <View style={{ backgroundColor: colors.primaryLight, padding: 10, borderRadius: 14, marginRight: 12 }}>
                <Bell size={22} color={colors.primary} fill={colors.primary + '30'} />
              </View>
              <View style={{ flex: 1, marginRight: toastImage ? 10 : 0 }}>
                <Text style={{ color: colors.textMain, fontWeight: '900', fontSize: 14 }}>
                  {toastTitle}
                </Text>
                <Text style={{ color: colors.textMuted, fontWeight: '700', fontSize: 11, mt: 1 }} numberOfLines={2}>
                  {toastBody}
                </Text>
              </View>
              {toastImage && (
                <Image
                  source={{ uri: toastImage }}
                  className="w-14 h-14 rounded-xl border border-slate-100 bg-slate-50"
                  resizeMode="cover"
                />
              )}
            </>
          )}
        </Animated.View>
      )}

      {/* Notifications Drawer Modal */}
      <Modal
        visible={showNotificationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNotificationModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 max-h-[80%] border-t border-slate-100 shadow-2xl">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <View className="flex-row items-center gap-2.5">
                <View style={{ backgroundColor: colors.primaryLight }} className="p-2.5 rounded-2xl">
                  <Bell size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={{ color: colors.textMain }} className="text-lg font-black">
                    Notification Center
                  </Text>
                  <Text style={{ color: colors.textMuted }} className="text-xs font-semibold">
                    {unreadCount > 0 ? `You have ${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'You are all caught up!'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowNotificationModal(false)}
                className="w-9 h-9 bg-slate-100 rounded-full items-center justify-center"
              >
                <X size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Notifications List */}
            <ScrollView showsVerticalScrollIndicator={false} className="space-y-3">
              {loadingNotifications ? (
                <View className="py-12 items-center justify-center">
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text className="text-xs text-slate-400 font-semibold mt-3">Loading updates...</Text>
                </View>
              ) : serverNotifications.length === 0 ? (
                <View className="py-10 items-center justify-center px-4">
                  <View className="w-16 h-16 rounded-full bg-slate-100 items-center justify-center mb-3">
                    <Bell size={28} color="#94a3b8" />
                  </View>
                  <Text className="text-slate-800 text-sm font-bold text-center">No notifications yet</Text>
                  <Text className="text-slate-400 text-xs text-center mt-1 leading-relaxed">
                    We'll notify you here about your live grocery orders and exclusive special offers!
                  </Text>
                </View>
              ) : (
                serverNotifications.map((item) => {
                  const isOrder = item.type === 'ORDER';
                  const isUnread = !item.read;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.8}
                      onPress={() => {
                        markNotificationsAsRead([item.id]);
                        setShowNotificationModal(false);
                        if (isOrder) {
                          setActiveTab('Orders');
                          triggerToast(item.title, item.body, null, false);
                        } else {
                          if (item.metadata?.couponCode) {
                            setCouponInput(item.metadata.couponCode);
                            triggerToast(item.title, `Promo code ${item.metadata.couponCode} ready to apply!`, null, false);
                          } else {
                            triggerToast(item.title, item.body, null, false);
                          }
                        }
                      }}
                      className={`p-4 rounded-2xl border flex-row items-start gap-3 mb-3 ${isUnread
                        ? isOrder
                          ? 'bg-emerald-50/80 border-emerald-200 shadow-sm'
                          : 'bg-amber-50/80 border-amber-200 shadow-sm'
                        : 'bg-slate-50/90 border-slate-200/70 opacity-75'
                        }`}
                    >
                      <View
                        className={`w-10 h-10 rounded-xl items-center justify-center ${isUnread
                          ? isOrder
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                          : 'bg-slate-200'
                          }`}
                      >
                        {isOrder ? (
                          <ShoppingBag size={20} color={isUnread ? 'white' : '#64748b'} />
                        ) : (
                          <Tag size={20} color={isUnread ? 'white' : '#64748b'} />
                        )}
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center flex-1 pr-2">
                            <Text
                              className={`${isUnread ? 'text-slate-900 font-black' : 'text-slate-700 font-bold'
                                } text-xs`}
                              numberOfLines={1}
                            >
                              {item.title}
                            </Text>
                            {isUnread && (
                              <View className={`w-2 h-2 rounded-full ml-1.5 ${isOrder ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            )}
                          </View>
                          <Text className="text-slate-400 text-[9px] font-bold">
                            {formatTimeAgo(item.createdAt)}
                          </Text>
                        </View>
                        <Text className="text-slate-600 text-[11px] font-medium mt-1 leading-relaxed">
                          {item.body}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

            {/* Bottom Actions */}
            {serverNotifications.length > 0 && unreadCount > 0 && (
              <View className="pt-4 mt-2 border-t border-slate-100">
                <TouchableOpacity
                  onPress={() => {
                    markNotificationsAsRead(serverNotifications.map(n => n.id));
                    setShowNotificationModal(false);
                    triggerToast("FreshMart Notice", "All notifications marked as read.", null, false);
                  }}
                  style={{ backgroundColor: colors.primary }}
                  className="w-full py-3.5 rounded-2xl items-center justify-center shadow-md shadow-emerald-700/20"
                >
                  <Text className="text-white font-extrabold text-xs">Mark All as Read</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
