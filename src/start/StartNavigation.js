import React from 'react';
import {
  Text,
  NavigationExperimental,
} from 'react-native';

// import { Backend } from '../api/apiClient';
import styles from '../common/styles';

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

// On Start, AccountList not empty => login into last logged in account
// On Logout if AccountList not empty => show list of accounts to login + button 'Add new account'
// If Login in stored account fails => Set realm to the one in it, but redirect to Email + Password page
// On Start, if AccountList is empty => go directly to RealmScreen

const NavReducer = createReducer({
  index: 0,
  key: 'App',
  routes: [{ key: 'Home' }],
});

type Props = {
  realm: string,
  authBackends: string[],
};

export default class StartNavigation extends React.Component {

  props: Props;

  constructor(props: Props) {
    super(props);
    this.state = {
      navState: NavReducer(undefined, {}),
    };
  }

  handleAction = (action) => {
    const newState = NavReducer(this.state.navState, action);
    if (newState === this.state.navState) {
      return false;
    }
    this.setState({
      navState: newState,
    });
    return true;
  }

  handleBackAction = () =>
    this.handleAction({ type: 'pop' });

  handleBackAction = () =>
    this.handleAction({ type: 'pop' });

  renderScene = (key) => <Text>Hello</Text>;

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
