import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Share,
  useWindowDimensions,
  BackHandler
} from 'react-native';
import Text from '../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../src/context/ThemeContext';
import { useCart } from '../src/context/CartContext';
import { ChevronLeft, ShoppingBag, Plus, Minus, Star, Heart, Share2 } from 'lucide-react-native';
import RenderHtml from 'react-native-render-html';

export default function ProductDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { cart, addToCart, removeFromCart } = useCart();

  const { product } = route.params || { product: null };
  const { width } = useWindowDimensions();

  const [selectedWeight, setSelectedWeight] = useState('1 kg');
  const [favorite, setFavorite] = useState(false);

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  useEffect(() => {
    const backAction = () => {
      handleBackPress();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text style={{ color: colors.textMuted }} className="text-xs">No product parameters loaded.</Text>
      </SafeAreaView>
    );
  }

  const cartItem = cart.find(c => c.product._id === product._id);
  const quantity = cartItem?.quantity || 0;
  const isOutOfStock = product.stock !== undefined ? product.stock <= 0 : (product.isAvailable === false || product.isActive === false);
  const isLowStock = !isOutOfStock && product.stock !== undefined && product.stock > 0 && product.stock <= 5;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this fresh ${product.name} on FreshDay Grocery! Only ₹${product.price}.`,
      });
    } catch (error) {
      console.log('Error sharing:', error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

      {/* Header bar (Mockup 08) */}
      <View
        style={{ borderBottomColor: colors.border }}
        className="px-5 py-4 border-b flex-row items-center justify-between bg-white"
      >
        <TouchableOpacity
          onPress={handleBackPress}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          className="p-1 rounded-full hover:bg-slate-100"
        >
          <ChevronLeft size={24} color={colors.textMain} />
        </TouchableOpacity>

        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={handleShare}>
            <Share2 size={22} color={colors.textMain} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFavorite(!favorite)}>
            <Heart size={22} color={favorite ? '#ef4444' : colors.textMain} fill={favorite ? '#ef4444' : 'transparent'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Large Product Image container with Status Badge */}
        <View className="bg-slate-50 items-center justify-center py-8 px-6 border-b border-slate-100 relative">
          {isOutOfStock ? (
            <View className="absolute top-4 left-4 bg-slate-800 rounded-lg px-3 py-1 z-10">
              <Text className="text-[10px] text-white font-black uppercase">OUT OF STOCK</Text>
            </View>
          ) : isLowStock ? (
            <View className="absolute top-4 left-4 bg-amber-500 rounded-lg px-3 py-1 z-10">
              <Text className="text-[10px] text-white font-black uppercase">ONLY {product.stock} LEFT IN STOCK</Text>
            </View>
          ) : (
            <View className="absolute top-4 left-4 bg-red-500 rounded-lg px-2.5 py-1">
              <Text className="text-[10px] text-white font-extrabold">20% OFF</Text>
            </View>
          )}

          {product.image ? (
            <Image
              source={{ uri: product.image }}
              style={{ opacity: isOutOfStock ? 0.35 : 1 }}
              className="w-64 h-64 bg-transparent"
              resizeMode="contain"
            />
          ) : (
            <View className="w-64 h-64 bg-slate-100 items-center justify-center rounded-2xl">
              <ShoppingBag size={48} color="#94a3b8" />
            </View>
          )}
        </View>

        <View className="p-6 space-y-6">
          {/* Info Header */}
          <View>
            <View className="flex-row items-center justify-between">
              <Text style={{ color: isOutOfStock ? colors.textMuted : colors.textMain }} className="text-2xl font-black flex-1 mr-2">{product.name}</Text>
              {isOutOfStock && (
                <View className="bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1">
                  <Text className="text-slate-400 text-xs font-black uppercase">UNAVAILABLE</Text>
                </View>
              )}
            </View>
            <View className="flex-row items-center justify-between mt-2">
              <Text style={{ color: colors.primary }} className="text-xs font-extrabold">Farm Fresh</Text>

              <View className="flex-row items-center gap-1.5">
                <Star size={16} color="#fbbf24" fill="#fbbf24" />
                <Text style={{ color: colors.textMain }} className="text-xs font-black">4.6</Text>
                <Text style={{ color: colors.textMuted }} className="text-xs font-semibold">(2.4k)</Text>
              </View>
            </View>
          </View>

          {/* Price Tag & Savings */}
          <View className="flex-row items-center justify-between border-t border-b border-slate-100 py-4">
            <View className="flex-row items-baseline gap-2">
              <Text style={{ color: colors.textMain }} className="text-3xl font-black">₹{product.price}</Text>
              <Text style={{ color: colors.textMuted }} className="text-sm font-semibold line-through">₹{Math.floor(product.price * 1.25)}</Text>
            </View>

            <View style={{ borderColor: colors.primary, backgroundColor: colors.primaryLight }} className="border rounded-xl px-3.5 py-1.5">
              <Text style={{ color: colors.primary }} className="text-xs font-black">You save ₹{Math.floor(product.price * 0.25)}</Text>
            </View>
          </View>

          {/* Size/Weight Selector pills */}
          <View className="space-y-3">
            <Text style={{ color: colors.textMain }} className="text-xs font-black uppercase tracking-wider">Weight</Text>
            <View className="flex-row gap-3">
              {['500 g', '1 kg', '2 kg'].map((weight) => (
                <TouchableOpacity
                  key={weight}
                  onPress={() => setSelectedWeight(weight)}
                  style={{
                    backgroundColor: selectedWeight === weight ? colors.primaryLight : 'white',
                    borderColor: selectedWeight === weight ? colors.primary : colors.border
                  }}
                  className="px-5 py-2.5 rounded-xl border flex-row items-center justify-center min-w-[80px] shadow-sm"
                >
                  <Text
                    style={{ color: selectedWeight === weight ? colors.primary : colors.textMain }}
                    className="text-xs font-extrabold"
                  >
                    {weight}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Details & Description tab content */}
          <View className="space-y-3 pt-2">
            <Text style={{ color: colors.textMain }} className="text-xs font-black uppercase tracking-wider">Product Details</Text>
            {product.description && (product.description.startsWith('<') || product.description.includes('</')) ? (
              <RenderHtml
                contentWidth={width - 48}
                source={{ html: product.description }}
                baseStyle={{
                  color: colors.textMuted,
                  fontSize: 12,
                  lineHeight: 18
                }}
              />
            ) : (
              <Text style={{ color: colors.textMuted }} className="text-xs font-semibold leading-relaxed">
                {product.description || 'Juicy, red tomatoes rich in vitamins and perfect for daily cooking.'}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom cart floating controllers */}
      <View
        style={{ borderTopColor: colors.border }}
        className="px-6 py-4 border-t bg-white flex-row items-center justify-between gap-4 shadow-lg shadow-black/5"
      >
        {isOutOfStock ? (
          <View className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-4 items-center justify-center">
            <Text className="text-slate-400 font-black text-base uppercase tracking-wider">CURRENTLY OUT OF STOCK</Text>
          </View>
        ) : (
          <>
            {/* Quantity controllers inside bordered box */}
            <View
              style={{ borderColor: colors.border }}
              className="flex-row items-center border-2 rounded-2xl px-3.5 py-3 w-[38%] justify-between"
            >
              <TouchableOpacity
                onPress={() => removeFromCart(product._id)}
                disabled={quantity === 0}
                className="p-1.5 rounded-full hover:bg-slate-100"
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <Minus size={18} color={quantity > 0 ? colors.textMain : '#cbd5e1'} />
              </TouchableOpacity>
              <Text style={{ color: colors.textMain }} className="text-sm font-black">{quantity}</Text>
              <TouchableOpacity
                onPress={() => addToCart(product)}
                disabled={product.stock !== undefined && product.stock !== null && quantity >= product.stock}
                className="p-1.5 rounded-full hover:bg-slate-100"
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <Plus
                  size={18}
                  color={
                    product.stock !== undefined && product.stock !== null && quantity >= product.stock
                      ? '#cbd5e1'
                      : colors.textMain
                  }
                />
              </TouchableOpacity>
            </View>

            {/* Action button */}
            <TouchableOpacity
              onPress={() => addToCart(product)}
              disabled={product.stock !== undefined && product.stock !== null && quantity >= product.stock}
              style={{
                backgroundColor:
                  product.stock !== undefined && product.stock !== null && quantity >= product.stock
                    ? '#94a3b8'
                    : colors.primary
              }}
              className="rounded-2xl flex-1 py-5 items-center justify-center shadow-md shadow-emerald-700/20"
            >
              <Text className="text-white font-extrabold text-base">
                {product.stock !== undefined && product.stock !== null && quantity >= product.stock
                  ? `Max Stock Reached (${quantity})`
                  : quantity > 0
                  ? `In Cart (₹${product.price * quantity})`
                  : `Add to Cart • ₹${product.price}`}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
