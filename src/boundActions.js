import { bindActionCreators } from 'redux';

import * as actions from './actions';

export default (dispatch, ownProps) =>
  bindActionCreators(actions, dispatch);
