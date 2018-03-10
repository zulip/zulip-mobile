/* @flow */
import React from 'react';
import { TabNavigator, TabBarBottom } from 'react-navigation';

import tabsOptions from '../styles/tabs';
import HomeTab from './HomeTab';
import StreamTabs from './StreamTabs';
import ConversationsContainer from '../conversations/ConversationsContainer';
import SettingsCard from '../settings/SettingsCard';
import { IconHome, IconStream, IconSettings } from '../common/Icons';
import IconUnreadConversations from '../nav/IconUnreadConversations';

export default TabNavigator(
  {
    home: {
      screen: props => <HomeTab {...props.screenProps} />,
      navigationOptions: {
        tabBarLabel: 'Home',
        tabBarIcon: ({ tintColor }) => <IconHome size={24} color={tintColor} />,
      },
    },
    streams: {
      screen: props => <StreamTabs {...props.screenProps} />,
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
      screen: SettingsCard,
      navigationOptions: {
        tabBarLabel: 'Settings',
        tabBarIcon: ({ tintColor }) => <IconSettings size={24} color={tintColor} />,
      },
    },
  },
  tabsOptions({
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    showLabel: false,
    showIcon: true,
    tabWidth: 0,
  }),
);
