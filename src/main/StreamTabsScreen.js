/* @flow strict-local */
import React from 'react';
import { View } from 'react-native';
import {
  createMaterialTopTabNavigator,
  type MaterialTopTabNavigationProp,
} from '@react-navigation/material-top-tabs';

import { Label, LoadingBanner } from '../common';
import { createStyleSheet, LOADING_BAR_THICKNESS, NAVBAR_SIZE } from '../styles';
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
  container: {
    flex: 1,
  },
});

type Props = $ReadOnly<{|
  navigation: MainTabsNavigationProp<'stream-tabs'>,
  route: RouteProp<'stream-tabs', void>,
|}>;

/**
 * It is assumed that height of `Tab.Navigator` is equal to `NAVBAR_SIZE`
 * and accordingly `LoadingBar` is being adjusted at bottom of `Tab.Navigator`.
 * `LOADING_BAR_THICKNESS` is used to place LoadingBar exactly at the height of
 * `NAVBAR_SIZE` from top.
 */
export default function StreamTabsScreen(props: Props) {
  return (
    <View style={styles.container}>
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
            tabBarLabel: ({ color }) => <Label style={[styles.tab, { color }]} text="Subscribed" />,
          }}
        />
        <Tab.Screen
          name="allStreams"
          component={StreamListCard}
          options={{
            tabBarLabel: ({ color }) => (
              <Label style={[styles.tab, { color }]} text="All streams" />
            ),
          }}
        />
      </Tab.Navigator>
      <LoadingBanner
        viewStyle={{
          position: 'absolute',
          top: NAVBAR_SIZE - LOADING_BAR_THICKNESS,
          left: 0,
          right: 0,
        }}
      />
    </View>
  );
}
