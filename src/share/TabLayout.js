/* @flow */
import { TabNavigator } from 'react-navigation';

import { Streams, PrivateMessages } from './tabs';
import styles from '../styles';

const TabLayout = TabNavigator(
  {
    Streams: {
      screen: Streams
    },
    PrivateMessages: {
      screen: PrivateMessages
    }
  },
  {
    tabBarOptions: {
      labelStyle: [styles.tabBarLabelStyle, styles.color],
      style: [styles.tabBarStyle, styles.backgroundColor],
      indicatorStyle: styles.tabBarIndicatorStyle,
    },
    swipeEnabled: true,
    tabBarPosition: 'top',
    lazy: true,
    scrollEnabled: true,
    activeTintColor: '#000',
    screenProps: { ...this.props }
  }
);

export default TabLayout;
