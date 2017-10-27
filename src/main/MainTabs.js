/* @TODO flow */
import React from 'react';
import { TabNavigator, TabBarBottom } from 'react-navigation';

import tabsOptions from '../styles/tabs';
import StreamTabsCard from '../nav/StreamTabsCard';
import ConversationsContainer from '../conversations/ConversationsContainer';
import SettingsContainer from '../settings/SettingsContainer';
import { IconStream, IconSettings } from '../common/Icons';
import IconUnreadConversations from '../nav/IconUnreadConversations';

export default TabNavigator(
  {
    streams: {
      screen: props => <StreamTabsCard {...props.screenProps} />,
      navigationOptions: {
        tabBarLabel: 'Streams',
        tabBarIcon: ({ tintColor }) => <IconStream size={24} color={tintColor} />,
      },
    },
    conversations: {
      screen: props => <ConversationsContainer {...props.screenProps} />,
      navigationOptions: {
        tabBarLabel: 'Conversations',
        tabBarIcon: ({ tintColor }) => <IconUnreadConversations color={tintColor} />,
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
  tabsOptions(TabBarBottom, 'bottom', false),
);
