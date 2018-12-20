/* @flow strict-local */
import composeBoxStyles from './composeBoxStyles';
import { statics as miscStyles } from './miscStyles';
import { statics as navStyles } from './navStyles';
import utilityStyles from './utilityStyles';

export * from './constants';

export default {
  ...composeBoxStyles,
  ...miscStyles,
  ...navStyles,
  ...utilityStyles,
};
