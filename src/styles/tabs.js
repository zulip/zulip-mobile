/* @flow strict-local */
import { Platform } from 'react-native';
import type { MaterialTopTabBarOptions } from '@react-navigation/material-top-tabs';
import type { BottomTabBarOptions } from '@react-navigation/bottom-tabs';

import { BRAND_COLOR } from './constants';

export const bottomTabNavigatorConfig = (): {| tabBarOptions: BottomTabBarOptions |} => ({
  tabBarOptions: {
    // TODO: Find a way to tell if we're on an Android tablet,
    //   and use that -- we don't want to assume Android users
    //   aren't on tablets, but `isPad` is iOS only and `Platform`
    //   doesn't have something else for Android (yet):
    //   https://reactnative.dev/docs/platform#ispad-ios
    showLabel: Platform.OS === 'ios' && Platform.isPad,
    showIcon: true,

    activeTintColor: BRAND_COLOR,
    inactiveTintColor: 'gray',
    labelStyle: {
      fontSize: 13,
      margin: 0,
    },
    tabStyle: {
      flex: 1,
    },
    style: {
      backgroundColor: 'transparent',

      // Fix a bug introduced in React Navigation v5 that is exposed
      // by setting `backgroundColor` to 'transparent', as we do.
      elevation: 0,
    },
  },
});

export const materialTopTabNavigatorConfig = (): {| tabBarOptions: MaterialTopTabBarOptions |} => ({
  tabBarOptions: {
    showLabel: true,
    showIcon: false,
    activeTintColor: BRAND_COLOR,
    inactiveTintColor: 'gray',
    labelStyle: {
      fontSize: 13,
      margin: 0,
    },
    tabStyle: {
      flex: 1,
    },

    pressColor: BRAND_COLOR,
    indicatorStyle: {
      backgroundColor: BRAND_COLOR,
    },
    // TODO: `upperCaseLabel` vanished in react-navigation v5. We
    // used to use `false` for this, but it appears that the
    // effective default value is `true`, at least for material top
    // tab navigators:
    // https://github.com/react-navigation/react-navigation/issues/7952
    //
    // The coercion into uppercase only happens when the tab-bar
    // label (whether that comes directly from
    // `options.tabBarLabel`, or from `options.title`) is a string,
    // not a more complex React node. It also doesn't seem to happen
    // on bottom tab navigators, just material top ones; this
    // difference seems to align with Material Design choices (see
    // Greg's comment at
    // https://github.com/zulip/zulip-mobile/pull/4393#discussion_r556949209f).
    style: {
      backgroundColor: 'transparent',

      // Fix a bug introduced in React Navigation v5 that is exposed
      // by setting `backgroundColor` to 'transparent', as we do.
      elevation: 0,

      // Setting borderWidth and elevation to 0 works around an issue
      // affecting react-navigation's createMaterialTopTabNavigator.
      // https://github.com/zulip/zulip-mobile/issues/2065
      // https://github.com/satya164/react-native-tab-view/pull/519#issuecomment-689724208
      // TODO: Brief testing suggests this workaround isn't needed; confirm.
      borderWidth: 0,
      elevation: 0, // eslint-disable-line no-dupe-keys
    },
  },
});
