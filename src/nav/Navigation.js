import React from 'react';
import {
  BackAndroid,
  NavigationExperimental,
} from 'react-native';

import styles from '../common/styles';

import LoadingScreen from '../start/LoadingScreen';
import AccountPickScreen from '../accountlist/AccountPickScreen';
import RealmScreen from '../start/RealmScreen';
import PasswordAuthScreen from '../start/PasswordAuthScreen';
import DevAuthScreen from '../start/DevAuthScreen';

const {
  CardStack: NavigationCardStack,
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

  navigateTo = (key: string) =>
    this.handleNavigate({ type: 'push', route: { key, title: key } });

  renderScene = (props) => {
    switch (props.scene.route.key) {
      case 'accountlist':
        return (
          <AccountPickScreen onNext={() => this.navigateTo('realm')} />
        );
      case 'realm':
        return (
          <RealmScreen
            onBack={this.handleBackAction}
            onNext={() => this.navigateTo('password')}
          />
        );
      case 'password':
        return <PasswordAuthScreen onNext={() => this.navigateTo('main')} />;
      case 'dev':
        return <DevAuthScreen onNext={() => this.navigateTo('main')} />;
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
