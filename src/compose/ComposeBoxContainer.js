/* @flow */
import { connect } from 'react-redux';

import type { GlobalState } from '../types';
import boundActions from '../boundActions';
import { getAuth, getLastTopicInActiveNarrow } from '../selectors';

import ComposeBox from './ComposeBox';

export default connect(
  (state: GlobalState) => ({
    auth: getAuth(state),
    narrow: state.chat.narrow,
    users: state.users,
    lastTopic: getLastTopicInActiveNarrow(state),
    editMessage: state.app.editMessage,
  }),
  boundActions,
)(ComposeBox);
