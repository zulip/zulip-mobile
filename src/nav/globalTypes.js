/* @flow strict-local */

import type { AppNavigatorParamList } from './AppNavigator';
import type { SharingNavigatorParamList } from '../sharing/SharingScreen';
import type { MainTabsNavigatorParamList } from '../main/MainTabsScreen';

export type GlobalParamList = {|
  ...AppNavigatorParamList,
  ...SharingNavigatorParamList,
  ...MainTabsNavigatorParamList,
|};
