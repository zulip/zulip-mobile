/* @flow strict-local */
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { TabNavigator, TabBarTop } from 'react-navigation';
import { FormattedMessage } from 'react-intl';

import type { TabNavigationOptionsPropsType } from '../types';
import tabsOptions from '../styles/tabs';
import SubscriptionsCard from '../streams/SubscriptionsCard';
import StreamListCard from '../subscriptions/StreamListCard';

const styles = StyleSheet.create({
  tab: {
    padding: 8,
    fontSize: 16,
  },
});

export default TabNavigator(
  {
    subscribed: {
      screen: SubscriptionsCard,
      navigationOptions: {
        tabBarLabel: (props: TabNavigationOptionsPropsType) => (
          <Text style={[styles.tab, { color: props.tintColor }]}>
            <FormattedMessage id="Subscribed" defaultMessage="Subscribed" />
          </Text>
        ),
      },
    },
    allStreams: {
      screen: StreamListCard,
      navigationOptions: {
        tabBarLabel: (props: TabNavigationOptionsPropsType) => (
          <Text style={[styles.tab, { color: props.tintColor }]}>
            <FormattedMessage id="All streams" defaultMessage="All streams" />
          </Text>
        ),
      },
    },
  },
  {
    tabBarComponent: TabBarTop,
    tabBarPosition: 'top',
    ...tabsOptions({
      showLabel: true,
      showIcon: false,
    }),
  },
);
