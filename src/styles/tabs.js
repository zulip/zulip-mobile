/* @flow */
import { BRAND_COLOR } from './';

export default (
  tabBarComponent: Object,
  tabBarPosition: 'bottom' | 'top',
  showLabel: boolean,
  tabWidth: number,
) => ({
  tabBarComponent,
  tabBarPosition,
  swipeEnabled: true,
  animationEnabled: true,
  tabBarOptions: {
    showLabel,
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
    },
  },
});
