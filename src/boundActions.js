/* @flow */
import { bindActionCreators } from 'redux';
import type { Dispatch } from './types';

import * as actions from './actions';

export default (dispatch: Dispatch, ownProps: Object) =>
  bindActionCreators(actions, dispatch);
