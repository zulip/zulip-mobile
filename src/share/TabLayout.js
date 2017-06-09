/* @flow */
import React from 'react';
import { TabNavigator } from 'react-navigation';

import { Streams, PrivateMessages } from './tabs';
import { BRAND_COLOR } from '../styles';

const TabLayout = TabNavigator(
  {
    Streams: {
      screen: props => <Streams {...props} />
    },
    PrivateMessages: {
      screen: props => <PrivateMessages {...props} />
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
    activeTintColor: '#000',
    screenProps: { ...this.props },
  }
);

export default TabLayout;
