/* @flow strict-local */

import { createReduxContainer } from 'react-navigation-redux-helpers';

import { connect } from 'react-redux';
import AppNavigator from './AppNavigator';

// $FlowFixMe - should use a type-checked `connect`
export default connect(
  state => ({
    state: state.nav,
  }),
  null,
  null,
  { forwardRef: true },
)((createReduxContainer(AppNavigator, 'root'): React$ComponentType<{||}>));
