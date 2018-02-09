/* @noflow */
import React, { PureComponent } from 'react';
import { BackHandler } from 'react-native';
import { addNavigationHelpers } from 'react-navigation';
import { createReduxBoundAddListener } from 'react-navigation-redux-helpers';

import connectWithActions from '../connectWithActions';
import { getCanGoBack, getNav } from '../selectors';
import AppNavigator from './AppNavigator';
import type { Actions } from '../types';

type Props = {
  canGoBack: boolean,
  actions: Actions,
};

class AppWithNavigation extends PureComponent<Props> {
  componentDidMount() {
    // triggered only when
    // drawer is close & tabs are at initalRoute
    // or MainScreen is not at all in stack
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonPress);
  }

  handleBackButtonPress = () => {
    const { canGoBack, actions } = this.props;
    if (canGoBack) {
      actions.navigateBack();
    }
    return canGoBack;
  };

  render() {
    const { dispatch, nav } = this.props;
    const addListener = createReduxBoundAddListener('root');

    return (
      <AppNavigator
        navigation={addNavigationHelpers({
          state: nav,
          dispatch,
          addListener,
        })}
      />
    );
  }
}

export default connectWithActions(state => ({
  nav: getNav(state),
  canGoBack: getCanGoBack(state),
}))(AppWithNavigation);
