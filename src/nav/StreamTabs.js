/* TODO flow */
import React from 'react';
import { TabNavigator, TabBarTop } from 'react-navigation';

import tabsOptions from '../styles/tabs';
import UnreadStreamsContainer from '../unread/UnreadStreamsContainer';
import SubscriptionsContainer from '../streams/SubscriptionsContainer';
import StreamsContainer from '../subscriptions/SubscriptionsContainer';

export default TabNavigator(
  {
    unread: {
      screen: props => <UnreadStreamsContainer {...props.screenProps} />,
      navigationOptions: {
        tabBarLabel: 'Unread',
      },
    },
    subscribed: {
      screen: props => <SubscriptionsContainer {...props.screenProps} />,
      navigationOptions: {
        tabBarLabel: 'Subscribed',
      },
    },
    streams: {
      screen: props => <StreamsContainer {...props.screenProps} />,
      navigationOptions: {
        tabBarLabel: 'All Streams',
      },
    },
  },
  tabsOptions(TabBarTop, 'top', true),
);
