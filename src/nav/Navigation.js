import React from 'react';
import {
  BackAndroid,
  NavigationExperimental,
} from 'react-native';

// import { Backend } from '../api/apiClient';
import styles from '../common/styles';

import LoadingScreen from '../start/LoadingScreen';
import AccountPickScreen from '../accountlist/AccountPickScreen';
import RealmScreen from '../start/RealmScreen';
import PasswordAuthScreen from '../start/PasswordAuthScreen';
import DevAuthScreen from '../start/DevAuthScreen';

const {
  CardStack: NavigationCardStack,
  // Reducer: NavigationTabsReducer,
  // StateUtils: NavigationStateUtils,
} = NavigationExperimental;

// On Start, AccountList not empty =>
//   login into last logged in account
// On Logout if AccountList not empty =>
//   show list of accounts to login + button 'Add new account'
// If Login in stored account fails =>
//   Set realm to the one in it, but redirect to Email + Password page
// On Start, if AccountList is empty =>
//   go directly to RealmScreen

type Props = {
//  realm: string,
};

export default class Navigation extends React.Component {

  props: Props;

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

  renderScene = (props) => {
    switch (props.scene.route.key) {
      case 'accountlist':
        return <AccountPickScreen onNext={() => this.handleNavigate({ type: 'push', route: { key: 'realm', title: 'Realm' } })} />;
      case 'realm':
        return <RealmScreen onNext={this.handleNavigate} />;
      case 'password':
        return <PasswordAuthScreen onNext={this.handleNavigate} />;
      case 'dev':
        return <DevAuthScreen onNext={this.handleNavigate} />;
      default:
        return <LoadingScreen />;
    }
  }

  render() {
    const { navigation } = this.props;

    return (
      <NavigationCardStack
        cardStyle={styles.navigation}
        onNavigate={this.handleAction}
        onNavigateBack={this.handleBackAction}
        navigationState={navigation}
        renderScene={this.renderScene}
      />
    );
  }
}
