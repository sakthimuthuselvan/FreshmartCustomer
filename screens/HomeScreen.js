import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  FlatList,
  ActivityIndicator,
  Dimensions,
  StatusBar
} from 'react-native';
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
  Settings
} from 'lucide-react-native';

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

export default function HomeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { cart, addToCart, removeFromCart, getCartTotal, getCartCount } = useCart();

  const [activeTab, setActiveTab] = useState('Home');
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [orders, setOrders] = useState([]);
  const [currentOrdersTab, setCurrentOrdersTab] = useState('Current'); // Current or Past (Mockup 14)
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Coupon promo states
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const coords = route.params?.coords || {
    addressText: 'Home - 12, Anna Nagar'
  };

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
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      if (prodRes.data.products?.length > 0) setProducts(prodRes.data.products);
      if (catRes.data.categories?.length > 0) setCategories(catRes.data.categories);
    } catch (err) {
      console.log('Error fetching store data, falling back to mock files:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/my');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.log('Error fetching customer orders:', err.message);
    } finally {
      setLoading(false);
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
      <ScrollView showsVerticalScrollIndicator={false} className="flex-grow bg-white">
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
          <TouchableOpacity className="p-2.5 bg-slate-100 rounded-full relative">
            <Bell size={24} color={colors.textMain} />
            <View className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full items-center justify-center border-2 border-white">
              <Text className="text-[9px] text-white font-extrabold">2</Text>
            </View>
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

        {/* Green Discount Slider Card (Mockup 05) */}
        <View className="px-5 py-2">
          <View
            style={{ backgroundColor: colors.primary }}
            className="rounded-3xl p-5 relative overflow-hidden flex-row justify-between items-center shadow-lg"
          >
            <View className="z-10 max-w-[60%] space-y-2">
              <View className="bg-white/20 border border-white/30 rounded-full px-3 py-1 self-start">
                <Text className="text-[9px] font-extrabold text-white uppercase tracking-wider">UP TO 50% OFF</Text>
              </View>
              <Text className="text-lg font-black text-white leading-tight">Fresh Vegetables Deals</Text>
              <TouchableOpacity className="bg-white rounded-full px-4 py-1.5 self-start mt-2">
                <Text style={{ color: colors.primary }} className="text-[10px] font-black">Shop Now</Text>
              </TouchableOpacity>
            </View>
            <Image
              source={require("../assets/Gemini_Generated_Image_ohi6lvohi6lvohi6.png")}
              className="w-28 h-28 rounded-2xl"
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Categories Circle horizontal list (Mockup 05) */}
        <View className="py-4">
          <View className="px-5 flex-row items-center justify-between mb-3">
            <Text style={{ color: colors.textMain }} className="text-base font-extrabold">Shop by Category</Text>
            <TouchableOpacity onPress={() => setActiveTab('Categories')}>
              <Text style={{ color: colors.primary }} className="text-xs font-extrabold">See All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories.slice(0, 10)}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => navigation.navigate('ProductListing', { categoryId: item._id, categoryName: item.name })}
                className="items-center mr-6"
              >
                <View
                  style={{ backgroundColor: '#f3f4f6' }}
                  className="w-16 h-16 rounded-2xl items-center justify-center mb-1.5 shadow-sm overflow-hidden"
                >
                  <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                </View>
                <Text style={{ color: colors.textMain }} className="text-[10px] font-black tracking-tight text-center mt-1.5">{item.name}</Text>
              </TouchableOpacity>
            )}
          />
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
                  <View
                    key={product._id}
                    style={{ width: (width - 56) / 3, borderColor: colors.border, backgroundColor: colors.card }}
                    className="border rounded-2xl mb-4 shadow-sm relative overflow-hidden"
                  >
                    {/* Discount badge */}
                    <View className="absolute top-2 left-2 bg-red-500 rounded px-1.5 py-0.5 z-10">
                      <Text className="text-[7px] text-white font-extrabold">20% OFF</Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => navigation.navigate('ProductDetails', { product })}
                      className="w-full bg-white items-center justify-center pt-2 pb-1"
                    >
                      <Image
                        source={{ uri: product.image }}
                        style={{ width: '100%', height: 75 }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>

                    {/* Text Details Container */}
                    <View className="p-2 pt-1 flex-1 justify-between bg-white">
                      <View>
                        <Text style={{ color: colors.textMain }} className="text-[10px] font-black leading-tight" numberOfLines={1}>
                          {product.name}
                        </Text>
                        <Text style={{ color: colors.textMuted }} className="text-[8px] font-bold mt-0.5">
                          {product.unit || '1 kg'}
                        </Text>
                      </View>

                      <View className="flex-row items-center justify-between mt-2.5">
                        <View className="flex-1 mr-0.5">
                          <Text style={{ color: colors.textMain }} className="text-[10px] font-black">
                            ₹{product.price}
                          </Text>
                          <Text style={{ color: colors.textMuted }} className="text-[8px] font-medium line-through">
                            ₹{Math.floor(product.price * 1.25)}
                          </Text>
                        </View>

                        {cartItem ? (
                          <View style={{ backgroundColor: colors.primary }} className="flex-row items-center rounded-xl px-2 h-10 justify-center">
                            <TouchableOpacity
                              onPress={() => removeFromCart(product._id)}
                              className="p-1"
                              hitSlop={{ top: 15, bottom: 15, left: 10, right: 10 }}
                            >
                              <Minus size={13} color="white" className="stroke-[3]" />
                            </TouchableOpacity>
                            <Text className="text-white text-xs font-black px-1.5">{cartItem.quantity}</Text>
                            <TouchableOpacity
                              onPress={() => addToCart(product)}
                              className="p-1"
                              hitSlop={{ top: 15, bottom: 15, left: 10, right: 10 }}
                            >
                              <Plus size={13} color="white" className="stroke-[3]" />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity
                            onPress={() => addToCart(product)}
                            style={{ backgroundColor: colors.primary }}
                            className="w-10 h-10 rounded-xl items-center justify-center shadow-sm"
                            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                          >
                            <Plus size={20} color="white" className="stroke-[3.5]" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
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
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
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
      <View className="flex-1 px-5 pt-4 bg-white">
        <View className="flex-row items-center justify-between mb-4">
          <Text style={{ color: colors.textMain }} className="text-lg font-black">My Cart ({cart.length})</Text>
          <TouchableOpacity>
            <Text style={{ color: colors.primary }} className="text-sm font-extrabold">Edit</Text>
          </TouchableOpacity>
        </View>

        {cart.length === 0 ? (
          <View className="flex-1 items-center justify-center pb-20">
            <Image
              source={require("../assets/ecom_assets/empty_cart.png")}
              className="w-48 h-48 mb-4"
              resizeMode="contain"
            />
            <Text style={{ color: colors.textMain }} className="text-base font-black">Your cart is empty</Text>
            <Text style={{ color: colors.textMuted }} className="text-xs text-center mt-1 px-8 font-medium">Looks like you haven't added anything yet.</Text>
            <TouchableOpacity
              onPress={() => setActiveTab('Home')}
              style={{ backgroundColor: colors.primary }}
              className="mt-6 rounded-2xl px-6 py-3 shadow-md animate-bounce"
            >
              <Text className="text-white font-black text-xs">Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-grow justify-between">
            <ScrollView showsVerticalScrollIndicator={false} className="flex-shrink">
              {cart.map((item) => (
                <View
                  key={item.product._id}
                  style={{ borderBottomColor: colors.border }}
                  className="flex-row items-center justify-between border-b py-3.5"
                >
                  <View className="flex-row items-center gap-3 flex-1 mr-4">
                    <Image source={{ uri: item.product.image }} className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100" resizeMode="contain" />
                    <View className="flex-1">
                      <Text style={{ color: colors.textMain }} className="text-xs font-black leading-tight">{item.product.name}</Text>
                      <Text style={{ color: colors.textMuted }} className="text-[10px] mt-0.5 font-bold">₹{item.product.price} • {item.product.unit || '1 kg'}</Text>
                    </View>
                  </View>

                  <View style={{ backgroundColor: colors.primary }} className="flex-row items-center rounded-2xl px-3.5 py-2 shadow-sm">
                    <TouchableOpacity
                      onPress={() => removeFromCart(item.product._id)}
                      className="p-1.5"
                      hitSlop={{ top: 15, bottom: 15, left: 12, right: 12 }}
                    >
                      <Minus size={15} color="white" className="stroke-[3]" />
                    </TouchableOpacity>
                    <Text className="text-white text-sm font-black px-4">{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => addToCart(item.product)}
                      className="p-1.5"
                      hitSlop={{ top: 15, bottom: 15, left: 12, right: 12 }}
                    >
                      <Plus size={15} color="white" className="stroke-[3]" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Coupon row matching Screen 09 */}
              <View>
                <View
                  style={{ borderColor: colors.border, backgroundColor: colors.card }}
                  className="border-2 rounded-2xl p-2.5 mt-6 flex-row items-center justify-between"
                >
                  <View className="flex-1 mr-2">
                    <TextInput
                      placeholder="Apply Coupon"
                      placeholderTextColor="#94a3b8"
                      value={couponInput}
                      onChangeText={(val) => {
                        setCouponInput(val);
                        setCouponError('');
                      }}
                      autoCapitalize="characters"
                      className="p-1.5 text-xs font-bold text-slate-800 ml-1"
                      editable={!appliedCoupon}
                    />
                  </View>
                  {appliedCoupon ? (
                    <TouchableOpacity 
                      onPress={handleRemoveCoupon}
                      style={{ paddingVertical: 10, paddingHorizontal: 16 }}
                      className="bg-red-500/10 rounded-xl border border-red-500/25"
                      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    >
                      <Text className="text-red-500 text-xs font-black">Remove</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      onPress={handleApplyCoupon}
                      style={{ paddingVertical: 10, paddingHorizontal: 16 }}
                      className="bg-emerald-500/10 rounded-xl border border-emerald-500/25"
                      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    >
                      <Text style={{ color: colors.primary }} className="text-xs font-black">Apply</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {couponError ? (
                  <Text className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{couponError}</Text>
                ) : null}
                {couponSuccess ? (
                  <Text className="text-emerald-600 text-[10px] font-bold mt-1.5 ml-1">{couponSuccess}</Text>
                ) : null}
              </View>

              {/* Delivery Address panel inside Cart */}
              <TouchableOpacity
                onPress={() => navigation.navigate('Address')}
                style={{ borderColor: colors.border, backgroundColor: colors.card }}
                className="border-2 rounded-2xl p-4 mt-4 flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <MapPin size={20} color={colors.primary} />
                  <View className="flex-1">
                    <Text style={{ color: colors.textMain }} className="text-xs font-black">Home Address</Text>
                    <Text style={{ color: colors.textMuted }} className="text-[10px] mt-0.5 font-semibold" numberOfLines={1}>
                      Anna Nagar, Chennai - 600040
                    </Text>
                  </View>
                </View>
                <ChevronRight size={16} color={colors.textMuted} />
              </TouchableOpacity>

              {/* Bill summary (Mockup 09) */}
              <View
                style={{ backgroundColor: colors.card, borderColor: colors.border }}
                className="rounded-2xl p-4 mt-4 border-2 space-y-2.5 mb-6"
              >
                <Text style={{ color: colors.textMain }} className="text-xs font-black mb-1">Billing Summary</Text>
                <View className="flex-row justify-between">
                  <Text style={{ color: colors.textMuted }} className="text-xs font-semibold">Subtotal</Text>
                  <Text style={{ color: colors.textMain }} className="text-xs font-black">₹{getCartTotal()}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text style={{ color: colors.textMuted }} className="text-xs font-semibold">Delivery Fee</Text>
                  <Text style={{ color: colors.textMain }} className="text-xs font-black">₹{appliedCoupon?.code === 'FREESHIP' ? 0 : 15}</Text>
                </View>
                {appliedCoupon ? (
                  <View className="flex-row justify-between">
                    <Text className="text-emerald-600 text-xs font-semibold">Discount ({appliedCoupon.code})</Text>
                    <Text className="text-emerald-600 text-xs font-black">-₹{getCouponDiscount()}</Text>
                  </View>
                ) : null}
                <View style={{ backgroundColor: colors.border }} className="w-full h-px my-1" />
                <View className="flex-row justify-between">
                  <Text style={{ color: colors.textMain }} className="text-xs font-black">Total to Pay</Text>
                  <Text style={{ color: colors.primary }} className="text-sm font-black">
                    ₹{Math.max(0, getCartTotal() + (appliedCoupon?.code === 'FREESHIP' ? 0 : 15) - getCouponDiscount())}
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Checkout Button */}
            <View className="py-4">
              <TouchableOpacity
                onPress={() => navigation.navigate('Checkout', { 
                  coords, 
                  appliedCoupon: appliedCoupon ? appliedCoupon.code : null 
                })}
                style={{ backgroundColor: colors.primary }}
                className="rounded-2xl py-4 items-center shadow-md shadow-emerald-700/25"
              >
                <Text className="text-white font-extrabold text-sm">Checkout</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  // MOCKUP 14: ORDERS TRACKING TABS LIST
  const renderOrdersTab = () => {
    const currentOrders = orders.filter(o => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED');
    const pastOrders = orders.filter(o => o.orderStatus === 'DELIVERED' || o.orderStatus === 'CANCELLED');
    const listToRender = currentOrdersTab === 'Current' ? currentOrders : pastOrders;

    return (
      <View className="flex-1 px-5 pt-4 bg-white">
        <Text style={{ color: colors.textMain }} className="text-lg font-black mb-4">My Orders</Text>

        {/* Tab Header Selector (Mockup 14) */}
        <View className="flex-row bg-slate-100 rounded-xl p-1 mb-5">
          <TouchableOpacity
            onPress={() => setCurrentOrdersTab('Current')}
            style={{ backgroundColor: currentOrdersTab === 'Current' ? 'white' : 'transparent' }}
            className="flex-1 py-2 rounded-lg items-center shadow-sm"
          >
            <Text
              style={{ color: currentOrdersTab === 'Current' ? colors.primary : colors.textMuted }}
              className="text-xs font-black"
            >
              Current Orders
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCurrentOrdersTab('Past')}
            style={{ backgroundColor: currentOrdersTab === 'Past' ? 'white' : 'transparent' }}
            className="flex-1 py-2 rounded-lg items-center shadow-sm"
          >
            <Text
              style={{ color: currentOrdersTab === 'Past' ? colors.primary : colors.textMuted }}
              className="text-xs font-black"
            >
              Past Orders
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} className="my-8" />
        ) : listToRender.length === 0 ? (
          <View className="flex-1 items-center justify-center pb-20">
            <Image
              source={require("../assets/ecom_assets/no_orders.png")}
              className="w-48 h-48 mb-4"
              resizeMode="contain"
            />
            <Text style={{ color: colors.textMain }} className="text-base font-black">No orders yet</Text>
            <Text style={{ color: colors.textMuted }} className="text-xs mt-1 text-center font-semibold">You haven't placed any orders anything yet.</Text>
            <TouchableOpacity
              onPress={() => setActiveTab('Home')}
              style={{ backgroundColor: colors.primary }}
              className="mt-6 rounded-2xl px-6 py-3 shadow-md"
            >
              <Text className="text-white font-black text-xs">Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={listToRender}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => navigation.navigate('Tracking', { orderId: item._id })}
                style={{ borderColor: colors.border, backgroundColor: colors.card }}
                className="border-2 rounded-2xl p-4 mb-4 shadow-sm"
              >
                <View className="flex-row items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <View>
                    <Text style={{ color: colors.textMain }} className="text-xs font-black">{item.orderNumber}</Text>
                    <Text style={{ color: colors.textMuted }} className="text-[9px] font-bold mt-0.5">
                      Today, {new Date(item.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>

                  <View
                    style={{
                      backgroundColor: item.orderStatus === 'DELIVERED' ? colors.primaryLight : '#fef3c7',
                      borderColor: item.orderStatus === 'DELIVERED' ? colors.primary + '20' : '#f59e0b20'
                    }}
                    className="border px-2.5 py-0.5 rounded-full"
                  >
                    <Text
                      style={{ color: item.orderStatus === 'DELIVERED' ? colors.primary : '#d97706' }}
                      className="text-[9px] font-extrabold uppercase"
                    >
                      {item.orderStatus}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between">
                  <View>
                    <Text style={{ color: colors.textMain }} className="text-sm font-black">₹{item.finalTotal}</Text>
                    <Text style={{ color: colors.textMuted }} className="text-[10px] font-semibold mt-0.5">{item.items?.length} Items</Text>
                  </View>

                  <View className="flex-row items-center gap-1">
                    <Text style={{ color: colors.primary }} className="text-xs font-black">Track Order</Text>
                    <ChevronRight size={14} color={colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    );
  };

  // MOCKUP 15: PROFILE VIEW
  const renderProfileTab = () => {
    return (
      <View className="flex-1 px-5 pt-4 justify-between bg-white">
        <View>
          <Text style={{ color: colors.textMain }} className="text-lg font-black mb-6">Profile Screen</Text>

          {/* Profile card avatar layout (Mockup 15) */}
          <View
            style={{ backgroundColor: colors.primary }}
            className="rounded-3xl p-5 relative overflow-hidden mb-6 flex-row items-center gap-4 shadow-lg shadow-emerald-700/10"
          >
            <View className="w-16 h-16 rounded-full bg-white items-center justify-center shadow-md">
              <User size={32} color={colors.primary} />
            </View>
            <View>
              <Text className="text-white font-black text-base leading-tight">Karthik Kumar</Text>
              <Text className="text-white/80 font-bold text-[10px] mt-1">98765 43210</Text>
            </View>
          </View>

          {/* Menu routes settings list (Mockup 15) */}
          <View style={{ borderColor: colors.border }} className="border-2 rounded-2xl overflow-hidden bg-white shadow-sm">
            <TouchableOpacity
              onPress={() => setActiveTab('Orders')}
              style={{ borderBottomColor: colors.border }}
              className="flex-row items-center justify-between px-5 py-3.5 border-b hover:bg-slate-50"
            >
              <View className="flex-row items-center gap-3">
                <Clipboard size={18} color={colors.primary} />
                <Text style={{ color: colors.textMain }} className="text-xs font-extrabold">My Orders</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Address')}
              style={{ borderBottomColor: colors.border }}
              className="flex-row items-center justify-between px-5 py-3.5 border-b hover:bg-slate-50"
            >
              <View className="flex-row items-center gap-3">
                <MapPin size={18} color={colors.primary} />
                <Text style={{ color: colors.textMain }} className="text-xs font-extrabold">My Addresses</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ borderBottomColor: colors.border }}
              className="flex-row items-center justify-between px-5 py-3.5 border-b hover:bg-slate-50"
            >
              <View className="flex-row items-center gap-3">
                <Wallet size={18} color={colors.primary} />
                <Text style={{ color: colors.textMain }} className="text-xs font-extrabold">Wallet & Offers</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ borderBottomColor: colors.border }}
              className="flex-row items-center justify-between px-5 py-3.5 border-b hover:bg-slate-50"
            >
              <View className="flex-row items-center gap-3">
                <Bell size={18} color={colors.primary} />
                <Text style={{ color: colors.textMain }} className="text-xs font-extrabold">Notifications</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ borderBottomColor: colors.border }}
              className="flex-row items-center justify-between px-5 py-3.5 border-b hover:bg-slate-50"
            >
              <View className="flex-row items-center gap-3">
                <HelpCircle size={18} color={colors.primary} />
                <Text style={{ color: colors.textMain }} className="text-xs font-extrabold">Help & Support</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ borderBottomColor: colors.border }}
              className="flex-row items-center justify-between px-5 py-3.5 border-b hover:bg-slate-50"
            >
              <View className="flex-row items-center gap-3">
                <Info size={18} color={colors.primary} />
                <Text style={{ color: colors.textMain }} className="text-xs font-extrabold">About Us</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between px-5 py-3.5 hover:bg-slate-50"
            >
              <View className="flex-row items-center gap-3">
                <Settings size={18} color={colors.primary} />
                <Text style={{ color: colors.textMain }} className="text-xs font-extrabold">Settings</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout button */}
        <View className="py-6">
          <TouchableOpacity
            onPress={handleLogout}
            style={{ borderColor: '#ef4444' }}
            className="flex-row items-center justify-center border-2 rounded-2xl py-4 gap-2 bg-red-500/5 cursor-pointer"
          >
            <LogOut size={16} color="#ef4444" />
            <Text className="text-red-500 font-extrabold text-sm">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

      {/* Dynamic Tab Panel */}
      <View className="flex-1">
        {renderTabContent()}
      </View>

      {/* Tab Navigation Menu bar */}
      <View
        style={{ borderTopColor: colors.border }}
        className="h-18 border-t flex-row justify-around items-center bg-white px-2 shadow-md"
      >
        <TouchableOpacity
          onPress={() => setActiveTab('Home')}
          className="items-center py-2 flex-1"
        >
          <Home size={24} color={activeTab === 'Home' ? colors.primary : colors.textMuted} />
          <Text
            style={{ color: activeTab === 'Home' ? colors.primary : colors.textMuted }}
            className="text-[10px] font-bold mt-1.5"
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('Categories')}
          className="items-center py-2 flex-1"
        >
          <Grid size={24} color={activeTab === 'Categories' ? colors.primary : colors.textMuted} />
          <Text
            style={{ color: activeTab === 'Categories' ? colors.primary : colors.textMuted }}
            className="text-[10px] font-bold mt-1.5"
          >
            Categories
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('Cart')}
          className="items-center py-2 flex-1 relative"
        >
          <ShoppingCart size={24} color={activeTab === 'Cart' ? colors.primary : colors.textMuted} />
          <Text
            style={{ color: activeTab === 'Cart' ? colors.primary : colors.textMuted }}
            className="text-[10px] font-bold mt-1.5"
          >
            Cart
          </Text>
          {getCartCount() > 0 && (
            <View
              style={{
                position: 'absolute',
                right: 20,
                top: 4,
                backgroundColor: '#ef4444',
                width: 18,
                height: 18,
                borderRadius: 9,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1.5,
                borderColor: 'white'
              }}
            >
              <Text className="text-[8px] text-white font-black">{getCartCount()}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('Orders')}
          className="items-center py-2 flex-1"
        >
          <Clipboard size={24} color={activeTab === 'Orders' ? colors.primary : colors.textMuted} />
          <Text
            style={{ color: activeTab === 'Orders' ? colors.primary : colors.textMuted }}
            className="text-[10px] font-bold mt-1.5"
          >
            Orders
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('Profile')}
          className="items-center py-2 flex-1"
        >
          <User size={24} color={activeTab === 'Profile' ? colors.primary : colors.textMuted} />
          <Text
            style={{ color: activeTab === 'Profile' ? colors.primary : colors.textMuted }}
            className="text-[10px] font-bold mt-1.5"
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
