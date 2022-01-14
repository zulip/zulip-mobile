/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { createDrawerNavigator, type DrawerNavigationProp } from '@react-navigation/drawer';

import type { RouteProp, RouteParamsOf } from '../../react-navigation';
import type { MainTabsNavigationProp } from '../MainTabsScreen';
import type { GlobalParamList } from '../../nav/globalTypes';
import DefaultScreen from './DefaultScreen';
import AllNarrowScreen from './AllNarrowScreen';
import StarredNarrowScreen from './StarredNarrowScreen';
import MentionedNarrowScreen from './MentionedNarrowScreen';
import SearchInHomeDrawerScreen from './SearchInHomeDrawerScreen';

export type HomeDrawerNavigatorParamList = {|
  default: RouteParamsOf<typeof DefaultScreen>,
  'all-narrow': RouteParamsOf<typeof AllNarrowScreen>,
  'starred-narrow': RouteParamsOf<typeof StarredNarrowScreen>,
  'mentioned-narrow': RouteParamsOf<typeof MentionedNarrowScreen>,
  'search-in-home-drawer': RouteParamsOf<typeof SearchInHomeDrawerScreen>,
|};

export type HomeDrawerNavigationProp<
  +RouteName: $Keys<HomeDrawerNavigatorParamList> = $Keys<HomeDrawerNavigatorParamList>,
> = DrawerNavigationProp<GlobalParamList, RouteName>;

const Tab = createDrawerNavigator<
  GlobalParamList,
  HomeDrawerNavigatorParamList,
  HomeDrawerNavigationProp<>,
>();

type Props = $ReadOnly<{|
  navigation: MainTabsNavigationProp<'home'>,
  route: RouteProp<'home', void>,
|}>;

export default function HomeDrawerNavigator(props: Props): Node {
  return (
    <Tab.Navigator
      initialRouteName="default"
      backBehavior="initialRoute"
      screenOptions={{
        // These are probably the defaults, but it's a convenient place to
        // mention this: gestures seem to never work in "Debug JS Remotely"
        // mode. Probably because of Reanimated; it has a note at
        // https://docs.swmansion.com/react-native-reanimated/docs/2.2.0/installation:
        //
        // > CAUTION: Please note that Reanimated 2 doesn't support remote
        // > debugging, only Flipper can be used for debugging.
        gestureEnabled: true,
        swipeEnabled: true,
      }}
    >
      <Tab.Screen
        name="default"
        options={{ drawerLabel: 'Home' }} // TODO: translate
        component={DefaultScreen}
      />
      <Tab.Screen
        name="all-narrow"
        options={{ drawerLabel: 'All messages' }} // TODO: translate
        component={AllNarrowScreen}
        initialParams={{ editMessage: null }}
      />
      <Tab.Screen
        name="starred-narrow"
        options={{ drawerLabel: 'Starred messages' }} // TODO: translate
        component={StarredNarrowScreen}
        initialParams={{ editMessage: null }}
      />
      <Tab.Screen
        name="mentioned-narrow"
        options={{ drawerLabel: 'Mentions' }} // TODO: translate
        component={MentionedNarrowScreen}
        initialParams={{ editMessage: null }}
      />
      <Tab.Screen
        name="search-in-home-drawer"
        options={{ drawerLabel: 'Search' }} // TODO: translate
        component={SearchInHomeDrawerScreen}
      />
    </Tab.Navigator>
  );
}
