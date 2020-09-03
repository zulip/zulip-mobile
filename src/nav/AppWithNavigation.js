/* @flow strict-local */

import { createReduxContainer } from 'react-navigation-redux-helpers';

import { connect } from '../react-redux';
import { getNav } from '../selectors';
import AppNavigator from './AppNavigator';

export default connect(state => ({
  state: getNav(state),
}))(createReduxContainer(AppNavigator, 'root'));
