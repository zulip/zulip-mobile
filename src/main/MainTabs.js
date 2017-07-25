/* TODO flow */
import React from 'react';
import { TabNavigator, TabBarBottom } from 'react-navigation';

import { BRAND_COLOR } from '../styles';
import UnreadStreamsContainer from '../unread/UnreadStreamsContainer';
import SubscriptionsContainer from '../streams/SubscriptionsContainer';
import ConversationsContainer from '../conversations/ConversationsContainer';
import SettingsContainer from '../settings/SettingsContainer';
import { IconHome, IconStream, IconPrivateChat, IconSettings } from '../common/Icons';

export default TabNavigator(
  {
    unread: {
      screen: UnreadStreamsContainer,
      navigationOptions: {
        tabBarLabel: 'Home',
        tabBarIcon: ({ tintColor }) => <IconHome size={24} color={tintColor} />,
      },
    },
    streams: {
      screen: SubscriptionsContainer,
      navigationOptions: {
        tabBarLabel: 'Streams',
        tabBarIcon: ({ tintColor }) => <IconStream size={24} color={tintColor} />,
      },
    },
    conversations: {
      screen: ConversationsContainer,
      navigationOptions: {
        tabBarLabel: 'Conversations',
        tabBarIcon: ({ tintColor }) => <IconPrivateChat size={24} color={tintColor} />,
      },
    },
    settings: {
      screen: SettingsContainer,
      navigationOptions: {
        tabBarLabel: 'Settings',
        tabBarIcon: ({ tintColor }) => <IconSettings size={24} color={tintColor} />,
      },
    },
  },
  {
    swipeEnabled: true,
    animationEnabled: true,
    tabBarComponent: TabBarBottom,
    tabBarOptions: {
      showIcon: true,
      activeTintColor: BRAND_COLOR,
      pressColor: BRAND_COLOR,
    },
  },
);
