import React from 'react';
import ScrollableTabView from 'react-native-scrollable-tab-view';

import MainTabBar from './MainTabBar';
import HomeTab from './HomeTab';
import ConversationsContainer from '../conversations/ConversationsContainer';
import SubscriptionsContainer from '../streamlist/SubscriptionsContainer';
import AccountContainer from '../account-info/AccountContainer';

export default class MainScreen extends React.Component {
  render() {
    return (
      <ScrollableTabView
        renderTabBar={() => <MainTabBar />}
      >
        <HomeTab />
        <ConversationsContainer />
        <SubscriptionsContainer />
        <AccountContainer />
      </ScrollableTabView>
    );
  }
}
