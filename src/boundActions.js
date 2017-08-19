/* @flow */
import { bindActionCreators } from 'redux';

import type { Dispatch } from './types';
import * as actions from './actions';

let cachedBoundActions;

export default (dispatch: Dispatch, ownProps: Object): Object => {
  if (!cachedBoundActions) {
    cachedBoundActions = {
      actions: bindActionCreators(actions, dispatch),
    };
  }

  return cachedBoundActions;
};
