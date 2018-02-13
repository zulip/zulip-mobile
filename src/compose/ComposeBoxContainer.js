/* @flow */
import type { GlobalState } from '../types';
import connectWithActions from '../connectWithActions';
import {
  getAuth,
  getSession,
  canSendToActiveNarrow,
  getActiveNarrow,
  getLastMessageTopic,
  getUsers,
  getShowMessagePlaceholders,
} from '../selectors';
import { getIsActiveStreamSubscribed } from '../subscriptions/subscriptionSelectors';
import { getDraftForActiveNarrow } from '../drafts/draftsSelectors';
import ComposeBox from './ComposeBox';

export default connectWithActions((state: GlobalState) => ({
  auth: getAuth(state),
  narrow: getActiveNarrow(state),
  users: getUsers(state),
  safeAreaInsets: getSession(state).safeAreaInsets,
  composeTools: getSession(state).composeTools,
  isSubscribed: getIsActiveStreamSubscribed(state),
  canSend: canSendToActiveNarrow(state) && !getShowMessagePlaceholders(state),
  editMessage: getSession(state).editMessage,
  draft: getDraftForActiveNarrow(state),
  lastMessageTopic: getLastMessageTopic(state),
}))(ComposeBox);
