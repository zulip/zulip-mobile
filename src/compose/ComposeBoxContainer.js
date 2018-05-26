/* @flow */
import { connect } from 'react-redux';

import type { GlobalState } from '../types';
import {
  getAuth,
  getSession,
  canSendToActiveNarrow,
  getLastMessageTopic,
  getUsers,
  getShowMessagePlaceholders,
} from '../selectors';
import { getIsActiveStreamSubscribed } from '../subscriptions/subscriptionSelectors';
import { getDraftForActiveNarrow } from '../drafts/draftsSelectors';
import ComposeBox from './ComposeBox';

export default connect((state: GlobalState, props) => ({
  auth: getAuth(state),
  users: getUsers(state),
  safeAreaInsets: getSession(state).safeAreaInsets,
  isSubscribed: getIsActiveStreamSubscribed(props.narrow)(state),
  canSend: canSendToActiveNarrow(props.narrow) && !getShowMessagePlaceholders(props.narrow)(state),
  editMessage: getSession(state).editMessage,
  draft: getDraftForActiveNarrow(props.narrow)(state),
  lastMessageTopic: getLastMessageTopic(props.narrow)(state),
}))(ComposeBox);
