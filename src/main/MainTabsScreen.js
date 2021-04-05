/* @flow strict-local */
import React, { useContext } from 'react';
import { Platform, View } from 'react-native';
import {
  createBottomTabNavigator,
  type BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RouteProp, RouteParamsOf } from '../react-navigation';
import type { Dispatch } from '../types';
import type { AppNavigationProp } from '../nav/AppNavigator';
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
import { connect, useSelector } from '../react-redux';
import { getHaveServerData } from '../selectors';
import styles, { ThemeContext } from '../styles';
import FullScreenLoading from '../common/FullScreenLoading';

export type MainTabsNavigatorParamList = {|
  home: RouteParamsOf<typeof HomeScreen>,
  'stream-tabs': RouteParamsOf<typeof StreamTabsScreen>,
  'pm-conversations': RouteParamsOf<typeof PmConversationsScreen>,
  settings: RouteParamsOf<typeof SettingsScreen>,
  profile: RouteParamsOf<typeof ProfileScreen>,
|};

export type MainTabsNavigationProp<
  +RouteName: $Keys<MainTabsNavigatorParamList> = $Keys<MainTabsNavigatorParamList>,
> = BottomTabNavigationProp<GlobalParamList, RouteName>;

const Tab = createBottomTabNavigator<
  GlobalParamList,
  MainTabsNavigatorParamList,
  MainTabsNavigationProp<>,
>();

type SelectorProps = $ReadOnly<{||}>;

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'main-tabs'>,
  route: RouteProp<'main-tabs', void>,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

function MainTabsScreen(props: Props) {
  const { backgroundColor } = useContext(ThemeContext);

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.flexed, { backgroundColor }]}>
      <View style={{ height: insets.top }} />
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

const withShowIfServerData = C => (props: Props) =>
  useSelector(getHaveServerData) ? (
    <C {...props} />
  ) : (
    // Show a full-screen loading indicator while waiting for the
    // initial fetch to complete, if we don't have potentially stale
    // data to show instead. Also show it for the duration of the nav
    // transition just after the user logs out (see our #4275).
    //
    // And avoid rendering any of our main UI, to maintain the
    // guarantee that it can all rely on server data existing.
    <FullScreenLoading />
  );

// `connect` does something useful for us that `useSelector` doesn't
// do: it interposes a new `ReactReduxContext.Provider` component,
// which proxies subscriptions so that the descendant components only
// rerender if this one continues to say their subtree should be kept
// around. See
//   https://github.com/zulip/zulip-mobile/pull/4454#discussion_r578140524
// and some discussion around
//   https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/converting.20to.20Hooks/near/1111970
// where we describe some limits of our understanding.
//
// We found these things out while investigating an annoying crash: we
// found that `mapStateToProps` on a descendant of `MainTabsScreen`
// was running -- and throwing an uncaught error -- on logout, and
// `MainTabsScreen`'s early return on `!haveServerData` wasn't
// preventing that from happening.
export default connect<{||}, _, _>()(withShowIfServerData(MainTabsScreen));
