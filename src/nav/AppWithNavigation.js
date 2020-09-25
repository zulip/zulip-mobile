/* @flow strict-local */

import { createReduxContainer } from 'react-navigation-redux-helpers';

import { connect } from 'react-redux';
import { getNav } from '../selectors';
import AppNavigator from './AppNavigator';

// $FlowFixMe - should use a type-checked `connect`
export default connect(
  state => ({
    state: getNav(state),
  }),
  null,
  null,
  { forwardRef: true },
)((createReduxContainer(AppNavigator, 'root'): React$ComponentType<{||}>));
