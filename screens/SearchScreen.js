import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import Text from '../components/AppText';
import TextInput from '../components/AppTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../src/context/ThemeContext';
import { useCart } from '../src/context/CartContext';
import api from '../src/api/api';
import {
  ArrowLeft,
  Search,
  X,
  Plus,
  Minus,
  Clock,
  TrendingUp,
  ShoppingBag
} from 'lucide-react-native';

import ProductCard from '../components/ProductCard';

const { width } = Dimensions.get('window');

const POPULAR_KEYWORDS = [
  'Tomato',
  'Milk',
  'Mango',
  'Bread',
  'Potato',
  'Egg'
];

export default function SearchScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { cart, addToCart, removeFromCart } = useCart();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([
    'Fresh Veggies',
    'Organic Bananas',
    'Butter'
  ]);

  const inputRef = useRef(null);

  // Auto focus input on load
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, []);

  // Debounced search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await api.get('/products', {
          params: { search: query }
        });
        if (response.data) {
          // If the backend returns products, set results
          setResults(response.data.products || response.data || []);
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    }, 450); // 450ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearchSubmit = () => {
    if (query.trim() && !recentSearches.includes(query.trim())) {
      setRecentSearches(prev => [query.trim(), ...prev.slice(0, 4)]);
    }
  };

  const handleKeywordTap = (keyword) => {
    setQuery(keyword);
    if (!recentSearches.includes(keyword)) {
      setRecentSearches(prev => [keyword, ...prev.slice(0, 4)]);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  const removeRecentSearch = (itemToRemove) => {
    setRecentSearches(prev => prev.filter(item => item !== itemToRemove));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Header Search bar */}
      <View
        style={{ borderBottomColor: colors.border }}
        className="flex-row items-center px-4 py-3 border-b bg-white gap-3"
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-1 rounded-full hover:bg-slate-100"
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <ArrowLeft size={22} color={colors.textMain} />
        </TouchableOpacity>

        <View
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
          className="flex-1 flex-row items-center border rounded-2xl px-3.5 py-2.5"
        >
          <Search size={18} color="#64748b" />
          <TextInput
            ref={inputRef}
            placeholder="Search fresh products..."
            placeholderTextColor="#94a3b8"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            style={{ padding: 0 }}
            className="flex-1 ml-2.5 text-sm font-bold text-slate-800"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={clearSearch}
              className="p-0.5 rounded-full bg-slate-200"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={13} color="#475569" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Container */}
      <View className="flex-1 bg-white">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.textMuted }} className="text-xs font-semibold mt-3">Searching the grocery fields...</Text>
          </View>
        ) : query.length === 0 ? (
          /* Default state: Suggestions & History */
          <View className="px-5 pt-4">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View className="mb-6">
                <Text style={{ color: colors.textMain }} className="text-sm font-black mb-3">Recent Searches</Text>
                {recentSearches.map((item, idx) => (
                  <View key={idx} className="flex-row items-center justify-between py-2 border-b border-slate-50">
                    <TouchableOpacity
                      onPress={() => handleKeywordTap(item)}
                      className="flex-row items-center gap-3 flex-1"
                    >
                      <Clock size={16} color="#94a3b8" />
                      <Text style={{ color: colors.textMain }} className="text-xs font-bold">{item}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeRecentSearch(item)}
                      className="p-1"
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <X size={14} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Popular Keywords */}
            <View>
              <Text style={{ color: colors.textMain }} className="text-sm font-black mb-3">Popular Searches</Text>
              <View className="flex-row flex-wrap gap-2">
                {POPULAR_KEYWORDS.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleKeywordTap(item)}
                    style={{ backgroundColor: '#f1f5f9' }}
                    className="flex-row items-center px-4 py-2 rounded-2xl gap-1.5"
                  >
                    <TrendingUp size={12} color={colors.primary} />
                    <Text style={{ color: colors.textMain }} className="text-xs font-extrabold">{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ) : results.length === 0 ? (
          /* Empty results state */
          <View className="flex-1 items-center justify-center px-6 pb-20">
            <Image
              source={require("../assets/ecom_assets/empty_cart.png")}
              style={{ width: 140, height: 140 }}
              resizeMode="contain"
              className="mb-4 opacity-75"
            />
            <Text style={{ color: colors.textMain }} className="text-base font-black">No products found</Text>
            <Text style={{ color: colors.textMuted }} className="text-xs mt-1 text-center font-semibold px-6">
              We couldn't find any products matching "{query}". Try checking your spelling.
            </Text>
          </View>
        ) : (
          /* Results list */
          <FlatList
            data={results}
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
      </View>
    </SafeAreaView>
  );
}
