/* @flow strict-local */
import { connect } from 'react-redux';
import { createReduxContainer } from 'react-navigation-redux-helpers';

import { getNav } from '../selectors';
import AppNavigator from './AppNavigator';

const AppWithNavigation = createReduxContainer(AppNavigator, 'root');

export default connect(state => ({
  state: getNav(state),
}))(AppWithNavigation);
