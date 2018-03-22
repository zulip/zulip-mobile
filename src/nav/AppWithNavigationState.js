/* @noflow */
import React, { PureComponent } from 'react';
import { addNavigationHelpers } from 'react-navigation';
import { createReduxBoundAddListener } from 'react-navigation-redux-helpers';

import connectWithActions from '../connectWithActions';
import { getNav } from '../selectors';
import AppNavigator from './AppNavigator';
import type { Actions } from '../types';

type Props = {
  actions: Actions,
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

export default connectWithActions(state => ({
  nav: getNav(state),
}))(AppWithNavigation);
