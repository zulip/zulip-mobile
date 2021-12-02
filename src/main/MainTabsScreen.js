/* @flow strict-local */
import React, { useContext } from 'react';
import type { Node } from 'react';
import { Platform } from 'react-native';
import {
  createBottomTabNavigator,
  type BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RouteProp, RouteParamsOf } from '../react-navigation';
import { getUnreadHuddlesTotal, getUnreadPmsTotal } from '../selectors';
import { useSelector } from '../react-redux';
import type { AppNavigationProp } from '../nav/AppNavigator';
import type { GlobalParamList } from '../nav/globalTypes';
import { bottomTabNavigatorConfig } from '../styles/tabs';
import HomeScreen from './HomeScreen';
import StreamTabsScreen from './StreamTabsScreen';
import PmConversationsScreen from '../pm-conversations/PmConversationsScreen';
import { IconInbox, IconStream, IconPeople } from '../common/Icons';
import { OwnAvatar, OfflineNotice } from '../common';
import ProfileScreen from '../account-info/ProfileScreen';
import styles, { BRAND_COLOR, ThemeContext } from '../styles';

export type MainTabsNavigatorParamList = {|
  home: RouteParamsOf<typeof HomeScreen>,
  'stream-tabs': RouteParamsOf<typeof StreamTabsScreen>,
  'pm-conversations': RouteParamsOf<typeof PmConversationsScreen>,
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

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'main-tabs'>,
  route: RouteProp<'main-tabs', void>,
|}>;

export default function MainTabsScreen(props: Props): Node {
  const { backgroundColor } = useContext(ThemeContext);

  const unreadPmsCount = useSelector(getUnreadHuddlesTotal) + useSelector(getUnreadPmsTotal);

  return (
    <SafeAreaView mode="padding" edges={['top']} style={[styles.flexed, { backgroundColor }]}>
      <OfflineNotice />
      <Tab.Navigator
        {...bottomTabNavigatorConfig({
          // TODO: Find a way to tell if we're on an Android tablet,
          // and use that -- we don't want to assume Android users
          // aren't on tablets, but `isPad` is iOS only and `Platform`
          // doesn't have something else for Android (yet):
          // https://reactnative.dev/docs/platform#ispad-ios
          showLabel: Platform.OS === 'ios' && Platform.isPad,
          showIcon: true,
        })}
        lazy={false}
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
            tabBarIcon: ({ color }) => <IconPeople size={24} color={color} />,
            tabBarBadge: unreadPmsCount > 0 ? unreadPmsCount : undefined,
            tabBarBadgeStyle: {
              // Light in light mode, dark in dark mode; both will contrast
              //   with BRAND_COLOR.
              color: backgroundColor,
              backgroundColor: BRAND_COLOR,
            },
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
    </SafeAreaView>
  );
}
