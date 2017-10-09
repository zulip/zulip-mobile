/* @flow */
import { bindActionCreators } from 'redux';
import type { MapStateToProps } from 'react-redux';

import type { Dispatch } from './types';
import * as actions from './actions';

let cachedBoundActions: MapStateToProps<*, *, *>;

export default (dispatch: Dispatch, ownProps: Object): MapStateToProps<*, *, *> => {
  if (!cachedBoundActions) {
    cachedBoundActions = {
      actions: bindActionCreators(actions, dispatch),
    };
  }

  return cachedBoundActions;
};
