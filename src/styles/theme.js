/* @flow strict-local */
import { StyleSheet } from 'react-native';

import type { ThemeName } from '../types';
import navStyles from './navStyles';
import miscStyles from './miscStyles';

type ThemeColors = {|
  color: string,
  backgroundColor: string,
  borderColor: string,
  cardColor: string,
  dividerColor: string,
|};

export type AppStyles = $ReadOnly<{|
  ...$Call<typeof navStyles, ThemeColors>,
  ...$Call<typeof miscStyles, ThemeColors>,
|}>;

const themeColors: { [string]: ThemeColors } = {
  night: {
    color: '#d5d9dd',
    backgroundColor: '#212D3B',
    borderColor: 'rgba(127, 127, 127, 0.25)',
    cardColor: '#253547',
    // Dividers follow Material Design: opacity 12% black or 12% white.
    // See https://material.io/guidelines/components/dividers.html
    dividerColor: 'rgba(255, 255, 255, 0.12)',
  },
  light: {
    color: '#333',
    backgroundColor: 'white',
    borderColor: 'rgba(127, 127, 127, 0.25)',
    cardColor: '#F8F8F8',
    // Dividers follow Material Design: opacity 12% black or 12% white.
    // See https://material.io/guidelines/components/dividers.html
    dividerColor: 'rgba(0, 0, 0, 0.12)',
  },
};
themeColors.default = themeColors.light;

export const stylesFromTheme = (name: ThemeName) => {
  const colors = themeColors[name];
  return StyleSheet.create({
    ...navStyles(colors),
    ...miscStyles(colors),
  });
};
