/* @flow */
import React from 'react';
import { TabNavigator, TabBarBottom } from 'react-navigation';

import tabsOptions from '../styles/tabs';
import HomeTab from './HomeTab';
import StreamTabs from './StreamTabs';
import ConversationsContainer from '../conversations/ConversationsContainer';
import SettingsCard from '../settings/SettingsCard';
import { IconHome, IconStream, IconSettings } from '../common/Icons';
import MainTabIcon from './MainTabIcon';
import IconUnreadConversations from '../nav/IconUnreadConversations';

export default TabNavigator(
  {
    home: {
      screen: props => <HomeTab {...props.screenProps} />,
      navigationOptions: {
        tabBarLabel: ({ tintColor }) => <MainTabIcon Icon={IconHome} color={tintColor} />,
        // tabBarIcon: ({ tintColor }) => <MainTabIcon Icon={IconHome} color={tintColor} />,
      },
    },
    streams: {
      screen: props => <StreamTabs {...props.screenProps} />,
      navigationOptions: {
        tabBarLabel: ({ tintColor }) => <MainTabIcon Icon={IconStream} color={tintColor} />,
        // tabBarIcon: ({ tintColor }) => <MainTabIcon Icon={IconStream} color={tintColor} />,
      },
    },
    conversations: {
      screen: props => <ConversationsContainer {...props.screenProps} />,
      navigationOptions: {
        tabBarLabel: ({ tintColor }) => (
          <MainTabIcon Icon={IconUnreadConversations} color={tintColor} />
        ),
        // tabBarIcon: ({ tintColor }) => <IconUnreadConversations color={tintColor} />,
      },
    },
    settings: {
      screen: SettingsCard,
      navigationOptions: {
        tabBarLabel: ({ tintColor }) => <MainTabIcon Icon={IconSettings} color={tintColor} />,
        // tabBarIcon: ({ tintColor }) => <MainTabIcon Icon={IconSettings} color={tintColor} />,
      },
    },
  },
  tabsOptions({
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    showLabel: true,
    showIcon: false,
    tabWidth: 100,
  }),
);
