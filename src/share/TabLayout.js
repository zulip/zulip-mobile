/* @flow */
import { TabNavigator } from 'react-navigation';

import { Streams, PrivateMessages } from './tabs';
import { BRAND_COLOR } from '../styles';

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
      activeBackgroundColor: '#eaedf2',
      inactiveBackgroundColor: '#fff',
      labelStyle: {
        fontSize: 18,
        color: '#000',
        margin: 0
      },
      style: {
        backgroundColor: '#fff'
      },
      indicatorStyle: {
        backgroundColor: BRAND_COLOR
      }
    },
    swipeEnabled: true,
    tabBarPosition: 'top',
    lazy: true,
    scrollEnabled: true,
    activeTintColor: '#000'
  }
);

export default TabLayout;
