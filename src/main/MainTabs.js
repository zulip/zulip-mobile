/* @flow strict-local */
import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import { bottomTabNavigatorConfig } from '../styles/tabs';
import HomeTab from './HomeTab';
import StreamTabs from './StreamTabs';
import PmConversationsCard from '../pm-conversations/PmConversationsCard';
import SettingsCard from '../settings/SettingsCard';
import { IconInbox, IconSettings, IconStream } from '../common/Icons';
import { OwnAvatar } from '../common';
import IconUnreadConversations from '../nav/IconUnreadConversations';
import ProfileCard from '../account-info/ProfileCard';

export default createBottomTabNavigator(
  {
    home: {
      // $FlowFixMe react-navigation types are twisty and seem wrong
      screen: HomeTab,
      navigationOptions: {
        tabBarLabel: 'Home',
        tabBarIcon: props => <IconInbox size={24} color={props.tintColor} />,
      },
    },
    streams: {
      screen: StreamTabs,
      navigationOptions: {
        tabBarLabel: 'Streams',
        tabBarIcon: props => <IconStream size={24} color={props.tintColor} />,
      },
    },
    conversations: {
      // $FlowFixMe react-navigation types are twisty and seem wrong
      screen: PmConversationsCard,
      navigationOptions: {
        tabBarLabel: 'Conversations',
        tabBarIcon: props => <IconUnreadConversations color={props.tintColor} />,
      },
    },
    settings: {
      // $FlowFixMe react-navigation types are twisty and seem wrong
      screen: SettingsCard,
      navigationOptions: {
        tabBarLabel: 'Settings',
        tabBarIcon: props => <IconSettings size={24} color={props.tintColor} />,
      },
    },
    profile: {
      // $FlowFixMe react-navigation types are twisty and seem wrong
      screen: ProfileCard,
      navigationOptions: {
        tabBarLabel: 'Profile',
        tabBarIcon: props => <OwnAvatar size={24} />,
      },
    },
  },
  {
    backBehavior: 'none',
    ...bottomTabNavigatorConfig({
      showLabel: !!Platform.isPad,
      showIcon: true,
    }),
  },
);
