/* @flow strict-local */
import type { ViewStyle } from 'react-native/Libraries/StyleSheet/StyleSheet';
import type { ExtraMaterialTopTabNavigatorProps } from '@react-navigation/material-top-tabs';
import type { ExtraBottomTabNavigatorProps } from '@react-navigation/bottom-tabs';

import { BRAND_COLOR } from './constants';

type Props = $ReadOnly<{|
  showLabel: boolean,
  showIcon: boolean,
  style?: ViewStyle,
|}>;

const baseTabNavigatorConfig = (args: Props) => {
  const { showLabel, showIcon, style } = args;
  return {
    tabBarOptions: {
      showLabel,
      showIcon,
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

        ...style,
      },
    },
  };
};
export const bottomTabNavigatorConfig: Props => ExtraBottomTabNavigatorProps = (args: Props) =>
  baseTabNavigatorConfig(args);

export const materialTopTabNavigatorConfig: Props => ExtraMaterialTopTabNavigatorProps = (
  args: Props,
) => {
  const baseConfig = baseTabNavigatorConfig(args);
  return {
    ...baseConfig,
    tabBarOptions: {
      ...baseConfig.tabBarOptions,
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
        ...baseConfig.tabBarOptions.style,

        // Setting a zero-width border (instead of none) works around an issue
        // affecting react-navigation's createMaterialTopTabNavigator.
        // https://github.com/zulip/zulip-mobile/issues/2065
        // https://github.com/satya164/react-native-tab-view/pull/519#issuecomment-689724208
        borderWidth: 0,
        elevation: 0,
      },
    },
  };
};
