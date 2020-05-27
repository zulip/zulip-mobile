/* @flow strict-local */
import { BRAND_COLOR } from './constants';

type Props = $ReadOnly<{|
  showLabel: boolean,
  showIcon: boolean,
  //  react-navigation tabNavigation also treat styles as {}, so match the same type here too
  style?: { ... },
|}>;

export default ({ showLabel, showIcon, style }: Props) => ({
  swipeEnabled: false,
  animationEnabled: false,
  tabBarOptions: {
    showLabel,
    showIcon,
    upperCaseLabel: false,
    pressColor: BRAND_COLOR,
    activeTintColor: BRAND_COLOR,
    inactiveTintColor: 'gray',
    labelStyle: {
      fontSize: 13,
      margin: 0,
    },
    indicatorStyle: {
      backgroundColor: BRAND_COLOR,
    },
    tabStyle: {
      flex: 1,
    },
    style: {
      backgroundColor: 'transparent',
      // Setting a zero-width border (instead of none) works around an issue
      // affecting react-navigation's TabNavigator.
      // github.com/zulip/zulip-mobile/issues/2065
      borderWidth: 0,
      elevation: 0,
      /* flowlint-next-line inexact-spread:off */
      ...style,
    },
  },
});
