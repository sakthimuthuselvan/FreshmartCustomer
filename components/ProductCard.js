import React from 'react';
import { View, TouchableOpacity, Image, Dimensions } from 'react-native';
import Text from './AppText';
import { Plus, Minus, ShoppingBag } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ProductCard({
  product,
  cartItem,
  onPress,
  onAddToCart,
  onRemoveFromCart,
  cardWidth,
  colors
}) {
  if (!product) return null;

  // 3 Columns default width matching user mockup (Screen width - horizontal padding - gaps) / 3
  const defaultWidth = (width - 40 - 16) / 3;
  const finalCardWidth = cardWidth || defaultWidth;

  const isOutOfStock = product.stock !== undefined ? product.stock <= 0 : (product.isAvailable === false || product.isActive === false);
  const isLowStock = !isOutOfStock && product.stock !== undefined && product.stock > 0 && product.stock <= 5;
  const price = product.sellingPrice || product.price;
  const mrp = product.mrp || Math.floor(price * 1.25);
  const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 20;

  return (
    <View
      style={{
        width: finalCardWidth,
        borderColor: '#e2e8f0',
        backgroundColor: isOutOfStock ? '#f8fafc' : '#ffffff'
      }}
      className={`border rounded-2xl p-2 mb-3 flex-col justify-between relative overflow-hidden ${
        isOutOfStock ? 'opacity-75' : ''
      }`}
    >
      {/* Top Part: Discount Tag & Product Image */}
      <View>
        {/* Status Badge Tag */}
        {isOutOfStock ? (
          <View className="absolute top-1 left-1 z-10 bg-slate-800 rounded px-1.5 py-0.5">
            <Text className="text-[7px] text-white font-extrabold uppercase">SOLD OUT</Text>
          </View>
        ) : isLowStock ? (
          <View className="absolute top-1 left-1 z-10 bg-amber-500 rounded px-1.5 py-0.5">
            <Text className="text-[7px] text-white font-extrabold uppercase">ONLY {product.stock}</Text>
          </View>
        ) : (
          <View className="absolute top-1 left-1 z-10 bg-red-500 rounded px-1.5 py-0.5">
            <Text className="text-[7px] text-white font-extrabold">{discountPercent}% OFF</Text>
          </View>
        )}

        {/* Product Image Stage */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={onPress}
          className="w-full bg-white items-center justify-center pt-3 pb-1"
        >
          {product.image ? (
            <Image
              source={{ uri: product.image }}
              style={{ width: '100%', height: 75, opacity: isOutOfStock ? 0.4 : 1 }}
              resizeMode="contain"
            />
          ) : (
            <View className="w-full h-16 bg-slate-50 items-center justify-center rounded-xl">
              <ShoppingBag size={20} color="#94a3b8" />
            </View>
          )}
        </TouchableOpacity>

        {/* Name & Unit Subtitle */}
        <TouchableOpacity activeOpacity={0.88} onPress={onPress} className="mt-1">
          <Text
            className="text-[11px] font-bold text-slate-900 leading-snug"
            numberOfLines={2}
          >
            {product.name}
          </Text>

          <Text className="text-[9px] text-slate-400 font-semibold mt-0.5">
            {product.unit || 'kg'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Part: Price & Circular Green Plus Button */}
      <View className="flex-row items-end justify-between mt-2 pt-1 border-t border-slate-50">
        {/* Price Column */}
        <View className="flex-1 mr-0.5">
          <Text className="text-xs font-black text-slate-900">
            ₹{price}
          </Text>
          {mrp > price ? (
            <Text className="text-[9px] font-medium text-slate-400 line-through">
              ₹{mrp}
            </Text>
          ) : null}
        </View>

        {/* Circular Vibrant Green Action Button */}
        {isOutOfStock ? (
          <View className="bg-slate-100 rounded-md px-1 py-0.5 items-center justify-center">
            <Text className="text-slate-400 text-[7px] font-bold uppercase">OUT</Text>
          </View>
        ) : cartItem ? (
          <View className="flex-row items-center bg-[#00c853] rounded-full px-1.5 h-8 justify-center gap-1 shadow-xs">
            <TouchableOpacity
              onPress={onRemoveFromCart}
              className="p-1"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Minus size={11} color="white" className="stroke-[3]" />
            </TouchableOpacity>
            <Text className="text-white text-[11px] font-extrabold">{cartItem.quantity}</Text>
            <TouchableOpacity
              onPress={onAddToCart}
              disabled={product.stock !== undefined && product.stock !== null && cartItem.quantity >= product.stock}
              className="p-1"
              style={{ opacity: (product.stock !== undefined && product.stock !== null && cartItem.quantity >= product.stock) ? 0.35 : 1 }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Plus size={11} color="white" className="stroke-[3]" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={onAddToCart}
            activeOpacity={0.8}
            className="w-8 h-8 rounded-full bg-[#00c853] items-center justify-center shadow-xs"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Plus size={18} color="white" className="stroke-[3]" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
