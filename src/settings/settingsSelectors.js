/* @flow strict-local */
import type { ColorSchemeName } from 'react-native/Libraries/Utilities/NativeAppearance';
import type { ThemeSetting, ThemeName } from '../reduxTypes';

export const getThemeToUse = (theme: ThemeSetting, osScheme: ?ColorSchemeName): ThemeName =>
  theme === 'default' ? 'light' : 'dark';
