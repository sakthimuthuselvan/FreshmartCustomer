import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

/**
 * Extracts start color, end color, and text color from banner / card metadata.
 * Supports CSS gradients like "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)"
 * as well as hex / rgb solid colors.
 */
export function getBannerColors(item) {
    if (!item) {
        return {
            startColor: '#059669',
            endColor: '#10b981',
            textColor: '#ffffff',
            isGradient: true
        };
    }

    const textColor = item.textColor || '#ffffff';
    let startColor = item.backgroundColor || null;
    let endColor = item.backgroundColor || null;
    let isGradient = false;

    if (item.gradient && typeof item.gradient === 'string' && item.gradient.trim() !== '') {
        // Extract all hex colors and rgb/rgba values from the CSS gradient string
        const colorMatches = item.gradient.match(/#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b|rgba?\([^)]+\)/g);
        if (colorMatches && colorMatches.length >= 2) {
            startColor = colorMatches[0];
            endColor = colorMatches[1];
            isGradient = true;
        } else if (colorMatches && colorMatches.length === 1) {
            startColor = colorMatches[0];
            endColor = colorMatches[0];
        }
    }

    // Fallbacks if missing
    if (!startColor) startColor = '#059669';
    if (!endColor) endColor = isGradient ? '#10b981' : startColor;

    return { startColor, endColor, textColor, isGradient };
}

/**
 * BannerBackground component
 * Renders a crisp native vector SVG gradient or solid background inside any banner container.
 */
export default function BannerBackground({ item, id = 'bg' }) {
    const { startColor, endColor, isGradient } = getBannerColors(item);
    const safeId = `grad-${String(id).replace(/[^a-zA-Z0-9]/g, '_')}-${startColor.replace(/[^a-zA-Z0-9]/g, '')}`;

    if (isGradient && startColor !== endColor) {
        return (
            <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                <Svg height="100%" width="100%">
                    <Defs>
                        <LinearGradient id={safeId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor={startColor} stopOpacity="1" />
                            <Stop offset="100%" stopColor={endColor} stopOpacity="1" />
                        </LinearGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${safeId})`} />
                </Svg>
            </View>
        );
    }

    return (
        <View
            style={[StyleSheet.absoluteFillObject, { backgroundColor: startColor }]}
            pointerEvents="none"
        />
    );
}
