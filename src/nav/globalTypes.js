/* @flow strict-local */

import type { AppNavigatorParamList } from './AppNavigator';
import type { SharingNavigatorParamList } from '../sharing/SharingScreen';
import type { StreamTabsNavigatorParamList } from '../main/StreamTabsScreen';
import type { MainTabsNavigatorParamList } from '../main/MainTabsScreen';
import type { HomeDrawerNavigatorParamList } from '../main/home/HomeDrawerNavigator';

export type GlobalParamList = {|
  ...AppNavigatorParamList,
  ...SharingNavigatorParamList,
  ...StreamTabsNavigatorParamList,
  ...MainTabsNavigatorParamList,
  ...HomeDrawerNavigatorParamList,
|};
