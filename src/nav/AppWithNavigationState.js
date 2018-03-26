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
  actions: Actions,
  canGoBack: boolean,
};

class AppWithNavigation extends PureComponent<Props> {
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonPress);
  }

  handleBackButtonPress = () => {
    const { canGoBack, actions } = this.props;
    if (canGoBack) {
      actions.navigateBack();
      return true;
    }
    return false;
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
  canGoBack: getCanGoBack(state),
  nav: getNav(state),
}))(AppWithNavigation);
