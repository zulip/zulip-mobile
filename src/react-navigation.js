/* @flow strict-local */

import { useNavigation as useNavigationInner } from '@react-navigation/native';

import type { GlobalParamList } from './nav/globalTypes';

/* eslint-disable flowtype/generic-spacing */

/**
 * Exactly like `useNavigation` upstream, but more typed.
 *
 * In particular, we use our `GlobalParamList` type.
 */
export function useNavigation() {
  return useNavigationInner<GlobalParamList>();
}
