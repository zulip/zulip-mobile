/* @flow strict-local */
import type { ViewStyle } from 'react-native/Libraries/StyleSheet/StyleSheet';
import type {
  MaterialTopTabNavigatorConfig,
  BottomTabNavigatorConfig,
} from 'react-navigation-tabs';

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

        // Starting in React Navigation v5, if we set
        // `backgroundColor` to 'transparent', the tab bar will look
        // very odd on Android. It will look normal with this
        // Android-only `elevation` attribute set to 0.
        elevation: 0,

        ...style,
      },
    },
  };
};
export const bottomTabNavigatorConfig: Props => BottomTabNavigatorConfig = (args: Props) =>
  baseTabNavigatorConfig(args);

export const materialTopTabNavigatorConfig: Props => MaterialTopTabNavigatorConfig = (
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
      upperCaseLabel: false,
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
