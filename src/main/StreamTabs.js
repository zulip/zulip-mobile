/* @flow strict-local */
import React from 'react';
import { Text } from 'react-native';
import { FormattedMessage } from 'react-intl';
import {
  createMaterialTopTabNavigator,
  type NavigationTabProp,
  type NavigationStateRoute,
} from 'react-navigation-tabs';

import type { GlobalParamList } from '../nav/globalTypes';
import { createStyleSheet } from '../styles';
import { materialTopTabNavigatorConfig } from '../styles/tabs';
import SubscriptionsCard from '../streams/SubscriptionsCard';
import StreamListCard from '../subscriptions/StreamListCard';

export type StreamTabsNavigatorParamList = {|
  subscribed: void,
  allStreams: void,
|};

export type StreamTabsNavigationProp<
  RouteName: $Keys<StreamTabsNavigatorParamList> = $Keys<StreamTabsNavigatorParamList>,
> = NavigationTabProp<{|
  ...NavigationStateRoute,
  params: $ElementType<GlobalParamList, RouteName>,
|}>;

const styles = createStyleSheet({
  tab: {
    padding: 8,
    fontSize: 16,
  },
});

export default createMaterialTopTabNavigator(
  {
    subscribed: {
      // $FlowFixMe react-navigation types are twisty and seem wrong
      screen: SubscriptionsCard,
      navigationOptions: {
        tabBarLabel: props => (
          <Text style={[styles.tab, { color: props.tintColor }]}>
            <FormattedMessage id="Subscribed" defaultMessage="Subscribed" />
          </Text>
        ),
      },
    },
    allStreams: {
      // $FlowFixMe react-navigation types are twisty and seem wrong
      screen: StreamListCard,
      navigationOptions: {
        tabBarLabel: props => (
          <Text style={[styles.tab, { color: props.tintColor }]}>
            <FormattedMessage id="All streams" defaultMessage="All streams" />
          </Text>
        ),
      },
    },
  },
  {
    ...materialTopTabNavigatorConfig({
      showLabel: true,
      showIcon: false,
    }),
    swipeEnabled: true,
  },
);
