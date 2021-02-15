/* @flow strict-local */

import type { MainStackNavigatorParamList } from './MainStackScreen';
import type { SharingNavigatorParamList } from '../sharing/SharingScreen';
import type { StreamTabsNavigatorParamList } from '../main/StreamTabsScreen';
import type { MainTabsNavigatorParamList } from '../main/MainTabsScreen';

export type GlobalParamList = {|
  ...MainStackNavigatorParamList,
  ...SharingNavigatorParamList,
  ...StreamTabsNavigatorParamList,
  ...MainTabsNavigatorParamList,
|};
