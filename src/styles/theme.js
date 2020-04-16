/* @flow strict-local */
import React from 'react';
import type { Context } from 'react';

export type ThemeColors = {|
  color: string,
  backgroundColor: string,
  cardColor: string,
  dividerColor: string,
|};

export const themeColors: { [string]: ThemeColors } = {
  night: {
    color: 'hsl(210, 11%, 85%)',
    backgroundColor: 'hsl(212, 28%, 18%)',
    cardColor: 'hsl(212, 31%, 21%)',
    // Dividers follow Material Design: opacity 12% black or 12% white.
    // See https://material.io/guidelines/components/dividers.html
    dividerColor: 'hsla(0, 0%, 100%, 0.12)',
  },
  light: {
    color: 'hsl(0, 0%, 20%)',
    backgroundColor: 'white',
    cardColor: 'hsl(0, 0%, 97%)',
    // Dividers follow Material Design: opacity 12% black or 12% white.
    // See https://material.io/guidelines/components/dividers.html
    dividerColor: 'hsla(0, 0%, 0%, 0.12)',
  },
};
themeColors.default = themeColors.light;

export const ThemeContext: Context<ThemeColors> = React.createContext(themeColors.default);
