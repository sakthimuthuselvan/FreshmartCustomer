import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    FlatList,
    ScrollView,
    Dimensions
} from 'react-native';
import BannerBackground, { getBannerColors } from './BannerBackground';
import { getDevHostIp } from '../src/api/api';

const { width } = Dimensions.get('window');

export function resolveImageUrl(url) {
    if (!url || typeof url !== 'string' || !url.trim()) return '';
    const trimmed = url.trim();
    const hostIp = getDevHostIp();

    if (trimmed.startsWith('/uploads/')) {
        return `http://${hostIp}:3000${trimmed}`;
    }
    if (trimmed.includes('localhost:') || trimmed.includes('127.0.0.1:')) {
        return trimmed.replace(/localhost|127\.0\.0\.1/g, hostIp);
    }
    return trimmed;
}

export default function DynamicBannerSlot({ slot, navigation }) {
    if (!slot || !slot.isActive || !Array.isArray(slot.banners) || slot.banners.length === 0) {
        return null;
    }

    const { layoutStyle, banners } = slot;
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);

    // Expand items if any banner has internal cards (e.g. for multi-card promo blocks)
    const itemsToRender = [];
    banners.forEach((b, bIdx) => {
        if (Array.isArray(b.cards) && b.cards.length > 0) {
            b.cards.forEach((card, cIdx) => {
                itemsToRender.push({
                    ...card,
                    _id: card._id || card.id || `${b._id || bIdx}-card-${cIdx}`,
                    parentBannerId: b._id
                });
            });
        } else {
            itemsToRender.push(b);
        }
    });

    const activeList = itemsToRender.length > 0 ? itemsToRender : banners;

    // Auto-play for FULL_WIDTH carousel
    useEffect(() => {
        if (layoutStyle !== 'FULL_WIDTH' || activeList.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                const nextIdx = (prevIndex + 1) % activeList.length;
                flatListRef.current?.scrollToIndex({ index: nextIdx, animated: true });
                return nextIdx;
            });
        }, 4000);

        return () => clearInterval(timer);
    }, [layoutStyle, activeList.length]);

    const handleBannerPress = (banner) => {
        if (!banner) return;

        if (banner.targetType === 'CATEGORY' && banner.targetCategoryId) {
            const catId = banner.targetCategoryId._id || banner.targetCategoryId;
            const catName = banner.targetCategoryId.name || 'Category';
            navigation?.navigate('ProductListing', { categoryId: catId, categoryName: catName });
        } else if (banner.targetType === 'PRODUCT' && banner.targetProductId) {
            const product = banner.targetProductId;
            if (product && typeof product === 'object') {
                navigation?.navigate('ProductDetails', { product });
            }
        }
    };

    // 1. FULL_WIDTH HORIZONTAL SCROLLABLE CAROUSEL
    if (layoutStyle === 'FULL_WIDTH') {
        const cardWidth = width - 40;
        const cardHeight = Math.round(cardWidth * 0.5); // 2:1 Aspect Ratio (matches 1200x600 recommended size)

        return (
            <View className="py-3 relative">
                <FlatList
                    ref={flatListRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={activeList}
                    keyExtractor={(item, index) => item._id || `full-banner-${index}`}
                    snapToInterval={width - 30}
                    decelerationRate="fast"
                    snapToAlignment="start"
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                    onMomentumScrollEnd={(e) => {
                        const newIdx = Math.round(e.nativeEvent.contentOffset.x / (width - 30));
                        if (newIdx >= 0 && newIdx < activeList.length) {
                            setCurrentIndex(newIdx);
                        }
                    }}
                    renderItem={({ item, index }) => {
                        const { startColor, textColor } = getBannerColors(item);
                        const isImage = item.designType === 'IMAGE' && item.imageUrl;
                        const resolvedUri = isImage ? resolveImageUrl(item.imageUrl) : '';

                        return (
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => handleBannerPress(item)}
                                style={{
                                    width: cardWidth,
                                    height: cardHeight,
                                    backgroundColor: startColor,
                                    marginRight: 10
                                }}
                                className="rounded-2xl relative overflow-hidden shadow-lg"
                            >
                                {isImage && resolvedUri ? (
                                    <Image
                                        source={{ uri: resolvedUri }}
                                        style={{ width: '100%', height: '100%' }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <>
                                        <BannerBackground item={item} id={`full-${item._id || index}`} />
                                        <View className="flex-1 p-5 flex-row justify-between items-center z-10">
                                            <View className="max-w-[70%] space-y-1">
                                                {item.badgeText ? (
                                                    <View className="bg-white/20 border border-white/30 rounded-full px-2.5 py-0.5 self-start">
                                                        <Text
                                                            style={{ color: textColor }}
                                                            className="text-[9px] font-extrabold uppercase tracking-wider"
                                                        >
                                                            {item.badgeText}
                                                        </Text>
                                                    </View>
                                                ) : null}
                                                <Text
                                                    style={{ color: textColor }}
                                                    className="text-base font-black leading-tight"
                                                    numberOfLines={2}
                                                >
                                                    {item.title}
                                                </Text>
                                                {item.subtitle ? (
                                                    <Text
                                                        style={{ color: textColor, opacity: 0.9 }}
                                                        className="text-[10px] font-bold"
                                                        numberOfLines={1}
                                                    >
                                                        {item.subtitle}
                                                    </Text>
                                                ) : null}
                                            </View>
                                        </View>
                                    </>
                                )}
                            </TouchableOpacity>
                        );
                    }}
                />

                {/* Pagination Indicators */}
                {activeList.length > 1 && (
                    <View className="flex-row justify-center items-center mt-2.5 gap-1.5">
                        {activeList.map((_, index) => (
                            <View
                                key={index}
                                style={{
                                    backgroundColor: currentIndex === index ? '#10b981' : '#cbd5e1',
                                    width: currentIndex === index ? 16 : 6,
                                    height: 6,
                                    borderRadius: 3
                                }}
                            />
                        ))}
                    </View>
                )}
            </View>
        );
    }

    // 2. HALF_SPLIT (2-COLUMN HORIZONTAL SCROLLABLE HALF CARDS)
    if (layoutStyle === 'HALF_SPLIT') {
        const halfWidth = Math.floor((width - 52) / 2);

        return (
            <View className="py-3">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                    {activeList.map((item, index) => {
                        const { startColor, textColor } = getBannerColors(item);
                        const isImage = item.designType === 'IMAGE' && item.imageUrl;
                        const resolvedUri = isImage ? resolveImageUrl(item.imageUrl) : '';

                        return (
                            <TouchableOpacity
                                key={item._id || `half-banner-${index}`}
                                activeOpacity={0.9}
                                onPress={() => handleBannerPress(item)}
                                style={{
                                    width: halfWidth,
                                    height: halfWidth, // 1:1 Aspect Ratio Square (matches 600x600 recommended size)
                                    backgroundColor: startColor,
                                    marginRight: index === activeList.length - 1 ? 0 : 12
                                }}
                                className={`rounded-2xl relative overflow-hidden shadow-md ${isImage ? '' : 'p-4 justify-between'}`}
                            >
                                {isImage && resolvedUri ? (
                                    <Image
                                        source={{ uri: resolvedUri }}
                                        style={{ width: '100%', height: '100%' }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <>
                                        <BannerBackground item={item} id={`half-${item._id || index}`} />
                                        <View className="flex-1 justify-between z-10">
                                            {item.badgeText ? (
                                                <View className="bg-white/20 rounded-full px-2.5 py-0.5 self-start">
                                                    <Text
                                                        style={{ color: textColor }}
                                                        className="text-[8px] font-extrabold uppercase tracking-wider"
                                                    >
                                                        {item.badgeText}
                                                    </Text>
                                                </View>
                                            ) : <View />}

                                            <View className="space-y-0.5">
                                                <Text
                                                    style={{ color: textColor }}
                                                    className="text-xs font-black leading-tight"
                                                    numberOfLines={2}
                                                >
                                                    {item.title}
                                                </Text>
                                                {item.subtitle ? (
                                                    <Text
                                                        style={{ color: textColor, opacity: 0.85 }}
                                                        className="text-[9px] font-bold"
                                                        numberOfLines={1}
                                                    >
                                                        {item.subtitle}
                                                    </Text>
                                                ) : null}
                                            </View>
                                        </View>
                                    </>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        );
    }

    // 3. COMPACT_STRIP (HORIZONTAL SCROLLABLE STRIP)
    return (
        <View className="py-3">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
            >
                {activeList.map((item, index) => {
                    const { startColor, textColor } = getBannerColors(item);
                    const isImage = item.designType === 'IMAGE' && item.imageUrl;
                    const resolvedUri = isImage ? resolveImageUrl(item.imageUrl) : '';

                    return (
                        <TouchableOpacity
                            key={item._id || `strip-banner-${index}`}
                            activeOpacity={0.9}
                            onPress={() => handleBannerPress(item)}
                            style={{
                                width: width - 40,
                                backgroundColor: startColor,
                                marginRight: index === activeList.length - 1 ? 0 : 12
                            }}
                            className={`rounded-2xl relative overflow-hidden shadow-sm h-24 ${isImage ? '' : 'p-4 flex-row items-center justify-between'}`}
                        >
                            {isImage && resolvedUri ? (
                                <Image
                                    source={{ uri: resolvedUri }}
                                    style={{ width: '100%', height: '100%' }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            ) : (
                                <>
                                    <BannerBackground item={item} id={`strip-${item._id || index}`} />
                                    <View className="flex-1 pr-3 z-10">
                                        {item.badgeText ? (
                                            <Text
                                                style={{ color: textColor, opacity: 0.85 }}
                                                className="text-[9px] font-black uppercase tracking-wider"
                                            >
                                                {item.badgeText}
                                            </Text>
                                        ) : null}
                                        <Text
                                            style={{ color: textColor }}
                                            className="text-sm font-black leading-tight mt-0.5"
                                            numberOfLines={1}
                                        >
                                            {item.title}
                                        </Text>
                                        {item.subtitle ? (
                                            <Text
                                                style={{ color: textColor, opacity: 0.9 }}
                                                className="text-[10px] font-medium mt-0.5"
                                                numberOfLines={1}
                                            >
                                                {item.subtitle}
                                            </Text>
                                        ) : null}
                                    </View>
                                </>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}
