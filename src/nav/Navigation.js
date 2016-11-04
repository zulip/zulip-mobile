import React from 'react';
import {
  BackAndroid,
  NavigationExperimental,
} from 'react-native';

import { styles } from '../common';

import LoadingScreen from '../start/LoadingScreen';
import AccountPickScreen from '../accountlist/AccountPickScreen';
import RealmScreen from '../start/RealmScreen';
import PasswordAuthScreen from '../start/PasswordAuthScreen';
import DevAuthScreen from '../start/DevAuthScreen';
import MainScreenContainer from '../main/MainScreenContainer';

const {
  CardStack: NavigationCardStack,
} = NavigationExperimental;

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
          <AccountPickScreen
            navigateTo={this.navigateTo}
            onNext={() => this.navigateTo('realm')}
          />
        );
      case 'realm':
        return (
          <RealmScreen
            navigateTo={this.navigateTo}
            onBack={this.handleBackAction}
            onNext={() => this.navigateTo('password')}
          />
        );
      case 'password':
        return (
          <PasswordAuthScreen
            onBack={this.handleBackAction}
            onNext={() => this.navigateTo('main')}
          />
        );
      case 'dev':
        return (
          <DevAuthScreen
            onBack={this.handleBackAction}
            onNext={() => this.navigateTo('main')}
          />
        );
      case 'main':
        return <MainScreenContainer />;
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
