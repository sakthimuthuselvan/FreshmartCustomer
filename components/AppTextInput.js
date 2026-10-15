import React from 'react';
import { TextInput as RNTextInput, StyleSheet } from 'react-native';
import { cssInterop } from 'nativewind';
import { DEFAULT_THEME } from '../src/constants/theme';

function BaseTextInput(props) {
  const { style, ...rest } = props;

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

  const { fontWeight, fontFamily: _dummyFontFamily, ...cleanedStyle } = flatStyle;

  return (
    <RNTextInput style={[{ fontFamily: targetFontFamily }, cleanedStyle]} {...rest} />
  );
}

export default cssInterop(BaseTextInput, {
  className: 'style',
});
