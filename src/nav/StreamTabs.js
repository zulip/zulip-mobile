/* TODO flow */
import React from 'react';
import { TabNavigator, TabBarTop } from 'react-navigation';

import { BRAND_COLOR } from '../styles';
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
  {
    swipeEnabled: true,
    animationEnabled: true,
    tabBarComponent: TabBarTop,
    tabBarPosition: 'top',
    tabBarOptions: {
      upperCaseLabel: false,
      pressColor: 'white',
      labelStyle: {
        fontSize: 13,
        margin: 0,
      },
      tabStyle: {
        backgroundColor: BRAND_COLOR,
      },
      style: {
        backgroundColor: 'blue',
      },
    },
    style: {
      backgroundColor: 'red',
    },
  },
);
