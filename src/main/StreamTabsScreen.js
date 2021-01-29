/* @flow strict-local */
import React from 'react';
import { Text } from 'react-native';
import { FormattedMessage } from 'react-intl';
import {
  createMaterialTopTabNavigator,
  type MaterialTopTabNavigationProp,
} from '@react-navigation/material-top-tabs';

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

export default function StreamTabsScreen(props: Props) {
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
            <Text style={[styles.tab, { color }]}>
              <FormattedMessage id="Subscribed" defaultMessage="Subscribed" />
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="allStreams"
        component={StreamListCard}
        options={{
          tabBarLabel: ({ color }) => (
            <Text style={[styles.tab, { color }]}>
              <FormattedMessage id="All streams" defaultMessage="All streams" />
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
