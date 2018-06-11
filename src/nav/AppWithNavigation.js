/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { BackHandler } from 'react-native';
import { addNavigationHelpers } from 'react-navigation';
import { createReduxBoundAddListener } from 'react-navigation-redux-helpers';

import type { Dispatch } from '../types';
import { getCanGoBack, getNav } from '../selectors';
import AppNavigator from './AppNavigator';
import { navigateBack } from '../actions';

type Props = {
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
    const { canGoBack, dispatch } = this.props;
    if (canGoBack) {
      dispatch(navigateBack());
    }
    return canGoBack;
  };

  render() {
    const { dispatch, nav } = this.props;
    const addListener = createReduxBoundAddListener('root');

    return (
      <AppNavigator
        navigation={
          // $FlowFixMe
          addNavigationHelpers({
            state: nav,
            dispatch,
            addListener,
          })
        }
      />
    );
  }
}

export default connect(state => ({
  nav: getNav(state),
  canGoBack: getCanGoBack(state),
}))(AppWithNavigation);
