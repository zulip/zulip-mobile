/* @flow */
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import {
  getAuth,
  getActiveNarrow,
  getIsFetching,
  getCurrentTypingUsers,
  getShownMessagesInActiveNarrow,
  getUnreadCountInActiveNarrow,
} from '../selectors';
import { getIsActiveStreamSubscribed } from '../subscriptions/subscriptionSelectors';
import Chat from './Chat';

export default connect(
  state => ({
    auth: getAuth(state),
    isOnline: state.app.isOnline,
    subscriptions: state.subscriptions,
    flags: state.flags,
    isFetching: getIsFetching(state),
    narrow: getActiveNarrow(state),
    mute: state.mute,
    messages: getShownMessagesInActiveNarrow(state),
    typingUsers: getCurrentTypingUsers(state),
    users: state.users,
    unreadCount: getUnreadCountInActiveNarrow(state),
    twentyFourHourTime: state.realm.twentyFourHourTime,
    isSubscribed: getIsActiveStreamSubscribed(state),
  }),
  boundActions,
)(Chat);
