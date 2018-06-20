/* @flow strict-local */
import { reduxifyNavigator } from 'react-navigation-redux-helpers';

import { connect } from '../react-redux';
import { getNav } from '../selectors';
import AppNavigator from './AppNavigator';

const AppWithNavigation = reduxifyNavigator(AppNavigator, 'root');

export default connect(state => ({
  state: getNav(state),
}))(AppWithNavigation);
