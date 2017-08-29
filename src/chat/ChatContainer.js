/* @flow */
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import {
  getActiveNarrow,
  getIsFetching,
  getIfNoMessages,
  getUnreadCountInActiveNarrow,
} from '../selectors';
import Chat from './Chat';

export default connect(
  state => ({
    isOnline: state.app.isOnline,
    isFetching: getIsFetching(state),
    narrow: getActiveNarrow(state),
    noMessages: getIfNoMessages(state),
    unreadCount: getUnreadCountInActiveNarrow(state),
  }),
  boundActions,
)(Chat);
