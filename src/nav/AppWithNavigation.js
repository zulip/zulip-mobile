/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { addNavigationHelpers } from 'react-navigation';
import { createReduxBoundAddListener } from 'react-navigation-redux-helpers';

import type { Dispatch } from '../types';
import { getNav } from '../selectors';
import AppNavigator from './AppNavigator';

type Props = {
  dispatch: Dispatch,
  nav: Object,
};

class AppWithNavigation extends PureComponent<Props> {
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

export default connect(state => ({
  nav: getNav(state),
}))(AppWithNavigation);
