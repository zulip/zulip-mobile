/* @flow strict-local */
import React, { useContext } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
import {
  createBottomTabNavigator,
  type BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs';
import type { RouteProp, RouteParamsOf } from '../react-navigation';
import { getUnreadHuddlesTotal, getUnreadPmsTotal } from '../selectors';
import { useSelector } from '../react-redux';
import type { AppNavigationMethods, AppNavigationProp } from '../nav/AppNavigator';
import { bottomTabNavigatorConfig } from '../styles/tabs';
import HomeScreen from './HomeScreen';
import PmConversationsScreen from '../pm-conversations/PmConversationsScreen';
import { IconInbox, IconStream, IconPeople } from '../common/Icons';
import OwnAvatar from '../common/OwnAvatar';
import OfflineNotice from '../common/OfflineNotice';
import ProfileScreen from '../account-info/ProfileScreen';
import styles, { BRAND_COLOR, ThemeContext } from '../styles';
import SubscriptionsScreen from '../streams/SubscriptionsScreen';

export type MainTabsNavigatorParamList = {|
  +home: RouteParamsOf<typeof HomeScreen>,
  +subscribed: RouteParamsOf<typeof SubscriptionsScreen>,
  +'pm-conversations': RouteParamsOf<typeof PmConversationsScreen>,
  +profile: RouteParamsOf<typeof ProfileScreen>,
|};

export type MainTabsNavigationProp<
  +RouteName: $Keys<MainTabsNavigatorParamList> = $Keys<MainTabsNavigatorParamList>,
> =
  // Screens on this navigator will get a `navigation` prop that reflects
  // this navigator itself…
  BottomTabNavigationProp<MainTabsNavigatorParamList, RouteName> &
    // … plus the methods it gets from its parent navigator.
    AppNavigationMethods;

const Tab = createBottomTabNavigator<
  MainTabsNavigatorParamList,
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
    <View style={[styles.flexed, { backgroundColor }]}>
      <OfflineNotice />
      <Tab.Navigator {...bottomTabNavigatorConfig()} lazy={false} backBehavior="none">
        <Tab.Screen
          name="home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color }) => <IconInbox size={24} color={color} />,
          }}
        />
        <Tab.Screen
          name="subscribed"
          component={SubscriptionsScreen}
          options={{
            tabBarLabel: 'Streams',
            tabBarIcon: ({ color }) => <IconStream size={24} color={color} />,
          }}
        />
        <Tab.Screen
          name="pm-conversations"
          component={PmConversationsScreen}
          options={{
            tabBarLabel: 'Private messages',
            tabBarIcon: ({ color }) => <IconPeople size={24} color={color} />,
            tabBarBadge: unreadPmsCount > 0 ? unreadPmsCount : undefined,
            tabBarBadgeStyle: {
              color: 'white',
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
    </View>
  );
}
