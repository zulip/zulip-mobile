/* TODO flow */
import React from 'react';
import { addNavigationHelpers } from 'react-navigation';
import { connect } from 'react-redux';

import AppNavigator from './AppNavigator';

export default connect(state => ({
  nav: state.nav,
}))(props => (
  <AppNavigator
    navigation={addNavigationHelpers({
      state: props.nav,
      dispatch: props.dispatch,
    })}
  />
));
