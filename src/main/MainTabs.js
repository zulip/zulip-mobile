/* @flow */
import React from 'react';
import { Platform } from 'react-native';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';

import type { TabNavigationOptionsPropsType } from '../types';
import { BRAND_COLOR } from '../styles';
import tabsOptions from '../styles/tabs';
import HomeTab from './HomeTab';
import StreamsTab from './StreamsTab';
import PmConversationsCard from '../pm-conversations/PmConversationsCard';
import SettingsCard from '../settings/SettingsCard';
import { IconHome, IconStream, IconSettings } from '../common/Icons';
import IconUnreadConversations from '../nav/IconUnreadConversations';

export default createMaterialBottomTabNavigator(
  {
    home: {
      screen: HomeTab,
      navigationOptions: {
        tabBarLabel: 'Home',
        tabBarIcon: (props: TabNavigationOptionsPropsType) => (
          <IconHome size={24} color={props.tintColor} />
        ),
      },
    },
    streams: {
      screen: StreamsTab,
      navigationOptions: {
        tabBarLabel: 'Streams',
        tabBarIcon: (props: TabNavigationOptionsPropsType) => (
          <IconStream size={24} color={props.tintColor} />
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
          <IconSettings size={24} color={props.tintColor} />
        ),
      },
    },
  },
  {
    backBehavior: 'none',
    barStyle: { backgroundColor: BRAND_COLOR },
    ...tabsOptions({
      showLabel: !!Platform.isPad,
      showIcon: true,
    }),
  },
);
