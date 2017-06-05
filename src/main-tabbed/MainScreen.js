import React, { Component } from 'react';
import { TabNavigator } from 'react-navigation';

import MainTabBar from './MainTabBar';
import HomeTab from './HomeTab';
import ConversationsContainer from '../conversations/ConversationsContainer';
import SubscriptionsContainer from '../streamlist/SubscriptionsContainer';
import AccountContainer from '../account-info/AccountContainer';

const MainScreenTabNavigator = TabNavigator({
  Home: { screen: HomeTab, title: 'title' },
  Conversations: { screen: ConversationsContainer },
  Subscriptions: { screen: SubscriptionsContainer },
  Account: { screen: AccountContainer },
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
