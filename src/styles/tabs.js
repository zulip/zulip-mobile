/* @flow */
import { BRAND_COLOR } from './';

type Props = {
  showLabel: boolean,
  showIcon: boolean,
  backgroundColor: string,
};

export default TabStyles = ({ showLabel, showIcon, backgroundColor }: Props) => ({
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
    style: {
      backgroundColor,
    },
    indicatorStyle: {
      backgroundColor: BRAND_COLOR,
    },
    tabStyle: {
      flex: 1,
    },
  },
});
