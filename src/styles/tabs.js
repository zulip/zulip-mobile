/* @flow */
import { Platform } from 'react-native';
import { BRAND_COLOR } from './';

export default (
  tabBarComponent: Object,
  tabBarPosition: 'bottom' | 'top',
  showLabel: boolean,
  tabWidth: number,
) => ({
  tabBarComponent,
  tabBarPosition,
  swipeEnabled: Platform.OS === 'ios',
  animationEnabled: Platform.OS === 'ios',
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
