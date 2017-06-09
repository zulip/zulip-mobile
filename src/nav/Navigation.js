/* eslint-disable react-native/split-platform-components */
import React from 'react';
import { BackAndroid, NavigationExperimental, Platform } from 'react-native';
import ShareExtension from 'react-native-share-extension';

import styles from '../styles';
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
import ShareScreen from '../share/ShareScreen';

const { CardStack: NavigationCardStack } = NavigationExperimental;

export default class Navigation extends React.Component {

  async componentDidMount() {
    if (Platform.OS === 'android') {
      BackAndroid.addEventListener('hardwareBackPress', this.handleBackAction);
    }
    try {
      const { type, value } = await ShareExtension.data();
      if (value !== '') {
        const { pushRoute, putData } = this.props;
        putData(value);
        pushRoute('share', { type, value });
      }
    } catch (e) {
      console.log('error'); // eslint-disable-line
    }
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      BackAndroid.removeEventListener('hardwareBackPress', this.handleBackAction);
    }
  }

  handleNavigate = action => {
    switch (action && action.type) {
      case 'push':
        this.props.pushRoute(action.route);
        return true;
      case 'back':
      case 'pop':
        return this.handleBackAction();
      default:
        return false;
    }
  };

  handleBackAction = () => {
    if (this.props.navigation.index === 0) {
      return false;
    }
    this.props.popRoute();
    return true;
  };

  navigateTo = (key: string) => this.handleNavigate({ type: 'push', route: { key, title: key } });

  renderScene = props => {
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
      case 'share':
        return <ShareScreen {...props.scene.route.data} />;
      default:
        return <LoadingScreen />;
    }
  };

  render() {
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
