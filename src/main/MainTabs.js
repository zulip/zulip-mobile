/* @flow */
import React from 'react';
import { Platform } from 'react-native';
import { TabNavigator, TabBarBottom } from 'react-navigation';

import type { TabNavigationOptionsPropsType } from '../types';
import tabsOptions from '../styles/tabs';
import HomeTab from './HomeTab';
import StreamTabs from './StreamTabs';
import PmConversationsCard from '../pm-conversations/PmConversationsCard';
import SettingsCard from '../settings/SettingsCard';
import { IconHome, IconStream, IconSettings } from '../common/Icons';
import IconUnreadConversations from '../nav/IconUnreadConversations';

export default TabNavigator(
  {
    home: {
      screen: HomeTab,
      navigationOptions: {
        tabBarLabel: 'Home',
        tabBarIcon: (props: TabNavigationOptionsPropsType) => (
          <IconHome accessibilityLabel="Unread" size={24} color={props.tintColor} />
        ),
      },
    },
    streams: {
      screen: StreamTabs,
      navigationOptions: {
        tabBarLabel: 'Streams',
        tabBarIcon: (props: TabNavigationOptionsPropsType) => (
          <IconStream accessibilityLabel="Streams" size={24} color={props.tintColor} />
        ),
      },
    },
    conversations: {
      screen: PmConversationsCard,
      navigationOptions: {
        tabBarLabel: 'Conversations',
        tabBarIcon: (props: TabNavigationOptionsPropsType) => (
          <IconUnreadConversations color={props.tintColor} />
        ),
      },
    },
    settings: {
      screen: SettingsCard,
      navigationOptions: {
        tabBarLabel: 'Settings',
        tabBarIcon: (props: TabNavigationOptionsPropsType) => (
          <IconSettings accessibilityLabel="Settings" size={24} color={props.tintColor} />
        ),
      },
    },
  },
  {
    backBehavior: 'none',
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    ...tabsOptions({
      showLabel: !!Platform.isPad,
      showIcon: true,
    }),
  },
);
