/* @flow strict-local */
import React from 'react';
import { Text } from 'react-native';
import { FormattedMessage } from 'react-intl';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import {
  createCompatNavigatorFactory,
  type NavigationTabProp,
  type NavigationStateRoute,
} from '@react-navigation/compat';

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
  +RouteName: $Keys<StreamTabsNavigatorParamList> = $Keys<StreamTabsNavigatorParamList>,
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

export default createCompatNavigatorFactory(createMaterialTopTabNavigator)(
  {
    subscribed: {
      screen: SubscriptionsCard,
      navigationOptions: {
        tabBarLabel: props => (
          <Text style={[styles.tab, { color: props.color }]}>
            <FormattedMessage id="Subscribed" defaultMessage="Subscribed" />
          </Text>
        ),
      },
    },
    allStreams: {
      screen: StreamListCard,
      navigationOptions: {
        tabBarLabel: props => (
          <Text style={[styles.tab, { color: props.color }]}>
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
