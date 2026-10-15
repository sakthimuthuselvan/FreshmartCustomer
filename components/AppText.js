import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { cssInterop } from 'nativewind';
import { DEFAULT_THEME } from '../src/constants/theme';

function BaseText(props) {
  const { style, children, ...rest } = props;

  const flatStyle = StyleSheet.flatten(style) || {};

  let targetFontFamily = flatStyle.fontFamily;

  if (!targetFontFamily || targetFontFamily === 'System' || targetFontFamily === 'sans-serif' || targetFontFamily === 'Montserrat') {
    const fw = String(flatStyle.fontWeight || '').toLowerCase();
    if (
      fw === 'bold' ||
      fw === '700' ||
      fw === '800' ||
      fw === '900' ||
      fw === 'black' ||
      fw === 'extrabold'
    ) {
      targetFontFamily = DEFAULT_THEME.fontBold || 'Montserrat-Bold';
    } else if (fw === '600' || fw === 'semibold') {
      targetFontFamily = DEFAULT_THEME.fontSemiBold || 'Montserrat-SemiBold';
    } else if (fw === '500' || fw === 'medium') {
      targetFontFamily = DEFAULT_THEME.fontMedium || 'Montserrat-Medium';
    } else {
      targetFontFamily = DEFAULT_THEME.fontMain || 'Montserrat-Regular';
    }
  }

  // Remove numerical/string fontWeight on Android to prevent system Roboto fallback when rendering custom TTF font family
  const { fontWeight, fontFamily: _dummyFontFamily, ...cleanedStyle } = flatStyle;

  return (
    <RNText style={[{ fontFamily: targetFontFamily }, cleanedStyle]} {...rest}>
      {children}
    </RNText>
  );
}

// Interop wrapper so NativeWind v4 parses className props on AppText
export default cssInterop(BaseText, {
  className: 'style',
});
