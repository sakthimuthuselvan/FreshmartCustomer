import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    Dimensions
} from 'react-native';
import DynamicBannerSlot, { resolveImageUrl } from './DynamicBannerSlot';
import ProductCard from './ProductCard';
import BannerBackground, { getBannerColors } from './BannerBackground';

const { width } = Dimensions.get('window');

export default function DynamicFeedSection({ section, navigation, cart, addToCart, removeFromCart, colors }) {
    if (!section || !section.isActive) return null;

    const {
        sectionType,
        title,
        subtitle,
        productSettings,
        bannerSettings,
        bannersData,
        productsData,
        categoriesData,
        spacerSettings,
        categoryGridSettings
    } = section;

    const handleCategoryPress = (cat) => {
        if (!cat) return;
        navigation?.navigate('ProductListing', { categoryId: cat._id, categoryName: cat.name });
    };

    const handleProductPress = (product) => {
        if (!product) return;
        navigation?.navigate('ProductDetails', { product });
    };

    // 1. HERO SLIDER SECTION
    if (sectionType === 'HERO_SLIDER') {
        const dummySlot = {
            isActive: true,
            layoutStyle: 'FULL_WIDTH',
            banners: bannersData || []
        };
        return <DynamicBannerSlot slot={dummySlot} navigation={navigation} />;
    }

    // 2. CATEGORY GRID SECTION
    if (sectionType === 'CATEGORY_GRID') {
        const catList = Array.isArray(categoriesData) ? categoriesData : [];
        if (catList.length === 0) return null;

        const cols = categoryGridSettings?.columns || 4;
        const limit = categoryGridSettings?.limit || 8;
        const displayCats = catList.slice(0, limit);
        const cardW = Math.round((width - 32 - ((cols - 1) * 8)) / cols);

        return (
            <View className="py-3">
                <View className="px-5 flex-row items-center justify-between mb-3">
                    <View>
                        <Text style={{ color: colors?.textMain || '#0f172a' }} className="text-base font-black tracking-tight">
                            {title || 'Shop by Category'}
                        </Text>
                        {subtitle ? (
                            <Text style={{ color: colors?.textMuted || '#64748b' }} className="text-[10px] font-bold mt-0.5">
                                {subtitle}
                            </Text>
                        ) : null}
                    </View>
                    {categoryGridSettings?.showViewAll !== false && (
                        <TouchableOpacity
                            onPress={() => navigation?.navigate('Categories')}
                            className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200"
                        >
                            <Text className="text-xs font-black text-emerald-600">See All →</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Dynamic Columns Grid */}
                <View className="px-4 flex-row flex-wrap justify-between">
                    {displayCats.map((cat, idx) => (
                        <TouchableOpacity
                            key={cat._id || `cat-${idx}`}
                            onPress={() => handleCategoryPress(cat)}
                            style={{ width: cardW }}
                            className="mb-3.5 items-center"
                            activeOpacity={0.85}
                        >
                            <View style={{ width: cardW, height: Math.round(cardW * 0.9) }} className="rounded-2xl overflow-hidden bg-slate-100 shadow-sm">
                                <Image source={{ uri: cat.image }} className="w-full h-full" resizeMode="cover" />
                            </View>
                            <Text style={{ color: colors?.textMain || '#0f172a' }} className="text-[10px] font-bold text-center tracking-tight leading-tight mt-1 px-0.5" numberOfLines={2}>
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    }

    // 3. AD CARD BLOCK SECTION
    if (sectionType === 'AD_CARD_BLOCK') {
        const dummySlot = {
            isActive: true,
            layoutStyle: bannerSettings?.cardType || 'FULL_WIDTH',
            banners: bannersData || []
        };
        return <DynamicBannerSlot slot={dummySlot} navigation={navigation} />;
    }

    // 4. TWO COLUMN PROMOTIONAL CARDS SECTION
    if (sectionType === 'TWO_COLUMN_PROMO') {
        const rawPromoBanners = Array.isArray(bannersData) ? bannersData : [];
        if (rawPromoBanners.length === 0) return null;

        // Flatten cards if banners contain internal cards array
        const promoBanners = [];
        rawPromoBanners.forEach(b => {
            if (Array.isArray(b?.cards) && b.cards.length > 0) {
                b.cards.forEach(c => promoBanners.push({ ...c, _id: c._id || c.id }));
            } else {
                promoBanners.push(b);
            }
        });

        if (promoBanners.length === 0) return null;

        return (
            <View className="py-2.5 px-4">
                {title ? (
                    <Text style={{ color: colors?.textMain || '#0f172a' }} className="text-sm font-black px-1 mb-2">
                        {title}
                    </Text>
                ) : null}
                <View className="flex-row justify-between">
                    {promoBanners.slice(0, 2).map((b, bi) => {
                        const halfW = Math.floor((width - 44) / 2);
                        const { startColor, textColor } = getBannerColors(b);
                        const isImage = b?.designType === 'IMAGE' && b?.imageUrl;
                        const resolvedUri = isImage ? resolveImageUrl(b.imageUrl) : '';

                        return (
                            <TouchableOpacity
                                key={b?._id || bi}
                                onPress={() => {
                                    if (b?.targetCategoryId) {
                                        const catId = b.targetCategoryId._id || b.targetCategoryId;
                                        navigation?.navigate('ProductListing', { categoryId: catId });
                                    } else if (b?.targetProductId) {
                                        const prod = b.targetProductId._id ? b.targetProductId : { _id: b.targetProductId };
                                        navigation?.navigate('ProductDetails', { product: prod });
                                    } else {
                                        navigation?.navigate('Categories');
                                    }
                                }}
                                style={{ width: halfW, height: halfW, backgroundColor: startColor }}
                                className={`rounded-2xl shadow-sm overflow-hidden relative ${isImage ? '' : 'p-3 justify-between'}`}
                                activeOpacity={0.9}
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
                                        <BannerBackground item={b} id={`two-col-${b?._id || bi}`} />
                                        <View className="flex-1 justify-between z-10">
                                            {b?.badgeText ? (
                                                <View className="bg-black/30 border border-white/20 px-2 py-0.5 rounded-full self-start">
                                                    <Text style={{ color: textColor }} className="text-[8px] font-black uppercase">
                                                        {b.badgeText}
                                                    </Text>
                                                </View>
                                            ) : <View />}
                                            <View>
                                                <Text
                                                    style={{ color: textColor }}
                                                    className="font-black text-xs leading-tight"
                                                    numberOfLines={2}
                                                >
                                                    {b?.title || 'Special Deal'}
                                                </Text>
                                                {b?.subtitle ? (
                                                    <Text
                                                        style={{ color: textColor, opacity: 0.9 }}
                                                        className="text-[9px] mt-0.5 font-medium"
                                                        numberOfLines={1}
                                                    >
                                                        {b.subtitle}
                                                    </Text>
                                                ) : null}
                                            </View>
                                        </View>
                                    </>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        );
    }

    // 5. PRODUCT SHELF / COLLECTION (GRID OR CAROUSEL)
    if (
        sectionType === 'PRODUCT_SHELF' ||
        sectionType === 'PRODUCT_COLLECTION' ||
        sectionType === 'PRODUCT_CAROUSEL' ||
        sectionType === 'TRENDING_PRODUCTS' ||
        sectionType === 'BEST_SELLERS' ||
        sectionType === 'NEW_ARRIVALS'
    ) {
        const prodList = Array.isArray(productsData) ? productsData : [];
        if (prodList.length === 0) return null;

        const limit = productSettings?.limit || 6;
        const displayProds = prodList.slice(0, limit);
        const isCarousel = sectionType === 'PRODUCT_CAROUSEL' || productSettings?.layoutType === 'CAROUSEL';
        const showSeeMore = productSettings?.showSeeMore !== false;

        return (
            <View className="py-3 px-5">
                <View className="flex-row items-center justify-between mb-3">
                    <View>
                        <Text style={{ color: colors?.textMain || '#0f172a' }} className="text-base font-black tracking-tight">
                            {title || 'Fresh Deals'}
                        </Text>
                        {subtitle ? (
                            <Text style={{ color: colors?.textMuted || '#64748b' }} className="text-[10px] font-bold mt-0.5">
                                {subtitle}
                            </Text>
                        ) : null}
                    </View>

                    {showSeeMore && (
                        <TouchableOpacity
                            onPress={() => {
                                if (productSettings?.categoryId) {
                                    navigation?.navigate('ProductListing', {
                                        categoryId: productSettings.categoryId,
                                        categoryName: title
                                    });
                                } else {
                                    navigation?.navigate('Categories');
                                }
                            }}
                            className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200"
                        >
                            <Text className="text-xs font-black text-emerald-600">See More →</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Mode A: Horizontal Carousel Shelf */}
                {isCarousel ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-1">
                        {displayProds.map((product) => {
                            const cartItem = cart?.find(c => c.product._id === product._id);
                            return (
                                <View key={product._id} className="mr-3">
                                    <ProductCard
                                        product={product}
                                        cartItem={cartItem}
                                        cardWidth={130}
                                        onPress={() => handleProductPress(product)}
                                        onAddToCart={() => addToCart(product)}
                                        onRemoveFromCart={() => removeFromCart(product._id)}
                                        colors={colors}
                                    />
                                </View>
                            );
                        })}
                    </ScrollView>
                ) : (
                    /* Mode B: 2-Column Product Grid */
                    <View className="flex-row flex-wrap justify-between">
                        {displayProds.map((product) => {
                            const cartItem = cart?.find(c => c.product._id === product._id);
                            return (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    cartItem={cartItem}
                                    onPress={() => handleProductPress(product)}
                                    onAddToCart={() => addToCart(product)}
                                    onRemoveFromCart={() => removeFromCart(product._id)}
                                    colors={colors}
                                />
                            );
                        })}
                    </View>
                )}
            </View>
        );
    }

    // 6. COMBO BANNER + MAPPED PRODUCTS BLOCK
    if (sectionType === 'COMBO_BANNER_PRODUCTS') {
        const dummySlot = {
            isActive: true,
            layoutStyle: 'FULL_WIDTH',
            banners: bannersData || []
        };
        const prodList = Array.isArray(productsData) ? productsData : [];
        const limit = productSettings?.limit || 4;
        const displayProds = prodList.slice(0, limit);
        const showSeeMore = productSettings?.showSeeMore !== false;

        return (
            <View className="py-3 space-y-3">
                <DynamicBannerSlot slot={dummySlot} navigation={navigation} />

                <View className="px-5">
                    <View className="flex-row items-center justify-between mb-2">
                        <Text style={{ color: colors?.textMain || '#0f172a' }} className="text-sm font-black">
                            {title || 'Mapped Offer Products'}
                        </Text>
                        {showSeeMore && (
                            <TouchableOpacity
                                onPress={() => navigation?.navigate('Categories')}
                                className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200"
                            >
                                <Text className="text-[10px] font-black text-emerald-600">See More →</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-1">
                        {displayProds.map((product) => {
                            const cartItem = cart?.find(c => c.product._id === product._id);
                            return (
                                <View key={product._id} className="mr-3">
                                    <ProductCard
                                        product={product}
                                        cartItem={cartItem}
                                        cardWidth={130}
                                        onPress={() => handleProductPress(product)}
                                        onAddToCart={() => addToCart(product)}
                                        onRemoveFromCart={() => removeFromCart(product._id)}
                                        colors={colors}
                                    />
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        );
    }

    // 7. BRAND / DEPARTMENT CAROUSEL
    if (sectionType === 'BRAND_CAROUSEL') {
        const catList = Array.isArray(categoriesData) ? categoriesData : [];
        if (catList.length === 0) return null;

        return (
            <View className="py-2.5 px-5">
                <Text style={{ color: colors?.textMain || '#0f172a' }} className="text-sm font-black mb-2.5">
                    {title || 'Popular Brands & Departments'}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {catList.map((cat, ci) => (
                        <TouchableOpacity
                            key={cat._id || ci}
                            onPress={() => handleCategoryPress(cat)}
                            className="mr-3 px-3.5 py-2 rounded-2xl bg-slate-100 flex-row items-center border border-slate-200 shadow-sm"
                            activeOpacity={0.8}
                        >
                            {cat.image ? (
                                <Image source={{ uri: cat.image }} className="w-5 h-5 rounded-full mr-2" resizeMode="cover" />
                            ) : null}
                            <Text style={{ color: colors?.textMain || '#0f172a' }} className="text-xs font-bold">
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    }

    // 8. SPACER
    if (sectionType === 'SPACER') {
        const gapHeight = Number(spacerSettings?.height) || 16;
        return <View style={{ height: gapHeight }} />;
    }

    return null;
}
