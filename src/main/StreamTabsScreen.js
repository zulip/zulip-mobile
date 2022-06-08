/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import {
  createMaterialTopTabNavigator,
  type MaterialTopTabNavigationProp,
} from '@react-navigation/material-top-tabs';

import ZulipTextIntl from '../common/ZulipTextIntl';
import { createStyleSheet } from '../styles';
import type { RouteProp, RouteParamsOf } from '../react-navigation';
import type { MainTabsNavigationProp } from './MainTabsScreen';
import { materialTopTabNavigatorConfig } from '../styles/tabs';
import SubscriptionsCard from '../streams/SubscriptionsCard';
import StreamListCard from '../subscriptions/StreamListCard';
import type { AppNavigationMethods } from '../nav/AppNavigator';

export type StreamTabsNavigatorParamList = {|
  +subscribed: RouteParamsOf<typeof SubscriptionsCard>,
  +allStreams: RouteParamsOf<typeof StreamListCard>,
|};

export type StreamTabsNavigationProp<
  +RouteName: $Keys<StreamTabsNavigatorParamList> = $Keys<StreamTabsNavigatorParamList>,
> =
  // Screens on this navigator will get a `navigation` prop that reflects
  // this navigator itself…
  MaterialTopTabNavigationProp<StreamTabsNavigatorParamList, RouteName> &
    // … plus the methods it gets from its parent navigator.
    AppNavigationMethods;

const Tab = createMaterialTopTabNavigator<StreamTabsNavigatorParamList>();

const styles = createStyleSheet({
  tab: {
    padding: 8,
    fontSize: 16,
  },
});

type Props = $ReadOnly<{|
  navigation: MainTabsNavigationProp<'stream-tabs'>,
  route: RouteProp<'stream-tabs', void>,
|}>;

export default function StreamTabsScreen(props: Props): Node {
  return (
    <Tab.Navigator {...materialTopTabNavigatorConfig()} swipeEnabled>
      <Tab.Screen
        name="subscribed"
        component={SubscriptionsCard}
        options={{
          tabBarLabel: ({ color }) => (
            <ZulipTextIntl style={[styles.tab, { color }]} text="Subscribed" />
          ),
        }}
      />
      <Tab.Screen
        name="allStreams"
        component={StreamListCard}
        options={{
          tabBarLabel: ({ color }) => (
            <ZulipTextIntl style={[styles.tab, { color }]} text="All streams" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
