/* @flow */
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { TabNavigator, TabBarTop } from 'react-navigation';
import { FormattedMessage } from 'react-intl';

import tabsOptions from '../styles/tabs';
import SubscriptionsContainer from '../streams/SubscriptionsContainer';
import StreamListContainer from '../subscriptions/StreamListContainer';

const styles = StyleSheet.create({
  tab: {
    padding: 10,
    fontSize: 16,
  },
});

export default TabNavigator(
  {
    subscribed: {
      screen: props => <SubscriptionsContainer {...props.screenProps} />,
      navigationOptions: {
        tabBarLabel: props => (
          <Text style={[styles.tab, { color: props.tintColor }]}>
            <FormattedMessage id="Subscribed" defaultMessage="Subscribed" />
          </Text>
        ),
      },
    },
    streams: {
      screen: props => <StreamListContainer {...props.screenProps} />,
      navigationOptions: {
        tabBarLabel: props => (
          <Text style={[styles.tab, { color: props.tintColor }]}>
            <FormattedMessage id="All streams" defaultMessage="All streams" />
          </Text>
        ),
      },
    },
  },
  tabsOptions(TabBarTop, 'top', true, 100),
);
