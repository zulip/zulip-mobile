/* @flow */
import type { GlobalState } from '../types';
import connectWithActions from '../connectWithActions';
import { getAuth, getLastTopicInActiveNarrow, canSendToActiveNarrow } from '../selectors';
import { getIsActiveStreamSubscribed } from '../subscriptions/subscriptionSelectors';
import { getDraftForActiveNarrow } from '../drafts/draftsSelectors';
import ComposeBox from './ComposeBox';

export default connectWithActions((state: GlobalState) => ({
  auth: getAuth(state),
  narrow: state.chat.narrow,
  users: state.users,
  safeAreaInsets: state.app.safeAreaInsets,
  composeTools: state.app.composeTools,
  lastTopic: getLastTopicInActiveNarrow(state),
  isSubscribed: getIsActiveStreamSubscribed(state),
  canSend: canSendToActiveNarrow(state),
  editMessage: state.app.editMessage,
  draft: getDraftForActiveNarrow(state),
}))(ComposeBox);
