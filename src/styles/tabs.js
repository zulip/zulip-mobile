/* @flow strict */
import { BRAND_COLOR } from './constants';

type Props = {|
  showLabel: boolean,
  showIcon: boolean,
|};

export default ({ showLabel, showIcon }: Props) => ({
  swipeEnabled: true,
  animationEnabled: true,
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
    },
  },
});
