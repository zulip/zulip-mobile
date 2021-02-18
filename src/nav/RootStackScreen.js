/* @flow strict-local */
import React from 'react';
import { createStackNavigator, type StackNavigationProp } from '@react-navigation/stack';

import type { RouteParamsOf } from '../react-navigation';
import type { GlobalParamList } from './globalTypes';
import MainStackScreen from './MainStackScreen';
import LightboxScreen from '../lightbox/LightboxScreen';

export type RootStackNavigatorParamList = {|
  'main-stack': RouteParamsOf<typeof MainStackScreen>,
  lightbox: RouteParamsOf<typeof LightboxScreen>,
|};

export type RootStackNavigationProp<
  +RouteName: $Keys<RootStackNavigatorParamList> = $Keys<RootStackNavigatorParamList>,
> = StackNavigationProp<GlobalParamList, RouteName>;

const Stack = createStackNavigator<
  GlobalParamList,
  RootStackNavigatorParamList,
  RootStackNavigationProp<>,
>();

type Props = $ReadOnly<{||}>;

export default function RootStackScreen(props: Props) {
  return (
    <Stack.Navigator headerMode="none" mode="modal">
      <Stack.Screen name="main-stack" component={MainStackScreen} />

      {/* Modal screens go here; see https://reactnavigation.org/docs/modal/. */}
      <Stack.Screen name="lightbox" component={LightboxScreen} />
    </Stack.Navigator>
  );
}
