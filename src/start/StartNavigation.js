import React from 'react';
import {
  NavigationExperimental,
} from 'react-native';

// import { Backend } from '../api/apiClient';
import styles from '../common/styles';

import AccountPickScreen from '../accountlist/AccountPickScreen';
import RealmScreen from './RealmScreen';
import PasswordAuthScreen from './PasswordAuthScreen';
import DevAuthScreen from './DevAuthScreen';

const {
  CardStack: NavigationCardStack,
  StateUtils: NavigationStateUtils,
} = NavigationExperimental;

const createReducer = (initialState) =>
  (currentState = initialState, action) => {
    switch (action.type) {
      case 'push':
        return NavigationStateUtils.push(currentState, { key: action.key });
      case 'pop':
        return currentState.index > 0 ?
          NavigationStateUtils.pop(currentState) :
            currentState;
      default:
        return currentState;
    }
  };

// On Start, AccountList not empty =>
//   login into last logged in account
// On Logout if AccountList not empty =>
//   show list of accounts to login + button 'Add new account'
// If Login in stored account fails =>
//   Set realm to the one in it, but redirect to Email + Password page
// On Start, if AccountList is empty =>
//   go directly to RealmScreen

const NavReducer = createReducer({
  index: 0,
  key: 'App',
  routes: [{ key: 'accountlist' }],
});

type Props = {
//  realm: string,
//  authBackends: string[],
};

export default class StartNavigation extends React.Component {

  props: Props;

  constructor(props: Props) {
    super(props);
    this.state = {
      navState: NavReducer(undefined, {}),
    };
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

  handleAction = (action) => {
    const { navState } = this.state;
    const newState = NavReducer(navState, action);
    if (newState === navState) {
      return false;
    }
    this.setState({
      navState: newState,
    });
    return true;
  }

  handleBackAction = () =>
    this.handleAction({ type: 'pop' });

  renderScene = (props) => {
    switch (props.scene.route.key) {
      case 'accountlist':
        return <AccountPickScreen onNext={() => this.handleAction({ type: 'push', route: { key: 'realm', title: 'Realm' } })} />;
      case 'realm':
        return <RealmScreen onNext={this.handleAction} />;
      case 'password':
        return <PasswordAuthScreen onNext={this.handleAction} />;
      case 'dev':
        return <DevAuthScreen onNext={this.handleAction} />;
      default:
        return null;
    }
  }

  render() {
    const { navState } = this.state;

    return (
      <NavigationCardStack
        cardStyle={styles.navigation}
        onNavigate={this.handleAction}
        // onNavigateBack={this.handleBackAction}
        navigationState={navState}
        renderScene={this.renderScene}
      />
    );
  }
}
