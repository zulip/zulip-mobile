/* @flow */
/* eslint-disable react-native/split-platform-components */
import React from 'react';
import { BackAndroid, NavigationExperimental, Platform } from 'react-native';

import CompatibilityScreen from '../start/CompatibilityScreen';
import LoadingScreen from '../start/LoadingScreen';
import AccountPickScreen from '../account/AccountPickScreen';
import RealmScreen from '../start/RealmScreen';
import AuthScreen from '../start/AuthScreen';
import DevAuthScreen from '../start/DevAuthScreen';
import MainScreenContainer from '../main/MainScreenContainer';
import AccountDetailsScreen from '../account-info/AccountDetailsScreen';
import SearchMessagesScreen from '../search/SearchMessagesScreen';
import UsersScreen from '../users/UsersScreen';
import SubscriptionsScreen from '../subscriptions/SubscriptionsScreen';
import ChatScreen from '../chat/ChatScreen';
import SettingsScreen from '../settings/SettingsScreen';
import LightboxScreen from '../lightbox/LightboxScreen';

const { CardStack: NavigationCardStack } = NavigationExperimental;

export default class Navigation extends React.Component {

  static contextTypes = {
    styles: () => null,
  };

  componentDidMount() {
    if (Platform.OS === 'android') {
      BackAndroid.addEventListener('hardwareBackPress', this.handleBackAction);
    }
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      BackAndroid.removeEventListener('hardwareBackPress', this.handleBackAction);
    }
  }

  handleNavigate = (action: Object) => {
    switch (action && action.type) {
      case 'push':
        this.props.actions.pushRoute(action.route);
        return true;
      case 'back':
      case 'pop':
        return this.handleBackAction();
      default:
        return false;
    }
  };

  handleBackAction = () => {
    const { actions, navigation } = this.props;
    if (navigation.index === 0) {
      return false;
    }
    actions.popRoute();
    return true;
  };

  navigateTo = (key: string) => this.handleNavigate({ type: 'push', route: { key, title: key } });

  renderScene = (props: Object) => {
    switch (props.scene.route.key) {
      case 'account':
        return <AccountPickScreen />;
      case 'realm':
        return <RealmScreen {...props.scene.route.data} />;
      case 'auth':
        return <AuthScreen {...props.scene.route.data} />;
      case 'dev':
        return <DevAuthScreen />;
      case 'main':
        return <MainScreenContainer />;
      case 'account-details':
        return <AccountDetailsScreen />;
      case 'search':
        return <SearchMessagesScreen />;
      case 'users':
        return <UsersScreen />;
      case 'subscriptions':
        return <SubscriptionsScreen />;
      case 'chat':
        return <ChatScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'light-box':
        return <LightboxScreen {...props.scene.route.data} />;
      default:
        return <LoadingScreen />;
    }
  };

  render() {
    const { styles } = this.context;
    const { navigation, compatibilityCheckFail } = this.props;

    if (compatibilityCheckFail) {
      return <CompatibilityScreen />;
    }

    return (
      <NavigationCardStack
        style={styles.screen}
        cardStyle={styles.navigationCard}
        onNavigate={this.handleNavigate}
        onNavigateBack={this.handleBackAction}
        navigationState={navigation}
        renderScene={this.renderScene}
      />
    );
  }
}
