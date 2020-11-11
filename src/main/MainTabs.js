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
import HomeTab from './HomeTab';
import StreamTabs from './StreamTabs';
import PmConversationsCard from '../pm-conversations/PmConversationsCard';
import SettingsCard from '../settings/SettingsCard';
import { IconInbox, IconSettings, IconStream } from '../common/Icons';
import { OwnAvatar } from '../common';
import IconUnreadConversations from '../nav/IconUnreadConversations';
import ProfileCard from '../account-info/ProfileCard';

export type MainTabsNavigatorParamList = {|
  home: void,
  streams: void,
  conversations: void,
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
        component={HomeTab}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: props => <IconInbox size={24} color={props.color} />,
        }}
      />
      <Tab.Screen
        name="streams"
        component={StreamTabs}
        options={{
          tabBarLabel: 'Streams',
          tabBarIcon: props => <IconStream size={24} color={props.color} />,
        }}
      />
      <Tab.Screen
        name="conversations"
        component={PmConversationsCard}
        options={{
          tabBarLabel: 'Conversations',
          tabBarIcon: props => <IconUnreadConversations color={props.color} />,
        }}
      />
      <Tab.Screen
        name="settings"
        component={SettingsCard}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: props => <IconSettings size={24} color={props.color} />,
        }}
      />
      <Tab.Screen
        name="profile"
        component={ProfileCard}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: props => <OwnAvatar size={24} />,
        }}
      />
    </Tab.Navigator>
  );
}
