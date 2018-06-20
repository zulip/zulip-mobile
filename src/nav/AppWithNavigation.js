/* @flow */
import { connect } from 'react-redux';
import { reduxifyNavigator } from 'react-navigation-redux-helpers';

import type { GlobalState } from '../types';
import { getNav } from '../selectors';
import AppNavigator from './AppNavigator';

const AppWithNavigation = reduxifyNavigator(AppNavigator, 'root');

export default connect((state: GlobalState) => ({
  state: getNav(state),
}))(AppWithNavigation);
