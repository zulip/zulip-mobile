/* @flow strict-local */
import Color from 'color';
import type { ColorValue } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

export const foregroundColorFromBackground = (color: ColorValue): 'black' | 'white' =>
  Color(color).luminosity() > 0.4 ? 'black' : 'white';

export const colorHashFromString = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = hash * 31 + name.charCodeAt(i);
    hash %= 0x1000000;
  }

  return `#${hash.toString(16).padStart(6, '0')}`;
};
