/* @flow strict-local */
import type { UtilityStyles } from './utilityStyles';
import type { ComposeBoxStyles } from './composeBoxStyles';
import type { NavStyles } from './navStyles';
import type { MiscStyles } from './miscStyles';
import utilityStyles from './utilityStyles';
import composeBoxStyles from './composeBoxStyles';
import navStyles from './navStyles';
import miscStyles from './miscStyles';

export type AppStyles = UtilityStyles & ComposeBoxStyles & NavStyles & MiscStyles;

type ThemeColors = {|
  color: string,
  backgroundColor: string,
  borderColor: string,
  cardColor: string,
  dividerColor: string,
|};

export const themeColors: { [string]: ThemeColors } = {
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

export default (props: ThemeColors) => ({
  ...utilityStyles,
  ...composeBoxStyles(props),
  ...navStyles(props),
  ...miscStyles(props),
});
