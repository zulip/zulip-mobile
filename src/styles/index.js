/* @flow strict-local */
import { StyleSheet } from 'react-native';

import composeBoxStyles from './composeBoxStyles';
import { statics as miscStyles } from './miscStyles';
import { statics as navStyles } from './navStyles';
import utilityStyles from './utilityStyles';

export * from './constants';
export type { ThemeData } from './theme';
export { ThemeContext } from './theme';

export default StyleSheet.create({
  ...composeBoxStyles,
  ...miscStyles,
  ...navStyles,
  ...utilityStyles,
});
