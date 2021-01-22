/* @flow strict-local */
import React, { useContext } from 'react';
import { Platform, View } from 'react-native';
import {
  createBottomTabNavigator,
  type BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs';
import type { RouteProp } from '@react-navigation/native';

import type { AppNavigationProp, AppNavigationRouteProp } from '../nav/AppNavigator';
import type { GlobalParamList } from '../nav/globalTypes';
import { bottomTabNavigatorConfig } from '../styles/tabs';
import HomeScreen from './HomeScreen';
import StreamTabsScreen from './StreamTabsScreen';
import PmConversationsScreen from '../pm-conversations/PmConversationsScreen';
import SettingsScreen from '../settings/SettingsScreen';
import { IconInbox, IconSettings, IconStream } from '../common/Icons';
import { OwnAvatar, OfflineNotice, ZulipStatusBar } from '../common';
import IconUnreadConversations from '../nav/IconUnreadConversations';
import ProfileScreen from '../account-info/ProfileScreen';
import { useSelector } from '../react-redux';
import { getHaveServerData } from '../selectors';
import styles, { ThemeContext } from '../styles';

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

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'main-tabs'>,
  route: AppNavigationRouteProp<'main-tabs'>,
|}>;

export default function MainTabsScreen(props: Props) {
  const { backgroundColor } = useContext(ThemeContext);
  const haveServerData = useSelector(getHaveServerData);

  if (!haveServerData) {
    // This can happen if the user has just logged out; this screen
    // is still visible for the duration of the nav transition, and
    // it's legitimate for its `render` to get called again.
    // See our #4275.
    //
    // Avoid rendering any of our main UI in this case, to maintain
    // the guarantee that it can all rely on server data existing.
    return null;
  }

  return (
    <View style={[styles.flexed, { backgroundColor }]}>
      <ZulipStatusBar />
      <OfflineNotice />
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
            tabBarIcon: ({ color }) => <IconInbox size={24} color={color} />,
          }}
        />
        <Tab.Screen
          name="stream-tabs"
          component={StreamTabsScreen}
          options={{
            tabBarLabel: 'Streams',
            tabBarIcon: ({ color }) => <IconStream size={24} color={color} />,
          }}
        />
        <Tab.Screen
          name="pm-conversations"
          component={PmConversationsScreen}
          options={{
            tabBarLabel: 'Conversations',
            tabBarIcon: ({ color }) => <IconUnreadConversations color={color} />,
          }}
        />
        <Tab.Screen
          name="settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({ color }) => <IconSettings size={24} color={color} />,
          }}
        />
        <Tab.Screen
          name="profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color }) => <OwnAvatar size={24} />,
          }}
        />
      </Tab.Navigator>
    </View>
  );
}
