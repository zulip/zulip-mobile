/* @flow strict-local */
import React from 'react';
import { Text } from 'react-native';
import { FormattedMessage } from 'react-intl';
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';

import { createStyleSheet } from '../styles';
import { materialTopTabNavigatorConfig } from '../styles/tabs';
import SubscriptionsCard from '../streams/SubscriptionsCard';
import StreamListCard from '../subscriptions/StreamListCard';

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
