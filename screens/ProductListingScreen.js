import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
  StatusBar
} from 'react-native';
import Text from '../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../src/context/ThemeContext';
import { useCart } from '../src/context/CartContext';
import api from '../src/api/api';
import { ChevronLeft, ShoppingBag, Plus, Minus, Search, ArrowUpDown, SlidersHorizontal } from 'lucide-react-native';

import ProductCard from '../components/ProductCard';

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
            <Text style={{ color: colors.textMuted }} className="text-[10px] font-bold">{products.length || 0} items available</Text>
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
          numColumns={3}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 15, paddingTop: 15, paddingBottom: 30 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const cartItem = cart.find(c => c.product._id === item._id);

            return (
              <ProductCard
                product={item}
                cartItem={cartItem}
                cardWidth={(width - 30 - 16) / 3}
                onPress={() => navigation.navigate('ProductDetails', { product: item })}
                onAddToCart={() => addToCart(item)}
                onRemoveFromCart={() => removeFromCart(item._id)}
                colors={colors}
              />
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
