/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import {
  createMaterialTopTabNavigator,
  type MaterialTopTabNavigationProp,
} from '@react-navigation/material-top-tabs';

import { ZulipTextIntl } from '../common';
import { createStyleSheet } from '../styles';
import type { RouteProp, RouteParamsOf } from '../react-navigation';
import type { MainTabsNavigationProp } from './MainTabsScreen';
import type { GlobalParamList } from '../nav/globalTypes';
import { materialTopTabNavigatorConfig } from '../styles/tabs';
import SubscriptionsCard from '../streams/SubscriptionsCard';
import StreamListCard from '../subscriptions/StreamListCard';

export type StreamTabsNavigatorParamList = {|
  subscribed: RouteParamsOf<typeof SubscriptionsCard>,
  allStreams: RouteParamsOf<typeof StreamListCard>,
|};

export type StreamTabsNavigationProp<
  +RouteName: $Keys<StreamTabsNavigatorParamList> = $Keys<StreamTabsNavigatorParamList>,
> = MaterialTopTabNavigationProp<GlobalParamList, RouteName>;

const Tab = createMaterialTopTabNavigator<
  GlobalParamList,
  StreamTabsNavigatorParamList,
  StreamTabsNavigationProp<>,
>();

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
    <Tab.Navigator
      {...materialTopTabNavigatorConfig({
        showLabel: true,
        showIcon: false,
      })}
      swipeEnabled
    >
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
