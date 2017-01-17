import React from 'react';
import { BackAndroid, NavigationExperimental } from 'react-native';

import { styles } from '../common';
import LoadingScreen from '../start/LoadingScreen';
import AccountPickScreen from '../account/AccountPickScreen';
import RealmScreen from '../start/RealmScreen';
import AuthTypeScreen from '../start/AuthTypeScreen';
import PasswordAuthScreen from '../start/PasswordAuthScreen';
import DevAuthScreen from '../start/DevAuthScreen';
import MainScreenContainer from '../main/MainScreenContainer';
import AccountDetailsScreen from '../account-info/AccountDetailsScreen';
import SearchScreen from '../search/SearchScreen';
import UsersScreen from '../users/UsersScreen';


const { CardStack: NavigationCardStack } = NavigationExperimental;

export default class Navigation extends React.Component {

  componentDidMount() {
    BackAndroid.addEventListener('hardwareBackPress', this.handleBackAction);
  }

  componentWillUnmount() {
    BackAndroid.removeEventListener('hardwareBackPress', this.handleBackAction);
  }

  handleNavigate = (action) => {
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
  }

  handleBackAction = () => {
    if (this.props.navigation.index === 0) {
      return false;
    }
    this.props.popRoute();
    return true;
  }

  navigateTo = (key: string) =>
    this.handleNavigate({ type: 'push', route: { key, title: key } });

  renderScene = (props) => {
    switch (props.scene.route.key) {
      case 'account':
        return <AccountPickScreen />;
      case 'realm':
        return <RealmScreen />;
      case 'auth-type':
        return <AuthTypeScreen />;
      case 'password':
        return <PasswordAuthScreen />;
      case 'dev':
        return <DevAuthScreen />;
      case 'main':
        return <MainScreenContainer />;
      case 'account-details':
        return <AccountDetailsScreen />;
      case 'search':
        return <SearchScreen />;
      case 'users':
        return <UsersScreen />;
      default:
        return <LoadingScreen />;
    }
  }

  render() {
    const { navigation } = this.props;

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
