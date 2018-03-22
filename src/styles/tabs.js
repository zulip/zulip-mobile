/* @flow */
import { BRAND_COLOR } from './';
import themeDark from './themeDark';
import themeLight from './themeLight';

type Props = {
  tabBarComponent: Object,
  tabBarPosition: 'top' | 'bottom',
  showLabel: boolean,
  showIcon: boolean,
  tabWidth: number,
  theme: string,
};

export default ({
  tabBarComponent,
  tabBarPosition,
  showLabel,
  showIcon,
  tabWidth,
  theme,
}: Props) => ({
  tabBarComponent,
  tabBarPosition,
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
      backgroundColor: theme === 'night' ? themeDark.backgroundColor : themeLight.backgroundColor,
    },
  },
});
