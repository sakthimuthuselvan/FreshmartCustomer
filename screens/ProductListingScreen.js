import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../src/context/ThemeContext';
import { useCart } from '../src/context/CartContext';
import api from '../src/api/api';
import { ChevronLeft, ShoppingBag, Plus, Minus, Search, ArrowUpDown, SlidersHorizontal } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ProductListingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { cart, addToCart, removeFromCart } = useCart();

  const { categoryId, categoryName } = route.params || { categoryId: '', categoryName: 'Products' };

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [categoryId]);

  const fetchProducts = async () => {
    if (!categoryId) return;
    setLoading(true);
    try {
      const res = await api.get('/products', { params: { categoryId } });
      setProducts(res.data.products || []);
    } catch (err) {
      console.log('Error fetching category products:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

      {/* Header bar (Mockup 07) */}
      <View
        style={{ borderBottomColor: colors.border }}
        className="px-5 py-3 border-b flex-row items-center justify-between bg-white"
      >
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-1 rounded-full hover:bg-slate-100"
          >
            <ChevronLeft size={24} color={colors.textMain} />
          </TouchableOpacity>
          <View>
            <Text style={{ color: colors.textMain }} className="text-base font-black leading-tight">{categoryName}</Text>
            <Text style={{ color: colors.textMuted }} className="text-[10px] font-bold">120+ items</Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Search')}
          className="p-2 rounded-full hover:bg-slate-50"
        >
          <Search size={20} color={colors.textMain} />
        </TouchableOpacity>
      </View>

      {/* Sort & Filter pills (Mockup 07) */}
      <View
        style={{ borderColor: colors.border }}
        className="flex-row border-b justify-around items-center py-2.5 bg-slate-50/50"
      >
        <TouchableOpacity className="flex-row items-center justify-center gap-2 flex-1 py-1">
          <ArrowUpDown size={16} color={colors.textMain} />
          <Text style={{ color: colors.textMain }} className="text-xs font-extrabold">Sort</Text>
        </TouchableOpacity>

        <View style={{ backgroundColor: colors.border }} className="w-px h-5" />

        <TouchableOpacity className="flex-row items-center justify-center gap-2 flex-1 py-1">
          <SlidersHorizontal size={16} color={colors.textMain} />
          <Text style={{ color: colors.textMain }} className="text-xs font-extrabold">Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Product List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : products.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View
            style={{ backgroundColor: colors.primaryLight }}
            className="p-5 rounded-full mb-4"
          >
            <ShoppingBag size={32} color={colors.primary} />
          </View>
          <Text style={{ color: colors.textMain }} className="text-base font-extrabold">No items found</Text>
          <Text style={{ color: colors.textMuted }} className="text-xs text-center mt-1 px-8">There are no products cataloged under this department yet.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 15, paddingTop: 15, paddingBottom: 30 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const cartItem = cart.find(c => c.product._id === item._id);
            return (
              <View
                style={{ width: (width - 45) / 2, borderColor: colors.border, backgroundColor: colors.card }}
                className="border rounded-2xl mb-4 shadow-sm relative overflow-hidden"
              >
                {/* 20% OFF Tag (Mockup 07) */}
                <View className="absolute top-2 left-2 bg-red-500 rounded px-1.5 py-0.5 z-10">
                  <Text className="text-[8px] text-white font-extrabold">20% OFF</Text>
                </View>

                <TouchableOpacity
                  onPress={() => navigation.navigate('ProductDetails', { product: item })}
                  className="w-full bg-white items-center justify-center pt-2.5 pb-1.5"
                >
                  {item.image ? (
                    <Image
                      source={{ uri: item.image }}
                      style={{ width: '100%', height: 110 }}
                      resizeMode="contain"
                    />
                  ) : (
                    <View className="w-full h-28 bg-slate-100 items-center justify-center">
                      <ShoppingBag size={24} color="#94a3b8" />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Text Details Container */}
                <View className="p-3 pt-2 flex-1 justify-between bg-white">
                  <View>
                    <Text style={{ color: colors.textMain }} className="text-sm font-black leading-tight" numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={{ color: colors.textMuted }} className="text-xs font-semibold mt-0.5">
                      {item.unit || '1 kg'}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between mt-3">
                    <View className="flex-1 mr-1">
                      <Text style={{ color: colors.textMain }} className="text-base font-black">
                        ₹{item.price}
                      </Text>
                      <Text style={{ color: colors.textMuted }} className="text-xs font-medium line-through">
                        ₹{Math.floor(item.price * 1.25)}
                      </Text>
                    </View>

                    {cartItem ? (
                      <View style={{ backgroundColor: colors.primary }} className="flex-row items-center rounded-2xl px-3 h-11 justify-center">
                        <TouchableOpacity
                          onPress={() => removeFromCart(item._id)}
                          className="p-1.5"
                          hitSlop={{ top: 15, bottom: 15, left: 12, right: 12 }}
                        >
                          <Minus size={16} color="white" className="stroke-[3]" />
                        </TouchableOpacity>
                        <Text className="text-white text-sm font-black px-2">{cartItem.quantity}</Text>
                        <TouchableOpacity
                          onPress={() => addToCart(item)}
                          className="p-1.5"
                          hitSlop={{ top: 15, bottom: 15, left: 12, right: 12 }}
                        >
                          <Plus size={16} color="white" className="stroke-[3]" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => addToCart(item)}
                        style={{ backgroundColor: colors.primary }}
                        className="w-11 h-11 rounded-2xl items-center justify-center shadow-md shadow-emerald-700/10"
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                      >
                        <Plus size={22} color="white" className="stroke-[3.5]" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
