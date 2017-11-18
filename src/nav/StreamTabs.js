/* @TODO flow */
import React from 'react';
import { Text } from 'react-native';
import { TabNavigator, TabBarTop } from 'react-navigation';
import { FormattedMessage } from 'react-intl';

import tabsOptions from '../styles/tabs';
import UnreadStreamsContainer from '../unread/UnreadStreamsContainer';
import SubscriptionsContainer from '../streams/SubscriptionsContainer';
import StreamsContainer from '../subscriptions/SubscriptionsContainer';

export default TabNavigator(
  {
    unread: {
      screen: props => <UnreadStreamsContainer {...props.screenProps} />,
      navigationOptions: {
        tabBarLabel: props => (
          <Text style={{ color: props.tintColor }}>
            <FormattedMessage id="Unread" defaultMessage="Unread" />
          </Text>
        ),
      },
    },
    subscribed: {
      screen: props => <SubscriptionsContainer {...props.screenProps} />,
      navigationOptions: {
        tabBarLabel: props => (
          <Text style={{ color: props.tintColor }}>
            <FormattedMessage id="Subscribed" defaultMessage="Subscribed" />
          </Text>
        ),
      },
    },
    streams: {
      screen: props => <StreamsContainer {...props.screenProps} />,
      navigationOptions: {
        tabBarLabel: props => (
          <Text style={{ color: props.tintColor }}>
            <FormattedMessage id="All streams" defaultMessage="All streams" />
          </Text>
        ),
      },
    },
  },
  tabsOptions(TabBarTop, 'top', true, 100),
);
