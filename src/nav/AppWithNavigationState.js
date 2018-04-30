/* @flow */
import React, { PureComponent } from 'react';
import { BackHandler, View } from 'react-native';
import { addNavigationHelpers } from 'react-navigation';
import { createReduxBoundAddListener } from 'react-navigation-redux-helpers';

import type { Actions, Dispatch } from '../types';
import connectWithActions from '../connectWithActions';
import { getCanGoBack, getNav } from '../selectors';
import { ZulipStatusBar } from '../common';
import AppNavigator from './AppNavigator';

type Props = {
  actions: Actions,
  canGoBack: boolean,
  dispatch: Dispatch,
  nav: Object,
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
    }
    return canGoBack;
  };

  render() {
    const { dispatch, nav } = this.props;
    const addListener = createReduxBoundAddListener('root');

    return (
      <View style={{ flex:1 }}>
        <ZulipStatusBar />
        <AppNavigator
          navigation={addNavigationHelpers({
            state: nav,
            dispatch,
            addListener,
          })}
        />
      </View>
    );
  }
}

export default connectWithActions(state => ({
  nav: getNav(state),
  canGoBack: getCanGoBack(state),
}))(AppWithNavigation);
