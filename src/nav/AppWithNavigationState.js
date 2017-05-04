import React from 'react';
import { addNavigationHelpers } from 'react-navigation';
import { connect } from 'react-redux';

import AppNavigator from './AppNavigator';

const AppWithNavigationState = props =>
  <AppNavigator
    navigation={addNavigationHelpers({
      state: props.nav,
      dispatch: props.dispatch,
    })}
  />;

export default connect(state => ({
  nav: state.nav,
}))(AppWithNavigationState);
