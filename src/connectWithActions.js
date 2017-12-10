/* @noflow */
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import type { Dispatch, MapStateToProps } from './types';
import * as actions from './actions';

let cachedBoundActions;

const boundActions = (dispatch: Dispatch, ownProps: Object) => {
  if (!cachedBoundActions) {
    cachedBoundActions = {
      dispatch,
      actions: bindActionCreators(actions, dispatch),
    };
  }

  return cachedBoundActions;
};

export default (mapStateToProps: MapStateToProps, mergeProps, options) => (
  component: React$Component<*, *, *>,
) => connect(mapStateToProps, boundActions, mergeProps, options)(component);
