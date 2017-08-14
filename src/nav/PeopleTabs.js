/* TODO flow */
import React from 'react';
import { TabNavigator, TabBarTop } from 'react-navigation';

import { BRAND_COLOR } from '../styles';
import ConversationsContainer from '../conversations/ConversationsContainer';
import UsersContainer from '../users/UsersContainer';

export default TabNavigator(
  {
    conversations: {
      screen: props => <ConversationsContainer {...props} />,
      navigationOptions: {
        tabBarLabel: 'Messages',
      },
    },
    people: {
      screen: props => <UsersContainer {...props} />,
      navigationOptions: {
        tabBarLabel: 'People',
      },
    },
  },
  {
    swipeEnabled: true,
    animationEnabled: true,
    tabBarComponent: TabBarTop,
    tabBarPosition: 'top',
    tabBarOptions: {
      upperCaseLabel: false,
      pressColor: 'white',
      labelStyle: {
        fontSize: 13,
        margin: 0,
      },
      tabStyle: {
        backgroundColor: BRAND_COLOR,
      },
      style: {
        backgroundColor: 'blue',
      },
    },
    style: {
      backgroundColor: 'red',
    },
  },
);
