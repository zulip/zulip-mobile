/* @flow */
import type { Dimensions } from '../types';
import { INIT_SAFE_AREA_INSETS } from '../actionConstants';

export const initSafeAreaInsets = (safeAreaInsets: Dimensions) => ({
  type: INIT_SAFE_AREA_INSETS,
  ...safeAreaInsets,
});
