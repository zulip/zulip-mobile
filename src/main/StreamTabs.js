/* @flow */
import React, { Component } from 'react';
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

type Props = {
  theme: string,
};

export default class TopTabBar extends Component<Props> {
  render() {
    const Tabs = TabNavigator(
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
      tabsOptions({
        tabBarComponent: TabBarTop,
        tabBarPosition: 'top',
        showLabel: true,
        showIcon: false,
        tabWidth: 100,
        theme: this.props.theme,
      }),
    );

    return <Tabs />;
  }
}
