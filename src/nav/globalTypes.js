/* @flow strict-local */

import type { RootStackNavigatorParamList } from './RootStackScreen';
import type { MainStackNavigatorParamList } from './MainStackScreen';
import type { SharingNavigatorParamList } from '../sharing/SharingScreen';
import type { StreamTabsNavigatorParamList } from '../main/StreamTabsScreen';
import type { MainTabsNavigatorParamList } from '../main/MainTabsScreen';

export type GlobalParamList = {|
  ...RootStackNavigatorParamList,
  ...MainStackNavigatorParamList,
  ...SharingNavigatorParamList,
  ...StreamTabsNavigatorParamList,
  ...MainTabsNavigatorParamList,
|};
