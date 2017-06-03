import { StyleSheet } from 'react-native';

import theme from './theme';
// import themeDark from './themeDark';
import themeLight from './themeLight';

export {
  CONTROL_SIZE,
  STATUSBAR_HEIGHT,
  NAVBAR_HEIGHT,
  REACTION_HEIGHT,
  REACTION_SPINNER_OFFSET
} from './platform';

export const BRAND_COLOR = 'rgba(82, 194, 175, 1)';
export const BORDER_COLOR = BRAND_COLOR;
export const HIGHLIGHT_COLOR = 'rgba(86, 164, 174, 0.5)';
export const HALF_COLOR = 'rgba(127, 127, 127, 0.5)';
export const QUARTER_COLOR = 'rgba(127, 127, 127, 0.25)';

export default StyleSheet.create(theme(themeLight));
