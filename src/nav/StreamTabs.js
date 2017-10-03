/* TODO flow */
import React from 'react';
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
        tabBarLabel: <FormattedMessage id="Unread" defaultMessage="Unread" />,
      },
    },
    subscribed: {
      screen: props => <SubscriptionsContainer {...props.screenProps} />,
      navigationOptions: {
        tabBarLabel: <FormattedMessage id="Subscribed" defaultMessage="Subscribed" />,
      },
    },
    streams: {
      screen: props => <StreamsContainer {...props.screenProps} />,
      navigationOptions: {
        tabBarLabel: <FormattedMessage id="All streams" defaultMessage="All streams" />,
      },
    },
  },
  tabsOptions(TabBarTop, 'top', true),
);
