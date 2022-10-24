/* @flow strict-local */
import type { ColorSchemeName } from 'react-native/Libraries/Utilities/NativeAppearance';
import type { ThemeSetting, ThemeName } from '../reduxTypes';

export const getThemeToUse = (theme: ThemeSetting, osScheme: ?ColorSchemeName): ThemeName =>
  // This is a no-op stub.  We'll give it more interesting behavior soon.
  theme;
