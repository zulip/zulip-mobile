/* @flow */
import type { GlobalState } from '../types';
import connectWithActions from '../connectWithActions';
import {
  getAuth,
  getApp,
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
  safeAreaInsets: getApp(state).safeAreaInsets,
  composeTools: getApp(state).composeTools,
  isSubscribed: getIsActiveStreamSubscribed(state),
  canSend: canSendToActiveNarrow(state) && !getShowMessagePlaceholders(state),
  editMessage: getApp(state).editMessage,
  draft: getDraftForActiveNarrow(state),
  lastMessageTopic: getLastMessageTopic(state),
}))(ComposeBox);
