/* @flow strict-local */
import React from 'react';
import { Platform } from 'react-native';
import {
  createBottomTabNavigator,
  type BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs';
import type { RouteProp } from '@react-navigation/native';

import type { GlobalParamList } from '../nav/globalTypes';
import { bottomTabNavigatorConfig } from '../styles/tabs';
import HomeScreen from './HomeScreen';
import StreamTabsScreen from './StreamTabsScreen';
import PmConversationsScreen from '../pm-conversations/PmConversationsScreen';
import SettingsScreen from '../settings/SettingsScreen';
import { IconInbox, IconSettings, IconStream } from '../common/Icons';
import { OwnAvatar } from '../common';
import IconUnreadConversations from '../nav/IconUnreadConversations';
import ProfileScreen from '../account-info/ProfileScreen';

export type MainTabsNavigatorParamList = {|
  home: void,
  'stream-tabs': void,
  'pm-conversations': void,
  settings: void,
  profile: void,
|};

export type MainTabsNavigationProp<
  +RouteName: $Keys<MainTabsNavigatorParamList> = $Keys<MainTabsNavigatorParamList>,
> = BottomTabNavigationProp<GlobalParamList, RouteName>;

export type MainTabsRouteProp<
  RouteName: $Keys<MainTabsNavigatorParamList> = $Keys<MainTabsNavigatorParamList>,
> = RouteProp<GlobalParamList, RouteName>;

const Tab = createBottomTabNavigator<
  GlobalParamList,
  MainTabsNavigatorParamList,
  MainTabsNavigationProp<>,
>();

export default function MainTabs() {
  return (
    <Tab.Navigator
      {...bottomTabNavigatorConfig({
        showLabel: !!Platform.isPad,
        showIcon: true,
      })}
      backBehavior="none"
    >
      <Tab.Screen
        name="home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: props => <IconInbox size={24} color={props.color} />,
        }}
      />
      <Tab.Screen
        name="stream-tabs"
        component={StreamTabsScreen}
        options={{
          tabBarLabel: 'Streams',
          tabBarIcon: props => <IconStream size={24} color={props.color} />,
        }}
      />
      <Tab.Screen
        name="pm-conversations"
        component={PmConversationsScreen}
        options={{
          tabBarLabel: 'Conversations',
          tabBarIcon: props => <IconUnreadConversations color={props.color} />,
        }}
      />
      <Tab.Screen
        name="settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: props => <IconSettings size={24} color={props.color} />,
        }}
      />
      <Tab.Screen
        name="profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: props => <OwnAvatar size={24} />,
        }}
      />
    </Tab.Navigator>
  );
}
