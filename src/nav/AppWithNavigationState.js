/* TODO flow */
import React from 'react';
import { addNavigationHelpers } from 'react-navigation';

import connectWithActions from '../connectWithActions';
import AppNavigator from './AppNavigator';

export default connectWithActions(state => ({
  nav: state.nav,
}))(props => (
  <AppNavigator
    navigation={addNavigationHelpers({
      state: props.nav,
      dispatch: props.dispatch,
    })}
  />
));
