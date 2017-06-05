import React, { Component } from 'react';
import { TabNavigator, TabBarTop } from 'react-navigation';

import { BRAND_COLOR } from '../common/styles';
import HomeTab from './HomeTab';
import ConversationsContainer from '../conversations/ConversationsContainer';
import SubscriptionsContainer from '../streamlist/SubscriptionsContainer';
import AccountContainer from '../account-info/AccountContainer';

const MainScreenTabNavigator = TabNavigator({
  Home: { screen: HomeTab },
  Conversations: { screen: ConversationsContainer },
  Subscriptions: { screen: SubscriptionsContainer },
  Account: { screen: AccountContainer },
}, {
  tabBarComponent: TabBarTop,
  tabBarPosition: 'top',
  animationEnabled: true,
  tabBarOptions: {
    showIcon: true,
    showLabel: false,
    style: {
      backgroundColor: BRAND_COLOR,
    },
  }
});

export default class MainScreen extends Component {
  static navigationOptions = {
    title: 'Home',
  };

  render() {
    return (
      <MainScreenTabNavigator />
    );
  }
}
